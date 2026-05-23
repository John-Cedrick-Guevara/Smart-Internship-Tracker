import { useState, useEffect, useCallback } from "react";
import { Internship, InternshipStatus } from "../types/internship";

interface InternshipFormState {
    companyName: string;
    companyEmail: string;
    position: string;
    location: string;
    duration: string;
    url: string;
    status: InternshipStatus;
    isPaid: boolean;
    selectedImage: string | null;
    dragActive: boolean;
    isParsing: boolean;
}

const initialFormState: InternshipFormState = {
    companyName: "",
    companyEmail: "",
    position: "",
    location: "",
    duration: "",
    url: "",
    status: "wishlist",
    isPaid: true,
    selectedImage: null,
    dragActive: false,
    isParsing: false,
};

export function useInternshipOcr(
    internship: Internship | null,
    isOpen: boolean,
    { onParseComplete }: { onParseComplete: () => void } = {
        onParseComplete: () => {},
    },
) {
    const [formState, setFormState] =
        useState<InternshipFormState>(initialFormState);

    // Load data if editing
    useEffect(() => {
        if (isOpen) {
            if (internship) {
                setFormState({
                    companyName: internship.company_name,
                    companyEmail: internship.company_email,
                    position: internship.position,
                    location: internship.location,
                    duration: internship.duration,
                    url: internship.url || "",
                    status: internship.status,
                    isPaid: internship.is_paid,
                    selectedImage: null,
                    dragActive: false,
                    isParsing: false,
                });
            } else {
                setFormState(initialFormState);
            }
        }
    }, [internship, isOpen]);

    const updateFormState = useCallback(
        (updates: Partial<InternshipFormState>) => {
            setFormState((prev) => ({ ...prev, ...updates }));
        },
        [],
    );

    const getSubmitData = useCallback(() => {
        return {
            company_name: formState.companyName,
            company_email: formState.companyEmail,
            position: formState.position,
            location: formState.location,
            duration: formState.duration,
            url: formState.url.trim() || null,
            status: formState.status,
            is_paid: formState.isPaid,
        };
    }, [formState]);

    // AI parsing - Send to Laravel endpoint using fetch
    const aiParsing = useCallback(async () => {
        if (!formState.selectedImage || formState.isParsing) return;

        updateFormState({ isParsing: true });

        try {
            // Convert base64 data URL to Blob
            const response = await fetch(formState.selectedImage);
            const blob = await response.blob();

            // Create FormData with the file
            const formData = new FormData();
            formData.append("image", blob, "screenshot.png");

            // Send request using fetch (this is an API call, not a page navigation)
            const apiResponse = await fetch("/internship/extract", {
                method: "POST",
                body: formData,
                headers: {
                    "X-CSRF-TOKEN":
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute("content") || "",
                },
            });

            if (!apiResponse.ok) {
                const errorData = await apiResponse.json();
                throw new Error(errorData?.error || "Upload failed");
            }

            const data = await apiResponse.json();
            if (data?.success) {
                console.log(data.data);
                updateFormState({
                    companyName: data.data?.company_name || "",
                    companyEmail: data.data?.company_email || "",
                    position: data.data?.position || "",
                    location: data.data?.location || "",
                    duration: data.data?.duration || "",
                    url: data.data?.url || "",
                    status:
                        (data.data?.status as InternshipStatus) || "wishlist",
                    isPaid: data.data?.is_paid ?? true,
                    isParsing: false,
                });

                console.log("AI parsing successful:", data.data);
                resetImage(); // Clear image after successful parsing
                onParseComplete();
            } else {
                throw new Error(data?.error || "Upload failed");
            }
        } catch (error) {
            console.error("AI parsing error:", error);
            updateFormState({ isParsing: false });
            resetImage(); // Clear image after failed parsing
        }
    }, [
        formState.selectedImage,
        formState.isParsing,
        updateFormState,
        onParseComplete,
    ]);

    // Drag and drop handlers
    const handleDrag = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.type === "dragenter" || e.type === "dragover") {
                updateFormState({ dragActive: true });
            } else if (e.type === "dragleave") {
                updateFormState({ dragActive: false });
            }
        },
        [updateFormState],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            updateFormState({ dragActive: false });

            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleImageFile(e.dataTransfer.files[0]);
            }
        },
        [updateFormState],
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            e.preventDefault();
            if (e.target.files && e.target.files[0]) {
                handleImageFile(e.target.files[0]);
            }
        },
        [],
    );

    const handleImageFile = useCallback(
        (file: File) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateFormState({
                    selectedImage: reader.result as string,
                });
            };
            reader.readAsDataURL(file);
            console.log("Selected image file:", file);
        },
        [updateFormState],
    );

    const resetImage = useCallback(() => {
        updateFormState({ selectedImage: null });
    }, [updateFormState]);

    const rescanImage = useCallback(() => {
        if (formState.selectedImage) {
            aiParsing();
        }
    }, [formState.selectedImage, aiParsing]);

    return {
        formState,
        updateFormState,
        handleDrag,
        handleDrop,
        handleFileChange,
        handleImageFile,
        aiParsing,
        resetImage,
        rescanImage,
        getSubmitData,
    };
}
