import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { CategoryProvider, useCategory } from "./context/CategoryContext";
import HomePage from "./pages/HomePage";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import ProductPage from "./pages/ProductPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import Collect from "./pages/Collect";
import OrderList from "./pages/OrderList";
import MyProduct from "./pages/MyProduct";
import Register from "./pages/Register";
import UserList from "./pages/UserList";
import RequireAuth from "./components/RequireAuth";
import SearchPage from "./pages/SearchPage";
import EmailConfirmPage from "./pages/EmailConfirmPage";
import EmailConfirmSuccessPage from "./pages/EmailConfirmSuccessPage";
import EmailConfirmErrorPage from "./pages/EmailConfirmErrorPage";
function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <CategoryProvider>
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route
              path="/products/user/cart"
              element={
                <RequireAuth>
                  <Cart />
                </RequireAuth>
              }
            />

            <Route path="/login" element={<Login />} />
            <Route path="/products/:main/:sub" element={<ProductPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route
              path="/user/collect"
              element={
                <RequireAuth>
                  <Collect />
                </RequireAuth>
              }
            />
            <Route
              path="/user/myorder"
              element={
                <RequireAuth>
                  <OrderList />
                </RequireAuth>
              }
            />
            <Route
              path="/user/myproduct"
              element={
                <RequireAuth>
                  <MyProduct />
                </RequireAuth>
              }
            />
            <Route
              path="/user/userlist"
              element={
                <RequireAuth>
                  <UserList />
                </RequireAuth>
              }
            />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<SearchPage />} />
            <Route
              path="/MyWebProject/email/confirm"
              element={<EmailConfirmPage />}
            />
            <Route
              path="/email-confirm-success"
              element={<EmailConfirmSuccessPage />}
            />
            <Route
              path="/email-confirm-error"
              element={<EmailConfirmErrorPage />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CategoryProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
