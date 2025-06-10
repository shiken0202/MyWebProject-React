import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function EmailConfirmPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const username = searchParams.get("username");
    if (!username) {
      alert("缺少驗證資訊");
      navigate("/email-confirm-fail");
      return;
    }

    fetch(
      `http://localhost:8080/MyWebProject/email/confirm?username=${username}`,
      {
        method: "GET",
        credentials: "include",
      }
    )
      .then((res) => {
        console.log(res);
        return res.json();
      })
      .then((data) => {
        console.log(data);
        if (data.status == 200) {
          navigate("/email-confirm-success");
        } else {
          navigate("/email-confirm-error");
        }
      });
  }, [navigate, searchParams]);

  return (
    <div className="text-center mt-5">
      <div className="spinner-border text-primary" role="status" />
      <div>驗證中，請稍候...</div>
    </div>
  );
}

export default EmailConfirmPage;
