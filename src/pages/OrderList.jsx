import MyNavbar from "../components/MyNavbar";
import { Container, Row, Col, Table } from "react-bootstrap";

function OrderList() {
    return (
        <>
            <MyNavbar />
            <Container className="WebContent mt-4">
                <Row>
                    <Col xs={12} className="mb-5">
                        <h1 className="mb-4 text-start">目前訂單</h1>
                        <Table striped bordered hover responsive>
                            <thead className="table-primary">
                                <tr>
                                    <th>訂單編號</th>
                                    <th>商品名稱</th>
                                    <th>數量</th>
                                    <th>訂單金額</th>
                                    <th>配送方式</th>
                                    <th>運送狀態</th>
                                    <th>付款方式</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>NO.1</td>
                                    <td>帽子A</td>
                                    <td>5個</td>
                                    <td>$500</td>
                                    <td>超商取貨</td>
                                    <td>配送中</td>
                                    <td>信用卡</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                    <Col xs={12}>
                        <h1 className="mb-4 text-start">歷史訂單</h1>
                        {/* 這裡可以放歷史訂單的表格或其他內容 */}
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default OrderList;
