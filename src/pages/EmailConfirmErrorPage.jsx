import MyNavbar from "../components/MyNavbar";
import { Container } from "react-bootstrap";
function EmailConfirmErrorPage() {
  return (
    <>
      <MyNavbar />
      <Container className="WebContent">
        <div className="alert alert-danger text-center mt-5">
          <h2>信箱驗證失敗！</h2>
          <p>請重新確認您的信箱，或是返回首頁。</p>
        </div>
      </Container>
    </>
  );
}
export default EmailConfirmErrorPage;
