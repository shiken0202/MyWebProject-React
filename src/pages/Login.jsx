import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Alert, InputGroup } from 'react-bootstrap';
import MyNavbar from '../components/MyNavbar';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaImgUrl, setCaptchaImgUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const navigate=useNavigate();

  // 載入或刷新驗證碼圖片
  const fetchCaptcha = () => {
    // 加上時間戳避免快取
    setCaptchaImgUrl(`http://localhost:8080/captcha?${Date.now()}`);
    setCaptchaInput('');
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if(username.toUpperCase()=="ADMIN") return{};
    if (!username) newErrors.username = '請輸入username';
    else if (!/^[A-Za-z\d]{5,20}$/.test(username)) newErrors.username = 'username格式錯誤';
    if (!password) newErrors.password = '請輸入密碼';
    else if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/.test(password)) newErrors.password='密碼須為英數混和 且至少8碼 最多20碼';
    if (!captchaInput) newErrors.captchaInput = '請輸入驗證碼';
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
    try {
      const res = await fetch('http://localhost:8080/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: 'include', // 重要！帶上 session cookie
         body: new URLSearchParams({ username, password, captchaInput }),
      });
      if (res.ok) {
        setLoginError('');
        navigate('/');
        // window.location.href = '/';
      } else {
        const msg = await res.text();
        setLoginError('登入失敗，請檢查帳號密碼或驗證碼'|| msg );
        fetchCaptcha(); // 登入失敗時刷新驗證碼
      }
    } catch (err) {
      setLoginError('伺服器錯誤，請稍後再試');
      fetchCaptcha();
    }
  };

  return (
    <Container className='WebContent'>
      <MyNavbar/>
      <Row className="justify-content-md-center mt-5">
        <Col xs={12} md={6}>
          <h2 className="text-center mb-4">會員登入</h2>
          {loginError && <Alert variant="danger">{loginError}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>帳號</Form.Label>
              <Form.Control
                type="username"
                placeholder="請輸入Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                isInvalid={!!errors.username}
              />
              <Form.Control.Feedback type="invalid">
                {errors.username}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>密碼</Form.Label>
              <Form.Control
                type="password"
                placeholder="請輸入密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                isInvalid={!!errors.password}
              />
              <Form.Control.Feedback type="invalid">
                {errors.password}
              </Form.Control.Feedback>
            </Form.Group>
            {/* 驗證碼欄位 */}
            <Form.Group className="mb-3" controlId="formCaptcha">
              <Form.Label>驗證碼</Form.Label>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="請輸入驗證碼"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  isInvalid={!!errors.captchaInput}
                  maxLength={6}
                />
                <InputGroup.Text style={{ padding: 0, background: 'none', border: 'none' }}>
                  <img
                    src={captchaImgUrl}
                    alt="驗證碼"
                    style={{ height: 38, cursor: 'pointer' }}
                    onClick={fetchCaptcha}
                    title="點擊刷新驗證碼"
                  />
                </InputGroup.Text>
                <Button variant="outline-secondary" onClick={fetchCaptcha}>
                  重新產生
                </Button>
                <Form.Control.Feedback type="invalid">
                  {errors.captchaInput}
                </Form.Control.Feedback>
              </InputGroup>
            </Form.Group>
            <Button variant="primary" type="submit" className="w-100">
              登入
            </Button>
          </Form>
          <Button variant="outline-primary" as={Link} to="/register"  className="me-3 mt-3 w-100">忘記密碼</Button>
          <Button variant="outline-primary" as={Link} to="/register"  className="me-3 mt-3 w-100">點擊註冊</Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
