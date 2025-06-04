import "../App.css";
import React, { useState, useEffect } from "react";
import MyNavbar from "../components/MyNavbar";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  ListGroup,
  Card,
} from "react-bootstrap";

function Cart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchAllCartItemsByUser();
  }, []);

  async function fetchAllCartItemsByUser() {
    try {
      const res = await fetch("http://localhost:8080/cartitem/allitems", {
        method: "GET",
        credentials: "include",
      });

      if (res.ok) {
        const resData = await res.json();
        setItems(resData.data || []);
      }
    } catch (error) {
      alert(error.message);
    }
  }
  console.log(items);
  const updateQuantity = async (index, newQuantity) => {
    const quantity = Math.max(1, parseInt(newQuantity) || 1);
    if (quantity > items[index].stock) {
      alert("超過可購買數量");
      return;
    }
    // 先保存舊資料以便錯誤時恢復
    const oldItems = [...items];

    // 立即更新本地狀態
    const updatedItems = items.map((item, i) =>
      i === index ? { ...item, quantity } : item
    );
    setItems(updatedItems);

    try {
      const res = await fetch("http://localhost:8080/cartitem/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          id: items[index].id, // 確保 CartItemDto 有 id 欄位
          quantity: quantity,
        }),
      });

      if (!res.ok) {
        throw new Error("更新失敗");
      }
    } catch (error) {
      // 失敗時恢復狀態
      setItems(oldItems);
      alert("數量更新失敗，請稍後再試");
    }
  };

  const handleDelete = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (items.length === 0) {
      alert("購物車是空的");
      return;
    }
    // 結帳邏輯...
  };

  return (
    <div>
      <MyNavbar />
      <Container className="WebContent">
        <Row className="justify-content-center">
          <Col xs={12} lg={8}>
            <Card className="shadow-sm">
              <Card.Body>
                <Card.Title className="mb-4">
                  <h3>🛒 購物車內容</h3>
                </Card.Title>

                <ListGroup variant="flush">
                  {items.length === 0 ? (
                    <ListGroup.Item className="text-center py-4">
                      <h5 className="text-muted">購物車是空的</h5>
                    </ListGroup.Item>
                  ) : (
                    items.map((item, index) => (
                      <ListGroup.Item key={index} className="py-3">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="flex-grow-1">
                            <h5 className="mb-1">{item.productName}</h5>
                            <div className="text-muted small">
                              {item.brand} | 單價 ${item.price.toLocaleString()}
                            </div>
                          </div>

                          <div className="d-flex align-items-center ms-3">
                            <Button
                              variant="outline-secondary"
                              onClick={() =>
                                updateQuantity(index, item.quantity - 1)
                              }
                              disabled={item.quantity <= 1}
                              className="px-3"
                            >
                              -
                            </Button>
                            <Form.Control
                              type="number"
                              value={item.quantity}
                              min="1"
                              style={{ width: "80px" }}
                              onChange={(e) =>
                                updateQuantity(index, e.target.value)
                              }
                              className="text-center mx-2"
                            />
                            <Button
                              variant="outline-secondary"
                              onClick={() =>
                                updateQuantity(index, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stock}
                              className="px-3"
                            >
                              +
                            </Button>
                            <Button
                              variant="outline-danger"
                              className="ms-2"
                              onClick={() => handleDelete(index)}
                              size="sm"
                            >
                              ×
                            </Button>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))
                  )}
                </ListGroup>

                <div className="mt-4 border-top pt-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <h4 className="mb-0">總金額：</h4>
                    <h3 className="mb-0 text-primary">
                      ${total.toLocaleString()}
                    </h3>
                  </div>

                  <div className="d-grid mt-4">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleCheckout}
                      disabled={items.length === 0}
                    >
                      前往結帳
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Cart;
