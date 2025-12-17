"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardPage() {
    // Mock data - will be replaced with API calls
    const stats = [
        { label: "Total Notes", value: "12", icon: "📝" },
        { label: "Study Sessions", value: "24", icon: "📚" },
        { label: "Hours Studied", value: "18", icon: "⏱️" },
        { label: "Topics Mastered", value: "5", icon: "🏆" },
    ];

    const recentNotes = [
        { id: 1, title: "Transformer Architecture Deep Dive", type: "stanford", date: "2 hours ago" },
        { id: 2, title: "Binary Search Patterns", type: "dsa", date: "Yesterday" },
        { id: 3, title: "Naval Ravikant on Wealth", type: "podcast", date: "3 days ago" },
    ];

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 ml-64">
                <Header />

                <div className="pt-20 px-8 pb-8">
                    {/* Welcome Section */}
                    <section className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Welcome back! 👋
                        </h1>
                        <p className="text-foreground-secondary">
                            Continue your learning journey
                        </p>
                    </section>

                    {/* Stats Grid */}
                    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="glass rounded-xl p-5 hover:shadow-glow transition-all"
                            >
                                <div className="text-2xl mb-2">{stat.icon}</div>
                                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                                <div className="text-sm text-foreground-secondary">{stat.label}</div>
                            </div>
                        ))}
                    </section>

                    {/* Quick Actions */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
                        <div className="flex gap-4">
                            <a
                                href="/"
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-accent text-white rounded-xl font-medium hover:shadow-glow transition-all"
                            >
                                ➕ Generate New Notes
                            </a>
                            <a
                                href="/study"
                                className="flex items-center gap-2 px-6 py-3 bg-background-secondary border border-border text-foreground rounded-xl font-medium hover:border-accent transition-all"
                            >
                                🤖 Chat with AI Tutor
                            </a>
                        </div>
                    </section>

                    {/* Recent Notes */}
                    <section>
                        <h2 className="text-xl font-semibold text-foreground mb-4">Recent Notes</h2>
                        <div className="glass rounded-xl overflow-hidden">
                            {recentNotes.map((note, i) => (
                                <div
                                    key={note.id}
                                    className={`flex items-center justify-between p-4 hover:bg-background-secondary transition-colors ${i < recentNotes.length - 1 ? "border-b border-border" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">
                                            {note.type === "stanford" ? "🎓" : note.type === "dsa" ? "💻" : "🎙️"}
                                        </span>
                                        <div>
                                            <div className="font-medium text-foreground">{note.title}</div>
                                            <div className="text-sm text-foreground-secondary">{note.date}</div>
                                        </div>
                                    </div>
                                    <button className="px-3 py-1 text-sm text-accent hover:bg-accent/10 rounded-lg transition-colors">
                                        View
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
