"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/signup");

    if (isAuthPage) return null;

    return (
        <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    <span className="text-2xl">📚</span>
                    <span className="font-semibold text-lg gradient-text">
                        Super-Learning
                    </span>
                </Link>

                <nav className="flex items-center gap-6">
                    <NavLink href="/">Home</NavLink>
                    <NavLink href="/dashboard">Dashboard</NavLink>
                    <NavLink href="/dashboard/notes">Notes</NavLink>
                    <NavLink href="/study">Study</NavLink>
                    <NavLink href="/dashboard/insights">Insights</NavLink>
                    <div className="flex items-center gap-3 ml-4">
                        <Link
                            href="/login"
                            className="text-foreground-secondary hover:text-foreground transition-colors text-sm"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="px-4 py-2 bg-gradient-accent text-white rounded-lg font-medium hover:shadow-glow transition-all"
                        >
                            Get Started
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-foreground-secondary hover:text-foreground transition-colors text-sm"
        >
            {children}
        </Link>
    );
}
