import React, { useEffect } from "react";

const Chatbot = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
        script.async = true;
        document.head.appendChild(script);
    }, []);

    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
            <df-messenger
                intent="WELCOME"
                chat-title="TravelPlannerAgent"
                agent-id="4eb6799b-5201-431e-97d6-764d4d493074"
                language-code="en"
                embedded="true"
            >
                {/* 👇 This tag is required for embedded mode to work */}
                <df-messenger-chat
                    chat-title="TravelPlannerAgent"
                    agent-id="4eb6799b-5201-431e-97d6-764d4d493074"
                    language-code="en"
                ></df-messenger-chat>
            </df-messenger>
        </div>
    );
};

export default Chatbot;