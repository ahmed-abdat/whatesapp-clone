import whatsappWelcomeImg from "../../assets/img/whatsapp-welcome.png";
import "./welcoome.css";
import { useNavigate } from "react-router-dom";

export default function ({ }) {
  const navigate = useNavigate()
  return (
    <div className="welcome-page">
      <div className="img">
        <img src={whatsappWelcomeImg} alt="whatsapp welcome img" />
      </div>
      <div className="content d-f">
        <h3>أهلا بك في واتساب</h3>
        <p>
          اقرأ
          <a href="https://www.whatsapp.com/legal/privacy-policy?lg=ar&lc=MR&eea=0" target="_blank">
            سياسة الخصوصية
          </a>
        انقر على <span>"الموافقة و المتابعة"</span> لقبول 
          <a href="https://www.whatsapp.com/legal/terms-of-service?lg=ar&lc=MR&eea=0" target="_blank"> شروط الخدمة</a>
        </p>
      </div>
      <div className="btn">
        <button onClick={()=> navigate('/')}>الموافقة و المتابعة</button>
      </div>
    </div>
  );
}
