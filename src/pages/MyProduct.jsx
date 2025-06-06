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
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductBrand, setNewProductBrand] = useState("");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductStock, setNewProductStock] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [editProductId, setEditProductId] = useState(null);
  const [editProductName, setEditProductName] = useState("");
  const [editProductBrand, setEditProductBrand] = useState("");
  const [editProductPrice, setEditProductPrice] = useState("");
  const [editProductStock, setEditProductStock] = useState("");
  const [editProductDescription, setEditProductDescription] = useState("");
  // 上傳圖片功能
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [uploadProducImageId, setUploadProducImageId] = useState(null);
  const [editDescription, setEditDescription] = useState("");
  const { userId, username, emailcheck, role } = useUser();
  if (!userId) {
    return <Navigate to="/" replace />;
  }
  console.log(userId);
  console.log(username);
  useEffect(() => {
    fetchStoreInfo();
    fetchMainCategories();
  }, []);
  useEffect(() => {
    if (storeInfo) {
      fetchProducts();
    }
  }, [storeInfo]);
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
      console.log(resData);

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
      const res = await fetch(
        `http://localhost:8080/products/store/${storeInfo.id}`
      );
      const resData = await res.json();
      console.log(resData);
      setProducts(resData.data);
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
  const createStore = async (e) => {
    e.preventDefault();
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
      localStorage.removeItem("userId");
      window.location.replace("/");
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
  const handleProductAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/product/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          storeId: storeInfo.id,
          title: newProductName,
          brand: newProductBrand,
          categoryId: selectedSubCategory,
          price: newProductPrice,
          stock: newProductStock,
          description: newProductDescription,
        }),
      });
      if (res.ok) {
        alert("商品新增成功！");
        setNewProductName("");
        setNewProductBrand("");
        setSelectedMainCategory("");
        setSelectedSubCategory("");
        setNewProductPrice("");
        setNewProductStock("");
        setNewProductDescription("");
        setShowAddProductModal(false);
        fetchProducts();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "新增失敗");
      }
    } catch (error) {
      alert("伺服器錯誤，請稍後再試");
    }
  };
  const handleProductAddClick = () => {
    setShowAddProductModal(true);
  };
  const handleProductEditClick = (product) => {
    setShowEditProductModal(true);
    setEditProductId(product.id);
    setEditProductName(product.title);
    setEditProductBrand(product.brand);
    setEditProductPrice(product.price);
    setEditProductStock(product.stock);
    setEditProductDescription(product.description);
  };
  const handleProductCloseModal = () => {
    setShowAddProductModal(false);
  };
  const handleProductEditCloseModal = () => {
    setSelectedMainCategory("");
    setSelectedSubCategory("");
    setShowEditProductModal(false);
  };
  const handleProductEditSubmit = async (e) => {
    e.preventDefault();
    if (!editProductName.trim()) {
      alert("請輸入商品名稱");
      return;
    }
    if (!editProductPrice || Number(editProductPrice) <= 0) {
      alert("請輸入有效價格");
      return;
    }
    if (!editProductStock || Number(editProductStock) < 0) {
      alert("請輸入有效庫存");
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:8080/product/edit/${editProductId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: editProductName,
            brand: editProductBrand,
            categoryId: selectedSubCategory,
            price: editProductPrice,
            stock: editProductStock,
            description: editProductDescription,
          }),
        }
      );
      if (res.ok) {
        alert("商品修改成功！");
        setShowEditProductModal(false);
        setSelectedMainCategory("");
        setSelectedSubCategory("");
        fetchProducts();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "新增失敗");
      }
    } catch (error) {
      alert("伺服器錯誤，請稍後再試");
    }
  };
  const handleProductDelete = async (productId) => {
    const isConfirmed = window.confirm("是否確定要刪除這個商品？");
    if (!isConfirmed) {
      return;
    }
    try {
      const res = await fetch(
        `http://localhost:8080/product/delete/${productId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      if (res.ok) {
        alert("刪除成功");
        fetchProducts();
      } else {
        const errorData = await res.json();
        alert(errorData.message || "刪除失敗，請稍後再試。");
      }
    } catch (error) {
      alert("伺服器錯誤，請稍後再試。");
    }
  };

  const handleImageUploadClick = (productId) => {
    setUploadProducImageId(productId);
    setShowImageModal(true);
  };
  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };
  const handleImageUpload = async (e) => {
    e.preventDefault();

    if (!selectedFiles.length) {
      alert("請選擇圖片檔案");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const res = await fetch(
        `http://localhost:8080/${uploadProducImageId}/images`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setShowImageModal(false);
        fetchProducts();
        setSelectedFiles([]);
      } else {
        alert(data.message || "上傳失敗");
      }
    } catch (error) {
      alert("伺服器錯誤，請稍後再試");
    }
  };
  const handleDeleteAllImages = async (productId) => {
    if (!window.confirm("確定要刪除所有照片嗎？")) return;
    try {
      const res = await fetch(`http://localhost:8080/${productId}/images`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "所有照片已刪除！");
        // 重新載入商品或圖片列表
        fetchProducts();
      } else {
        alert(data.message || "批次刪除失敗");
      }
    } catch (err) {
      alert("伺服器錯誤，請稍後再試");
    }
  };
  const handleActiveClick = async (Id) => {
    try {
      const res = await fetch(`http://localhost:8080/product/active/${Id}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "上架成功！");
        // 重新載入商品或圖片列表
        fetchProducts();
      } else {
        alert(data.message || "上架失敗");
      }
    } catch (err) {
      alert("伺服器錯誤，請稍後再試");
    }
  };
  const handleIsNotActiveClick = async (Id) => {
    try {
      const res = await fetch(`http://localhost:8080/product/notactive/${Id}`, {
        method: "PUT",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "下架成功！");
        // 重新載入商品或圖片列表
        fetchProducts();
      } else {
        alert(data.message || "下架失敗");
      }
    } catch (err) {
      alert("伺服器錯誤，請稍後再試");
    }
  };
  const categoriesIdMap = {
    2: 1,
    3: 1,
    4: 1,
    6: 5,
    7: 5,
    8: 5,
    10: 9,
    11: 9,
    12: 9,
  };
  const categoriesMainMap = { 1: "衣服", 5: "包包", 9: "玩偶" };

  const subCategoryNameMap = {
    male: "男",
    female: "女",
    unisex: "中性",
    accessories: "配件",
    chiikawa: "吉伊卡哇",
    sunrio: "三麗鷗",
    others: "其他",
  };
  const titleMap = {
    clothes: "衣服",
    bags: "包包",
    dolls: "玩偶",
  };
  return (
    <>
      <MyNavbar />
      <Container className="WebContent">
        {storeInfo == null && userId != null ? (
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
              {/*新增商品表單*/}
              <Modal
                show={showAddProductModal}
                onHide={handleProductCloseModal}
              >
                <ModalHeader closeButton>
                  <ModalTitle>新增商品</ModalTitle>
                </ModalHeader>
                <Form onSubmit={handleProductAddSubmit}>
                  <ModalBody>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        商品名稱<span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="請輸入商品名稱"
                        value={newProductName}
                        onChange={(e) => setNewProductName(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        品牌<span className="text-danger">*</span>
                      </Form.Label>
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
                            {titleMap[category.name]}
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
                            {subCategoryNameMap[category.name]}
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
                      <Form.Label>
                        商品描述<span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="請輸入商品描述"
                        value={newProductDescription}
                        maxLength={255}
                        onChange={(e) =>
                          setNewProductDescription(e.target.value)
                        }
                        required
                      />
                    </Form.Group>
                    <small className="text-muted">
                      {newProductDescription.length}/255
                    </small>
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
              {/*修改商品表單*/}
              <Modal
                show={showEditProductModal}
                onHide={handleProductEditCloseModal}
              >
                <ModalHeader closeButton>
                  <ModalTitle>修改商品</ModalTitle>
                </ModalHeader>
                <Form onSubmit={handleProductEditSubmit}>
                  <ModalBody>
                    <Form.Group className="mb-3">
                      <Form.Label>商品名稱:</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="請輸入商品名稱"
                        value={editProductName}
                        onChange={(e) => setEditProductName(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>品牌</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="請輸入品牌名稱"
                        value={editProductBrand}
                        onChange={(e) => setEditProductBrand(e.target.value)}
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
                            {titleMap[category.name]}
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
                            {subCategoryNameMap[category.name]}
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
                        value={editProductPrice}
                        onChange={(e) => setEditProductPrice(e.target.value)}
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
                        value={editProductStock}
                        onChange={(e) => setEditProductStock(e.target.value)}
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
                        value={editProductDescription}
                        maxLength={255}
                        onChange={(e) =>
                          setEditProductDescription(e.target.value)
                        }
                      />
                    </Form.Group>
                    <small className="text-muted">
                      {editProductDescription.length}/255
                    </small>
                  </ModalBody>
                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      onClick={handleProductEditCloseModal}
                    >
                      取消
                    </Button>
                    <Button variant="primary" type="submit">
                      修改商品
                    </Button>
                  </Modal.Footer>
                </Form>
              </Modal>
              {/*上傳照片*/}
              <Modal
                show={showImageModal}
                onHide={() => setShowImageModal(false)}
              >
                <Modal.Header closeButton>
                  <Modal.Title>上傳商品照片</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleImageUpload}>
                  <Modal.Body>
                    <Form.Group>
                      <Form.Label>選擇圖片（可多選）</Form.Label>
                      <Form.Control
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileSelect}
                      />
                    </Form.Group>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button
                      variant="secondary"
                      onClick={() => setShowImageModal(false)}
                    >
                      取消
                    </Button>
                    <Button variant="primary" type="submit">
                      上傳
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
            <Table
              striped
              bordered
              hover
              responsive="md"
              className="align-middle"
              style={{ tableLayout: "fixed", width: "100%" }}
            >
              <thead>
                <tr>
                  <th style={{ width: "80px" }}>商品名稱</th>
                  <th style={{ width: "60px" }}>品牌名稱</th>
                  <th style={{ width: "40px" }}>分類</th>
                  <th style={{ width: "50px" }}>價格</th>
                  <th style={{ width: "30px" }}>庫存</th>
                  <th style={{ width: "240px" }}>描述</th>
                  <th style={{ width: "110px" }}>照片</th>
                  <th style={{ width: "50px" }}>上架狀態</th>
                  <th style={{ width: "260px" }}>操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="desc-cell">{product.title}</td>
                    <td className="desc-cell">{product.brand}</td>
                    <td>
                      {categoriesMainMap[categoriesIdMap[product.categoryId]] +
                        ";" +
                        subCategoryNameMap[product.categoryName]}
                    </td>
                    <td>${product.price}</td>
                    <td>{product.stock}</td>
                    <td className="desc-cell">{product.description}</td>
                    <td>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {product.images && product.images.length > 0 ? (
                          product.images.slice(0, 3).map((img, idx) => (
                            <img
                              key={idx}
                              src={`http://localhost:8080${img.imageUrl}`}
                              alt="商品圖片"
                              style={{
                                width: "50px",
                                height: "50px",
                                objectFit: "cover",
                                border: "1px solid #ddd",
                                borderRadius: "4px",
                              }}
                            />
                          ))
                        ) : (
                          <span className="text-muted">無圖片</span>
                        )}
                      </div>
                    </td>
                    <td>{product.isActive ? "上架中" : "已下架"}</td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "4px",
                        }}
                      >
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handleProductEditClick(product)}
                        >
                          編輯
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleProductDelete(product.id)}
                        >
                          刪除
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleImageUploadClick(product.id)}
                        >
                          上傳照片
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteAllImages(product.id)}
                        >
                          刪除照片
                        </Button>
                        {product.isActive ? (
                          <Button
                            variant="info"
                            size="sm"
                            onClick={() => handleIsNotActiveClick(product.id)}
                          >
                            下架
                          </Button>
                        ) : (
                          <Button
                            variant="outline-info"
                            size="sm"
                            onClick={() => handleActiveClick(product.id)}
                          >
                            上架
                          </Button>
                        )}
                      </div>
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
