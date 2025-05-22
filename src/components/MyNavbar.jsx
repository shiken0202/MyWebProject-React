import { Navbar, Nav, NavDropdown, Container, Form, FormControl, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function MyNavbar() {
  return (
    <Navbar expand="lg" className="navbar" fixed='top' data-bs-theme="light" style={{ backgroundColor: '#e3f2fd' }}>
      <Container fluid>
        <Navbar.Brand as={Link} to="/">網頁名稱</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          {/* 左側導覽項目 */}
          <Nav className="me-auto my-2 my-lg-0">
            <NavDropdown title="衣服" id="clothes-nav-dropdown">
              <NavDropdown.Item as={Link} to="/products/clothes/male">男裝</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products/clothes/female">女裝</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/products/clothes/unisex">中性</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="包包" id="bags-nav-dropdown">
              <NavDropdown.Item as={Link} to="/products/bags/male">男包</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products/bags/female">女包</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/products/bags/accessories">包包配件</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown title="玩偶" id="dolls-nav-dropdown">
              <NavDropdown.Item as={Link} to="/products/dolls/chiikawa">吉伊卡哇</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products/dolls/sunrio">三麗鷗</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/products/dolls/others">其他</NavDropdown.Item>
            </NavDropdown>
              <Nav.Link href="/user/collect">💗收藏賣場</Nav.Link>
              <Nav.Link href="/user/myorder">📋我的訂單</Nav.Link>
              <Nav.Link href="/user/myproduct">🌸我的賣場</Nav.Link>
          </Nav>
          {/* 右側按鈕區塊 */}
          <div className="d-flex">
            <Button variant="outline-warning" as={Link} to="/products/user/cart" className="me-2">🛒 購物車</Button>
            <Button variant="outline-primary" as={Link} to="/login" className="me-3">👤 會員登入</Button>
          </div>
        </Navbar.Collapse>
        <Form className="d-flex me-3">
          <FormControl
            type="search"
            placeholder="搜尋商品"
            className="me-2"
            aria-label="Search"
          />
          <Button variant="outline-success">🔍</Button>
        </Form>
      </Container>
    </Navbar>
  );
}

export default MyNavbar;
