// src/pages/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import ProductCard from '../components/ProductCard';
import MyNavbar from '../components/MyNavbar';
import { useParams ,Link} from 'react-router-dom';

function ProductPage() {
  // 狀態與資料
  const [products, setProducts] = useState([]);
  const{main,sub}=useParams();
  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
      })
      .catch(err => {
        console.log("載入失敗", err);
      });
  }, []);

  // 過濾出當前子分類的商品
 
  const filtered = products.filter(p =>p.category===main&& p.subCategory === sub);
  const mainmap={clothes:{male:"男裝",female:"女裝",unisex:"中性"},
                 bags:{male:"男包",female:"女包",accessories:"配件"},
                 dolls:{chiikawa:"吉伊卡哇",sunrio:"三麗鷗",others:"其他"}
}
  
  
  return (
    <>
    
      <MyNavbar />
      <Container className='WebContent'>
        <h1 className="my-4">{mainmap[main][sub]}</h1>
        
        <Row>
          {filtered.map(product => (
            <Col xs={12} md={4} lg={3} key={product.id} className="mb-4">
              <Link to={`/product/${product.id}`}>
              <ProductCard product={product} />
              </Link>
            </Col>
          ))}
          {filtered.length === 0 && <Col>沒有商品</Col>}
        </Row>
      </Container>
    </>
  );
}

export default ProductPage;
