import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";
import { useCategory } from "../context/CategoryContext";
import { useEffect } from "react";
import { useState } from "react";
function ProductCard({ product }) {
  const [stores, setStores] = useState([]);
  const { categories, mainCategories, subCategories } = useCategory();
  useEffect(() => {
    fetchAllStore();
  }, []);
  const fetchAllStore = async () => {
    const res = await fetch("http://localhost:8080/store/all", {
      method: "GET",
      credentials: "include",
    });
    const resData = await res.json();
    setStores(resData.data || []);
  };
  const store = stores.find((s) => s.id === product.storeId);
  const titleMap = {
    clothes: { male: "男裝", female: "女裝", unisex: "中性" },
    bags: { male: "男包", female: "女包", accessories: "配件" },
    dolls: { chiikawa: "吉伊卡哇", sunrio: "三麗鷗", others: "其他" },
  };
  // 建立子分類 ID 到主分類 ID 的映射
  const subToMainMap = subCategories.reduce((map, subCat) => {
    map[subCat.id] = subCat.parentId;
    return map;
  }, {});
  const mainCategoriesMap = { 1: "clothes", 5: "bags", 9: "dolls" };
  const subCategoriesMap = {
    2: "male",
    3: "female",
    4: "unisex",
    6: "male",
    7: "female",
    8: "accessories",
    10: "chiikawa",
    11: "sunrio",
    12: "others",
  };
  const mainId = subToMainMap[product.categoryId];
  const mainKey = mainCategoriesMap[mainId];
  const subKey = subCategoriesMap[product.categoryId];
  const categoryName = titleMap[mainKey]?.[subKey] ?? "未知分類";
  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: "none" }}>
      <Card className="h-100">
        <Card.Body>
          <Card.Title>{product.title}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {product.brand}
          </Card.Subtitle>

          {product.images.slice(0, 1).map((img, idx) => (
            <Card.Img
              key={img.id}
              variant="top"
              src={`http://localhost:8080${img.imageUrl}`}
              style={{ width: "200px", height: "250px", objectFit: "cover" }}
              className="d-block mx-auto"
            />
          ))}

          <Card.Text>
            分類：
            {categoryName}
            <br />
            價格：${product.price} <br />
            商場:
            {store ? store.storeName : "載入中..."}
            <br />
            瀏覽次數:{product.viewCount}
          </Card.Text>
        </Card.Body>
      </Card>
    </Link>
  );
}

export default ProductCard;
