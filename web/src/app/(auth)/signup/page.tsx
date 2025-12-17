"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        // TODO: Integrate with Supabase Auth
        await new Promise((resolve) => setTimeout(resolve, 1000));

        router.push("/dashboard");
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12">
            {/* Background Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gradient-radial from-accent-secondary/20 via-accent/10 to-transparent opacity-50 blur-3xl" />
            </div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <span className="text-3xl">📚</span>
                        <span className="text-2xl font-bold gradient-text">Super-Learning</span>
                    </Link>
                    <p className="mt-2 text-foreground-secondary">
                        Create an account to start your learning journey.
                    </p>
                </div>

                {/* Signup Form */}
                <div className="glass rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-foreground-secondary">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                required
                                className="w-full px-4 py-3 bg-background-secondary border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-foreground-secondary">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="w-full px-4 py-3 bg-background-secondary border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-foreground-secondary">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={8}
                                className="w-full px-4 py-3 bg-background-secondary border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground-secondary">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full px-4 py-3 bg-background-secondary border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-error/20 border border-error/50 rounded-lg text-error text-sm">
                                {error}
                            </div>
                        )}

                        <div className="flex items-start gap-2">
                            <input
                                id="terms"
                                type="checkbox"
                                required
                                className="mt-1 w-4 h-4 rounded border-border bg-background-secondary text-accent focus:ring-accent"
                            />
                            <label htmlFor="terms" className="text-sm text-foreground-secondary">
                                I agree to the{" "}
                                <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link>
                                {" "}and{" "}
                                <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 bg-gradient-accent text-white rounded-xl font-semibold hover:shadow-glow transition-all disabled:opacity-50"
                        >
                            {isLoading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-foreground-secondary">
                        Already have an account?{" "}
                        <Link href="/login" className="text-accent hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
