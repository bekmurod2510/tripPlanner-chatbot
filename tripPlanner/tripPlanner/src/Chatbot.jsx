import React, { useState, useRef, useEffect } from "react";

const Chatbot = () => {
    const [messages, setMessages] = useState([
        { role: "bot", content: "Hi there! I'm your travel assistant. Click on a destination or ask me about your **next adventure**!" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentTypingIndex, setCurrentTypingIndex] = useState(-1);
    const [displayedText, setDisplayedText] = useState("");
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Sample travel data
    const popularDestinations = [
        { id: 1, name: "Paris", image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80", description: "The city of love and lights" },
        { id: 2, name: "Tokyo", image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400&q=80", description: "Modern meets traditional" },
        { id: 3, name: "New York", image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80", description: "The city that never sleeps" },
        { id: 4, name: "Bali", image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80", description: "Island paradise" },
        { id: 5, name: "Rome", image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80", description: "Eternal city of history" },
        { id: 6, name: "Sydney", image: "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=400&q=80", description: "Harbor city with iconic landmarks" },
    ];

    const travelTips = [
        { id: 1, title: "Packing Essentials", content: "Always pack a universal adapter, portable charger, and photocopies of important documents." },
        { id: 2, title: "Budget Travel", content: "Use public transportation, eat where locals eat, and book accommodations with kitchen facilities." },
        { id: 3, title: "Safety Tips", content: "Keep digital copies of documents, use a money belt, and research common scams at your destination." },
        { id: 4, title: "Jet Lag", content: "Adjust to the local time immediately, stay hydrated, and get sunlight during the day." },
        { id: 5, title: "Local Customs", content: "Research local customs and etiquette before your trip to avoid cultural misunderstandings." },
    ];

    const API_KEY = "AIzaSyBKOZvvRHA7bKszgASlqibodRMHMSA2M-k";
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, displayedText]);

    // Typing effect
    useEffect(() => {
        if (currentTypingIndex >= 0 && currentTypingIndex < messages.length && messages[currentTypingIndex].role === "bot") {
            const fullText = messages[currentTypingIndex].content;

            if (displayedText.length < fullText.length) {
                const timer = setTimeout(() => {
                    setDisplayedText(fullText.substring(0, displayedText.length + 1));
                }, 15 + Math.random() * 10); // Variable typing speed

                return () => clearTimeout(timer);
            } else {
                setCurrentTypingIndex(-1);
            }
        }
    }, [currentTypingIndex, displayedText, messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Format text with bold for text between ** markers
    const formatText = (text) => {
        if (!text) return [];

        // Split by ** markers
        const parts = text.split(/(\*\*[^*]+\*\*)/g);

        return parts.map((part, index) => {
            // Check if this part is surrounded by ** markers
            if (part.startsWith('**') && part.endsWith('**')) {
                // Remove the ** markers and make the text bold
                const boldText = part.substring(2, part.length - 2);
                return <strong key={index}>{boldText}</strong>;
            }
            return <span key={index}>{part}</span>;
        });
    };

    // Format the currently typing text
    const formatTypingText = (text) => {
        if (!text) return [];

        // For the typing text, we need to handle the case where a ** is being typed
        // but hasn't been completed yet
        const parts = [];
        let currentPart = "";
        let inBold = false;
        let boldStart = -1;

        for (let i = 0; i < text.length; i++) {
            if (text[i] === '*' && i + 1 < text.length && text[i + 1] === '*') {
                if (!inBold) {
                    // Start of bold text
                    if (currentPart) parts.push(<span key={parts.length}>{currentPart}</span>);
                    currentPart = "";
                    inBold = true;
                    boldStart = i;
                    i++; // Skip the next *
                } else {
                    // End of bold text
                    parts.push(<strong key={parts.length}>{currentPart}</strong>);
                    currentPart = "";
                    inBold = false;
                    i++; // Skip the next *
                }
            } else {
                currentPart += text[i];
            }
        }

        // Add any remaining text
        if (currentPart) {
            if (inBold) {
                // If we're in the middle of typing a bold section
                parts.push(<strong key={parts.length}>{currentPart}</strong>);
            } else {
                parts.push(<span key={parts.length}>{currentPart}</span>);
            }
        }

        return parts;
    };

    const sendMessage = async (messageText = input) => {
        if (!messageText.trim()) return;

        const userMessage = { role: "user", content: messageText };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch(GEMINI_API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: messageText }] }]
                }),
            });

            const data = await response.json();
            const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text ??
                "I couldn't connect to my knowledge base. Please try again.";

            const botMessage = { role: "bot", content: botReply };
            setMessages(prev => [...prev, botMessage]);

            // Start typing effect
            setCurrentTypingIndex(messages.length + 1); // +1 because we just added two messages
            setDisplayedText("");
        } catch (error) {
            console.error("Gemini API error:", error);
            const errorMessage = { role: "bot", content: "Something went wrong. Please try again." };
            setMessages(prev => [...prev, errorMessage]);

            // Start typing effect for error message
            setCurrentTypingIndex(messages.length + 1);
            setDisplayedText("");
        } finally {
            setLoading(false);
        }
    };

    const handleDestinationClick = (destination) => {
        sendMessage(`Tell me about **${destination.name}** as a travel destination.`);
    };

    const handleTipClick = (tip) => {
        sendMessage(`Tell me more about **${tip.title}** for travelers.`);
    };

    return (
        <div style={{
            display: "flex",
            height: "100vh",
            width: "100%",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
            backgroundColor: "#f9f9f9"
        }}>
            {/* Left Column - Travel Options */}
            <div style={{
                width: "35%",
                height: "100%",
                borderRight: "1px solid #e0e0e0",
                overflowY: "auto",
                backgroundColor: "#ffffff",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "24px"
            }}>
                <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", fontWeight: "500", color: "#1a73e8" }}>
                    Travel Explorer
                </h2>

                {/* Popular Destinations - Horizontal Scroll */}
                <div>
                    <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "500" }}>Popular Destinations</h3>
                    <div style={{
                        display: "flex",
                        overflowX: "auto",
                        gap: "16px",
                        paddingBottom: "16px",
                        scrollbarWidth: "thin",
                        scrollbarColor: "#c1c1c1 #f1f1f1"
                    }}>
                        {popularDestinations.map(destination => (
                            <div
                                key={destination.id}
                                onClick={() => handleDestinationClick(destination)}
                                style={{
                                    minWidth: "200px",
                                    borderRadius: "12px",
                                    overflow: "hidden",
                                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                                    cursor: "pointer",
                                    transition: "transform 0.2s, box-shadow 0.2s",
                                    ":hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                                    }
                                }}
                            >
                                <div style={{
                                    height: "120px",
                                    backgroundImage: `url(${destination.image})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center"
                                }}></div>
                                <div style={{ padding: "12px" }}>
                                    <h4 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>{destination.name}</h4>
                                    <p style={{ margin: 0, fontSize: "14px", color: "#70757a" }}>{destination.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Travel Tips - Vertical Scroll */}
                <div style={{ flex: 1, overflowY: "auto" }}>
                    <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: "500" }}>Travel Tips</h3>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px"
                    }}>
                        {travelTips.map(tip => (
                            <div
                                key={tip.id}
                                onClick={() => handleTipClick(tip)}
                                style={{
                                    padding: "16px",
                                    borderRadius: "8px",
                                    backgroundColor: "#f8f9fa",
                                    cursor: "pointer",
                                    transition: "background-color 0.2s",
                                    ":hover": {
                                        backgroundColor: "#f1f3f4"
                                    }
                                }}
                            >
                                <h4 style={{ margin: "0 0 8px 0", fontSize: "15px" }}>{tip.title}</h4>
                                <p style={{ margin: 0, fontSize: "14px", color: "#5f6368" }}>{tip.content}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Column - Chat Interface */}
            <div style={{
                width: "65%",
                height: "100%",
                display: "flex",
                flexDirection: "column"
            }}>
                {/* Chat Header */}
                <div style={{
                    padding: "16px 24px",
                    borderBottom: "1px solid #e0e0e0",
                    backgroundColor: "#ffffff",
                    display: "flex",
                    alignItems: "center"
                }}>
                    <h2 style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: "500",
                        color: "#202124"
                    }}>
                        Travel Assistant
                    </h2>
                </div>

                {/* Chat Messages */}
                <div
                    ref={chatContainerRef}
                    style={{
                        flex: 1,
                        padding: "20px 24px",
                        overflowY: "auto",
                        backgroundColor: "#ffffff",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px"
                    }}
                >
                    {messages.map((msg, index) => (
                        <div key={index} style={{
                            display: "flex",
                            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                            position: "relative"
                        }}>
                            <div style={{
                                maxWidth: "80%",
                                padding: "12px 16px",
                                borderRadius: "18px",
                                backgroundColor: msg.role === "user" ? "#1a73e8" : "#f1f3f4",
                                color: msg.role === "user" ? "white" : "#202124",
                                fontSize: "15px",
                                lineHeight: "1.5",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                            }}>
                                {currentTypingIndex === index ? (
                                    <>
                                        {formatTypingText(displayedText)}
                                        <span style={{ marginLeft: "4px" }}>▋</span>
                                    </>
                                ) : (
                                    formatText(msg.content)
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start"
                        }}>
                            <div style={{
                                padding: "12px 16px",
                                borderRadius: "18px",
                                backgroundColor: "#f1f3f4",
                                color: "#202124"
                            }}>
                                <div style={{
                                    display: "flex",
                                    gap: "6px",
                                    alignItems: "center",
                                    height: "10px"
                                }}>
                                    <div style={{
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        backgroundColor: "#70757a",
                                        opacity: 0.6,
                                        animation: "pulse 1.5s infinite"
                                    }}></div>
                                    <div style={{
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        backgroundColor: "#70757a",
                                        opacity: 0.6,
                                        animation: "pulse 1.5s infinite",
                                        animationDelay: "0.2s"
                                    }}></div>
                                    <div style={{
                                        width: "6px",
                                        height: "6px",
                                        borderRadius: "50%",
                                        backgroundColor: "#70757a",
                                        opacity: 0.6,
                                        animation: "pulse 1.5s infinite",
                                        animationDelay: "0.4s"
                                    }}></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{
                    padding: "16px 24px",
                    borderTop: "1px solid #e0e0e0",
                    backgroundColor: "#ffffff"
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        backgroundColor: "#f1f3f4",
                        borderRadius: "24px",
                        padding: "8px 16px"
                    }}>
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Ask about destinations, tips, or travel plans..."
                            style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                backgroundColor: "transparent",
                                fontSize: "15px",
                                padding: "8px 0"
                            }}
                            onKeyDown={e => e.key === "Enter" && sendMessage()}
                        />
                        <button
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            style={{
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                padding: "8px",
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: (loading || !input.trim()) ? 0.5 : 1
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 2L11 13" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#1a73e8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* CSS Animation */}
            <style>
                {`
          @keyframes pulse {
            0%, 100% { transform: scale(0.8); opacity: 0.5; }
            50% { transform: scale(1.2); opacity: 1; }
          }
          
          /* Custom scrollbar styling */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: #a8a8a8;
          }
        `}
            </style>
        </div>
    );
};

export default Chatbot;