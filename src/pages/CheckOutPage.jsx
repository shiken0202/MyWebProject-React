import MyNavbar from "../components/MyNavbar";
import { Container } from "react-bootstrap";
function CheckOutPage() {
  return (
    <>
      <MyNavbar />
      <Container className="WebContent">
        <h1>收藏店家</h1>
        <ul>
          <li>日韓代購</li>
          <li>迪士尼代購</li>
          <li>環球代購</li>
        </ul>
      </Container>
    </>
  );
}
export default CheckOutPage;
