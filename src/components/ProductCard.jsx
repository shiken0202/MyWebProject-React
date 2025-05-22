import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';


function ProductCard({ product }) {
  const titleMap={clothes:{male:"男裝",female:"女裝",unisex:"中性"},
                 bags:{male:"男包",female:"女包",accessories:"配件"},
                 dolls:{chiikawa:"吉伊卡哇",sunrio:"三麗鷗",others:"其他"}
  };
  return (
    <Card>
      <Card.Body>
        <Card.Title>{product.name}</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">{product.brand}</Card.Subtitle>
        <Card.Img variant="top" src="https://fakeimg.pl/440x320/" />
        <Card.Text>
          分類：{titleMap[product.category]?.[product.subCategory]}<br />
          價格：${product.price} <br />
          商場:{product.storeId}<br/>
          瀏覽次數:{product.views}
        </Card.Text>
        {/* 可加購物車按鈕 */}
        <Button variant="primary">加入購物車</Button>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;
