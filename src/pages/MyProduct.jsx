import React, { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Form } from "react-bootstrap";
import MyNavbar from "../components/MyNavbar";

function MyProduct() {
  const [products, setProducts] = useState([]);
  //   const [showModal, setShowModal] = useState(false);
  //   const [editProduct, setEditProduct] = useState(null);
  //   const [formData, setFormData] = useState({
  //     name: '',
  //     price: 0,
  //     stock: 0,
  //     description: ''
  //   });

  // 取得商品列表
  useEffect(() => {
    fetchProducts();
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

  return (
    <>
      <MyNavbar />
      <Container className="WebContent">
        <div className="d-flex justify-content-between mb-4">
          <h2>我的商品管理</h2>
          <Button variant="primary">新增商品</Button>
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

        {/* 新增/編輯模態框 */}
        {/* <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{editProduct ? '編輯商品' : '新增商品'}</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>商品名稱</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>價格</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>庫存</Form.Label>
                <Form.Control
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>商品描述</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>
                取消
              </Button>
              <Button variant="primary" type="submit">
                {editProduct ? '儲存變更' : '新增商品'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal> */}
      </Container>
    </>
  );
}

export default MyProduct;
