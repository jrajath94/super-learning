"use client";

import { useState } from "react";

interface NoteGeneratorProps {
    onNotesGenerated: (notes: string, metadata: { title: string; duration: number }) => void;
    isGenerating: boolean;
    setIsGenerating: (value: boolean) => void;
}

const NOTE_TYPES = [
    { value: "stanford", label: "Stanford AI", icon: "🎓" },
    { value: "dsa", label: "DSA & Interview", icon: "💻" },
    { value: "podcast", label: "Podcast", icon: "🎙️" },
    { value: "cheatsheet", label: "Cheat Sheet", icon: "📋" },
];

export function NoteGenerator({
    onNotesGenerated,
    isGenerating,
    setIsGenerating
}: NoteGeneratorProps) {
    const [url, setUrl] = useState("");
    const [noteType, setNoteType] = useState("stanford");
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<string[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!url.trim()) {
            setError("Please enter a YouTube URL");
            return;
        }

        setError(null);
        setIsGenerating(true);
        setProgress(["🚀 Starting generation..."]);

        try {
            // Use the legacy endpoint for now (it works with the existing backend)
            const response = await fetch("/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, video_type: noteType }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.detail || "Failed to generate notes");
            }

            const data = await response.json();
            setProgress((prev) => [...prev, "✅ Notes generated successfully!"]);

            onNotesGenerated(data.notes, {
                title: data.metadata?.title || "Unknown",
                duration: data.metadata?.duration || 0,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            setProgress((prev) => [...prev, "❌ Generation failed"]);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="glass rounded-2xl p-6 md:p-8 animate-slide-up">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* URL Input */}
                <div className="space-y-2">
                    <label htmlFor="url" className="text-sm font-medium text-foreground-secondary">
                        YouTube URL
                    </label>
                    <input
                        id="url"
                        type="text"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-3 bg-background-secondary border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                        disabled={isGenerating}
                    />
                </div>

                {/* Note Type Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground-secondary">
                        Note Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {NOTE_TYPES.map((type) => (
                            <button
                                key={type.value}
                                type="button"
                                onClick={() => setNoteType(type.value)}
                                disabled={isGenerating}
                                className={`
                  flex items-center gap-2 px-4 py-3 rounded-xl border transition-all
                  ${noteType === type.value
                                        ? "bg-accent/20 border-accent text-accent shadow-glow"
                                        : "bg-background-secondary border-border text-foreground-secondary hover:border-accent/50"
                                    }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                            >
                                <span>{type.icon}</span>
                                <span className="text-sm font-medium">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 bg-error/20 border border-error/50 rounded-xl text-error text-sm">
                        {error}
                    </div>
                )}

                {/* Progress Log */}
                {progress.length > 0 && (
                    <div className="p-4 bg-background-secondary rounded-xl border border-border">
                        <div className="space-y-1 font-mono text-sm">
                            {progress.map((msg, i) => (
                                <div key={i} className="text-foreground-secondary animate-fade-in">
                                    {msg}
                                </div>
                            ))}
                            {isGenerating && (
                                <div className="flex items-center gap-2 text-accent">
                                    <span className="animate-pulse">⏳</span>
                                    <span>Processing... This may take a minute for long videos</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isGenerating || !url.trim()}
                    className={`
            w-full py-4 rounded-xl font-semibold text-white transition-all
            ${isGenerating
                            ? "bg-accent/50 cursor-wait"
                            : "bg-gradient-accent hover:shadow-glow-lg hover:scale-[1.02]"
                        }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none
          `}
                >
                    {isGenerating ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                            Generating Notes...
                        </span>
                    ) : (
                        "Generate Notes"
                    )}
                </button>
            </form>
        </div>
    );
}
