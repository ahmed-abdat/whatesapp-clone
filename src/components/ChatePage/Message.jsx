import moment from "moment";
import React from "react";
import useUser from "../../store/useUser";
import Check from "../svg/Check";
import MessageReceiver from "../svg/MessageReceiver";
import MessageSender from "../svg/MessageSender";
import { LazyLoadImage } from "react-lazy-load-image-component";
import AudioPlayer from "./AudioPlayer";
import defaultAvatar from '../../assets/img/default-avatar.svg'
import useSelectedUser from "../../store/useSelectedUser";
import { Card, CardContent } from "../ui/card";
import { cn } from "../../lib/utils";

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
    const urlReg =
      /https:\/\/cdn\.jsdelivr\.net\/npm\/emoji-datasource-apple\/img\/apple\/64\/[^/]+\.png/gim;
    const newArray = [];

    for (const word of words) {
      const urlMatch = word.match(urlReg);

      if (urlMatch) {
        newArray.push(
          <img src={urlMatch[0]} alt={urlMatch[0]} className="emoji" />
        );
      } else if (
        newArray.length > 0 &&
        typeof newArray[newArray.length - 1] === "string"
      ) {
        newArray[newArray.length - 1] += " " + word;
      } else {
        newArray.push(word);
      }
    }

    return newArray;
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
  const getSelectedUser = useSelectedUser(state => state.getSelectedUser)

  const isCurrentUserSender = isSender === getCurrentUser().uid;

  const avatar = isCurrentUserSender ? getCurrentUser().photoURL : getSelectedUser().photoURL ? getSelectedUser().photoURL : defaultAvatar;


  return (
    <div className={cn(
      "flex",
      isCurrentUserSender ? "justify-end" : "justify-start",
      "mb-3 px-4"
    )}>
      <Card className={cn(
        "max-w-xs md:max-w-md relative",
        isCurrentUserSender 
          ? "bg-whatsapp-primary text-white ml-auto" 
          : "bg-white text-gray-900",
        media && !content && "p-1"
      )}>
        <CardContent className="p-3">
          {/* image message */}
          {media ? (
            media?.name ? (
              <div className="flex justify-center">
                <LazyLoadImage
                  alt="image"
                  height={"322px"}
                  src={URL.createObjectURL(media)}
                  onClick={onclike}
                  width={"322px"}
                  effect="blur"
                  className="rounded-lg cursor-pointer object-cover"
                />
              </div>
            ) : media?.type?.includes("image") ? (
              <div className="flex justify-center">
                <LazyLoadImage
                  onClick={onclike}
                  alt="image"
                  height={"322px"}
                  src={media.src}
                  width={"100%"}
                  effect="blur"
                  className="rounded-lg cursor-pointer object-cover max-w-full"
                />
              </div>
            ) : null
          ) : null}

          {/* audio message */}
          {media && media?.fullPath?.includes("audio") ? (
            <div className="voice-message">
              <AudioPlayer audioSrc={media.src} isPreview={false} avatar={avatar}/>
            </div>
          ) : 
            ((media && media?.type?.includes("audio")) && (
              <div className="voice-message">
                <AudioPlayer audioSrc={URL.createObjectURL(media)} isPreview={false} avatar={avatar}/>
              </div>
            )
          )}

          {/* Message tail */}
          <div className={cn(
            "absolute top-0 w-3 h-3",
            isCurrentUserSender 
              ? "right-[-6px] transform rotate-45 bg-whatsapp-primary" 
              : "left-[-6px] transform rotate-45 bg-white"
          )}>
            {isCurrentUserSender ? <MessageSender /> : <MessageReceiver />}
          </div>
          
          {/* Message content */}
          {content && (
            <div className="message-content">
              <p className={cn(
                "leading-relaxed",
                isArabic ? "text-right font-arabic" : "text-left"
              )}>
                {newContent.map((content, index) => (
                  <React.Fragment key={index}>{content} </React.Fragment>
                ))}
              </p>
            </div>
          )}
          {/* Message timestamp and status */}
          <div className={cn(
            "flex items-center justify-end mt-2 gap-1",
            (media?.type?.includes("image") || media?.name) && !content && "absolute bottom-2 right-2 bg-black bg-opacity-50 rounded px-2 py-1",
            media?.type?.includes("audio") && "mt-1"
          )}>
            <span className={cn(
              "text-xs",
              isCurrentUserSender 
                ? ((media?.type?.includes("image") || media?.name) && !content ? "text-white" : "text-whatsapp-primary-100")
                : "text-gray-500"
            )}>
              {`${HourAndMinitFormat} ${AmPm}`}
            </span>
            {isCurrentUserSender && (
              <div className={cn(
                "flex items-center",
                isRead ? "text-blue-400" : "text-gray-400"
              )}>
                <Check />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
