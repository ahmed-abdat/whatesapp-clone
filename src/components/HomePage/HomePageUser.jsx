import moment from "moment";
import "moment/locale/ar-sa";
import { useState, useEffect } from "react";
import useSelectedUser from "../../store/useSelectedUser";
import defaultAvatar from "../../assets/img/default-avatar.svg";

export default function HomePageUser({
  displayName,
  photoURL,
  isOnline,
  lastSeen,
  uid,
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
  const now = moment();
  const lastSeenMoment = moment(lastSeen);

  const HourAndMinitFormat = lastSeenMoment.format("hh:mm");
  const dateFormat = lastSeenMoment.format("DD/MM/YYYY");

  // function to check if the last seen is today or yesterday
  const currentDate = () => {
    if (lastSeenMoment.isSame(now, "day")) {
      return ` آخر ظهور اليوم عند الساعة ${HourAndMinitFormat} ${
        lastSeenMoment.format("a") === "am" ? "ص" : "م"
      }`;
    } else if (lastSeenMoment.isSame(now.clone().subtract(1, "day"), "day")) {
      return `آخر ظهور أمس عند الساعة ${HourAndMinitFormat}`;
    } else {
      return `آخر ظهور بتاريخ ${dateFormat}`;
    }
  };

  const [timeAgo, setTimeAgo] = useState(currentDate());

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = currentDate();
      setTimeAgo(currentTime);
    }, 10000);

    return () => clearInterval(interval);
  }, [lastSeen]);

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
          <p className="dr-ar f-ar">{isOnline ? "متصل الآن" : timeAgo}</p>
        </div>
        <div className="last-message">
          <p>أهلا بك في واتساب</p>
        </div>
      </div>
    </div>
  );
}
