import React, { useEffect, useState } from "react";
import MyNavbar from "../components/MyNavbar";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { useCategory } from "../context/CategoryContext";
import { useUser } from "../context/UserContext";
import Carousel from "react-bootstrap/Carousel";
import ChatRoom from "../components/ChatRoom";

function ProductDetailPage() {
  const { id } = useParams(); // 取得網址上的商品 id
  const [product, setProduct] = useState(null);
  const [amount, setAmount] = useState(1);
  const [images, setImages] = useState([]);
  const { categories, mainCategories, subCategories } = useCategory("");
  const [stores, setStores] = useState([]);
  const { userId, username, emailcheck, role } = useUser();
  const [rate, setRate] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);
  useEffect(() => {
    // 取得商品主資料
    fetch(`http://localhost:8080/product/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data.data))
      .catch(() => setProduct(null));
    fetchAllStore();
    fetchViewCount(id);
    fetchCurrencyRate();
  }, [id]);
  console.log(product);

  async function fetchCurrencyRate() {
    const res = await fetch("http://localhost:8080/twd-jpy", {
      method: "GET",
      credentials: "include",
    });
    if (res.ok) {
      const resData = await res.json();
      console.log(resData);
      setRate(resData.data);
    }
  }
  const jpyFormat = (value) =>
    new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: "JPY",
    }).format(value);

  async function CreateCartItem(e) {
    try {
      e.preventDefault();
      if (userId == null || role != "BUYER") {
        alert("請先登入買家身份來加入購物車!");
        return;
      }
      if (!emailcheck) {
        alert("請先驗證Email");
        return;
      }
      if (Number(amount) > product.stock) {
        alert("庫存不足，請重新選擇");
        return;
      }
      const res = await fetch("http://localhost:8080/cartitem/create", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        credentials: "include",
        body: new URLSearchParams({ id: product.id, amount }),
      });

      if (res.ok) {
        alert("成功加入購物車");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "購物車加入失敗");
      }
    } catch (err) {
      alert("伺服器錯誤，請稍後再試");
    }
  }
  async function fetchAllStore() {
    const res = await fetch("http://localhost:8080/store/all", {
      method: "GET",
      credentials: "include",
    });
    const resData = await res.json();
    console.log(resData.data);

    setStores(resData.data || []);
  }

  const fetchViewCount = async () => {
    try {
      const res = await fetch(`http://localhost:8080/product/view/${id}`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
    } catch (error) {
      console.error("更新瀏覽次數失敗", error);
    }
  };
  if (!product || !subCategories || !mainCategories)
    return <div>載入中或查無此商品</div>;
  const store = stores.find((s) => s.id === product.storeId);

  const subToMainMap = subCategories.reduce((map, subCat) => {
    map[subCat.id] = subCat.parentId;
    return map;
  }, {});
  const titleMap = {
    clothes: { male: "男裝", female: "女裝", unisex: "中性" },
    bags: { male: "男包", female: "女包", accessories: "配件" },
    dolls: { chiikawa: "吉伊卡哇", sunrio: "三麗鷗", others: "其他" },
  };
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
  const handleChatClick = () => {
    if (!userId || role !== "BUYER") {
      alert("請先登入買家身份才能與賣家聊天！");
      return;
    }
    if (!emailcheck) {
      alert("請先驗證Email");
      return;
    }
    setShowChat(true);
  };

  // 關閉聊天室
  const handleChatClose = () => {
    setShowChat(false);
  };
  return (
    <>
      <MyNavbar />
      <Container className="WebContent my-5">
        {/* 商品主內容區塊 */}
        <Row className="g-4">
          <Col xs={12} lg={6} className="mb-4">
            <div className="border rounded-3 p-3 bg-light">
              <Carousel
                data-bs-theme="dark"
                interval={2000}
                indicators={product.images.length > 1}
                className="product-carousel"
              >
                {product.images.length > 0 ? (
                  product.images.map((img) => (
                    <Carousel.Item key={img.id}>
                      <div className="ratio ratio-1x1">
                        <img
                          src={`http://localhost:8080${img.imageUrl}`}
                          alt={product.title}
                          className="d-block w-100 h-100 object-fit-contain p-3"
                        />
                      </div>
                    </Carousel.Item>
                  ))
                ) : (
                  <Carousel.Item>
                    <div className="text-center py-5 text-muted">
                      <i className="bi bi-image fs-1"></i>
                      <p className="mt-2">暫無商品圖片</p>
                    </div>
                  </Carousel.Item>
                )}
              </Carousel>
            </div>
          </Col>

          {/* 商品資訊區 */}
          <Col xs={12} lg={6}>
            <div className="border rounded-3 p-4 bg-white shadow-sm">
              {/* 商品標題區 */}
              <div className="border-bottom pb-3 mb-3">
                <h1 className="h2 fw-bold mb-2">{product.title}</h1>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary fs-6">
                    {product.isActive ? "販售中" : "已下架"}
                  </span>
                  <span className="text-muted fs-6">
                    上架時間：{new Date(product.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex align-items-baseline gap-2 mb-3">
                  <span className="fs-5 text-muted">售價</span>
                  <span className="fs-3 fw-bold text-danger">
                    ${product.price.toLocaleString()}
                  </span>
                  <span className="fs-5 text-muted">換算日幣約為</span>
                  <span className="fs-3 fw-bold text-primary">
                    {jpyFormat(product.price * rate)}
                  </span>
                </div>
                <div className="alert alert-light d-flex align-items-center justify-content-between mb-3 shadow-sm border rounded">
                  <span className="text-muted small">
                    <i className="bi bi-info-circle me-1"></i>
                    資料來源：
                    <a
                      href="https://tw.rter.info/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-secondary text-decoration-underline"
                    >
                      RTER.info 全球即時匯率API
                    </a>
                  </span>
                  <span className="fs-5 fw-bold text-primary">
                    當前匯率 台幣 : 日幣
                    <span className="badge bg-success ms-2">
                      1 :{" "}
                      {rate.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </span>
                </div>

                <div className="d-flex gap-2 ">
                  <Form className="d-flex gap-2" onSubmit={CreateCartItem}>
                    <Form.Select
                      className="w-25"
                      style={{ minWidth: "80px" }}
                      onChange={(e) => setAmount(e.target.value)}
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </Form.Select>
                    <br />

                    <Button
                      variant="outline-info"
                      size="lg"
                      type="submit"
                      className="flex-grow-1 d-flex align-items-center justify-content-center gap-2"
                    >
                      加入購物車
                    </Button>
                  </Form>
                </div>
              </div>

              {/* 商品詳細資訊 */}
              <div className="mb-4">
                <h3 className="h5 mb-3">商品詳情</h3>
                <dl className="row">
                  <dt className="col-sm-4 text-muted">商品分類</dt>
                  <dd className="col-sm-8">
                    {titleMap[
                      mainCategoriesMap[subToMainMap[product.categoryId]]
                    ]?.[subCategoriesMap[product.categoryId]]
                      ? titleMap[
                          mainCategoriesMap[subToMainMap[product.categoryId]]
                        ][subCategoriesMap[product.categoryId]]
                      : ""}
                  </dd>

                  <dt className="col-sm-4 text-muted">庫存數量</dt>
                  <dd className="col-sm-8">
                    {product.stock > 0 ? (
                      <span className="text-success">{product.stock} 件</span>
                    ) : (
                      <span className="text-danger">缺貨中</span>
                    )}
                  </dd>

                  <dt className="col-sm-4 text-muted">商品品牌</dt>
                  <dd className="col-sm-8">{product.brand || "無品牌資訊"}</dd>
                </dl>
              </div>

              {/* 商品描述 */}
              <div className="border-top pt-3">
                <h3 className="h5 mb-3">商品描述</h3>
                <div
                  className="text-muted lh-lg"
                  style={{ whiteSpace: "pre-line" }}
                >
                  {product.description || "暫無商品描述"}
                </div>
              </div>
            </div>
          </Col>
        </Row>

        {/* 商店資訊區塊 */}
        <Row className="mt-4">
          <Col xs={12}>
            <div className="border rounded-3 p-4 bg-light">
              <h2 className="h4 mb-3">
                <i className="bi bi-shop me-2"></i>
                商店資訊
              </h2>
              {store ? (
                <>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div className="bg-white rounded-circle p-3">
                      <i className="bi bi-building fs-3"></i>
                    </div>
                    <div>
                      <h3 className="h5 mb-1">{store.storeName}</h3>
                      <p className="text-muted mb-0">{store.description}</p>
                    </div>
                  </div>
                  <Button variant="outline-primary" className="gap-2" size="sm">
                    <i className="bi bi-info-circle me-2 "></i>
                    查看店家頁面
                  </Button>
                  <Button
                    className="ms-2"
                    variant="outline-primary"
                    onClick={handleChatClick}
                  >
                    <i className="bi bi-chat-dots me-2"></i>
                    與賣家聊聊
                  </Button>
                </>
              ) : (
                <div className="text-center py-3 text-muted">
                  <i className="bi bi-hourglass-split fs-3"></i>
                  <p className="mt-2 mb-0">載入商店資訊中...</p>
                </div>
              )}
            </div>
            {store && (
              <ChatRoom
                show={showChat}
                onClose={handleChatClose}
                buyerId={userId}
                storeId={store.id}
                storeName={store.storeName}
              />
            )}
            {console.log(userId)}
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default ProductDetailPage;
