"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 ml-64">
                <Header />

                <div className="pt-20 px-8 pb-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                        <p className="text-foreground-secondary mt-1">
                            Manage your account and preferences
                        </p>
                    </div>

                    <div className="flex gap-8">
                        {/* Tabs */}
                        <div className="w-48 shrink-0">
                            <nav className="space-y-1">
                                {[
                                    { id: "profile", label: "Profile", icon: "👤" },
                                    { id: "preferences", label: "Preferences", icon: "⚙️" },
                                    { id: "notifications", label: "Notifications", icon: "🔔" },
                                    { id: "subscription", label: "Subscription", icon: "💳" },
                                    { id: "api", label: "API Keys", icon: "🔑" },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === tab.id
                                                ? "bg-accent/20 text-accent"
                                                : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary"
                                            }`}
                                    >
                                        <span>{tab.icon}</span>
                                        <span className="font-medium">{tab.label}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            {activeTab === "profile" && <ProfileSettings />}
                            {activeTab === "preferences" && <PreferencesSettings />}
                            {activeTab === "notifications" && <NotificationSettings />}
                            {activeTab === "subscription" && <SubscriptionSettings />}
                            {activeTab === "api" && <ApiSettings />}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function ProfileSettings() {
    return (
        <div className="glass rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Profile Settings</h2>

            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-accent flex items-center justify-center text-white text-2xl font-bold">
                    U
                </div>
                <button className="px-4 py-2 bg-background-secondary border border-border rounded-lg text-sm hover:border-accent transition-all">
                    Change Photo
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground-secondary">Full Name</label>
                    <input
                        type="text"
                        defaultValue="User"
                        className="w-full px-4 py-3 bg-background-secondary border border-border rounded-xl text-foreground focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground-secondary">Email</label>
                    <input
                        type="email"
                        defaultValue="user@example.com"
                        className="w-full px-4 py-3 bg-background-secondary border border-border rounded-xl text-foreground focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                    />
                </div>
            </div>

            <button className="px-6 py-3 bg-gradient-accent text-white rounded-xl font-medium hover:shadow-glow transition-all">
                Save Changes
            </button>
        </div>
    );
}

function PreferencesSettings() {
    return (
        <div className="glass rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Learning Preferences</h2>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground-secondary">Default Note Type</label>
                    <select className="w-full px-4 py-3 bg-background-secondary border border-border rounded-xl text-foreground focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all">
                        <option value="stanford">🎓 Stanford AI Mode</option>
                        <option value="dsa">💻 DSA & Interview</option>
                        <option value="podcast">🎙️ Podcast Mode</option>
                        <option value="cheatsheet">📋 Cheat Sheet</option>
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground-secondary">Theme</label>
                    <div className="flex gap-3">
                        <button className="flex-1 px-4 py-3 bg-accent/20 border border-accent rounded-xl text-accent font-medium">
                            🌙 Dark
                        </button>
                        <button className="flex-1 px-4 py-3 bg-background-secondary border border-border rounded-xl text-foreground-secondary font-medium hover:border-accent transition-all">
                            ☀️ Light
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between py-3">
                    <div>
                        <div className="font-medium text-foreground">Auto-save notes</div>
                        <div className="text-sm text-foreground-muted">Automatically save notes to your library</div>
                    </div>
                    <button className="w-12 h-6 bg-accent rounded-full relative">
                        <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                    </button>
                </div>
            </div>

            <button className="px-6 py-3 bg-gradient-accent text-white rounded-xl font-medium hover:shadow-glow transition-all">
                Save Preferences
            </button>
        </div>
    );
}

function NotificationSettings() {
    return (
        <div className="glass rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Notification Settings</h2>

            <div className="space-y-4">
                {[
                    { title: "Email notifications", desc: "Receive updates via email" },
                    { title: "Study reminders", desc: "Daily reminders to continue learning" },
                    { title: "Weekly summary", desc: "Get a weekly progress report" },
                    { title: "New features", desc: "Be notified about new features" },
                ].map((item) => (
                    <div key={item.title} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div>
                            <div className="font-medium text-foreground">{item.title}</div>
                            <div className="text-sm text-foreground-muted">{item.desc}</div>
                        </div>
                        <button className="w-12 h-6 bg-background-tertiary rounded-full relative">
                            <span className="absolute left-1 top-1 w-4 h-4 bg-foreground-muted rounded-full" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SubscriptionSettings() {
    return (
        <div className="glass rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">Subscription</h2>

            <div className="p-4 bg-background-tertiary rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-lg font-semibold text-foreground">Free Plan</div>
                        <div className="text-sm text-foreground-muted">Current plan</div>
                    </div>
                    <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium">Active</span>
                </div>
                <ul className="space-y-2 text-sm text-foreground-secondary">
                    <li>✓ 10 notes per month</li>
                    <li>✓ Basic AI features</li>
                    <li>✓ Study chat</li>
                </ul>
            </div>

            <div className="p-4 border border-accent rounded-xl">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-lg font-semibold text-foreground">Pro Plan</div>
                        <div className="text-sm text-accent">$9.99/month</div>
                    </div>
                    <button className="px-4 py-2 bg-gradient-accent text-white rounded-lg font-medium hover:shadow-glow transition-all">
                        Upgrade
                    </button>
                </div>
                <ul className="space-y-2 text-sm text-foreground-secondary">
                    <li>✓ Unlimited notes</li>
                    <li>✓ Advanced AI coach</li>
                    <li>✓ Priority support</li>
                    <li>✓ Export to PDF</li>
                </ul>
            </div>
        </div>
    );
}

function ApiSettings() {
    return (
        <div className="glass rounded-xl p-6 space-y-6">
            <h2 className="text-xl font-semibold text-foreground">API Keys</h2>
            <p className="text-foreground-secondary">
                Configure your own API keys for enhanced functionality.
            </p>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground-secondary">Gemini API Key</label>
                    <input
                        type="password"
                        placeholder="AIza..."
                        className="w-full px-4 py-3 bg-background-secondary border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all font-mono"
                    />
                    <p className="text-xs text-foreground-muted">
                        Get your API key from{" "}
                        <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                            Google AI Studio
                        </a>
                    </p>
                </div>
            </div>

            <button className="px-6 py-3 bg-gradient-accent text-white rounded-xl font-medium hover:shadow-glow transition-all">
                Save API Keys
            </button>
        </div>
    );
}
