import React, { useState, useEffect } from "react";
import { Accordion, ModalBody, ModalHeader, ModalTitle } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Container, Table, Button, Modal, Form } from "react-bootstrap";
import MyNavbar from "../components/MyNavbar";
import { useUser } from "../context/UserContext";
function MyProduct() {
  const [products, setProducts] = useState([]);
  const [storeInfo, setStoreInfo] = useState(null);
  const [storeName, setStoreName] = useState("");
  const [description, setDescription] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedMainCategory, setSelectedMainCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductBrand, setNewProductBrand] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [isActive, setIsActive] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const { userId, username, emailcheck, role } = useUser();
  const navigate = useNavigate();
  console.log(userId);
  console.log(username);
  useEffect(() => {
    fetchProducts();
    fetchStoreInfo();
    fetchMainCategories();
  }, []);
  const fetchMainCategories = async () => {
    try {
      const res = await fetch("http://localhost:8080/category/main", {
        method: "GET",
        credentials: "include",
      });
      const resData = await res.json();
      setMainCategories(resData.data);
      console.log(resData);
    } catch (error) {
      console.error("載入主分類失敗:", error);
    }
  };
  const fetchSubCategories = async (mainCategoryId) => {
    try {
      const res = await fetch(
        `http://localhost:8080/category/sub/${mainCategoryId}`,
        { method: "GET", credentials: "include" }
      );
      const resData = await res.json();
      setSubCategories(resData.data);
    } catch (error) {
      console.error("載入子分類失敗:", error);
    }
  };
  // 處理主分類變更
  const handleMainCategoryChange = (e) => {
    const mainCategoryId = e.target.value;
    setSelectedMainCategory(mainCategoryId);
    setSelectedSubCategory(""); // 清空子分類選擇
    if (mainCategoryId) {
      fetchSubCategories(mainCategoryId);
    } else {
      setSubCategories([]);
    }
  };
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
        setStoreInfo(data.data); // 假設後端回傳新商店資訊
        fetchStoreInfo();
      } else {
        alert(data.message || "創建失敗");
      }
    } catch (err) {
      alert("伺服器錯誤，請稍後再試");
    }
  };
  const handleStoreEditClick = () => {
    setEditDescription(storeInfo.description);
    setShowEditModal(true);
  };
  const handleStoreCloseModal = () => {
    setShowEditModal(false);
    setEditDescription("");
  };
  const handleStoreEditSubmit = async (e) => {
    e.preventDefault();
    if (!editDescription.trim()) {
      alert("請輸入商店描述");
      return;
    }
    try {
      const res = await fetch("http://localhost:8080/store/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          storeId: storeInfo.id,
          description: editDescription,
        }),
      });

      if (res.ok) {
        alert("商店資訊更新成功！");
        setShowEditModal(false);
        fetchStoreInfo(); // 重新載入商店資訊
      } else {
        const errorData = await res.json();
        alert(errorData.message || "更新失敗");
      }
    } catch (err) {
      alert("伺服器錯誤，請稍後再試");
    }
  };
  const handleProductAddClick = () => {
    setShowAddProductModal(true);
  };
  const handleProductCloseModal = () => {
    setShowAddProductModal(false);
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
                    <div>關於賣場: {storeInfo.description}</div>
                    <div className="d-flex justify-content-end">
                      <Button onClick={handleStoreEditClick}>編輯資訊</Button>
                    </div>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
              <Modal show={showEditModal} onHide={handleStoreCloseModal}>
                <Modal.Header closeButton>
                  <Modal.Title>編輯商店資訊</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleStoreEditSubmit}>
                  <Modal.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>商店名稱:{storeInfo.storeName}</Form.Label>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>商店描述</Form.Label>
                      <Form.Control
                        as="textarea"
                        placeholder="請描述一下你是甚麼樣類型的商店"
                        rows={3}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                      />
                    </Form.Group>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={handleStoreCloseModal}>
                      取消
                    </Button>
                    <Button variant="primary" type="submit">
                      儲存變更
                    </Button>
                  </Modal.Footer>
                </Form>
              </Modal>
              <Modal
                show={showAddProductModal}
                onHide={handleProductCloseModal}
              >
                <ModalHeader closeButton>
                  <ModalTitle>新增商品</ModalTitle>
                </ModalHeader>
                <Form onSubmit={""}>
                  <ModalBody>
                    <Form.Group className="mb-3">
                      <Form.Label>商品名稱:</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="請輸入商品名稱"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>品牌</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="請輸入品牌名稱"
                        value={newProductBrand}
                        onChange={(e) => setNewProductBrand(e.target.value)}
                      />
                    </Form.Group>
                    {/* 主分類選擇 */}
                    <Form.Group className="mb-3">
                      <Form.Label>
                        主分類 <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        value={selectedMainCategory}
                        onChange={handleMainCategoryChange}
                        required
                      >
                        <option value="">請選擇主分類</option>
                        {mainCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    {/* 子分類選擇 */}
                    <Form.Group className="mb-3">
                      <Form.Label>
                        子分類 <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        value={selectedSubCategory}
                        onChange={(e) => setSelectedSubCategory(e.target.value)}
                        disabled={!selectedMainCategory}
                        required
                      >
                        <option value="">請選擇子分類</option>
                        {subCategories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                      {!selectedMainCategory && (
                        <Form.Text className="text-muted">
                          請先選擇主分類
                        </Form.Text>
                      )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        價格 <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        step="1"
                        min="0"
                        placeholder="請輸入商品價格"
                        value={newProductPrice}
                        onChange={(e) => setNewProductPrice(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        庫存數量 <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        placeholder="請輸入庫存數量"
                        value={newProductStock}
                        onChange={(e) => setNewProductStock(e.target.value)}
                        required
                      />
                    </Form.Group>
                    {/* 商品描述 */}
                    <Form.Group className="mb-3">
                      <Form.Label>商品描述</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="請輸入商品描述"
                        value={newProductDescription}
                        onChange={(e) =>
                          setNewProductDescription(e.target.value)
                        }
                      />
                    </Form.Group>
                  </ModalBody>
                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      onClick={handleProductCloseModal}
                    >
                      取消
                    </Button>
                    <Button variant="primary" type="submit">
                      新增商品
                    </Button>
                  </Modal.Footer>
                </Form>
              </Modal>
              <p />
              <Button variant="primary" onClick={handleProductAddClick}>
                新增商品
              </Button>
              <p />
            </div>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>商品名稱</th>
                  <th>品牌名稱</th>
                  <th>分類</th>
                  <th>價格</th>
                  <th>庫存</th>
                  <th>描述</th>
                  <th>照片</th>
                  <th>上架狀態</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td></td>
                    <td></td>
                    <td></td>
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
                      <Button variant="outline-secondary" className="me-3">
                        上傳照片
                      </Button>
                      <Button variant="outline-info" className="me-3">
                        上架 (切換)下架
                      </Button>
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
