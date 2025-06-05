// src/context/UserContext.js
import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  // 初始化時從 localStorage 取值
  const [userId, setUserIdState] = useState(
    localStorage.getItem("userId") || ""
  );
  const [username, setUsernameState] = useState(
    localStorage.getItem("username") || ""
  );
  const [emailcheck, setEmailcheckState] = useState(
    localStorage.getItem("emailcheck") === "true"
  );
  const [role, setRoleState] = useState(localStorage.getItem("role") || "");

  // 包裝 setter，讓每次設定時都同步寫入 localStorage
  const setUserId = (id) => {
    setUserIdState(id);
    localStorage.setItem("userId", id);
  };

  const setUsername = (name) => {
    setUsernameState(name);
    localStorage.setItem("username", name);
  };

  const setEmailcheck = (check) => {
    setEmailcheckState(check);
    localStorage.setItem("emailcheck", check);
  };

  const setRole = (role) => {
    setRoleState(role);
    localStorage.setItem("role", role);
  };

  // 登出時清空所有
  const logout = () => {
    setUserIdState("");
    setUsernameState("");
    setEmailcheckState(false);
    setRoleState("");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    localStorage.removeItem("emailcheck");
    localStorage.removeItem("role");
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        username,
        setUsername,
        emailcheck,
        setEmailcheck,
        role,
        setRole,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
