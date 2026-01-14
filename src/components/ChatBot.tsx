
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaPaperPlane, FaTimes, FaCommentAlt } from 'react-icons/fa';
import styles from './ChatBot.module.css';
import { getApiUrl } from '@/utils/api';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const ChatBot: React.FC = () => {
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hello! I am MieT AI. How can I assist you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);

        // Periodic help tooltip logic
        const interval = setInterval(() => {
            if (!isOpen) {
                setShowTooltip(true);
                setTimeout(() => setShowTooltip(false), 5000); // Hide after 5 seconds
            }
        }, 15000); // Show every 15 seconds

        return () => clearInterval(interval);
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const userContent = input.trim();
        if (!userContent || isLoading) return;

        const userMessage: Message = { role: 'user', content: userContent };
        const currentMessages = [...messages, userMessage];

        // Update UI immediately
        setMessages(currentMessages);
        setIsLoading(true);

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('user_jwt') : null;
            // Filter out the initial greeting for the API if it's the first message and from assistant
            const apiMessages = currentMessages.length > 1 && currentMessages[0].role === 'assistant'
                ? currentMessages.slice(1)
                : currentMessages;

            const response = await fetch(getApiUrl('api/chat'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...(token && token.length > 5 && { 'Authorization': `Bearer ${token}` }),
                },
                body: JSON.stringify({
                    messages: apiMessages.map(m => ({
                        role: m.role,
                        content: m.content
                    }))
                }),
            });

            // Requirement 5: Clear input AFTER the message has been stored and sent
            setInput('');

            const data = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(data.message || data.error || `Error ${response.status}: Failed to get response`);
            }

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.message || data.reply || data.content || 'I am sorry, I am having trouble connecting right now.'
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error: any) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: error.message || 'Sorry, I encountered an error. Please try again later.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className={styles.chatbotContainer}>
            {isOpen && (
                <div className={styles.chatWindow}>
                    <div className={styles.chatHeader}>
                        <FaRobot className={styles.headerIcon} />
                        <div className={styles.headerInfo}>
                            <h3>MieT AI Support</h3>
                            <p>Online | Ask me anything</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className={styles.closeButton}
                            aria-label="Close Chat"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    <div className={styles.chatMessages}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.aiMessage}`}
                            >
                                {msg.content}
                            </div>
                        ))}
                        {isLoading && (
                            <div className={styles.loadingMessage}>
                                <span>MieT AI is thinking</span>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                                <div className={styles.dot}></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className={styles.chatInputArea}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className={styles.chatInput}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className={styles.sendButton}
                            disabled={isLoading || !input.trim()}
                        >
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}

            {showTooltip && !isOpen && (
                <div className={styles.helpTooltip}>
                    Need help? Ask me!
                </div>
            )}
            <button
                className={`${styles.chatButton} ${isOpen ? styles.chatButtonActive : ''}`}
                onClick={() => {
                    setIsOpen(!isOpen);
                    setShowTooltip(false);
                }}
                aria-label="Toggle Chat"
            >
                {isOpen ? <FaTimes /> : <FaCommentAlt />}
            </button>
        </div>
    );
};

export default ChatBot;
