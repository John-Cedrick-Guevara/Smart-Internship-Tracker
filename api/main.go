package main

import (
	"fmt"
	"io"
	"net"
	"net/http"
	"net/http/cgi"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"
)

const (
	phpFpmSocket = "/tmp/php-fpm.sock"
	phpFpmBin    = "/var/task/api/php-fpm-bin"
	laravelRoot  = "/var/task/api/laravel"
	vendorTar    = "/var/task/api/vendor.tar.gz"
	vendorDir    = "/tmp/vendor"
	storageDir   = "/tmp/storage"
)

var (
	bootstrapOnce sync.Once
	bootstrapErr  error
)

func Handler(w http.ResponseWriter, r *http.Request) {
	bootstrapOnce.Do(func() {
		bootstrapErr = bootstrap()
	})

	if bootstrapErr != nil {
		http.Error(w, fmt.Sprintf("bootstrap failed: %v", bootstrapErr), http.StatusInternalServerError)
		return
	}

	handler := &cgi.Handler{
		Path: phpFpmBin,
		Root: filepath.Join(laravelRoot, "public"),
		Env: append(os.Environ(),
			"SCRIPT_FILENAME="+filepath.Join(laravelRoot, "public", "index.php"),
			"DOCUMENT_ROOT="+filepath.Join(laravelRoot, "public"),
			"REQUEST_URI="+r.URL.RequestURI(),
		),
	}

	handler.ServeHTTP(w, r)
}

func bootstrap() error {
	if err := extractVendor(); err != nil {
		return err
	}

	if err := prepareStorage(); err != nil {
		return err
	}

	if err := ensureSymlinks(); err != nil {
		return err
	}

	return startPHPFPM()
}

func extractVendor() error {
	if _, err := os.Stat(vendorDir); err == nil {
		return nil
	}

	if _, err := os.Stat(vendorTar); os.IsNotExist(err) {
		return fmt.Errorf("vendor archive missing at %s (run scripts/pack.sh)", vendorTar)
	}

	cmd := exec.Command("tar", "-xzf", vendorTar, "-C", "/tmp")
	if out, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("extract vendor: %w (%s)", err, string(out))
	}

	return nil
}

func prepareStorage() error {
	dirs := []string{
		storageDir,
		filepath.Join(storageDir, "app/public"),
		filepath.Join(storageDir, "framework/cache/data"),
		filepath.Join(storageDir, "framework/sessions"),
		filepath.Join(storageDir, "framework/views"),
		filepath.Join(storageDir, "logs"),
	}

	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0o755); err != nil {
			return fmt.Errorf("mkdir %s: %w", dir, err)
		}
	}

	target := filepath.Join(laravelRoot, "storage")
	if _, err := os.Lstat(target); os.IsNotExist(err) {
		return os.Symlink(storageDir, target)
	}

	return nil
}

func ensureSymlinks() error {
	links := map[string]string{
		filepath.Join(laravelRoot, "vendor"): vendorDir,
	}

	for link, target := range links {
		if _, err := os.Lstat(link); err == nil {
			continue
		}
		if err := os.Symlink(target, link); err != nil {
			return fmt.Errorf("symlink %s -> %s: %w", link, target, err)
		}
	}

	return nil
}

func startPHPFPM() error {
	if _, err := os.Stat(phpFpmSocket); err == nil {
		return nil
	}

	if _, err := os.Stat(phpFpmBin); os.IsNotExist(err) {
		return fmt.Errorf("php-fpm binary missing at %s (run scripts/vercel-prepare.sh)", phpFpmBin)
	}

	configPath := filepath.Join(laravelRoot, "php-fpm-vercel.conf")
	config := fmt.Sprintf(`[global]
error_log = /tmp/php-fpm.log
daemonize = no

[www]
user = nobody
group = nobody
listen = %s
listen.owner = nobody
listen.group = nobody
listen.mode = 0666
pm = static
pm.max_children = 2
pm.max_requests = 500
chdir = %s
clear_env = no
catch_workers_output = yes
`, phpFpmSocket, laravelRoot)

	if err := os.WriteFile(configPath, []byte(config), 0o644); err != nil {
		return fmt.Errorf("write php-fpm config: %w", err)
	}

	cmd := exec.Command(phpFpmBin, "--nodaemonize", "--fpm-config", configPath)
	cmd.Stdout = io.Discard
	cmd.Stderr = os.Stderr

	if err := cmd.Start(); err != nil {
		return fmt.Errorf("start php-fpm: %w", err)
	}

	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		if _, err := os.Stat(phpFpmSocket); err == nil {
			return nil
		}
		time.Sleep(100 * time.Millisecond)
	}

	conn, err := net.Dial("unix", phpFpmSocket)
	if err != nil {
		return fmt.Errorf("php-fpm socket not ready: %w", err)
	}
	conn.Close()

	return nil
}
