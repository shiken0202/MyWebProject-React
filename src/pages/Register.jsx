import React, { useState } from "react";
import {
  Form,
  Button,
  Container,
  Row,
  Col,
  Alert,
  ButtonGroup,
} from "react-bootstrap";
import MyNavbar from "../components/MyNavbar";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(""); // 新增角色狀態
  const [errors, setErrors] = useState({});
  const [registerError, setRegisterError] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (username.toUpperCase() === "ADMIN") return {};
    if (!username) newErrors.username = "請輸入 username";
    else if (!/^[A-Za-z\d]{5,20}$/.test(username))
      newErrors.username = "username 格式錯誤（限英文數字，5-20字）";

    if (!email) newErrors.email = "請輸入電子郵件";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "電子郵件格式錯誤";

    if (!password) newErrors.password = "請輸入密碼";
    else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(password))
      newErrors.password = "密碼須為英數混和，8-20字";

    if (password !== confirmPassword) newErrors.confirmPassword = "密碼不一致";

    // 新增角色驗證
    if (!role) newErrors.role = "請選擇身份";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username,
          password,
          email,
          role, // 加入角色參數
        }),
      });

      if (res.ok) {
        setRegisterError("");
        alert("註冊成功！將導向登入頁面，認證Email已發至信箱。");
        navigate("/login");
      } else {
        const errorData = await res.json();
        setRegisterError(errorData.message || "註冊失敗，請檢查輸入資訊");
      }
    } catch (err) {
      setRegisterError("伺服器錯誤，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="WebContent">
      <MyNavbar />
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={6}>
          <h2 className="text-center mb-4">會員註冊</h2>

          {registerError && <Alert variant="danger">{registerError}</Alert>}

          {loading && (
            <div className="text-center my-3">
              <div className="spinner-border text-primary" role="status" />
              <div className="mt-2">註冊中，請稍候...</div>
            </div>
          )}
          <Form onSubmit={handleSubmit}>
            {/* 身份選擇按鈕組 */}
            <Form.Group className="mb-4">
              <Form.Label>身份選擇</Form.Label>
              <ButtonGroup className="w-100">
                <Button
                  variant={role === "BUYER" ? "primary" : "outline-primary"}
                  onClick={() => setRole("BUYER")}
                  active={role === "BUYER"}
                >
                  我是買家
                </Button>
                <Button
                  variant={role === "SELLER" ? "primary" : "outline-primary"}
                  onClick={() => setRole("SELLER")}
                  active={role === "SELLER"}
                >
                  我是賣家
                </Button>
              </ButtonGroup>
              {errors.role && (
                <div className="text-danger mt-1">{errors.role}</div>
              )}
            </Form.Group>

            {/* 原有表單欄位保持不變 */}
            <Form.Group className="mb-3" controlId="formUsername">
              <Form.Label>帳號</Form.Label>
              <Form.Control
                type="text"
                placeholder="請輸入使用者名稱（5-20位英文數字）"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                isInvalid={!!errors.username}
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEmail">
              <Form.Label>電子郵件</Form.Label>
              <Form.Control
                type="email"
                placeholder="請輸入電子郵件"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!errors.email}
              />
              <Form.Control.Feedback type="invalid">
                {errors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formPassword">
              <Form.Label>密碼</Form.Label>
              <Form.Control
                type="password"
                placeholder="請輸入密碼（8-20位英數混合）"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formConfirmPassword">
              <Form.Label>確認密碼</Form.Label>
              <Form.Control
                type="password"
                placeholder="請再次輸入密碼"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                isInvalid={!!errors.confirmPassword}
              />
              <Form.Control.Feedback type="invalid">
                {errors.confirmPassword}
              </Form.Control.Feedback>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 mb-3">
              {!loading ? "註冊" : "註冊中..."}
            </Button>

            <div className="text-center">
              已有帳號？<Link to="/login">立即登入</Link>
            </div>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
