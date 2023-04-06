import "./styles/Loading.css";
import { BsWhatsapp } from "react-icons/bs";
import { HiLockClosed } from "react-icons/hi";

function Loading() {
  return (
    <div className="loading--container">
      <div className="img d-f">
        <BsWhatsapp className="whatsapp-icon" />
      </div>
      <div className="text d-f">
        <h3>WhatsApp</h3>
        <div className="info d-f light-icon">
          <p>رسائل مشفرة من الطرفين</p>
          <HiLockClosed />
        </div>
      </div>
      <div className="loading">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i}></span>
        ))}
      </div>
    </div>
  );
}

export default Loading;