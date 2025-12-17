"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { NoteGenerator } from "@/components/features/NoteGenerator";
import { NotesPreview } from "@/components/features/NotesPreview";

export default function Home() {
  const [generatedNotes, setGeneratedNotes] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<{
    title: string;
    duration: number;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleNotesGenerated = (notes: string, meta: { title: string; duration: number }) => {
    setGeneratedNotes(notes);
    setMetadata(meta);
  };

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-4">
        {/* Gradient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-accent/20 via-accent-secondary/10 to-transparent opacity-50 blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            <span className="gradient-text">Super-Learning</span>
          </h1>
          <p className="text-xl text-foreground-secondary mb-12 animate-slide-up">
            Transform YouTube videos into comprehensive, AI-powered study notes
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <NoteGenerator
            onNotesGenerated={handleNotesGenerated}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
          />

          {generatedNotes && metadata && (
            <NotesPreview
              notes={generatedNotes}
              metadata={metadata}
            />
          )}
        </div>
      </section>

      {/* Features Section */}
      {!generatedNotes && (
        <section className="px-4 pb-20">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon="🎓"
              title="Stanford AI Mode"
              description="Deep comprehension notes with first principles and mental models"
            />
            <FeatureCard
              icon="💻"
              title="DSA & Interview"
              description="Pattern recognition, complexity analysis, and implementation templates"
            />
            <FeatureCard
              icon="🎙️"
              title="Podcast Mode"
              description="Extract wisdom, mental models, and actionable frameworks"
            />
          </div>
        </section>
      )}
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="glass rounded-2xl p-6 hover:shadow-glow transition-all duration-300 group">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-foreground-secondary text-sm">{description}</p>
    </div>
  );
}
