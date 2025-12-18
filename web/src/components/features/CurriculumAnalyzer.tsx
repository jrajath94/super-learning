"use client";

import { useState } from "react";

interface Module {
    module_number: number;
    title: string;
    description: string;
    key_concepts: string[];
}

interface CurriculumResponse {
    content_id: string;
    modules: Module[];
}

export function CurriculumAnalyzer() {
    const [url, setUrl] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState<CurriculumResponse | null>(null);
    const [generatingModules, setGeneratingModules] = useState<Record<number, boolean>>({});

    const handleAnalyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsLoading(true);
        try {
            const res = await fetch("/api/v1/curriculum/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });

            if (!res.ok) throw new Error("Analysis failed");

            const jsonData = await res.json();
            setData(jsonData);
        } catch (error) {
            console.error(error);
            alert("Failed to analyze course page. Is it accessible?");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateModule = async (module: Module) => {
        if (!data) return;

        setGeneratingModules(prev => ({ ...prev, [module.module_number]: true }));

        try {
            const res = await fetch("/api/v1/curriculum/generate-module", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    curriculum_id: data.content_id,
                    module_title: module.title,
                    module_description: module.description
                })
            });

            if (!res.ok) throw new Error("Generation failed");

            // Just visually indicate done for now
            alert(`Started generating notes for: ${module.title}. Check 'My Notes' shortly.`);

        } catch (error) {
            console.error(error);
            alert("Failed to trigger generation.");
        } finally {
            setGeneratingModules(prev => ({ ...prev, [module.module_number]: false }));
        }
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Input Section */}
            <div className="glass p-8 rounded-2xl animate-fade-in text-center">
                <h2 className="text-2xl font-bold mb-4 font-heading">Course Deconstructor 🏗️</h2>
                <p className="text-foreground-secondary mb-6">
                    Paste a course URL (Maven, Coursera, etc.) to extract the syllabus and generate study notes.
                </p>

                <form onSubmit={handleAnalyze} className="flex gap-4 max-w-2xl mx-auto">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://maven.com/..."
                        className="flex-1 bg-background-secondary border border-border rounded-xl px-4 py-3 outline-none focus:border-accent"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !url}
                        className="bg-accent hover:bg-accent-hover text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50"
                    >
                        {isLoading ? "Analyzing..." : "Analyze"}
                    </button>
                </form>
            </div>

            {/* Results Section */}
            {data && (
                <div className="space-y-4 animate-slide-up">
                    <h3 className="text-xl font-semibold text-foreground px-2">
                        Detected Curriculum ({data.modules.length} Modules)
                    </h3>

                    <div className="grid gap-4">
                        {data.modules.map((module) => (
                            <div key={module.module_number} className="glass p-6 rounded-xl flex flex-col md:flex-row justify-between gap-4 items-start md:items-center group hover:border-accent/50 transition-all">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono bg-background-secondary px-2 py-1 rounded text-foreground-muted">
                                            MOD {module.module_number}
                                        </span>
                                        <h4 className="font-semibold text-lg text-foreground">{module.title}</h4>
                                    </div>
                                    <p className="text-sm text-foreground-secondary mb-2">{module.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {module.key_concepts.map((concept, i) => (
                                            <span key={i} className="text-xs border border-border px-2 py-0.5 rounded-full text-foreground-muted">
                                                {concept}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleGenerateModule(module)}
                                    disabled={generatingModules[module.module_number]}
                                    className="shrink-0 bg-background-secondary hover:bg-green-500 hover:text-white text-foreground-secondary px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                                >
                                    {generatingModules[module.module_number] ? (
                                        <>⏳ Queued</>
                                    ) : (
                                        <>⚡ Generate Notes</>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
