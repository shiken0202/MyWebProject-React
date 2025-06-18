import React, { useState, useEffect } from "react";
import MyNavbar from "../components/MyNavbar";
import { Container, Table, Button } from "react-bootstrap";
import { useUser } from "../context/UserContext";
function UserList() {
  const [users, setUsers] = useState([]);

  const { userId, username, emailcheck, role } = useUser();
  useEffect(() => {
    fetchUsers();
  }, []);
  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:8080/userlist", {
        method: "GET",
        credentials: "include",
      });
      const resData = await res.json();

      setUsers(resData.data);
    } catch (error) {}
  };
  const handleBlockClick = async (id) => {
    const isConfirmed = window.confirm("確定要封鎖該使用者?");
    if (!isConfirmed) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/user/block/${id}`, {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        const resData = await res.json();

        alert(resData.message);
        fetchUsers();
      }
    } catch (err) {
      alert(err.message());
    }
  };
  const handleUnBlockClick = async (id) => {
    const isConfirmed = window.confirm("確定要封鎖該使用者?");
    if (!isConfirmed) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:8080/user/unblock/${id}`, {
        method: "PUT",
        credentials: "include",
      });
      if (res.ok) {
        const resData = await res.json();

        alert(resData.message);
        fetchUsers();
      }
    } catch (err) {
      alert(err.message());
    }
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
                  {user.isbanned ? (
                    <Button
                      variant="warning"
                      className="me-3"
                      disabled={user.role == "ADMIN"}
                      onClick={(e) => {
                        e.preventDefault, handleUnBlockClick(user.id);
                      }}
                    >
                      解除封鎖
                    </Button>
                  ) : (
                    <Button
                      variant="outline-warning"
                      className="me-3"
                      disabled={user.role == "ADMIN"}
                      onClick={(e) => {
                        e.preventDefault, handleBlockClick(user.id);
                      }}
                    >
                      封鎖
                    </Button>
                  )}
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
