import moment from "moment";
import React from "react";
import useUser from "../../store/useUser";
import Check from "../svg/Check";
import MessageReceiver from "../svg/MessageReceiver";
import MessageSender from "../svg/MessageSender";
import { LazyLoadImage } from "react-lazy-load-image-component";

export default function Message({
  content,
  isSender,
  createdAt,
  isRead,
  media,
  onclike,
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

  // find the emoji in the message and replace it with the emoji image
  const findEmoji = (message) => {
    const words = message.split(/\s+/);
    const urlReg = /https:\/\/cdn\.jsdelivr\.net\/npm\/emoji-datasource-apple\/img\/apple\/64\/[^/]+\.png/gim;
    const newArray = [];
    
    for (const word of words) {
      const urlMatch = word.match(urlReg);
  
      if (urlMatch) {
        newArray.push(<img src={urlMatch[0]} alt={urlMatch[0]} className="emoji" />);
      } else if (newArray.length > 0 && typeof newArray[newArray.length - 1] === 'string') {
        newArray[newArray.length - 1] += ' ' + word;
      } else {
        newArray.push(word);
      }
    }
    
    return newArray
  };
  

  // log the findEmoji function only if the content has emoji
  const newContent = findEmoji(content);

  const createdAtTime = createdAt?.seconds
    ? createdAt?.seconds * 1000
    : createdAt;

  const lastSeenMoment = moment(createdAtTime);
  const HourAndMinitFormat = lastSeenMoment.format("hh:mm");
  const AmPm = lastSeenMoment.format("a") === "am" ? "ص" : "م";

  // is message content Arabic
  const isArabic = /[\u0600-\u06FF]/.test(content);

  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);

  const isCurrentUserSender = isSender === getCurrentUser().uid;

  return (
    <div className={`message ${isCurrentUserSender ? "sender" : "receiver"} ${media && !content ? 'sm-p' : ''}`}>
      {media ? (
        media?.name ? (
          <div className="img d-f">
            <LazyLoadImage
              alt="image"
              height={"322.667px"}
              src={URL.createObjectURL(media)}
              onClick={onclike}
              width={"322px"}
              effect="blur"
            />
          </div>
        ) : (
          <div className="img d-f">
            <LazyLoadImage
              onClick={onclike}
              alt="image"
              height={"322.667px"}
              src={media}
              width={"100%"}
              effect="blur"
            />
          </div>
        )
      ) : null}
      <div className={`after ${isCurrentUserSender ? "send" : "receive"}`}>
        {isCurrentUserSender ? <MessageSender /> : <MessageReceiver />}
      </div>
      {
        content && (
          <div className="content">
        <p className={`${isArabic ? "f-ar dr-ar" : "f-en dr-en"}`}>
          {newContent.map((content, index) => (
            <React.Fragment key={index}>{content} </React.Fragment>
          ))}
        </p>
      </div>
        )
      }
      <div className={`time ${media && !content ? "onlyImage" : ""}`}>
        <p>{`${HourAndMinitFormat} ${AmPm}`}</p>
        {isCurrentUserSender && (
          <div className={`${isRead ? "check" : "uncheck"} d-f`}>
            <Check />
          </div>
        )}
      </div>
      {media && !content && (
        <div className="shadow">

        </div>
      )}
    </div>
  );
}
