import React, { useState, useEffect } from "react";
import MyNavbar from "../components/MyNavbar";
import { Container, Table, Button } from "react-bootstrap";
import { useUser } from "../context/UserContext";
function UserList() {
  const [users, setUsers] = useState([]);
  const { userId, username, emailcheck, role } = useUser();
  useEffect(() => {
    fetchUsers(); // 在元件掛載時獲取使用者資料
  }, []);
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/userlist", {
        method: "GET",
        credentials: "include",
      });
      const resData = await res.json();
      console.log(resData);
      console.log(resData.data);
      setUsers(resData.data);
    } catch (error) {}
  };
  const roleMap = { ADMIN: "管理員", BUYER: "買家", SELLER: "賣家" };
  return (
    <>
      <MyNavbar />
      <Container className="WebContent">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>使用者ID</th>
              <th>使用者帳號</th>
              <th>使用者信箱</th>
              <th>驗證狀態</th>
              <th>封鎖狀態</th>
              <th>身分組</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  {user.userName == username
                    ? user.userName + "(目前登入中)"
                    : user.userName}
                </td>
                <td>{user.email}</td>
                <td>{user.emailConfirmok ? "已驗證" : "未驗證"}</td>
                <td>{user.isbanned ? "已封鎖" : "優質用戶"}</td>
                <td>{roleMap[user.role]}</td>
                <td>
                  <Button
                    variant="warning"
                    className="me-3"
                    disabled={user.role == "ADMIN"}
                  >
                    封鎖
                  </Button>
                  <Button
                    variant="danger"
                    className="me-3"
                    disabled={user.role == "ADMIN"}
                  >
                    刪除
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );
}
export default UserList;
