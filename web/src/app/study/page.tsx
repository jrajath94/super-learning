"use client";

import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

export default function StudyPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "👋 Hi! I'm your AI Study Assistant. Ask me questions about your notes, or let me quiz you on what you've learned. What would you like to study today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/v1/agents/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage.content }),
            });

            if (!response.ok) throw new Error("Failed to get response");

            const data = await response.json();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: data.message,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "Sorry, I encountered an error. Please make sure the backend is running and try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestions = [
        "Explain transformers in simple terms",
        "Quiz me on binary search",
        "What are the key insights from my notes?",
        "Suggest what I should study next",
    ];

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 ml-64 flex flex-col h-screen">
                <Header />

                <div className="flex-1 flex flex-col pt-16">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-8 py-6">
                        <div className="max-w-3xl mx-auto space-y-6">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-2xl px-5 py-3 ${message.role === "user"
                                                ? "bg-gradient-accent text-white"
                                                : "glass"
                                            }`}
                                    >
                                        <p className={message.role === "user" ? "" : "text-foreground"}>
                                            {message.content}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="glass rounded-2xl px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                                <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                            </div>
                                            <span className="text-foreground-secondary text-sm">Thinking...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Suggestions */}
                    {messages.length <= 2 && (
                        <div className="px-8 pb-4">
                            <div className="max-w-3xl mx-auto">
                                <p className="text-sm text-foreground-secondary mb-3">Try asking:</p>
                                <div className="flex flex-wrap gap-2">
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setInput(suggestion)}
                                            className="px-4 py-2 bg-background-secondary border border-border rounded-full text-sm text-foreground-secondary hover:text-foreground hover:border-accent transition-all"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="border-t border-border p-4">
                        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask a question about your notes..."
                                    className="flex-1 px-5 py-3 bg-background-secondary border border-border rounded-xl text-foreground placeholder:text-foreground-muted focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-all"
                                    disabled={isLoading}
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || isLoading}
                                    className="px-6 py-3 bg-gradient-accent text-white rounded-xl font-medium hover:shadow-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Send
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}
