import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx"; // 你的主元件
import "bootstrap/dist/css/bootstrap.min.css"; // 引入 Bootstrap 樣式
import "./index.css"; // 自訂樣式（可選）

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {" "}
    {/*正式上線要拔除*/}
    <App />
  </React.StrictMode>
);
