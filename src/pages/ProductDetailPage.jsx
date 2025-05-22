import React, { useEffect, useState } from "react";
import MyNavbar from "../components/MyNavbar";
import { Container, Row, Col,Button,Form } from "react-bootstrap";
import { useParams } from "react-router-dom";

function ProductDetailPage() {
  const { id } = useParams(); // 取得網址上的商品 id
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    // 取得商品主資料
    fetch(`http://localhost:3000/products/${id}`)
      .then(res => res.json())
      .then(data => setProduct(data))
      .catch(() => setProduct(null));

    // 取得商品圖片
    fetch(`http://localhost:3000/products/${id}/images`)
      .then(res => res.json())
      .then(imgs => setImages(imgs))
      .catch(() => setImages([]));
  }, [id]);

  if (!product) return <div>載入中或查無此商品</div>;

  return (
    <>
    <MyNavbar/>
    <Container className="WebContent ">
        <Row className="justify-content-center">
                <Col xs={12}md={6} lg={6}> 
                 {images.length > 0 ? (
                        images.map(img => (
                            <img
                            key={img.id}
                            src={img.image_url}
                            alt={product.title}
                            style={{ maxWidth: "300px", marginRight: "10px" }}
                            />
                        ))
                        ) : (
                        <img src="https://fakeimg.pl/300x200/" alt="無圖片" style={{width:"100%"}} />
                        )}</Col>
                <Col xs={12}md={6} lg={6}>
                    <h2>{product.name}</h2>
                    <div>
                      
                    </div>
                    <p>價格：${product.price}</p>
                    <p>庫存：{null}</p>
                    <p>狀態：{product.is_active ? "上架中" : "已下架"}</p>
                    <p>分類ID：{product.category}</p>
                    <p>商店ID：{product.storeId}</p>
                    <p>建立時間：{product.created_at}</p>
                    <br />
                    <div className="d-flex align-items-center mb-3">
                        <Button variant="primary "className="flex-grow-1" >加入購物車</Button>
                        &nbsp;&nbsp;&nbsp;
                        <Form.Select className="w-25 me-2" aria-label="選擇數量">
                        <option value="1" >1</option>
                        <option value="2" >2</option>
                        <option value="3" >3</option>
                         </Form.Select>
                    </div>
                     
                    {/* 你可以根據需要再加上商店名稱、分類名稱等（需額外查詢） */}
                </Col>
            </Row>
      </Container>
    </>
  );
}

export default ProductDetailPage;
