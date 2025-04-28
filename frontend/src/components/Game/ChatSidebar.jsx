import { useState, useRef, useEffect } from "react";
import "./ChatSidebar.css";

const ChatSidebar = ({ socket, roomKey, username, onClose, messages, userName }) => {
  const [message, setMessage] = useState("");
  const messageRef = useRef(null);

  const sendMessage = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage === "") return;

    socket.emit("send-message", { roomKey, username, message: trimmedMessage });
    setMessage("");
  };

  const handleKeyDown=(e)=>{
    if(e.key=="Enter"){
      e.preventDefault();
      sendMessage();
    }
  }
  useEffect(()=>{
    if(messageRef.current){
      messageRef.current.scrollIntoView({behaviour:"smooth"})
    }
  },[messages])
  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <h3>💬 Chat</h3>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>

      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className="chat-message">
            <span>-- {msg.message}</span>
          </div>
        ))}
        <div ref={messageRef}/>
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={handleKeyDown}
        />
        <button className="send-btn" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatSidebar;
