import { HiLockClosed } from "react-icons/hi";
import WhatsppwebImg from '../assets/img/whatsapp-web.png'

export default function ChatPage() {
  return (
    <div className="chat-page">
      <img src={WhatsppwebImg} alt="" />
      <h3>واتساب ويب</h3>
      <div className="text">
        <p>
          يمكنك الآن إرسال الرسائل وتلقّيها دون أن يبقى هاتفك متصلاً بالإنترنت.
        </p>
        <p>
          استخدم واتساب على ما يصل إلى 4 أجهزة مرتبطة وهاتف واحد في وقت واحد.
        </p>
      </div>
      <div className="info d-f">
        <HiLockClosed />
        <p> مشفرة تمامًا بين الطرفين </p>
      </div>
    </div>
  );
}
