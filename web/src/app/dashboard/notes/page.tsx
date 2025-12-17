"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

// Mock data - will be replaced with API calls
const mockNotes = [
    {
        id: "1",
        title: "Transformer Architecture Deep Dive",
        type: "stanford",
        source: "YouTube",
        wordCount: 3500,
        createdAt: "2024-12-14T10:00:00Z",
        tags: ["AI", "Machine Learning", "Transformers"],
        isFavorite: true,
    },
    {
        id: "2",
        title: "Binary Search Patterns for Interviews",
        type: "dsa",
        source: "YouTube",
        wordCount: 2100,
        createdAt: "2024-12-13T15:30:00Z",
        tags: ["DSA", "Algorithms", "Interview"],
        isFavorite: false,
    },
    {
        id: "3",
        title: "Naval Ravikant on Wealth Creation",
        type: "podcast",
        source: "YouTube",
        wordCount: 4200,
        createdAt: "2024-12-12T09:00:00Z",
        tags: ["Wealth", "Philosophy", "Startups"],
        isFavorite: true,
    },
    {
        id: "4",
        title: "React Server Components Explained",
        type: "stanford",
        source: "YouTube",
        wordCount: 2800,
        createdAt: "2024-12-11T14:00:00Z",
        tags: ["React", "Frontend", "Web Dev"],
        isFavorite: false,
    },
];

const noteTypeConfig: Record<string, { icon: string; color: string }> = {
    stanford: { icon: "🎓", color: "bg-blue-500/20 text-blue-400" },
    dsa: { icon: "💻", color: "bg-green-500/20 text-green-400" },
    podcast: { icon: "🎙️", color: "bg-purple-500/20 text-purple-400" },
    cheatsheet: { icon: "📋", color: "bg-orange-500/20 text-orange-400" },
};

export default function NotesLibraryPage() {
    const [notes] = useState(mockNotes);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<string | null>(null);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const filteredNotes = notes.filter((note) => {
        const matchesSearch =
            note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.tags.some((tag) =>
                tag.toLowerCase().includes(searchQuery.toLowerCase())
            );
        const matchesType = !filterType || note.type === filterType;
        const matchesFavorites = !showFavoritesOnly || note.isFavorite;
        return matchesSearch && matchesType && matchesFavorites;
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 ml-64">
                <Header />

                <div className="pt-20 px-8 pb-8">
                    {/* Page Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-foreground">My Notes</h1>
                            <p className="text-foreground-secondary mt-1">
                                {notes.length} notes in your library
                            </p>
                        </div>
                        <a
                            href="/"
                            className="px-6 py-3 bg-gradient-accent text-white rounded-xl font-medium hover:shadow-glow transition-all"
                        >
                            ➕ Generate New
                        </a>
                    </div>

                    {/* Search & Filters */}
                    <div className="glass rounded-xl p-4 mb-6">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search notes by title or tag..."
                                    className="w-full px-4 py-3 bg-background-secondary border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                                />
                            </div>

                            {/* Type Filter */}
                            <div className="flex gap-2">
                                {Object.entries(noteTypeConfig).map(([type, config]) => (
                                    <button
                                        key={type}
                                        onClick={() =>
                                            setFilterType(filterType === type ? null : type)
                                        }
                                        className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${filterType === type
                                                ? "bg-accent/20 border-accent"
                                                : "bg-background-secondary border-border hover:border-accent/50"
                                            }`}
                                    >
                                        <span>{config.icon}</span>
                                        <span className="hidden md:inline text-sm capitalize">
                                            {type}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Favorites Toggle */}
                            <button
                                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                                className={`px-4 py-3 rounded-xl border transition-all ${showFavoritesOnly
                                        ? "bg-yellow-500/20 border-yellow-500 text-yellow-400"
                                        : "bg-background-secondary border-border hover:border-accent/50"
                                    }`}
                            >
                                ⭐
                            </button>
                        </div>
                    </div>

                    {/* Notes Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredNotes.map((note) => (
                            <div
                                key={note.id}
                                className="glass rounded-xl p-5 hover:shadow-glow transition-all group cursor-pointer"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm ${noteTypeConfig[note.type]?.color
                                            }`}
                                    >
                                        {noteTypeConfig[note.type]?.icon} {note.type}
                                    </span>
                                    <button className="text-foreground-muted hover:text-yellow-400 transition-colors">
                                        {note.isFavorite ? "⭐" : "☆"}
                                    </button>
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                                    {note.title}
                                </h3>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {note.tags.slice(0, 3).map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-0.5 bg-background-tertiary rounded-md text-xs text-foreground-secondary"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between text-sm text-foreground-muted">
                                    <span>{note.wordCount.toLocaleString()} words</span>
                                    <span>{formatDate(note.createdAt)}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredNotes.length === 0 && (
                        <div className="text-center py-16">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                No notes found
                            </h3>
                            <p className="text-foreground-secondary mb-6">
                                {searchQuery
                                    ? "Try a different search term"
                                    : "Generate your first note to get started"}
                            </p>
                            <a
                                href="/"
                                className="inline-block px-6 py-3 bg-gradient-accent text-white rounded-xl font-medium hover:shadow-glow transition-all"
                            >
                                Generate Notes
                            </a>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
