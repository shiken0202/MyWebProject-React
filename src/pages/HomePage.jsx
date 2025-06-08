import { Container, Row, Col } from "react-bootstrap";
import MyNavbar from "../components/MyNavbar";
import ProductCard from "../components/ProductCard";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCategory } from "../context/CategoryContext";

function HomePage() {
  const [products, setProducts] = useState([]);
  const { categories, mainCategories, subCategories } = useCategory();

  useEffect(() => {
    fetchProducts();
  }, []);

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

  // 建立子分類 ID 到主分類 ID 的映射
  const subToMainMap = subCategories.reduce((map, subCat) => {
    map[subCat.id] = subCat.parentId;
    return map;
  }, {});

  return (
    <>
      <MyNavbar />
      <Container className="WebContent">
        {mainCategories.map((mainCat) => {
          // 修正：使用子分類映射來找出屬於該主分類的商品
          const categoryProducts = products
            .filter((product) => {
              // 如果商品直接屬於主分類
              if (product.categoryId === mainCat.id) return true;
              // 如果商品屬於該主分類的子分類
              return subToMainMap[product.categoryId] === mainCat.id;
            })
            .filter((p) => p.isActive !== false) // 只顯示上架商品（如果有 isActive 欄位）
            .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)); // 修正欄位名稱

          // 只有該主分類有商品時才顯示
          if (categoryProducts.length === 0) return null;

          return (
            <Section
              key={mainCat.id}
              title={mainCat.name}
              products={categoryProducts}
            />
          );
        })}

        {products.length === 0 && (
          <Row className="mt-5 justify-content-center">
            <Col className="text-center">
              <h3>目前沒有商品</h3>
            </Col>
          </Row>
        )}
      </Container>
    </>
  );
}

function Section({ title, products }) {
  const titleMap = {
    clothes: "衣服",
    bags: "包包",
    dolls: "玩偶",
  };
  const PAGE_SIZE = 4;
  const [startIdx, setStartIdx] = useState(0);
  const total = products.length;

  // 取出目前要顯示的 4 張商品
  const displayProducts = products.slice(startIdx, startIdx + PAGE_SIZE);

  // 處理循環分頁
  const handlePrev = () => {
    setStartIdx((prev) =>
      prev - PAGE_SIZE < 0 ? Math.max(total - PAGE_SIZE, 0) : prev - PAGE_SIZE
    );
  };
  const handleNext = () => {
    setStartIdx((prev) => (prev + PAGE_SIZE >= total ? 0 : prev + PAGE_SIZE));
  };
  return (
    <Row className="mt-5 justify-content-center">
      <Col xs={12}>
        <h2 className="text-center mb-4">{titleMap[title] || title}</h2>
      </Col>

      {displayProducts.map((product) => (
        <Col key={product.id} className="pb-4 " xs={12} sm={6} lg={3}>
          <ProductCard product={product} />
        </Col>
      ))}

      {total > PAGE_SIZE && (
        <Col xs={12} className="d-flex justify-content-center mt-2">
          <button
            className="btn btn-outline-secondary me-2"
            onClick={handlePrev}
          >
            上一頁
          </button>
          <button className="btn btn-outline-secondary" onClick={handleNext}>
            下一頁
          </button>
        </Col>
      )}
    </Row>
  );
}

export default HomePage;
