import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                // Premium dark theme colors
                background: {
                    DEFAULT: "#0a0a0b",
                    secondary: "#141416",
                    tertiary: "#1c1c1f",
                    elevated: "#242428",
                },
                foreground: {
                    DEFAULT: "#fafafa",
                    secondary: "#a1a1aa",
                    muted: "#71717a",
                },
                accent: {
                    DEFAULT: "#6366f1",
                    secondary: "#8b5cf6",
                    hover: "#818cf8",
                },
                border: {
                    DEFAULT: "#27272a",
                    light: "#3f3f46",
                },
                success: "#22c55e",
                warning: "#f59e0b",
                error: "#ef4444",
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
                mono: ["JetBrains Mono", "Menlo", "monospace"],
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.3s ease-out",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                shimmer: "shimmer 2s infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(10px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-200% 0" },
                    "100%": { backgroundPosition: "200% 0" },
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-accent": "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                shimmer:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
            },
            boxShadow: {
                glow: "0 0 20px rgba(99, 102, 241, 0.3)",
                "glow-lg": "0 0 40px rgba(99, 102, 241, 0.4)",
                elevated: "0 8px 32px rgba(0, 0, 0, 0.4)",
            },
        },
    },
    plugins: [],
} satisfies Config;
