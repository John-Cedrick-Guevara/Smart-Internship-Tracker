import React from "react";
import { Internship } from "../../types/internship";
import { useInternshipOcr } from "../../hooks/useInternshipOcr";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

interface InternshipFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    internship: Internship | null; // Null means create, not null means edit
}

export default function InternshipForm({
    isOpen,
    onClose,
    onSubmit,
    internship,
}: InternshipFormProps) {
    const [activeTab, setActiveTab] = React.useState("details");
    const {
        formState,
        updateFormState,
        handleDrag,
        handleDrop,
        handleFileChange,
        aiParsing,
        resetImage,
        rescanImage,
        getSubmitData,
    } = useInternshipOcr(internship, isOpen, {
        onParseComplete: () => setActiveTab("details"),
    });
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(getSubmitData());
    };

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto animate-fade-in"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
                {/* Backdrop overlay */}
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity duration-300"
                    onClick={onClose}
                />

                {/* Vertical centering hack */}
                <span
                    className="hidden sm:inline-block sm:h-screen sm:align-middle"
                    aria-hidden="true"
                >
                    &#8203;
                </span>

                {/* Modal Container */}
                <div className="relative inline-block transform overflow-hidden rounded-2xl bg-white text-left align-bottom shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle dark:bg-gray-900 border border-gray-200 dark:border-gray-800 animate-scale-in">
                    {/* Header */}
                    <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-250/60 dark:bg-gray-950/20 dark:border-gray-800/80">
                        <div className="flex items-center justify-between">
                            <h3
                                className="text-lg font-bold text-gray-900 dark:text-white"
                                id="modal-title"
                            >
                                {internship
                                    ? "Edit Internship Details"
                                    : "Add Internship Application"}
                            </h3>
                            <button
                                type="button"
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                onClick={onClose}
                            >
                                <span className="sr-only">Close</span>
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        {/* Tab lists */}
                        <div className="px-6 pt-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="details">
                                    Application Fields
                                </TabsTrigger>
                                <TabsTrigger value="ai-scan">
                                    <span className="flex items-center space-x-1">
                                        <svg
                                            className="h-3.5 w-3.5 text-indigo-550 dark:text-indigo-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M13 10V3L4 14h7v7l9-11h-7z"
                                            />
                                        </svg>
                                        <span>AI Image Scan</span>
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        {/* TAB 1: Detailed fields form */}
                        <TabsContent value="details">
                            <form onSubmit={handleSubmit}>
                                <div className="px-6 pb-5 space-y-4">
                                    {/* Company Name & Email */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="company_name"
                                                className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                            >
                                                Company Name
                                            </label>
                                            <Input
                                                type="text"
                                                name="company_name"
                                                id="company_name"
                                                required
                                                placeholder="e.g. Supabase"
                                                value={formState.companyName}
                                                onChange={(e) =>
                                                    updateFormState({
                                                        companyName:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="company_email"
                                                className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                            >
                                                Company Contact Email
                                            </label>
                                            <Input
                                                type="email"
                                                name="company_email"
                                                id="company_email"
                                                required
                                                placeholder="e.g. HR@supabase.io"
                                                value={formState.companyEmail}
                                                onChange={(e) =>
                                                    updateFormState({
                                                        companyEmail:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Position & Location */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="position"
                                                className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                            >
                                                Role / Position
                                            </label>
                                            <Input
                                                type="text"
                                                name="position"
                                                id="position"
                                                required
                                                placeholder="e.g. Backend Dev Intern"
                                                value={formState.position}
                                                onChange={(e) =>
                                                    updateFormState({
                                                        position:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="location"
                                                className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                            >
                                                Location
                                            </label>
                                            <Input
                                                type="text"
                                                name="location"
                                                id="location"
                                                required
                                                placeholder="e.g. Singapore (Remote)"
                                                value={formState.location}
                                                onChange={(e) =>
                                                    updateFormState({
                                                        location:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Duration & Job URL */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="duration"
                                                className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                            >
                                                Duration
                                            </label>
                                            <Input
                                                type="text"
                                                name="duration"
                                                id="duration"
                                                required
                                                placeholder="e.g. 3 Months, Summer 2026"
                                                value={formState.duration}
                                                onChange={(e) =>
                                                    updateFormState({
                                                        duration:
                                                            e.target.value,
                                                    })
                                                }
                                                className="mt-1"
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="url"
                                                className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                            >
                                                Job Posting URL (Optional)
                                            </label>
                                            <Input
                                                type="url"
                                                name="url"
                                                id="url"
                                                placeholder="https://supabase.com/careers/..."
                                                value={formState.url}
                                                onChange={(e) =>
                                                    updateFormState({
                                                        url: e.target.value,
                                                    })
                                                }
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    {/* Status & Compensation Toggle */}
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="status"
                                                className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                                            >
                                                Application Status
                                            </label>
                                            <select
                                                name="status"
                                                id="status"
                                                value={formState.status}
                                                onChange={(e) =>
                                                    updateFormState({
                                                        status: e.target
                                                            .value as any,
                                                    })
                                                }
                                                className="mt-1 block h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-800 dark:bg-gray-950 dark:text-white dark:focus:border-indigo-650"
                                            >
                                                <option value="wishlist">
                                                    Wishlist
                                                </option>
                                                <option value="applied">
                                                    Applied
                                                </option>
                                                <option value="interviewing">
                                                    Interviewing
                                                </option>
                                                <option value="offer">
                                                    Offer Extended
                                                </option>
                                                <option value="rejected">
                                                    Rejected
                                                </option>
                                            </select>
                                        </div>

                                        <div>
                                            <span className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                                Compensation Type
                                            </span>

                                            <div className="mt-1 flex space-x-3">
                                                <label
                                                    className={`flex flex-1 items-center justify-center cursor-pointer border rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                                                        formState.isPaid
                                                            ? "bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400"
                                                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="is_paid"
                                                        checked={
                                                            formState.isPaid ===
                                                            true
                                                        }
                                                        onChange={() =>
                                                            updateFormState({
                                                                isPaid: true,
                                                            })
                                                        }
                                                        className="sr-only"
                                                    />
                                                    Paid
                                                </label>

                                                <label
                                                    className={`flex flex-1 items-center justify-center cursor-pointer border rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${
                                                        !formState.isPaid
                                                            ? "bg-amber-50 border-amber-300 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400"
                                                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-400 dark:hover:bg-gray-900"
                                                    }`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="is_paid"
                                                        checked={
                                                            formState.isPaid ===
                                                            false
                                                        }
                                                        onChange={() =>
                                                            updateFormState({
                                                                isPaid: false,
                                                            })
                                                        }
                                                        className="sr-only"
                                                    />
                                                    Unpaid
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer actions */}
                                <div className="bg-gray-50/50 px-6 py-4 border-t border-gray-250/60 flex justify-end space-x-3 dark:bg-gray-950/20 dark:border-gray-800/80">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {internship
                                            ? "Save Changes"
                                            : "Submit Application"}
                                    </Button>
                                </div>
                            </form>
                        </TabsContent>

                        {/* TAB 2: Image AI Scanner Upload Scaffold */}
                        <TabsContent value="ai-scan">
                            <div className="px-6 pb-6">
                                <div
                                    className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                                        formState.dragActive
                                            ? "border-indigo-500 bg-indigo-50/10 dark:border-indigo-400"
                                            : "border-gray-300 dark:border-gray-850 hover:border-gray-450 dark:hover:border-gray-700 bg-gray-50/30 dark:bg-gray-950/10"
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragOver={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    {formState.isParsing ? (
                                        <div className="flex flex-col items-center py-6">
                                            <div className="relative flex h-14 w-14 items-center justify-center">
                                                <div className="absolute inset-0 rounded-full border-4 border-indigo-200 dark:border-indigo-900" />
                                                <div className="absolute inset-0 rounded-full border-4 border-indigo-650 dark:border-indigo-400 border-t-transparent animate-spin" />
                                            </div>
                                            <h4 className="mt-4 font-bold text-sm text-gray-900 dark:text-white animate-pulse">
                                                AI Scanner active...
                                            </h4>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-450">
                                                Analyzing details and extraction
                                                parameters.
                                            </p>
                                        </div>
                                    ) : formState.selectedImage ? (
                                        <div className="w-full flex flex-col items-center">
                                            <div className="relative rounded-xl overflow-hidden max-h-48 shadow-md border border-gray-200 dark:border-gray-850">
                                                <img
                                                    src={
                                                        formState.selectedImage
                                                    }
                                                    alt="Uploaded listing"
                                                    className="object-cover max-w-full h-auto"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent flex items-end justify-center p-3">
                                                    <span className="text-[10px] font-bold text-white uppercase bg-indigo-600 px-2 py-0.5 rounded-full flex items-center">
                                                        <svg
                                                            className="mr-1 h-3 w-3 animate-ping"
                                                            fill="currentColor"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                            />
                                                        </svg>
                                                        Scan Complete
                                                    </span>
                                                </div>
                                            </div>
                                            <h4 className="mt-4 font-bold text-sm text-gray-900 dark:text-white">
                                                Fields Extracted!
                                            </h4>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                                                Switch to the{" "}
                                                <b>Application Fields</b> tab to
                                                review and submit the pre-filled
                                                information.
                                            </p>
                                            <div className="mt-4 flex space-x-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={resetImage}
                                                >
                                                    Remove
                                                </Button>
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    onClick={rescanImage}
                                                >
                                                    Re-Scan listing
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 mb-4">
                                                <svg
                                                    className="h-6 w-6"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">
                                                Drag and drop internship
                                                screenshot here
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-450 max-w-xs">
                                                Supports PNG, JPG, or PDF. Soon,
                                                our AI will automatically parse
                                                and populate your application
                                                fields!
                                            </p>
                                            <label className="mt-4 inline-flex cursor-pointer items-center rounded-xl bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 text-xs font-bold text-gray-700 dark:text-gray-300 px-4 py-2 shadow-sm transition-all active:scale-[0.98]">
                                                <span>Choose File</span>
                                                <input
                                                    type="file"
                                                    className="sr-only"
                                                    accept="image/*"
                                                    onChange={handleFileChange}
                                                />
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
