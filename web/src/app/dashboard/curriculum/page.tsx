"use client";

import { CurriculumAnalyzer } from "@/components/features/CurriculumAnalyzer";

export default function CurriculumPage() {
    return (
        <div className="space-y-8 animate-fade-in">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    Curriculum Design 🏗️
                </h1>
                <p className="text-foreground-secondary">
                    Turn any course page into a personalized Neural Learning Plan.
                </p>
            </header>

            <CurriculumAnalyzer />
        </div>
    );
}
