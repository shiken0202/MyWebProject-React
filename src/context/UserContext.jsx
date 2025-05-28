// src/context/UserContext.js
import { createContext, useContext, useState } from "react";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [emailcheck, setEmailcheck] = useState(false);
  const [role, setRole] = useState("");
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
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
