"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface ResearchPaper {
    id: string;
    title: string;
    created_at: string;
    metadata: {
        url?: string;
        filename?: string;
    };
}

export function ResearchList({ refreshTrigger }: { refreshTrigger: number }) {
    const [papers, setPapers] = useState<ResearchPaper[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPapers = async () => {
            try {
                // Fetch content where source_type is 'pdf'
                const res = await fetch("/api/v1/content?source_type=pdf");
                if (res.ok) {
                    const data = await res.json();
                    setPapers(data);
                }
            } catch (error) {
                console.error("Failed to fetch papers", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPapers();
    }, [refreshTrigger]);

    if (loading) {
        return <div className="animate-pulse h-32 bg-background-secondary rounded-xl"></div>;
    }

    if (papers.length === 0) {
        return (
            <div className="text-center py-12 bg-background-secondary/30 rounded-xl border border-dashed border-border">
                <p className="text-foreground-secondary">No papers analyzed yet.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            {papers.map((paper) => (
                <div key={paper.id} className="glass p-5 rounded-xl hover:border-accent transition-all group">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                                {paper.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-2 text-xs text-foreground-muted">
                                <span>📅 {new Date(paper.created_at).toLocaleDateString()}</span>
                                {paper.metadata.url && (
                                    <a
                                        href={paper.metadata.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline flex items-center gap-1"
                                    >
                                        🔗 Source
                                    </a>
                                )}
                            </div>
                        </div>
                        <Link
                            href={`/dashboard/notes/${paper.id}`} // Assuming we link to note view
                            className="bg-background-secondary hover:bg-accent hover:text-white text-foreground-secondary px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            View Notes
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
