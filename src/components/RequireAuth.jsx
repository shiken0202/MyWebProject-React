// src/components/RequireAuth.jsx
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

function RequireAuth({ children }) {
  const { userId } = useUser();
  // 判斷 userId 是否有值，沒值代表沒登入
  if (!userId) {
    // 未登入，導向登入頁
    return <Navigate to="/login" replace />;
  }
  // 已登入，顯示原本內容
  return children;
}

export default RequireAuth;
