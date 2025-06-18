import {
  Navbar,
  Nav,
  NavDropdown,
  Container,
  Form,
  FormControl,
  Button,
  Stack,
} from "react-bootstrap";

import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChatRoom from "./ChatRoom";
function MyNavbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [chatRooms, setChatRooms] = useState([]);
  const [showChat, setShowChat] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [selectedChatRoom, setSelectedChatRoom] = useState(null);
  const {
    userId,
    setUserId,
    username,
    setUsername,
    emailcheck,
    setEmailcheck,
    role,
    setRole,
    logout,
  } = useUser();
  const navigate = useNavigate();
  useEffect(() => {
    checkLogin();
    fetchUserInfo();
    fetchChatRooms();
    if (isLoggedIn && userId && userId !== "undefined" && emailcheck) {
      // 添加輕微延遲確保狀態完全同步
      const timeoutId = setTimeout(() => {
        fetchChatRooms();
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [isLoggedIn, userId]);

  const fetchChatRooms = async () => {
    // 確保 userId 存在且有效
    if (!userId || userId === "undefined" || !emailcheck) {
      return;
    }
    setIsLoadingChats(true);
    try {
      const res = await fetch(
        `http://localhost:8080/chatrooms?userId=${userId}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.ok) {
        const resData = await res.json();

        setChatRooms(resData.data || []);
      } else {
        console.error("API 請求失敗:", res.status, res.statusText);
      }
    } catch (error) {
      console.error("網路請求錯誤:", error);
      setError("無法載入聊天室，請檢查網路連線");
    } finally {
      setIsLoadingChats(false);
    }
  };
  const buyersChatRooms = (chatRooms || []).filter((f) => f.buyerId == userId);
  const storeChatRooms = (chatRooms || []).filter((f) => f.sellerId == userId);

  const handleChatRoomsClick = (chatRoom) => {
    setSelectedChatRoom(chatRoom);
    setShowChat(true);
  };
  const handleChatClose = () => {
    setSelectedChatRoom(null);
    setShowChat(false);
  };

  const checkLogin = async () => {
    try {
      const res = await fetch("http://localhost:8080/check-login", {
        method: "GET",
        credentials: "include",
      });
      const resData = await res.json();
      setIsLoggedIn(resData.data);
    } catch (err) {
      setIsLoggedIn(false);
    }
  };
  const Logout = async () => {
    try {
      const res = await fetch("http://localhost:8080/logout", {
        method: "GET",
        credentials: "include",
      });
      const resData = await res.json();
      if (res.ok && resData.status === 200) {
        alert(resData.message);
        setIsLoggedIn(false);
        logout();
        navigate("/");
      } else {
        alert("登出失敗：" + resData.message);
      }
    } catch (err) {
      alert("登出錯誤: " + err.message);
    }
  };
  const fetchUserInfo = async () => {
    try {
      const res = await fetch("http://localhost:8080/userinfo", {
        method: "GET",
        credentials: "include",
      });
      if (res.status === 401 || res.status === 403) {
        // session 過期或沒權限
        localStorage.removeItem("userId");
        setIsLoggedIn(false);
        return;
      }
      const resData = await res.json();
      setUserId(resData.data.userId);
      setUsername(resData.data.userName);
      setRole(resData.data.role);
      setEmailcheck(resData.data.emailcheck);
    } catch (err) {
      localStorage.removeItem("userId");
      setIsLoggedIn(false);
    }
  };
  const EmailchcekHandler = (e, path) => {
    if (!emailcheck) {
      alert("請先驗證Email");
      window.location.reload();
      navigate("/");
      return;
    } else {
      navigate(path);
    }
  };
  const handleSerchSubmit = (e) => {
    e.preventDefault(); // 防止刷新
    if (keyword.trim()) {
      navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
    }
  };
  const rolelink = () => {
    switch (role) {
      case "BUYER":
        return (
          <NavDropdown
            title="💬 聊天室"
            id="chat-nav-dropdown"
            onClick={(e) => {
              e.preventDefault();
              EmailchcekHandler(e);
            }}
          >
            {buyersChatRooms.length === 0 ? (
              <div className="text-center">"空空如也"</div>
            ) : (
              buyersChatRooms.map((m) => (
                <NavDropdown.Item
                  key={m.id}
                  onClick={() => handleChatRoomsClick(m)}
                >
                  {"🏬 " + m.storeName}
                </NavDropdown.Item>
              ))
            )}
          </NavDropdown>
        );
      case "SELLER":
        return (
          <>
            <Nav.Link
              as={Link}
              to="/user/myproduct"
              onClick={(e) => {
                e.preventDefault();
                EmailchcekHandler(e, "/user/myproduct");
              }}
            >
              🌸我的賣場
            </Nav.Link>
            <NavDropdown
              title="💬 聊天室"
              id="chat-nav-dropdown"
              onClick={(e) => {
                e.preventDefault();
                EmailchcekHandler(e);
              }}
            >
              {storeChatRooms.length === 0 ? (
                <div className="text-center">"空空如也"</div>
              ) : (
                storeChatRooms.map((m) => (
                  <NavDropdown.Item
                    key={m.id}
                    onClick={() => handleChatRoomsClick(m)}
                  >
                    {"🧛‍♀️ " + m.buyerName}
                  </NavDropdown.Item>
                ))
              )}
            </NavDropdown>
          </>
        );
      case "ADMIN":
        return (
          <>
            <Nav.Link
              as={Link}
              to="/user/userlist"
              onClick={(e) => {
                e.preventDefault();
                EmailchcekHandler(e, "/user/userlist");
              }}
            >
              🌸使用者管理
            </Nav.Link>
          </>
        );
    }
  };
  const roleMap = { ADMIN: "管理員", BUYER: "買家", SELLER: "賣家" };
  return (
    <Navbar
      expand="lg"
      className="navbar"
      fixed="top"
      data-bs-theme="light"
      style={{ backgroundColor: "#e3f2fd" }}
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/" reloadDocument>
          Pickify
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          {/* 左側導覽項目 */}
          <Nav className="me-auto my-2 my-lg-0">
            <NavDropdown title="衣服" id="clothes-nav-dropdown">
              <NavDropdown.Item as={Link} to="/products/clothes/male">
                男裝
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products/clothes/female">
                女裝
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/products/clothes/unisex">
                中性
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="包包" id="bags-nav-dropdown">
              <NavDropdown.Item as={Link} to="/products/bags/male">
                男包
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products/bags/female">
                女包
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/products/bags/accessories">
                包包配件
              </NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="玩偶" id="dolls-nav-dropdown">
              <NavDropdown.Item as={Link} to="/products/dolls/chiikawa">
                吉伊卡哇
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products/dolls/sunrio">
                三麗鷗
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/products/dolls/others">
                其他
              </NavDropdown.Item>
            </NavDropdown>

            {isLoggedIn && (
              <>
                {role != "ADMIN" ? (
                  <Nav.Link
                    as={Link}
                    to="/user/myorder"
                    onClick={(e) => {
                      e.preventDefault();
                      EmailchcekHandler(e, "/user/myorder");
                    }}
                  >
                    📋我的訂單
                  </Nav.Link>
                ) : (
                  ""
                )}
                {rolelink(role)}
              </>
            )}
          </Nav>

          {/* 右側按鈕區塊 */}
          <div className="d-flex">
            {isLoggedIn ? (
              <Stack direction="horizontal" gap={3}>
                <div className="p-2 ms-auto">
                  {`${roleMap[role]}\u00A0\u00A0:\u00A0\u00A0\u00A0${username}`}
                </div>
                <div className="vr m-2" />
              </Stack>
            ) : (
              ""
            )}
            {role == "BUYER" && isLoggedIn ? (
              <Button
                variant="outline-warning"
                as={Link}
                to="/products/user/cart"
                className="me-2"
                onClick={(e) => {
                  e.preventDefault(),
                    EmailchcekHandler(e, "/products/user/cart");
                }}
              >
                🛒 購物車
              </Button>
            ) : (
              ""
            )}
            {isLoggedIn ? (
              <Button
                variant="outline-primary"
                onClick={Logout}
                className="me-3"
              >
                👤 會員登出
              </Button>
            ) : (
              <Button
                variant="outline-primary"
                as={Link}
                to="/login"
                className="me-3"
              >
                👤 會員登入
              </Button>
            )}
          </div>
        </Navbar.Collapse>
        <Form className="d-flex me-3" onSubmit={handleSerchSubmit}>
          <FormControl
            type="search"
            placeholder="搜尋商品"
            className="me-2"
            aria-label="Search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Button variant="outline-success" type="submit">
            🔍
          </Button>
        </Form>

        <ChatRoom
          show={showChat}
          onClose={handleChatClose}
          buyerId={selectedChatRoom?.buyerId}
          sellerId={selectedChatRoom?.sellerId}
          storeId={selectedChatRoom?.storeId}
          buyerName={selectedChatRoom?.buyerName}
          storeName={selectedChatRoom?.storeName}
        />
      </Container>
    </Navbar>
  );
}

export default MyNavbar;
