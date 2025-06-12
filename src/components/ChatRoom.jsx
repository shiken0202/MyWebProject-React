import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Form, Button, ListGroup } from "react-bootstrap";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs.min.js";

const ChatRoom = ({ show, onClose, buyerId, storeId, storeName }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesRef = useRef([]);
  const isSubscribedRef = useRef(false);

  // 同步 messages state 到 ref
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // 使用 useCallback 避免 closure 問題
  const addMessage = useCallback((newMessage) => {
    setMessages((prev) => {
      const updated = [...prev, newMessage];
      messagesRef.current = updated;
      return updated;
    });
  }, []);

  useEffect(() => {
    if (show && buyerId && storeId) {
      // 重置狀態
      setMessages([]);
      setChatRoomId(null);
      setIsHistoryLoaded(false);
      isSubscribedRef.current = false;

      // 先嘗試獲取聊天室和歷史訊息
      initializeChatRoom().then((roomId) => {
        // 建立 WebSocket 連線
        connectWebSocket(roomId); // 若已知 chatRoomId，直接訂閱正式頻道
      });
    }
    return () => {
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [show, buyerId, storeId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初始化聊天室和載入歷史訊息
  const initializeChatRoom = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/chat/room?buyerId=${buyerId}&storeId=${storeId}`,
        { credentials: "include" }
      );
      if (response.ok) {
        const chatRoom = await response.json();
        if (chatRoom && chatRoom.id) {
          setChatRoomId(chatRoom.id);
          await loadChatHistory(chatRoom.id);
          setIsHistoryLoaded(true);
          return chatRoom.id;
        }
      }
      // 沒有聊天室，標記已載入（但不載入任何訊息）
      setIsHistoryLoaded(true);
      return null;
    } catch (error) {
      setIsHistoryLoaded(true);
      return null;
    }
  };

  const connectWebSocket = (knownRoomId) => {
    const socket = new SockJS("http://localhost:8080/chat-websocket");
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        setIsConnected(true);

        if (knownRoomId && !isSubscribedRef.current) {
          subscribeToMainChannel(client, knownRoomId);
        } else {
          subscribeToTempChannel(client);
        }
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;
  };

  // 訂閱臨時頻道（用於聊天室建立時）
  const subscribeToTempChannel = (client) => {
    const tempRoomId = `${buyerId}_${storeId}`;
    client.subscribe(`/topic/messages/${tempRoomId}`, (message) => {
      const newMessage = JSON.parse(message.body);
      addMessage(newMessage);

      // 如果收到 chatRoomId 且還沒訂閱正式頻道
      if (newMessage.chatRoomId && !isSubscribedRef.current) {
        setChatRoomId(newMessage.chatRoomId);
        subscribeToMainChannel(client, newMessage.chatRoomId);
        // 發送第一條訊息後自動載入歷史訊息
        if (!isHistoryLoaded) {
          loadChatHistory(newMessage.chatRoomId);
          setIsHistoryLoaded(true);
        }
      }
    });
  };

  // 訂閱正式頻道
  const subscribeToMainChannel = (client, roomId) => {
    if (isSubscribedRef.current) return;
    isSubscribedRef.current = true;
    client.subscribe(`/topic/messages/${roomId}`, (msg) => {
      const mainMsg = JSON.parse(msg.body);
      addMessage(mainMsg);
    });
  };

  const loadChatHistory = async (roomId) => {
    try {
      const response = await fetch(`http://localhost:8080/chat/${roomId}`, {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setMessages(data.data);
          messagesRef.current = data.data;
        }
      }
    } catch (error) {
      // 忽略歷史訊息載入失敗
    }
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !stompClientRef.current || !isConnected) return;
    const messageData = {
      senderId: buyerId,
      content: inputMessage,
    };
    stompClientRef.current.publish({
      destination: `/app/chatRoom/${buyerId}/${storeId}`,
      body: JSON.stringify(messageData),
    });
    setInputMessage("");
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-chat-dots me-2"></i>與 {storeName} 聊聊
        </Modal.Title>
        <div className="ms-auto">
          <span
            className={`badge ${isConnected ? "bg-success" : "bg-secondary"}`}
          >
            {isConnected ? "已連線" : "連線中..."}
          </span>
        </div>
      </Modal.Header>
      <Modal.Body
        style={{ height: "400px", display: "flex", flexDirection: "column" }}
      >
        <div
          className="flex-grow-1 overflow-auto mb-3 border rounded p-3"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <div style={{ minHeight: "20px" }}>
            {!isHistoryLoaded ? (
              <div className="text-center text-muted py-4">
                <span>載入中...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center text-muted py-4">
                <i className="bi bi-chat-square-text fs-1"></i>
                <p className="mt-2">開始對話吧！</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {messages.map((msg, index) => (
                  <ListGroup.Item
                    key={`${msg.id || index}-${msg.createdAt || Date.now()}`}
                    className={`border-0 mb-2 ${
                      msg.senderId === buyerId ? "text-end" : "text-start"
                    }`}
                    style={{ backgroundColor: "transparent" }}
                  >
                    <div
                      className={`d-inline-block p-2 rounded ${
                        msg.senderId === buyerId
                          ? "bg-primary text-white"
                          : "bg-white border"
                      }`}
                      style={{ maxWidth: "75%" }}
                    >
                      <div>{msg.content}</div>
                      <small
                        className={`${
                          msg.senderId === buyerId ? "text-light" : "text-muted"
                        }`}
                      >
                        {msg.createdAt
                          ? new Date(msg.createdAt).toLocaleTimeString()
                          : ""}
                      </small>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <div className="d-flex gap-2">
            <Form.Control
              type="text"
              placeholder="輸入訊息..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!isConnected}
            />
            <Button
              variant="primary"
              onClick={sendMessage}
              disabled={!isConnected || !inputMessage.trim()}
            >
              <i className="bi bi-send"></i>
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ChatRoom;
