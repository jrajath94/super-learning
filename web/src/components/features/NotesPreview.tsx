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

            {/* Notes Content - Premium Rendering */}
            <div className="glass rounded-2xl p-6 md:p-10 overflow-hidden">
                <article
                    className="
                        prose prose-invert 
                        prose-lg 
                        max-w-none
                        prose-headings:font-bold prose-headings:text-white
                        prose-h1:text-3xl prose-h1:border-b prose-h1:border-border prose-h1:pb-4 prose-h1:mb-6
                        prose-h2:text-2xl prose-h2:text-accent prose-h2:mt-10
                        prose-h3:text-xl prose-h3:text-foreground
                        prose-p:text-foreground-secondary prose-p:leading-relaxed
                        prose-strong:text-white prose-strong:font-semibold
                        prose-code:bg-background-tertiary prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-accent prose-code:font-mono prose-code:text-sm
                        prose-pre:bg-background-tertiary prose-pre:border prose-pre:border-border prose-pre:rounded-xl prose-pre:p-4 prose-pre:overflow-x-auto
                        prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-accent/10 prose-blockquote:px-4 prose-blockquote:py-2 prose-blockquote:rounded-r-xl prose-blockquote:italic
                        prose-ul:text-foreground-secondary
                        prose-li:marker:text-accent
                        prose-table:border-collapse prose-table:w-full
                        prose-th:bg-background-tertiary prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:border-b prose-th:border-border
                        prose-td:px-4 prose-td:py-2 prose-td:border-b prose-td:border-border/50
                        prose-img:rounded-xl prose-img:shadow-2xl prose-img:border prose-img:border-border prose-img:my-8
                        prose-hr:border-border prose-hr:my-8
                        prose-a:text-accent prose-a:no-underline hover:prose-a:underline
                    "
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                />
            </div>
        </div>
    );
}
