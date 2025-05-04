import React, { useEffect } from "react";

const Chatbot = () => {
    useEffect(() => {
        // Inject the Dialogflow Messenger script once
        const script = document.createElement("script");
        script.src = "https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1";
        script.async = true;
        document.body.appendChild(script);

        // Inject the <df-messenger> element into the DOM
        const messenger = document.createElement("df-messenger");
        messenger.setAttribute("intent", "WELCOME");
        messenger.setAttribute("chat-title", "TravelPlannerAgent");
        messenger.setAttribute("agent-id", "4eb6799b-5201-431e-97d6-764d4d493074");
        messenger.setAttribute("language-code", "en");

        document.body.appendChild(messenger);
    }, []);

    return null; // This component injects the bot, nothing to render directly
};

export default Chatbot;