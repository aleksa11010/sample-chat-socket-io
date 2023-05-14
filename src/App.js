import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./App.css";

const socket = io("http://localhost:8000/");

function App() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [room, setRoom] = useState("");
  const [currentRoom, setCurrentRoom] = useState("");
  const [status, setStatus] = useState("Disconnected");

  useEffect(() => {
    socket.on("connect", () => {
      setStatus("Connected");
    });

    socket.on("disconnect", () => {
      setStatus("Disconnected");
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);

  useEffect(() => {
    socket.on("reply", (msg) => {
      setMessages((oldMessages) => [...oldMessages, msg]);
    });

    return () => socket.off("reply");
  }, []);

  useEffect(() => {
    socket.on("room message", (msg) => {
      setMessages((oldMessages) => [...oldMessages, msg]);
    });

    return () => socket.off("room message");
  }, []);

  const joinRoom = (e) => {
    e.preventDefault();
    socket.emit("join_room", room, (data) => {
      setMessages((oldMessages) => [...oldMessages, "ACK CALLBACK: " + data]);
      setCurrentRoom(room);
    });
    setRoom("");
  };

  const sendMessage = (e) => {
    e.preventDefault();
    socket.emit("msg", message, currentRoom, (data) => {
      setMessages((oldMessages) => [...oldMessages, "ACK CALLBACK: " + data]);
    });

    socket.emit("notice", message);
    setMessage("");
  };

  return (
    <div>
      <div className={`status ${status === "Connected" ? "connected" : "disconnected"}`}>{status}</div>
      <h1>Current Room: {currentRoom}</h1>
      <ul id="messages">
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      <form onSubmit={joinRoom}>
        <input
          id="m"
          autoComplete="off"
          placeholder="Enter message"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
        <button id="sendBtn" onClick={sendMessage}>
          Send
        </button>
        <br />
        <input
          id="room"
          autoComplete="off"
          placeholder="Enter room name"
          onChange={(e) => setRoom(e.target.value)}
          value={room}
        />
        <button id="joinBtn" type="submit">
          Join Room
        </button>
      </form>
    </div>
  );
}

export default App;
