"use client";

import { useState } from "react";

interface ResearchUploaderProps {
    onProcessingStarted: () => void;
    onSuccess: () => void;
}

export function ResearchUploader({ onProcessingStarted, onSuccess }: ResearchUploaderProps) {
    const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
    const [url, setUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<string>("");

    const handleUrlSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsSubmitting(true);
        setStatus("🚀 Initializing research processing...");
        onProcessingStarted();

        try {
            const res = await fetch("/api/v1/research/process-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            if (!res.ok) throw new Error("Failed to process URL");

            setStatus("✅ Processing started in background!");
            setTimeout(() => {
                onSuccess();
                setIsSubmitting(false);
            }, 2000);
        } catch (error) {
            setStatus("❌ Error: " + (error as Error).message);
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setIsSubmitting(true);
        setStatus("🚀 Uploading paper...");
        onProcessingStarted();

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/v1/research/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to upload file");

            setStatus("✅ Upload complete! analyzing...");
            setTimeout(() => {
                onSuccess();
                setIsSubmitting(false);
            }, 2000);
        } catch (error) {
            setStatus("❌ Error: " + (error as Error).message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glass p-6 rounded-2xl animate-fade-in">
            <div className="flex gap-4 mb-6 border-b border-border">
                <button
                    onClick={() => setActiveTab("url")}
                    className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === "url"
                            ? "text-accent border-b-2 border-accent"
                            : "text-foreground-secondary hover:text-foreground"
                        }`}
                >
                    🔗 arXiv / URL
                </button>
                <button
                    onClick={() => setActiveTab("upload")}
                    className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === "upload"
                            ? "text-accent border-b-2 border-accent"
                            : "text-foreground-secondary hover:text-foreground"
                        }`}
                >
                    📄 Upload PDF
                </button>
            </div>

            {activeTab === "url" ? (
                <form onSubmit={handleUrlSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-uppercase text-foreground-muted mb-1">
                            Paper URL (arXiv, PDF link)
                        </label>
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://arxiv.org/pdf/1706.03762.pdf"
                            className="w-full bg-background-secondary border border-border rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-accent outline-none"
                            disabled={isSubmitting}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!url || isSubmitting}
                        className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? "Processing..." : "Analyze Paper"}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleFileUpload} className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:bg-background-secondary/50 transition-colors">
                        <input
                            type="file"
                            id="file-upload"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="hidden"
                            disabled={isSubmitting}
                        />
                        <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                        >
                            <span className="text-2xl">📄</span>
                            <span className="text-sm font-medium text-foreground">
                                {file ? file.name : "Click to upload PDF"}
                            </span>
                            <span className="text-xs text-foreground-muted">
                                Up to 10MB
                            </span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        disabled={!file || isSubmitting}
                        className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? "Uploading..." : "Analyze Paper"}
                    </button>
                </form>
            )}

            {status && (
                <div className="mt-4 p-3 bg-background-secondary rounded-lg text-xs font-mono text-foreground-secondary animate-pulse">
                    {status}
                </div>
            )}
        </div>
    );
}
