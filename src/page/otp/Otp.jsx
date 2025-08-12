import { useEffect, useRef, useState } from "react";
// import "./Opt.css"; // Removed - using Tailwind CSS only
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import useSignUp from "../../store/useSignUp";
import useUser from "../../store/useUser";
import { doc, getDoc, setDoc , getFirestore } from "firebase/firestore/lite";
import { app } from "../../config/firebase";
import {
  InputOTP,
  InputOTPGroup, 
  InputOTPSlot,
} from "../../components/ui/input-otp";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { BsWhatsapp } from "react-icons/bs";
import { MdEdit, MdSms } from "react-icons/md";

export default function Otp({}) {
  const confirmationResult = useSignUp((state) => state.confirmationResult);
  const setCurrentUser = useUser((state) => state.setCurrentUser);

  const getPhone = useSignUp((state) => state.getPhone);

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // set phoneUserVerified
  const setIsPhoneUserVerified = useUser(
    (state) => state.setIsPhoneUserVerified
  );

  // clear OTP
  const clearOtp = () => {
    setOtp("");
  };

  // firestore for lite firebase
  const firestore = getFirestore(app)

  const handelSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      confirmationResult
        .confirm(otp)
        .then((result) => {
          getUserInfo(result.user?.uid , result.user);
          setIsPhoneUserVerified(true);
          toast.success("تمت المصادقة");
          setTimeout(() => {
            navigate("/userInfo");
            setIsLoading(false);
          }, 2000);
        })
        .catch((error) => {
          setIsLoading(false);
          if (error.code === "auth/code-expired") {
            toast.error("لقد إنتهت صلاحية رمز التأكيد");
            return;
          }
          toast.error("! رمز تأكيد ليس صحيح");
          // console.error(error);
        });
    } catch (error) {
      setIsLoading(false);
      toast.error("حدث خطأ ما رجاءا قم بإدخال الرقم و المحاولة مرة أخرى");
      console.log(error.message);
    }
  };

  // get the current user info
  const getUserInfo = async (id , usere) => {
    const userRef = doc(firestore, "users", id);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      setUser(docSnap.data());
      setCurrentUser(docSnap.data());
    } else {
      console.log("No such document!");
      setUser(usere);
      setCurrentUser(usere);
    }
  };

  // set doc to the firebase
  const setUser = async (user) => {
    const userRef = doc(firestore, "users", user?.uid);
    await setDoc(userRef, {
      uid: user?.uid,
      phoneNumber: getPhone(),
      displayName: user.displayName,
      photoURL: user.photoURL,
      lastSeen: new Date().getTime(),
      photoPath: null,
      isOnline: true,
      userStatus: "جديد في واتساب",
      lastMessage: "",
    });
  };

  let count = 0;
  // submit otp
  useEffect(() => {
    if (confirmationResult.hasOwnProperty("verificationId") && count === 0) {
      count++;
      toast.success(`تم إرسال رمز التحقق إلى الرقم  ${getPhone()}`);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp-primary/10 to-whatsapp-secondary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl">
        <CardHeader className="text-center space-y-4">
          {/* WhatsApp Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-whatsapp-primary rounded-full flex items-center justify-center shadow-lg">
              <BsWhatsapp className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <CardTitle className="font-arabic text-2xl font-bold text-gray-900">
            التحقق من رقمك
          </CardTitle>
          
          <CardDescription className="font-arabic text-gray-600 leading-relaxed">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MdSms className="w-4 h-4 text-whatsapp-primary" />
              <span>تم إرسال رمز التحقق إلى الرقم</span>
            </div>
            <div className="font-medium text-whatsapp-primary">
              {getPhone()}
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handelSubmit} className="space-y-6">
            {/* Modern OTP Input */}
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
                disabled={isLoading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={clearOtp}
                disabled={!otp || isLoading}
                className="font-arabic"
              >
                مسح
              </Button>
              <Button
                type="submit"
                disabled={otp.length !== 6 || isLoading}
                className="bg-whatsapp-primary hover:bg-whatsapp-primary-dark font-arabic"
              >
                {isLoading ? "جاري التحقق..." : "تأكيد"}
              </Button>
            </div>
          </form>

          {/* Change number option */}
          <div className="text-center">
            <p className="text-sm text-gray-600 font-arabic">
              ليس رقمي؟{" "}
              <Button asChild variant="link" className="p-0 h-auto font-arabic text-whatsapp-primary">
                <Link to="/signup">
                  <MdEdit className="w-4 h-4 mr-1" />
                  تغيير رقمك
                </Link>
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
