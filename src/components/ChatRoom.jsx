import React, { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Form, Button, ListGroup, InputGroup } from "react-bootstrap";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs.min.js";
import { useUser } from "../context/UserContext";
import Draggable from "react-free-draggable";

// 1. 外層容器
const CenteredModalWrapper = ({ children, show }) =>
  show ? (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.2)", // 淡淡遮罩
      }}
    >
      {children}
    </div>
  ) : null;

//只要 DraggableDialog 在 function 外部宣告，React 只會認得它是同一個元件，Modal 內容就不會每次輸入都被重建
const DraggableDialog = React.forwardRef((props, ref) => {
  return (
    <Draggable handle=".modal-header" nodeRef={ref}>
      <div
        ref={ref}
        {...props}
        style={{
          position: "fixed",
          top: "20%",
          left: "30%",
          width: "800px",
          height: "1000px",
          transform: "translateX(-50%)",
        }}
      />
    </Draggable>
  );
});
const ChatRoom = ({
  show,
  onClose,
  buyerId,
  sellerId,
  storeId,
  storeName,
  buyerName,
  ...otherProps
}) => {
  const { userId, username, emailcheck, role } = useUser();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  const stompClientRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesRef = useRef([]);
  const isSubscribedRef = useRef(false);
  const nodeRef = useRef(null);
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

        if (chatRoom && chatRoom.data.id) {
          setChatRoomId(chatRoom.data.id);
          await loadChatHistory(chatRoom.data.id);
          setIsHistoryLoaded(true);
          return chatRoom.data.id;
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
      senderId: userId,
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
    <CenteredModalWrapper show={show}>
      <Modal
        show={show}
        onHide={onClose}
        size="md"
        dialogAs={DraggableDialog}
        enforceFocus={false}
        {...otherProps}
      >
        {/* ---------- 頂端：漸層標題 ---------- */}
        <Modal.Header
          closeButton
          className="chat-header text-white py-3 px-4 border-0"
        >
          <Modal.Title className="d-flex align-items-center">
            <i className="bi bi-chat-dots-fill me-2"></i>
            {role == "BUYER" ? (
              <span>與 {storeName} 聊聊</span>
            ) : (
              <span>與 {buyerName} 聊聊</span>
            )}
          </Modal.Title>
          {/* 連線狀態
        <span
          className={`badge ms-auto ${
            isConnected ? "bg-success" : "bg-secondary"
          }`}
        >
          {isConnected ? "已連線" : "連線中..."}
        </span> */}
        </Modal.Header>
        <Modal.Body
          className="d-flex flex-column p-0 chat-body"
          style={{ height: "500px" }}
        >
          <div className="flex-grow-1 overflow-auto px-4 pt-4">
            {!isHistoryLoaded ? (
              <div className="d-flex h-100 justify-content-center align-items-center text-muted">
                <span>載入中…</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="d-flex h-100 flex-column justify-content-center align-items-center text-muted">
                <i className="bi bi-chat-right-dots fs-1"></i>
                <p className="mt-2">開始對話吧！</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isSender = msg.senderId === userId;
                const time = msg.createdAt
                  ? new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";
                return (
                  <div
                    key={`${msg.id || index}-${msg.createdAt || Date.now()}`}
                    className={`d-flex mb-4 ${
                      isSender ? "justify-content-end" : "justify-content-start"
                    }`}
                  >
                    {/* 頭像 */}
                    {!isSender && (
                      <i className="bi bi-shop fs-4 text-secondary me-2 avatar"></i>
                    )}
                    {isSender && (
                      <i className="bi bi-person-circle fs-4 text-secondary ms-2 order-2 avatar"></i>
                    )}

                    {/* 訊息泡泡 */}
                    <div
                      className={`bubble ${
                        isSender ? "bubble-sender" : "bubble-receiver"
                      }`}
                    >
                      {msg.senderId == sellerId ? (
                        <div className="fw-bold small">{storeName}</div>
                      ) : (
                        <div className="fw-bold small">{msg.senderName}</div>
                      )}

                      <div className="mt-1">{msg.content}</div>
                      <div
                        className={`text-end mt-1 small ${
                          isSender ? "text-white-50" : "text-muted"
                        }`}
                      >
                        {time}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* ---------- 底部：輸入區 ---------- */}
          <div className="p-3 border-top bg-white">
            <Form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
            >
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="輸入訊息…"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isConnected}
                  className="rounded-pill bg-light border-0 me-2"
                />
                <Button
                  variant="primary"
                  onClick={sendMessage}
                  disabled={!isConnected || !inputMessage.trim()}
                  className={`d-flex align-items-center justify-content-center ${
                    inputMessage.trim()
                      ? "send-btn-expanded"
                      : "send-btn-compact"
                  }`}
                  style={{
                    borderRadius: "25px",
                    height: "50px",
                    minWidth: inputMessage.trim() ? "90px" : "50px",
                    transition: "all 0.3s ease",
                  }}
                >
                  <i
                    className="bi bi-send-fill"
                    style={{ fontSize: "18px" }}
                  ></i>
                  {inputMessage.trim() && <span className="ms-2">送出</span>}
                </Button>
              </InputGroup>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
    </CenteredModalWrapper>
  );
};

export default ChatRoom;
