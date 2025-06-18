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
  Modal,
  ModalBody,
} from "react-bootstrap";
import { useUser } from "../context/UserContext";
function Cart() {
  const { userId, username, emailcheck, role } = useUser();
  const [items, setItems] = useState([]);
  const [showOrderDetailModal, setShowOrderDetailModal] = useState(false);
  const [stores, setStores] = useState([]);
  const [address, setAddress] = useState("");
  const [paymentType, setPaymentType] = useState("信用卡");
  const [deliveryMethod, setDeliveryMethod] = useState("宅配");
  useEffect(() => {
    fetchAllCartItemsByUser();
    fetchAllStore();
  }, []);
  async function fetchAllStore() {
    const res = await fetch("http://localhost:8080/store/all", {
      method: "GET",
      credentials: "include",
    });
    const resData = await res.json();

    setStores(resData.data || []);
  }
  function getStoreName(storeId) {
    const store = stores.find((s) => s.id === Number(storeId));
    return store ? store.storeName : `店鋪ID:${storeId}`;
  }
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

  const updateQuantity = async (index, newQuantity) => {
    const quantity = Math.max(1, parseInt(newQuantity) || 1);
    if (quantity > items[index].stock) {
      alert("超過可購買數量");
      return;
    }

    const oldItems = [...items];

    // 更新本地狀態
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
          id: items[index].id,
          quantity: quantity,
        }),
      });

      if (!res.ok) {
        throw new Error("更新失敗");
      }
    } catch (error) {
      setItems(oldItems);
      alert("數量更新失敗，請稍後再試");
    }
  };

  const handleDelete = async (index) => {
    setItems(items.filter((_, i) => i !== index));
    try {
      const res = await fetch(
        `http://localhost:8080/cartitem/delete/${items[index].id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      alert("刪除成功");
      if (!res.ok) {
        throw new Error("更新失敗");
      }
    } catch (error) {
      alert("項目刪除失敗，請稍後再試");
    }
  };

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const handleCheckOutClick = () => {
    setShowOrderDetailModal(true);
  };
  const handleOrderDetailCloseModal = () => {
    setShowOrderDetailModal(false);
  };
  const groupedByStore = items.reduce((groups, item) => {
    const storeId = item.storeId;
    if (!groups[storeId]) {
      groups[storeId] = [];
    }
    groups[storeId].push(item);
    return groups;
  }, {});
  const handleCheckout = async () => {
    if (items.length === 0) {
      alert("購物車是空的");
      return;
    }

    if (!address || !paymentType || !deliveryMethod) {
      alert("請填寫完整的收件資訊");
      return;
    }

    try {
      // 按店家分組購物車商品
      const groupedByStore = items.reduce((groups, item) => {
        const storeId = item.storeId;
        if (!groups[storeId]) groups[storeId] = [];
        groups[storeId].push(item);
        return groups;
      }, {});

      // 訂單陣列（每個店家一個 OrderDto）
      const orderDataArray = Object.entries(groupedByStore).map(
        ([storeId, storeItems]) => ({
          userId: userId,
          storeId: parseInt(storeId),
          address: address,
          paymentType: paymentType,
          deliveryMethod: deliveryMethod,
          orderItems: storeItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        })
      );

      const res = await fetch("http://localhost:8080/order/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDataArray), // 傳送的是陣列
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || `${res.status} 訂單建立失敗`);
      }

      setItems([]);
      setAddress("");
      setPaymentType("");
      setDeliveryMethod("");
      setShowOrderDetailModal(false);
      const successData = await res.json();
      alert(successData.message || "訂單建立成功！");
    } catch (error) {
      alert("結帳失敗：" + error.message);
    }
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
                <Form>
                  {/* <Form onSubmit={handleCheckout}> */}
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
                                {item.brand} | 單價 $
                                {item.price.toLocaleString()}
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
                        onClick={handleCheckOutClick}
                        disabled={items.length === 0}
                      >
                        前往結帳
                      </Button>
                    </div>
                  </div>
                </Form>
                <Modal
                  show={showOrderDetailModal}
                  onHide={handleOrderDetailCloseModal}
                  size="lg"
                  centered
                >
                  <Modal.Header closeButton className="border-bottom-0">
                    <Modal.Title className="fw-bold">
                      <i className="bi bi-receipt me-2 text-primary"></i>
                      訂單明細
                    </Modal.Title>
                  </Modal.Header>

                  <Modal.Body className="py-0">
                    {/* 按店家分組顯示商品 */}
                    <div className="mb-4">
                      <h6 className="text-muted mb-3">
                        <i className="bi bi-cart-check me-2"></i>
                        購買商品 ({Object.keys(groupedByStore).length} 家店鋪)
                      </h6>

                      {Object.entries(
                        items.reduce((groups, item) => {
                          const storeId = item.storeId;
                          if (!groups[storeId]) {
                            groups[storeId] = [];
                          }
                          groups[storeId].push(item);
                          return groups;
                        }, {})
                      ).map(([storeId, storeItems]) => (
                        <div key={storeId} className="mb-4 border rounded p-3">
                          <h6 className="text-primary mb-2">
                            {getStoreName(storeId)}（{storeItems.length}{" "}
                            件商品）
                          </h6>
                          <ListGroup variant="flush">
                            {storeItems.map((item, index) => (
                              <ListGroup.Item
                                key={index}
                                className="ps-0 border-0"
                              >
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <div className="fw-medium">
                                      {item.productName}
                                    </div>
                                    <small className="text-muted">
                                      {item.quantity} × $
                                      {item.price.toLocaleString()}
                                    </small>
                                  </div>
                                  <span className="text-primary fw-medium">
                                    $
                                    {(
                                      item.price * item.quantity
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </ListGroup.Item>
                            ))}
                          </ListGroup>
                          <div className="text-end mt-2">
                            <strong>
                              小計: $
                              {storeItems
                                .reduce(
                                  (sum, item) =>
                                    sum + item.price * item.quantity,
                                  0
                                )
                                .toLocaleString()}
                            </strong>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 總金額顯示 */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="text-muted mb-0">總金額</h5>
                      <h3 className="text-primary mb-0">
                        ${total.toLocaleString()}
                      </h3>
                    </div>

                    <div className="mb-4">
                      <h6 className="text-muted mb-3">
                        <i className="bi bi-geo-alt me-2"></i>
                        收件資訊
                      </h6>
                      <Form.Group className="mb-3">
                        <Form.Label className="small text-muted">
                          配送地址
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="請輸入完整收件地址"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="py-2"
                          required
                        />
                      </Form.Group>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-md-6">
                        <h6 className="text-muted mb-3">
                          <i className="bi bi-credit-card me-2"></i>
                          付款方式
                        </h6>
                        <Form.Select
                          value={paymentType}
                          onChange={(e) => setPaymentType(e.target.value)}
                          className="py-2"
                          required
                        >
                          <option value="信用卡">信用卡付款</option>
                          <option value="貨到付款">貨到付款</option>
                          <option value="ATM轉帳">ATM轉帳</option>
                        </Form.Select>
                      </div>

                      <div className="col-md-6">
                        <h6 className="text-muted mb-3">
                          <i className="bi bi-truck me-2"></i>
                          配送方式
                        </h6>
                        <Form.Select
                          value={deliveryMethod}
                          onChange={(e) => setDeliveryMethod(e.target.value)}
                          className="py-2"
                          required
                        >
                          <option value="宅配">宅配到府</option>
                          <option value="超商取貨">超商取貨</option>
                        </Form.Select>
                      </div>
                    </div>
                  </Modal.Body>

                  <Modal.Footer className="border-top-0">
                    <Button
                      variant="outline-secondary"
                      onClick={handleOrderDetailCloseModal}
                      className="px-4"
                    >
                      返回修改
                    </Button>
                    <Button
                      variant="primary"
                      type="submit"
                      className="px-4"
                      onClick={handleCheckout} // 補上實際提交函數
                    >
                      <i className="bi bi-wallet2 me-2"></i>
                      立即結帳
                    </Button>
                  </Modal.Footer>
                </Modal>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Cart;
