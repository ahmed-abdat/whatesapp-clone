import { BsWhatsapp } from "react-icons/bs";
import { HiLockClosed } from "react-icons/hi";
import { Card } from "./ui/card";
import { cn } from "../lib/utils";

function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-primary/20 to-whatsapp-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm mx-auto p-8 text-center shadow-2xl bg-white/95 backdrop-blur">
        {/* WhatsApp Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-whatsapp-primary rounded-full flex items-center justify-center shadow-lg">
              <BsWhatsapp className="w-10 h-10 text-white" />
            </div>
            {/* Pulse animation ring */}
            <div className="absolute -inset-2 rounded-full border-2 border-whatsapp-primary opacity-20 animate-ping" />
          </div>
        </div>

        {/* App Name */}
        <h3 className="text-2xl font-bold text-gray-900 mb-4">WhatsApp</h3>

        {/* Security Message */}
        <div className="flex items-center justify-center gap-2 text-gray-600 mb-8">
          <HiLockClosed className="w-4 h-4" />
          <p className="text-sm font-arabic">رسائل مشفرة من الطرفين</p>
        </div>

        {/* Modern Loading Animation */}
        <div className="flex justify-center space-x-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-3 h-3 bg-whatsapp-primary rounded-full animate-bounce",
                i === 1 && "animation-delay-150",
                i === 2 && "animation-delay-300"
              )}
              style={{
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </div>

        {/* Loading Text */}
        <p className="text-xs text-gray-500 mt-4 font-arabic">جاري التحميل...</p>
      </Card>
    </div>
  );
}

export default Loading;