import React, { useState, useRef, useEffect } from "react";

function AiChat() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // 使用 useRef 來保存 EventSource 實例，避免因為 re-render 而重複建立
  const eventSourceRef = useRef(null);

  // 處理表單提交
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!question || isStreaming) {
      return;
    }

    // 清空上次的回答
    setResponse("");
    setIsStreaming(true);

    // 建立 EventSource 連線
    const url = `http://localhost:8080/ai/ask?q=${encodeURIComponent(
      question
    )}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    // 監聽 open 事件
    es.onopen = () => {
      console.log("SSE connection opened.");
    };

    // 監聽 message 事件
    es.onmessage = (event) => {
      // 使用 functional update 確保 state 更新是基於最新的狀態
      setResponse((prevResponse) => prevResponse + event.data);
    };

    // 監聽 error 事件
    es.onerror = (err) => {
      console.error("EventSource failed:", err);
      es.close();
      setIsStreaming(false);
    };
  };

  // 元件卸載時，確保關閉連線
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="ai-chat-container">
      <h1>React + Spring AI 串流問答</h1>
      <div className="response-area">
        {response}
        {isStreaming && <span className="cursor"></span>}
      </div>
      <form onSubmit={handleSubmit} className="input-form">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="請在這裡輸入問題..."
          disabled={isStreaming}
        />
        <button type="submit" disabled={isStreaming}>
          {isStreaming ? "傳送中..." : "提問"}
        </button>
      </form>
    </div>
  );
}

export default AiChat;
