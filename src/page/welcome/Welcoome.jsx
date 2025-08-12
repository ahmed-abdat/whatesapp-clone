import whatsappWelcomeImg from "../../assets/img/whatsapp-welcome.png";
import { useNavigate } from "react-router-dom";

export default function ({ }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-screen w-full font-arabic">
      <div className="flex-shrink-0">
        <img 
          src={whatsappWelcomeImg} 
          alt="whatsapp welcome img" 
          className="min-h-[35vh] h-[40vh] max-h-[55vh] max-w-full object-cover"
        />
      </div>
      <div className="flex flex-col items-center gap-4 mb-5 px-4">
        <h3 className="text-2xl text-gray-800 dark:text-white font-medium font-arabic">
          أهلا بك في واتساب
        </h3>
        <p className="font-tajawal text-center max-w-[85vw] text-gray-600 dark:text-gray-400 text-base font-normal rtl">
          اقرأ
          <a 
            href="https://www.whatsapp.com/legal/privacy-policy?lg=ar&lc=MR&eea=0" 
            target="_blank"
            className="no-underline text-blue-600 px-1"
          >
            سياسة الخصوصية
          </a>
          انقر على <span className="font-medium">"الموافقة و المتابعة"</span> لقبول 
          <a 
            href="https://www.whatsapp.com/legal/terms-of-service?lg=ar&lc=MR&eea=0" 
            target="_blank"
            className="no-underline text-blue-600 px-1"
          > شروط الخدمة</a>
        </p>
      </div>
      <div>
        <button 
          onClick={()=> navigate('/signUp')}
          className="font-vazir cursor-pointer border-none rounded-sm px-10 py-2 bg-whatsapp text-gray-100 text-sm transition-all duration-300 ease-in-out hover:bg-whatsapp-dark"
        >
          الموافقة و المتابعة
        </button>
      </div>
    </div>
  );
}
