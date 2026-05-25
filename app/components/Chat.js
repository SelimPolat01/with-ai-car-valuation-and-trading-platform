"use client";

import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useRouter } from "next/navigation";
import classes from "./Chat.module.css";
import SecondaryButton from "./SecondaryButton";

export default function Chat({ currentUserId, initialTargetUserId, advertId }) {
  const [advertInfo, setAdvertInfo] = useState({
    name: "",
    surname: "",
    tel: "",
  });
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const socketRef = useRef();
  const [targetUserId, setTargetUserId] = useState(initialTargetUserId);

  useEffect(() => {
    if (messages.length > 0) {
      const firstMessage = messages[0];
      const otherUserId =
        firstMessage.user_id === currentUserId
          ? firstMessage.receiver_id
          : firstMessage.user_id;
      setTargetUserId(otherUserId);
    }
  }, [messages, currentUserId]);

  useEffect(() => {
    async function fetchMessages() {
      if (!advertId) return;
      const token = localStorage.getItem("token");
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/adverts/messages/${advertId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message);
          return;
        }

        const messageData = await response.json();

        setMessages(
          messageData.map((msg) => ({
            id: msg.id,
            message: msg.message,
            user_id: msg.user_id,
            receiver_id: msg.receiver_id,
            created_at: msg.created_at
              ? msg.created_at
              : new Date().toISOString(),
          })),
        );
      } catch (err) {
        console.log("Error: " + err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [router, advertId]);

  useEffect(() => {
    async function fetchAdvertInfos() {
      const token = localStorage.getItem("token");
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/adverts/${advertId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (response.status === 401) {
          localStorage.removeItem("token");
          router.replace("/login");
          return;
        }

        if (!response.ok) {
          const errorData = await response.json();
          setError(errorData.message);
          return;
        }

        const advertData = await response.json();
        setAdvertInfo({
          name: advertData.user_name,
          surname: advertData.user_surname,
          tel: advertData.user_tel,
        });
      } catch (err) {
        console.log("Error: " + err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAdvertInfos();
  }, [router]);

  function messageInputChangeHandler(event) {
    setMessage(event.target.value);
  }

  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_URL);
    socketRef.current.emit("register", currentUserId);
    socketRef.current.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socketRef.current.disconnect();
  }, [currentUserId]);

  async function sendMessage() {
    if (message.trim() === "") return;
    socketRef.current.emit("sendMessageToUser", {
      senderId: currentUserId,
      receiverId: targetUserId,
      advertId: advertId,
      message: message,
    });
    setMessage("");
  }

  function capitalizeText(text) {
    if (typeof text !== "string") {
      return "";
    }

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  if (error) return <p>{error}</p>;

  return (
    <div className={classes.div}>
      <div className={classes.wrapperDiv}>
        <div className={classes.advertOwnerInfo}>
          <h3 className={classes.advertOwnerName}>
            {capitalizeText(advertInfo.name)}{" "}
            {capitalizeText(advertInfo.surname?.charAt(0))}.
          </h3>
          <div
            className={advertInfo.name !== "" ? classes.advertOwnerTelDiv : ""}
          >
            <p className={classes.advertOwnerTel}>{advertInfo.tel}</p>
          </div>
        </div>
        <div className={classes.messageDiv}>
          <ul className={classes.ul}>
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`${classes.messageBoxDiv} ${
                    msg.user_id === currentUserId ? classes.flexEndMessage : ""
                  }`}
                >
                  <div
                    className={`${classes.messageBoxWrapper} ${
                      msg.user_id === currentUserId ? classes.greenBox : ""
                    }`}
                  >
                    <li className={classes.li}>{msg.message}</li>
                    <span className={classes.messageCreatedAt}>
                      {msg.created_at &&
                        new Date(msg.created_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }) +
                          " " +
                          new Date(msg.created_at).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p>Mesajınız bulunmamaktadır.</p>
            )}
          </ul>
        </div>
        <div className={classes.inputButtonDiv}>
          <input
            type="text"
            placeholder="Mesaj yaz..."
            value={message}
            onChange={messageInputChangeHandler}
            className={classes.input}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <SecondaryButton
            className={classes.button}
            text="Gönder"
            type="button"
            onClick={sendMessage}
          />
        </div>
      </div>
    </div>
  );
}
