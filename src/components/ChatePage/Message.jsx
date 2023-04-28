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

    // Loop through words and find emoji and replace it with the emoji image component
    const newWords = words.map((word) => {
      const emojiReg =
        /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|[\u200d\u2600-\u26ff]\ufe0f?|[\u270a-\u27bf]\ufe0f?)/gim;
      const match = word.match(emojiReg);
      if (match) {
        const emojiURL = `https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${match[0]
          .codePointAt(0)
          .toString(16)}.png`;
        return <img src={emojiURL} alt={match[0]} className="emoji" />;
      }
      return word;
    });

    return newWords;
  };

  // log the findEmoji function only if the content has emoji
  const emojiReg = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|[\u200d\u2600-\u26ff]\ufe0f?|[\u270a-\u27bf]\ufe0f?)/gim;
  const hasEmoji = emojiReg.test(content);
  let newContent = content;
  if (hasEmoji) {
    newContent = findEmoji(content);
  }



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
    <div className={`message ${isCurrentUserSender ? "sender" : "receiver"}`}>
      {media ? (
        media?.name ? (
          <div className="img d-f">
            <LazyLoadImage
              alt="image"
              height={"322.667px"}
              src={URL.createObjectURL(media)}
              onClick={onclike}
              width={"320px"}
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
              width={"320px"}
              effect="blur"
            />
          </div>
        )
      ) : null}
      <div className={`after ${isCurrentUserSender ? "send" : "receive"}`}>
        {isCurrentUserSender ? <MessageSender /> : <MessageReceiver />}
      </div>
      <div className="content">
        <p className={`${isArabic ? "f-ar dr-ar" : "f-en dr-en"}`}>{
          hasEmoji ? newContent.map((content, index) => (
            <React.Fragment key={index}>{content} </React.Fragment>
          )) : content
        }</p>
      </div>
      <div className={`time ${media && !content ? "onlyImage" : ""}`}>
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
