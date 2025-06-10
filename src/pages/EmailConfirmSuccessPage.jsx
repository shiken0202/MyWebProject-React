import MyNavbar from "../components/MyNavbar";
import { Container } from "react-bootstrap";
function EmailConfirmSuccessPage() {
  return (
    <>
      <MyNavbar />
      <Container className="WebContent">
        <div className="alert alert-success text-center mt-5">
          <h2>信箱驗證成功！</h2>
          <p>您現在可以登入或返回首頁。</p>
        </div>
      </Container>
    </>
  );
}
export default EmailConfirmSuccessPage;
