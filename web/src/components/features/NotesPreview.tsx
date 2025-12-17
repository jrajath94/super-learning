"use client";

import { useMemo } from "react";
import { marked } from "marked";

interface NotesPreviewProps {
    notes: string;
    metadata: {
        title: string;
        duration: number;
    };
}

export function NotesPreview({ notes, metadata }: NotesPreviewProps) {
    const htmlContent = useMemo(() => {
        return marked(notes, { async: false }) as string;
    }, [notes]);

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        if (mins < 60) return `${mins} min`;
        const hours = Math.floor(mins / 60);
        const remainingMins = mins % 60;
        return `${hours}h ${remainingMins}m`;
    };

    const wordCount = notes.split(/\s+/).length;

    return (
        <div className="mt-8 animate-slide-up">
            {/* Header */}
            <div className="glass rounded-2xl p-6 mb-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold text-foreground mb-2">
                            {metadata.title}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-foreground-secondary">
                            <span className="flex items-center gap-1">
                                ⏱️ {formatDuration(metadata.duration)}
                            </span>
                            <span className="flex items-center gap-1">
                                📝 {wordCount.toLocaleString()} words
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => navigator.clipboard.writeText(notes)}
                            className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-foreground-secondary hover:text-foreground hover:border-accent transition-all flex items-center gap-2"
                        >
                            📋 Copy
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-gradient-accent text-white rounded-lg font-medium hover:shadow-glow transition-all flex items-center gap-2"
                        >
                            📄 Export PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Notes Content */}
            <div className="glass rounded-2xl p-6 md:p-8">
                <article
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </div>
        </div>
    );
}
