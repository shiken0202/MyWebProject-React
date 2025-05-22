import { Container, Row, Col } from 'react-bootstrap';
import MyNavbar from '../components/MyNavbar';
import ProductCard from '../components/ProductCard';
import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';



function HomePage() {
  const [products, setProducts] = useState([]);
  const [category,setCategory] =useState([]);
  const [subCategory,setSubCategory] =useState([]);
  const [views,setViews]=useState("")
  useEffect(() => {
    fetch("http://localhost:3000/products")
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setCategory([...new Set(data.map(p => p.category))]);
        // setCategory(data.map(d=>d.category));
        setSubCategory(...new Set(data.map(p => p.subCategory)));
      })
      .catch(err => console.log("載入失敗", err));
  }, []);
  
  return (
    <>
      <MyNavbar />
      <Container className='WebContent'>
        {category.map(cat =>
          <Section
            key={cat}
            title={cat}
            products={(products.filter(p => p.category === cat)).sort((a,b)=>b.views-a.views).slice(0, 4)}
          />
        )}
      </Container>
    </>
  );
}

function Section({ title, products }) {
  const titleMap={
    clothes:"衣服",
    bags:"包包",
    dolls:"玩偶"
  };
  return (
    <Row className="mt-5 justify-content-center">
      <h1>{titleMap[title]}</h1>
      {products.map(product => (
        <Col key={product.id} className='pb-4' xs={10} lg={3}>
          <Link to={`/product/${product.id}`}>
          <ProductCard product={product} />
          </Link>
        </Col>
      ))}
    </Row>
  );
}

export default HomePage;
