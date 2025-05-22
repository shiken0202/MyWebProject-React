import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Cart from './pages/Cart';
import Login from './pages/Login';
import ProductPage from './pages/ProductPage';
import ProductDetailPage from './pages/ProductDetailPage'
import Collect from './pages/Collect'
import OrderList from './pages/OrderList'
import MyProduct from './pages/MyProduct';
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products/user/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/products/:main/:sub" element={<ProductPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/user/collect" element={<Collect />} />
        <Route path="/user/myorder" element={<OrderList />} />
        <Route path="/user/myproduct" element={<MyProduct />} />
        {/* 可持續擴充更多路由 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
