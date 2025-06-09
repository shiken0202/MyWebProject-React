import { useState } from "react";
import MyNavbar from "../components/MyNavbar";
import { Container, Row, Col } from "react-bootstrap";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import ProductCard from "../components/ProductCard";
import axios from "axios";
function SearchPage() {
  const [searchParams] = useSearchParams();
  const keywords = searchParams.get("q");
  const [products, setProducts] = useState([]);
  useEffect(() => {
    if (keywords) {
      fetchProductsBySearch();
    }
  }, [keywords]);
  const fetchProductsBySearch = async () => {
    const res = await axios.get(
      `http://localhost:8080/product/search?keywords=${encodeURIComponent(
        keywords
      )}`
    );
    setProducts(res.data.data);
  };
  console.log(products);

  const filteredProducts = products.filter((p) => p.isActive === true);
  return (
    <>
      <MyNavbar />
      <Container className="WebContent">
        <Row className="d-flex align-items-stretch">
          {filteredProducts.map((product) => (
            <Col xs={12} md={4} lg={3} key={product.id} className="mb-4">
              <ProductCard product={product} />
            </Col>
          ))}
          {filteredProducts.length === 0 && (
            <Col className="text-center py-5">
              <h3>查無商品</h3>
            </Col>
          )}
        </Row>
      </Container>
    </>
  );
}
export default SearchPage;
