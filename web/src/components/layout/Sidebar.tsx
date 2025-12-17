"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/", label: "Generate", icon: "✨" },
    { href: "/dashboard/notes", label: "My Notes", icon: "📝" },
    { href: "/study", label: "Study Chat", icon: "🤖" },
    { href: "/dashboard/insights", label: "Insights", icon: "📊" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-background-secondary border-r border-border flex flex-col z-40">
            {/* Logo */}
            <div className="h-16 flex items-center px-6 border-b border-border">
                <Link href="/" className="flex items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <span className="font-semibold text-lg gradient-text">Super-Learning</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isActive
                                    ? "bg-accent/20 text-accent shadow-glow"
                                    : "text-foreground-secondary hover:text-foreground hover:bg-background-tertiary"
                                }
              `}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background-tertiary">
                    <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-white font-semibold">
                        U
                    </div>
                    <div>
                        <div className="font-medium text-foreground text-sm">User</div>
                        <div className="text-xs text-foreground-muted">Free Plan</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
