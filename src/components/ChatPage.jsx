import { HiLockClosed } from "react-icons/hi";
import WhatsppwebImg from '../assets/img/whatsapp-web.png'

export default function ChatPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-white relative w-full">
      {/* Green bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-whatsapp-primary"></div>
      
      {/* Main content */}
      <div className="flex flex-col items-center text-center max-w-md px-4 sm:px-6 w-full">
        <img 
          src={WhatsppwebImg} 
          alt="WhatsApp Web" 
          className="w-64 sm:w-80 mb-8 sm:mb-10 max-w-full"
        />
        
        <h3 className="text-3xl font-light text-gray-700 mb-4 font-arabic">
          واتساب ويب
        </h3>
        
        <div className="space-y-4 mb-16">
          <p className="text-sm text-gray-600 leading-relaxed font-arabic">
            يمكنك الآن إرسال الرسائل وتلقّيها دون أن يبقى هاتفك متصلاً بالإنترنت.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed font-arabic">
            استخدم واتساب على ما يصل إلى 4 أجهزة مرتبطة وهاتف واحد في وقت واحد.
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <HiLockClosed className="w-3 h-3" />
          <p className="font-arabic">مشفرة تمامًا بين الطرفين</p>
        </div>
      </div>
    </div>
  );
}
