import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProductCard from "../components/ProductCard";
import MyNavbar from "../components/MyNavbar";
import { useParams, Link } from "react-router-dom";
import { useCategory } from "../context/CategoryContext";

function ProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const { main, sub } = useParams();
  const {
    mainCategories,
    findMainCategoryByName,
    findSubCategoryByName,
    loading: categoryLoading,
  } = useCategory();
  const titleMap = {
    clothes: { male: "男裝", female: "女裝", unisex: "中性" },
    bags: { male: "男包", female: "女包", accessories: "配件" },
    dolls: { chiikawa: "吉伊卡哇", sunrio: "三麗鷗", others: "其他" },
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8080/products", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const resData = await res.json();
          setProducts(resData.data || []);
        }
      } catch (error) {
        console.error("載入商品失敗:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // 等待分類載入完成
  if (categoryLoading) {
    return (
      <>
        <MyNavbar />
        <Container className="WebContent">
          <div className="text-center mt-5">載入分類中...</div>
        </Container>
      </>
    );
  }

  if (!main || !sub) {
    return (
      <>
        <MyNavbar />
        <Container className="WebContent">
          <h1 className="my-4">無效的分類路徑</h1>
        </Container>
      </>
    );
  }

  // 找到主分類和子分類物件
  const mainCategory = findMainCategoryByName(main);
  const subCategory = findSubCategoryByName(sub, mainCategory?.id);

  // 檢查分類是否存在
  if (!mainCategory || !subCategory) {
    return (
      <>
        <MyNavbar />
        <Container className="WebContent">
          <h1 className="my-4">分類不存在</h1>
          <p>
            找不到對應的分類：{main} - {sub}
          </p>
        </Container>
      </>
    );
  }

  const filteredProducts = products
    .filter((p) => p.categoryId === subCategory.id)
    .filter((p) => p.isActive === true);

  if (loading) {
    return (
      <>
        <MyNavbar />
        <Container className="WebContent">
          <div className="text-center mt-5">載入商品中...</div>
        </Container>
      </>
    );
  }

  return (
    <>
      <MyNavbar />
      <Container className="WebContent">
        <h1 className="my-4">
          {titleMap[mainCategory.name][subCategory.name]}
        </h1>

        <Row className="d-flex align-items-stretch">
          {filteredProducts.map((product) => (
            <Col xs={12} md={4} lg={3} key={product.id} className="mb-4">
              <ProductCard product={product} />
            </Col>
          ))}
          {filteredProducts.length === 0 && (
            <Col className="text-center py-5">
              <h3>此分類暫無商品</h3>
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
}

export default ProductPage;
