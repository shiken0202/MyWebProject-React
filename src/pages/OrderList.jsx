import MyNavbar from "../components/MyNavbar";
import { Container, Row, Col, Table, Button } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import Collapse from "react-bootstrap/Collapse";
import { Modal, Form } from "react-bootstrap";
import React, { Fragment } from "react";

function OrderList() {
  useEffect(() => {
    fetchUsers();
    fetchAllStore();
    fechOrdersByUser();
    fechOrdersByStore();
    fetchProducts();
  }, []);
  const { userId, username, emailcheck, role } = useUser();
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [storeOrders, setStoreOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [showOrderStatus, setShowOrderStatus] = useState(false);
  const [editOrderStatus, setEditOrderStatus] = useState("");
  const [editOrderId, setEditOrderId] = useState(null);
  const [items, setItems] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const fetchProducts = async () => {
    const res = await fetch("http://localhost:8080/products", {
      method: "GET",
      credentials: "include",
    });
    if (res.ok) {
      const resData = await res.json();

      setProducts(resData.data || []);
    }
  };
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
  async function fetchAllStore() {
    const res = await fetch("http://localhost:8080/store/all", {
      method: "GET",
      credentials: "include",
    });
    const resData = await res.json();

    setStores(resData.data || []);
  }
  async function fechOrdersByUser() {
    try {
      const res = await fetch("http://localhost:8080/orders/user", {
        method: "GET",
        credentials: "include",
      });

      const resData = await res.json();
      setBuyerOrders(Array.isArray(resData.data) ? resData.data : []);
    } catch (error) {
      return "錯誤";
    }
  }
  async function fechOrdersByStore() {
    const res = await fetch("http://localhost:8080/orders/store", {
      method: "GET",
      credentials: "include",
    });
    const resData = await res.json();
    setStoreOrders(Array.isArray(resData.data) ? resData.data : []);
  }
  const CurrentBuyerOrders = buyerOrders.filter(
    (bos) => bos.status != "已完成" && bos.status != "已取消"
  );
  const HistoryBuyerOrders = buyerOrders
    .filter((bos) => bos.status == "已完成" || bos.status == "已取消")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const CurrentStoreOrders = storeOrders.filter(
    (bos) => bos.status != "已完成" && bos.status != "已取消"
  );
  const HistoryStoreOrders = storeOrders
    .filter((bos) => bos.status == "已完成" || bos.status == "已取消")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const handleCancelClick = async (id) => {
    const isConfirmed = window.confirm("是否確定要取消這筆訂單？");
    if (!isConfirmed) {
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/orders/cancel/${id}`, {
        method: "PUT",
        credentials: "include",
      });
      fechOrdersByUser();
      fechOrdersByStore();

      if (!res.ok) {
        throw new Error();
      }
    } catch (error) {
      alert(error.message);
    }
  };
  const handleStatusEditClick = async () => {
    if (editOrderStatus == "已完成") {
      const isConfirmed = window.confirm("是否確定要完成這筆訂單？");
      if (!isConfirmed) {
        return;
      }
    }
    if (editOrderStatus == "已出貨") {
      const isConfirmed = window.confirm("是否確定要出貨這筆訂單？");
      if (!isConfirmed) {
        return;
      }
    }
    try {
      const res = await fetch(
        `http://localhost:8080/orders/edit/${editOrderId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            status: editOrderStatus,
          }),
        }
      );
      setShowOrderStatus(false);
      fechOrdersByStore();

      if (!res.ok) {
        throw new Error("送出失敗");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleStatusEditOn = (order) => {
    setEditOrderId(order.id);
    setEditOrderStatus(order.status);
    setShowOrderStatus(true);
  };
  const handleStatusClose = () => {
    setShowOrderStatus(false);
  };
  const OrderDetailClick = async (id) => {
    const res = await fetch(`http://localhost:8080/orderitems/${id}`, {
      method: "GET",
      credentials: "include",
    });
    if (res.ok) {
      const resData = await res.json();
      setItems(resData.data);
    }
  };

  const Orders = () => {
    switch (role) {
      case "BUYER":
        return (
          <Row>
            <Col xs={12} className="mb-5">
              <h1 className="mb-4 text-start">目前訂單</h1>
              {CurrentBuyerOrders.length == 0 ? (
                <h2>"目前尚無訂單"</h2>
              ) : (
                <Table striped bordered hover responsive>
                  <thead className="table-primary">
                    <tr>
                      <th>項目</th>
                      <th>訂單編號</th>
                      <th>店家資訊</th>
                      <th>收貨地址</th>
                      <th>訂單金額</th>
                      <th>配送方式</th>
                      <th>訂單狀態</th>
                      <th>付款方式</th>
                      <th>下單時間</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CurrentBuyerOrders.map((order, index) => (
                      <React.Fragment key={order.id}>
                        <tr>
                          <td>{index + 1}</td>
                          <td>No.{order.id}</td>
                          <td>
                            {stores.find((s) => s.id == order.storeId)
                              ?.storeName || "未知店家"}
                          </td>
                          <td>{order.address}</td>
                          <td>{order.totalAmount}</td>
                          <td>{order.deliveryMethod}</td>
                          <td>{order.status}</td>
                          <td>{order.paymentType}</td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                          <td>
                            <Button
                              className="me-2"
                              onClick={() => {
                                OrderDetailClick(order.id);
                                setExpandedOrderId(
                                  expandedOrderId === order.id ? null : order.id
                                );
                              }}
                            >
                              {expandedOrderId === order.id
                                ? "收合明細"
                                : "查看訂單明細"}
                            </Button>
                            {order.status == "已出貨" ? (
                              <span title="訂單已出貨，無法取消">
                                <Button
                                  variant="outline-info"
                                  onClick={() => handleCancelClick(order.id)}
                                  disabled
                                >
                                  取消訂單
                                </Button>
                              </span>
                            ) : (
                              <Button
                                variant="outline-info"
                                onClick={() => handleCancelClick(order.id)}
                              >
                                取消訂單
                              </Button>
                            )}
                          </td>
                        </tr>
                        {/* 展開細項 row */}
                        {expandedOrderId === order.id && (
                          <tr>
                            <td colSpan={10} className="bg-light p-3">
                              <div className="border rounded shadow-sm p-3 bg-white">
                                <h6 className="mb-3 text-primary">
                                  <i className="bi bi-card-list me-2"></i>
                                  訂單商品明細
                                </h6>

                                <Table size="sm" bordered hover>
                                  <thead className="table-light">
                                    <tr>
                                      <th>商品名稱</th>
                                      <th>數量</th>
                                      <th>單價</th>
                                      <th>小計</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {items && items.length > 0 ? (
                                      items.map((item, idx) => {
                                        const product = products.find(
                                          (p) => p.id == item.productId
                                        );
                                        const title = items
                                          ? item.productTitleSnapshot
                                          : "未知商品";
                                        const subtotal =
                                          item.productPriceSnapshot *
                                          item.quantity;

                                        return (
                                          <tr key={idx}>
                                            <td>{title}</td>
                                            <td>{item.quantity}</td>
                                            <td className="text-end">
                                              ${item.price}
                                            </td>
                                            <td className="text-end fw-bold">
                                              ${subtotal}
                                            </td>
                                          </tr>
                                        );
                                      })
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan={4}
                                          className="text-center text-muted"
                                        >
                                          無商品資料
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                  {/* Footer 小計 */}
                                  {items && items.length > 0 && (
                                    <tfoot>
                                      <tr className="table-secondary">
                                        <td
                                          colSpan={3}
                                          className="text-end fw-bold"
                                        >
                                          訂單總計
                                        </td>
                                        <td className="text-end fw-bold text-danger">
                                          $
                                          {items.reduce(
                                            (sum, item) =>
                                              sum + item.price * item.quantity,
                                            0
                                          )}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  )}
                                </Table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              )}
            </Col>
            <Col xs={12}>
              <h1 className="mb-4 text-start">歷史訂單</h1>
              {HistoryBuyerOrders.length == 0 ? (
                <h2>"尚無歷史訂單"</h2>
              ) : (
                <Table striped bordered hover responsive>
                  <thead className="table-primary">
                    <tr>
                      <th>項目</th>
                      <th>訂單編號</th>
                      <th>店家資訊</th>
                      <th>收貨地址</th>
                      <th>訂單金額</th>
                      <th>配送方式</th>
                      <th>付款方式</th>
                      <th>訂單狀態</th>
                      <th>下單時間</th>
                      <th>查看訂單</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HistoryBuyerOrders.map((order, index) => (
                      <React.Fragment>
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>No.{order.id}</td>
                          <td>
                            {
                              stores.find((s) => s.id == order.storeId)
                                ?.storeName
                            }
                          </td>
                          <td>{order.address}</td>
                          <td>{order.totalAmount}</td>
                          <td>{order.deliveryMethod}</td>
                          <td>{order.paymentType}</td>
                          <td>{order.status}</td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                          <td>
                            <Button
                              className="me-2"
                              onClick={() => {
                                OrderDetailClick(order.id);
                                setExpandedOrderId(
                                  expandedOrderId === order.id ? null : order.id
                                );
                              }}
                            >
                              {expandedOrderId === order.id
                                ? "收合明細"
                                : "查看訂單明細"}
                            </Button>
                          </td>
                        </tr>
                        {expandedOrderId === order.id && (
                          <tr>
                            <td colSpan={10} className="bg-light p-3">
                              <div className="border rounded shadow-sm p-3 bg-white">
                                <h6 className="mb-3 text-primary">
                                  <i className="bi bi-card-list me-2"></i>
                                  訂單商品明細
                                </h6>

                                <Table size="sm" bordered hover>
                                  <thead className="table-light">
                                    <tr>
                                      <th>商品名稱</th>
                                      <th>數量</th>
                                      <th>單價</th>
                                      <th>小計</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {items && items.length > 0 ? (
                                      items.map((item, idx) => {
                                        const product = products.find(
                                          (p) => p.id == item.productId
                                        );
                                        const title = items
                                          ? item.productTitleSnapshot
                                          : "未知商品";
                                        const subtotal =
                                          item.productPriceSnapshot *
                                          item.quantity;

                                        return (
                                          <tr key={idx}>
                                            <td>{title}</td>
                                            <td>{item.quantity}</td>
                                            <td className="text-end">
                                              ${item.price}
                                            </td>
                                            <td className="text-end fw-bold">
                                              ${subtotal}
                                            </td>
                                          </tr>
                                        );
                                      })
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan={4}
                                          className="text-center text-muted"
                                        >
                                          無商品資料
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                  {/* Footer 小計 */}
                                  {items && items.length > 0 && (
                                    <tfoot>
                                      <tr className="table-secondary">
                                        <td
                                          colSpan={3}
                                          className="text-end fw-bold"
                                        >
                                          訂單總計
                                        </td>
                                        <td className="text-end fw-bold text-danger">
                                          $
                                          {items.reduce(
                                            (sum, item) =>
                                              sum + item.price * item.quantity,
                                            0
                                          )}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  )}
                                </Table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              )}
            </Col>
          </Row>
        );
      case "SELLER":
        return (
          <Row>
            <Col xs={12} className="mb-5">
              <h1 className="mb-4 text-start">目前訂單</h1>
              {CurrentStoreOrders.length == 0 ? (
                <h2>"目前尚無訂單"</h2>
              ) : (
                <Table striped bordered hover responsive>
                  <thead className="table-primary">
                    <tr>
                      <th>項目</th>
                      <th>訂單編號</th>
                      <th>訂單用戶</th>
                      <th>地址</th>
                      <th>訂單金額</th>
                      <th>配送方式</th>
                      <th>訂單狀態</th>
                      <th>付款方式</th>
                      <th>下單時間</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CurrentStoreOrders.map((order, index) => (
                      <React.Fragment key={order.id}>
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>No.{order.id}</td>
                          <td>
                            {users.find((u) => u.id == order.userId)?.userName}
                          </td>
                          <td>{order.address}</td>
                          <td>{order.totalAmount}</td>
                          <td>{order.deliveryMethod}</td>
                          <td>{order.status}</td>
                          <td>{order.paymentType}</td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                          <td>
                            <Button
                              className="me-2"
                              onClick={() => {
                                OrderDetailClick(order.id);
                                setExpandedOrderId(
                                  expandedOrderId === order.id ? null : order.id
                                );
                              }}
                            >
                              {expandedOrderId === order.id
                                ? "收合明細"
                                : "查看訂單明細"}
                            </Button>
                            <Button
                              variant="outline-secondary"
                              className="me-2"
                              onClick={() => handleStatusEditOn(order)}
                            >
                              編輯訂單狀態
                            </Button>
                            {order.status == "已出貨" ? (
                              <span title="訂單已出貨，無法取消">
                                <Button
                                  variant="outline-info"
                                  onClick={() => handleCancelClick(order.id)}
                                  disabled
                                >
                                  取消訂單
                                </Button>
                              </span>
                            ) : (
                              <Button
                                variant="outline-info"
                                onClick={() => handleCancelClick(order.id)}
                              >
                                取消訂單
                              </Button>
                            )}
                          </td>
                        </tr>
                        {expandedOrderId === order.id && (
                          <tr>
                            <td colSpan={10} className="bg-light p-3">
                              <div className="border rounded shadow-sm p-3 bg-white">
                                <h6 className="mb-3 text-primary">
                                  <i className="bi bi-card-list me-2"></i>
                                  訂單商品明細
                                </h6>

                                <Table size="sm" bordered hover>
                                  <thead className="table-light">
                                    <tr>
                                      <th>商品名稱</th>
                                      <th>數量</th>
                                      <th>單價</th>
                                      <th>小計</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {items && items.length > 0 ? (
                                      items.map((item, idx) => {
                                        const product = products.find(
                                          (p) => p.id == item.productId
                                        );
                                        const title = items
                                          ? item.productTitleSnapshot
                                          : "未知商品";
                                        const subtotal =
                                          item.productPriceSnapshot *
                                          item.quantity;

                                        return (
                                          <tr key={idx}>
                                            <td>{title}</td>
                                            <td>{item.quantity}</td>
                                            <td className="text-end">
                                              ${item.price}
                                            </td>
                                            <td className="text-end fw-bold">
                                              ${subtotal}
                                            </td>
                                          </tr>
                                        );
                                      })
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan={4}
                                          className="text-center text-muted"
                                        >
                                          無商品資料
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                  {/* Footer 小計 */}
                                  {items && items.length > 0 && (
                                    <tfoot>
                                      <tr className="table-secondary">
                                        <td
                                          colSpan={3}
                                          className="text-end fw-bold"
                                        >
                                          訂單總計
                                        </td>
                                        <td className="text-end fw-bold text-danger">
                                          $
                                          {items.reduce(
                                            (sum, item) =>
                                              sum + item.price * item.quantity,
                                            0
                                          )}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  )}
                                </Table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              )}
            </Col>
            <Col xs={12}>
              <h1 className="mb-4 text-start">歷史訂單</h1>
              {HistoryStoreOrders.length == 0 ? (
                <h1>"尚無歷史訂單"</h1>
              ) : (
                <Table striped bordered hover responsive>
                  <thead className="table-primary">
                    <tr>
                      <th>項目</th>
                      <th>訂單編號</th>
                      <th>訂單用戶</th>
                      <th>地址</th>
                      <th>訂單金額</th>
                      <th>配送方式</th>
                      <th>付款方式</th>
                      <th>訂單狀態</th>
                      <th>下單時間</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {HistoryStoreOrders.map((order, index) => (
                      <React.Fragment key={order.id}>
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>No.{order.id}</td>
                          <td>
                            {users.find((u) => u.id == order.userId)?.userName}
                          </td>
                          <td>{order.address}</td>
                          <td>{order.totalAmount}</td>
                          <td>{order.deliveryMethod}</td>
                          <td>{order.paymentType}</td>
                          <td>{order.status}</td>
                          <td>{new Date(order.createdAt).toLocaleString()}</td>
                          <td>
                            <Button
                              className="me-2"
                              onClick={() => {
                                OrderDetailClick(order.id);
                                setExpandedOrderId(
                                  expandedOrderId === order.id ? null : order.id
                                );
                              }}
                            >
                              {expandedOrderId === order.id
                                ? "收合明細"
                                : "查看訂單明細"}
                            </Button>
                          </td>
                        </tr>
                        {expandedOrderId === order.id && (
                          <tr>
                            <td colSpan={10} className="bg-light p-3">
                              <div className="border rounded shadow-sm p-3 bg-white">
                                <h6 className="mb-3 text-primary">
                                  <i className="bi bi-card-list me-2"></i>
                                  訂單商品明細
                                </h6>

                                <Table size="sm" bordered hover>
                                  <thead className="table-light">
                                    <tr>
                                      <th>商品名稱</th>
                                      <th>數量</th>
                                      <th>單價</th>
                                      <th>小計</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {items && items.length > 0 ? (
                                      items.map((item, idx) => {
                                        const product = products.find(
                                          (p) => p.id == item.productId
                                        );
                                        const title = items
                                          ? item.productTitleSnapshot
                                          : "未知商品";
                                        const subtotal =
                                          item.productPriceSnapshot *
                                          item.quantity;

                                        return (
                                          <tr key={idx}>
                                            <td>{title}</td>
                                            <td>{item.quantity}</td>
                                            <td className="text-end">
                                              ${item.price}
                                            </td>
                                            <td className="text-end fw-bold">
                                              ${subtotal}
                                            </td>
                                          </tr>
                                        );
                                      })
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan={4}
                                          className="text-center text-muted"
                                        >
                                          無商品資料
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                  {/* Footer 小計 */}
                                  {items && items.length > 0 && (
                                    <tfoot>
                                      <tr className="table-secondary">
                                        <td
                                          colSpan={3}
                                          className="text-end fw-bold"
                                        >
                                          訂單總計
                                        </td>
                                        <td className="text-end fw-bold text-danger">
                                          $
                                          {items.reduce(
                                            (sum, item) =>
                                              sum + item.price * item.quantity,
                                            0
                                          )}
                                        </td>
                                      </tr>
                                    </tfoot>
                                  )}
                                </Table>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              )}
            </Col>
          </Row>
        );
    }
  };
  return (
    <>
      <MyNavbar />
      <Modal show={showOrderStatus} onHide={handleStatusClose}>
        <Modal.Header closeButton>
          <Modal.Title>訂單狀態</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>訂單狀態</Form.Label>
            <Form.Select
              value={editOrderStatus}
              onChange={(e) => setEditOrderStatus(e.target.value)}
            >
              <option>{editOrderStatus}</option>
              <option value={"已出貨"}>{"已出貨"}</option>
              <option value={"已完成"}>{"已完成"}</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button className="mb-3" onClick={handleStatusClose}>
            取消
          </Button>
          <Button className="mb-3" onClick={handleStatusEditClick}>
            送出
          </Button>
        </Modal.Footer>
      </Modal>
      <Container className="WebContent mt-4">{Orders()}</Container>
    </>
  );
}

export default OrderList;
