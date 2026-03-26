import { useEffect, useState } from "react";

export const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const newSocket = new WebSocket("ws://localhost:8080");

        newSocket.onopen = () => {
            console.log("WebSocket connection established");
        };

        newSocket.onmessage = (event) => {
            setMessages((prevMessages) => [...prevMessages, event.data]);
        };

        newSocket.onclose = () => {
            console.log("WebSocket connection closed");
        };
        setSocket(newSocket);
        return () => newSocket.close();
    }, []);

    const sendMessage = () => {
        if (socket && input.trim()) {
            socket.send(input);
            setInput("");
        }
    };

    return (
        <div>
            <h1>WebSocket Chat</h1>
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className="chat-message">
                        {msg}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}