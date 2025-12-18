"use client";

import { useState } from "react";
import { ResearchUploader } from "@/components/features/ResearchUploader";
import { ResearchList } from "@/components/features/ResearchList";

export default function ResearchPage() {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    return (
        <div className="space-y-8 animate-fade-in">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Research Station 🔬
                </h1>
                <p className="text-foreground-secondary">
                    Deep-dive into papers with the Neural Architect (Ilya Mode).
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <ResearchUploader
                        onProcessingStarted={() => { }}
                        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
                    />
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-semibold text-foreground">Recent Analysis</h2>
                    <ResearchList refreshTrigger={refreshTrigger} />
                </div>
            </div>
        </div>
    );
}
