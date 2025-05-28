import React, { useState, useEffect } from "react";
import { Accordion } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Container, Table, Button, Modal, Form } from "react-bootstrap";
import MyNavbar from "../components/MyNavbar";
import { useUser } from "../context/UserContext";
function MyProduct() {
  const [products, setProducts] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const { userId, username, emailcheck, role } = useUser();
  const navigate = useNavigate();
  console.log(userId);
  console.log(username);
  useEffect(() => {
    fetchProducts();
    fetchStoreInfo();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("http://localhost:3000/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("取得商品失敗:", error);
    }
  };
  const fetchStoreInfo = async () => {
    const res = await fetch("http://localhost:8080/store/info", {
      method: "GET",
      credentials: "include",
    });
    const resData = await res.json();
    setStoreInfo(resData.data);
    console.log(resData);
  };
  console.log(storeInfo);
  const createStore = async (e) => {
    e.preventDefault(); // 防止頁面重整

    // 前端驗證
    if (!storeName.trim()) {
      alert("請輸入商店名稱");
      return;
    }
    if (!description.trim()) {
      alert("請輸入商店描述");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/store/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          storeName,
          description,
          userId, // 從 useUser() 取得
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("商店創建成功！");
        window.location.reload();
        setStoreInfo(data.data); // 假設後端回傳新商店資訊
      } else {
        alert(data.message || "創建失敗");
      }
    } catch (err) {
      alert("伺服器錯誤，請稍後再試");
    }
  };
  return (
    <>
      <MyNavbar />
      <Container className="WebContent">
        {storeInfo == null ? (
          <>
            <Form onSubmit={createStore}>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlInput1"
              >
                <Form.Label>商店名稱</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="請輸入商店名稱"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                />
              </Form.Group>
              <Form.Group
                className="mb-3"
                controlId="exampleForm.ControlTextarea1"
              >
                <Form.Label>商店描述</Form.Label>
                <Form.Control
                  as="textarea"
                  placeholder="請描述一下你是甚麼樣類型的商店"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </Form.Group>
              <Button variant="warning" type="submit">
                創建商店
              </Button>
            </Form>
          </>
        ) : (
          <>
            <div>
              <Accordion defaultActiveKey="0" flush>
                <Accordion.Item eventKey="0">
                  <Accordion.Header>{storeInfo.storeName}</Accordion.Header>
                  <Accordion.Body>
                    關於賣場{storeInfo.description}
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
              <p />
              <Button variant="primary">新增商品</Button>
              <p />
            </div>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>商品名稱</th>
                  <th>價格</th>
                  <th>庫存</th>
                  <th>描述</th>
                  <th>照片</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>${product.price}</td>
                    <td>{product.stock}</td>
                    <td>{product.description}</td>
                    <td>{}</td>
                    <td>
                      <Button variant="warning" className="me-2">
                        編輯
                      </Button>
                      <Button variant="danger" className="me-3">
                        刪除
                      </Button>
                      <Button variant="info">上傳照片</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}
      </Container>
    </>
  );
}

export default MyProduct;
