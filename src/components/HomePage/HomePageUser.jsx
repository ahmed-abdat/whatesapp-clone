import moment from "moment";
import "moment/locale/ar-sa";
import { useState, useEffect } from "react";
import useSelectedUser from "../../store/useSelectedUser";
import defaultAvatar from "../../assets/img/default-avatar.svg";
import useUsers from "../../store/useUsers";

export default function HomePageUser({
  displayName,
  photoURL,
  isOnline,
  lastSeen,
  uid,
  lastMessage,
}) {
  moment.locale("ar_SA");
  moment.updateLocale("ar_SA", {
    relativeTime: {
      future: "في %s",
      past: "منذ %s",
      s: "ثوان",
      ss: "%d ثانية",
      m: "دقيقة",
      mm: "%d دقائق",
      h: "ساعة",
      hh: "%d ساعات",
      d: "يوم",
      dd: "%d أيام",
      M: "شهر",
      MM: "%d أشهر",
      y: "سنة",
      yy: "%d سنوات",
    },
  });

     

  const lastSeanMessage = moment(lastMessage?.createdAt);
  const HourAndMinitFormat = lastSeanMessage.format("hh:mm");

  const [timeAgo, setTimeAgo] = useState(HourAndMinitFormat);
  
  // track the time ago
  useEffect(() => {
    const lastSeanMessage = moment(lastMessage?.createdAt);
    const HourAndMinitFormate = lastSeanMessage.format("hh:mm");
    const interval = setInterval(() => {
      if(HourAndMinitFormate !== timeAgo) {
        setTimeAgo(HourAndMinitFormate)
        return
      }
    }, 1000);
    
    
    return () => clearInterval(interval);
  }, [lastMessage?.createdAt]);
  

  
  // get the selected user
  const setSelectedUser = useSelectedUser((state) => state.setSelectedUser);
  // set is selected user
  const setIsSelectedUser = useSelectedUser((state) => state.setIsSelectedUser);

  const handelSelectedUser = () => {
    setSelectedUser({ displayName, photoURL, isOnline, lastSeen, uid });
    setIsSelectedUser(true);
  };

  // is arabic Name
  const isArabic = (str) => {
    const arabic = /[\u0600-\u06FF]/;
    return arabic.test(str);
  };

  // content display class
  const contentClass = ()=> {
    const isArabic = /[\u0600-\u06FF]/.test(lastMessage?.content);
    const content = lastMessage?.content;
    const maxLength = 50
    if(isArabic && content?.length > maxLength) {
      return "f-ar dr-ar"
    } else if(isArabic && content?.length < maxLength) {
      return "f-ar"
    } else if(!isArabic && content?.length > maxLength) {
      return "f-en dr-en"
    } else if(!isArabic && content?.length < maxLength) {
      return "f-en"
    }
  }




  return (
    <div className="user--profile" onClick={handelSelectedUser}>
      <div className="user--profile--img">
        <img src={photoURL || defaultAvatar} alt="user profile" />
      </div>
      <div className="user--profile--info">
        <div className="info">
          <h3 className={isArabic(displayName) ? "f-ar dr-ar" : "f-en dr-en"}>
            {displayName || "Ahmed Abdat"}
          </h3>
       {
        lastMessage  &&  <p className="dr-ar f-ar">{`${timeAgo} ${
          lastSeanMessage.format("a") === "am" ? "ص" : "م"
        }`}</p>
       }
        </div>
        <div className="last-message">
         {
          lastMessage &&  <p className={contentClass()}> {lastMessage?.content} </p>
         }
        </div>
      </div>
    </div>
  );
}
