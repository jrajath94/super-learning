"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

// Mock analytics data
const mockAnalytics = {
    totalNotes: 24,
    totalWords: 45000,
    studySessions: 18,
    streakDays: 7,
    topicsLearned: ["Machine Learning", "System Design", "JavaScript", "Algorithms"],
    weeklyActivity: [
        { day: "Mon", notes: 2, hours: 1.5 },
        { day: "Tue", notes: 3, hours: 2.0 },
        { day: "Wed", notes: 1, hours: 0.5 },
        { day: "Thu", notes: 4, hours: 3.0 },
        { day: "Fri", notes: 2, hours: 1.5 },
        { day: "Sat", notes: 0, hours: 0 },
        { day: "Sun", notes: 1, hours: 1.0 },
    ],
    notesByType: {
        stanford: 10,
        dsa: 8,
        podcast: 4,
        cheatsheet: 2,
    },
    recentAchievements: [
        { id: 1, title: "First Note", description: "Generated your first note", icon: "🎉", date: "Dec 10" },
        { id: 2, title: "Deep Diver", description: "Read 10,000+ words", icon: "📚", date: "Dec 12" },
        { id: 3, title: "Week Warrior", description: "7 day streak", icon: "🔥", date: "Dec 14" },
    ],
    aiInsights: [
        "You learn best with Stanford-style deep comprehension notes.",
        "Consider revisiting your Binary Search notes - last studied 5 days ago.",
        "Your retention is highest for topics you study in the morning.",
    ],
    suggestedTopics: [
        { title: "Dynamic Programming Patterns", reason: "Related to your DSA notes" },
        { title: "Attention Mechanisms in AI", reason: "Builds on Transformer knowledge" },
        { title: "System Design Interview Prep", reason: "Popular in your field" },
    ],
};

export default function InsightsPage() {
    const [analytics] = useState(mockAnalytics);

    const maxActivityHours = Math.max(...analytics.weeklyActivity.map((d) => d.hours));

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 ml-64">
                <Header />

                <div className="pt-20 px-8 pb-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground">Learning Insights</h1>
                        <p className="text-foreground-secondary mt-1">
                            AI-powered analysis of your learning patterns
                        </p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard icon="📝" value={analytics.totalNotes} label="Total Notes" />
                        <StatCard icon="📖" value={`${(analytics.totalWords / 1000).toFixed(1)}k`} label="Words Studied" />
                        <StatCard icon="💬" value={analytics.studySessions} label="Study Sessions" />
                        <StatCard icon="🔥" value={`${analytics.streakDays} days`} label="Current Streak" />
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                        {/* Weekly Activity */}
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Weekly Activity</h2>
                            <div className="flex items-end justify-between h-40 gap-2">
                                {analytics.weeklyActivity.map((day) => (
                                    <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                                        <div
                                            className="w-full bg-gradient-accent rounded-t-lg transition-all hover:shadow-glow"
                                            style={{
                                                height: `${maxActivityHours > 0 ? (day.hours / maxActivityHours) * 100 : 0}%`,
                                                minHeight: day.hours > 0 ? "8px" : "0",
                                            }}
                                        />
                                        <span className="text-xs text-foreground-muted">{day.day}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes by Type */}
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">Notes by Type</h2>
                            <div className="space-y-3">
                                {Object.entries(analytics.notesByType).map(([type, count]) => {
                                    const total = Object.values(analytics.notesByType).reduce((a, b) => a + b, 0);
                                    const percentage = ((count / total) * 100).toFixed(0);
                                    const icons: Record<string, string> = {
                                        stanford: "🎓",
                                        dsa: "💻",
                                        podcast: "🎙️",
                                        cheatsheet: "📋",
                                    };
                                    return (
                                        <div key={type}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-foreground-secondary capitalize">
                                                    {icons[type]} {type}
                                                </span>
                                                <span className="text-sm text-foreground">{count} notes</span>
                                            </div>
                                            <div className="h-2 bg-background-tertiary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-accent rounded-full"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-6 mb-8">
                        {/* AI Insights */}
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">
                                🤖 AI Coach Insights
                            </h2>
                            <div className="space-y-3">
                                {analytics.aiInsights.map((insight, i) => (
                                    <div
                                        key={i}
                                        className="p-3 bg-background-tertiary rounded-lg text-sm text-foreground-secondary"
                                    >
                                        {insight}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Suggested Topics */}
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">
                                📚 Suggested Next Topics
                            </h2>
                            <div className="space-y-3">
                                {analytics.suggestedTopics.map((topic, i) => (
                                    <div
                                        key={i}
                                        className="p-3 bg-background-tertiary rounded-lg hover:bg-background-elevated transition-colors cursor-pointer"
                                    >
                                        <div className="font-medium text-foreground text-sm">{topic.title}</div>
                                        <div className="text-xs text-foreground-muted mt-1">{topic.reason}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Achievements */}
                        <div className="glass rounded-xl p-6">
                            <h2 className="text-lg font-semibold text-foreground mb-4">
                                🏆 Recent Achievements
                            </h2>
                            <div className="space-y-3">
                                {analytics.recentAchievements.map((achievement) => (
                                    <div key={achievement.id} className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-background-tertiary rounded-full flex items-center justify-center text-xl">
                                            {achievement.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-medium text-foreground text-sm">
                                                {achievement.title}
                                            </div>
                                            <div className="text-xs text-foreground-muted">
                                                {achievement.description}
                                            </div>
                                        </div>
                                        <div className="text-xs text-foreground-muted">{achievement.date}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Topics Learned */}
                    <div className="glass rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Topics Mastered</h2>
                        <div className="flex flex-wrap gap-2">
                            {analytics.topicsLearned.map((topic) => (
                                <span
                                    key={topic}
                                    className="px-4 py-2 bg-accent/20 text-accent rounded-full text-sm font-medium"
                                >
                                    ✓ {topic}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ icon, value, label }: { icon: string; value: string | number; label: string }) {
    return (
        <div className="glass rounded-xl p-5 hover:shadow-glow transition-all">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-2xl font-bold text-foreground">{value}</div>
            <div className="text-sm text-foreground-secondary">{label}</div>
        </div>
    );
}
