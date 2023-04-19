import moment from "moment";
import useUser from "../../store/useUser";
import Check from "../svg/Check";
import MessageReceiver from "../svg/MessageReceiver";
import MessageSender from "../svg/MessageSender";

export default function Message({ content, isSender, createdAt, isRead }) {
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
  const lastSeenMoment = moment(createdAt);
  const HourAndMinitFormat = lastSeenMoment.format("hh:mm");
  const AmPm = lastSeenMoment.format("a") === "am" ? "ص" : "م";

  // is message content Arabic
  const isArabic = /[\u0600-\u06FF]/.test(content);

  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);

  const isCurrentUserSender = isSender === getCurrentUser().uid;



  return (
    <div className={`message ${isCurrentUserSender ? "sender" : "receiver"}`}>
      <div className={`after ${isCurrentUserSender ? "send" : "receive"}`}>
        {isCurrentUserSender ? <MessageSender /> : <MessageReceiver />}
      </div>
      <div className="content">
        <p className={`${isArabic ? "f-ar dr-ar" : "f-en dr-en"}`}>{content}</p>
      </div>
      <div className="time">
        <p>{`${HourAndMinitFormat} ${AmPm}`}</p>
        {isCurrentUserSender && (
          <div className={`${isRead ? "check" : "uncheck"} d-f`}>
            <Check />
          </div>
        )}
      </div>
    </div>
  );
}
