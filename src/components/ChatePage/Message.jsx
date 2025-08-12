import moment from "moment";
import React from "react";
import useUser from "../../store/useUser";
import Check from "../svg/Check";
import { LazyLoadImage } from "react-lazy-load-image-component";
import AudioPlayer from "./AudioPlayer";
import defaultAvatar from '../../assets/img/default-avatar.svg'
import useSelectedUser from "../../store/useSelectedUser";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
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


  // For image-only messages, return different layout (WhatsApp style)
  if ((media?.type?.includes("image") || media?.name) && !content) {
    return (
      <div className={cn(
        "flex w-full mb-2 px-3 sm:px-6 lg:px-8",
        isCurrentUserSender ? "justify-end" : "justify-start"
      )}>
        <div className="relative group">
          {/* Image with minimal styling */}
          <div className="relative overflow-hidden rounded-md">
            <LazyLoadImage
              alt="Shared image"
              src={media?.name ? URL.createObjectURL(media) : media.src}
              onClick={onclike}
              effect="opacity"
              className="h-auto w-full cursor-pointer object-cover transition-all duration-200 hover:opacity-95"
              placeholder={<Skeleton className="h-48 w-full rounded-md" />}
              style={{
                maxHeight: '350px',
                minHeight: '120px',
                maxWidth: '280px',
                minWidth: '180px'
              }}
            />
            {/* Simple overlay timestamp */}
            <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/50 px-2 py-1 backdrop-blur-sm">
              <span className="text-xs font-medium text-white">
                {`${HourAndMinitFormat} ${AmPm}`}
              </span>
              {isCurrentUserSender && (
                <div className={cn(
                  "flex items-center ml-0.5",
                  isRead ? "text-blue-300" : "text-white/70"
                )}>
                  <Check />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular text message or image with caption
  return (
    <div className={cn(
      "flex w-full gap-2 mb-3 px-3 sm:px-6 lg:px-8",
      isCurrentUserSender ? "justify-end" : "justify-start",
      isArabic ? "dir-rtl" : "dir-ltr"
    )}>
      <Card className={cn(
        "relative border-0 shadow-sm transition-all duration-200",
        "max-w-[75%] sm:max-w-[65%] md:max-w-[450px] min-w-[120px] py-2",
        isCurrentUserSender 
          ? "bg-whatsapp-message-out text-gray-900 rounded-tr-sm"
          : "bg-whatsapp-message-in text-gray-900 rounded-tl-sm"
      )}>
        <CardContent className="px-3 py-1">
          {/* Image with caption (has both media and content) */}
          {media && content && (media?.type?.includes("image") || media?.name) && (
            <div className="relative mb-2 overflow-hidden rounded-lg bg-muted/20">
              <LazyLoadImage
                alt="Shared image"
                src={media?.name ? URL.createObjectURL(media) : media.src}
                onClick={onclike}
                effect="opacity"
                className="h-auto w-full cursor-pointer object-cover transition-opacity duration-200 hover:opacity-95"
                placeholder={<Skeleton className="h-40 w-full" />}
                style={{
                  maxHeight: '250px',
                  minHeight: '120px'
                }}
              />
            </div>
          )}

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

          {/* Message tail SVG - only for text messages */}
          <div className={cn(
            "absolute top-0",
            isCurrentUserSender 
              ? "right-[-8px] text-whatsapp-message-out" 
              : "left-[-8px] text-whatsapp-message-in"
          )}>
            {isCurrentUserSender ? (
              <svg viewBox="0 0 8 13" width="8" height="13" className="">
                <path opacity=".13" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"/>
                <path fill="currentColor" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 8 13" width="8" height="13" className="">
                <path opacity=".13" fill="#0000000" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"/>
                <path fill="currentColor" d="M1.533 2.568L8 11.193V0H2.812C1.042 0 .474 1.156 1.533 2.568z"/>
              </svg>
            )}
          </div>
          
          {/* Message content */}
          {content && (
            <div className="message-content">
              <p className={cn(
                "leading-relaxed text-[15px] break-words",
                isArabic ? "text-right font-arabic direction-rtl" : "text-left direction-ltr"
              )}>
                {newContent.map((content, index) => (
                  <React.Fragment key={index}>{content} </React.Fragment>
                ))}
              </p>
            </div>
          )}
          {/* Message timestamp and status */}
          <div className={cn(
            "flex items-center justify-end mt-1 gap-0.5",
            (media?.type?.includes("image") || media?.name) && !content && "absolute bottom-1 right-2 bg-black/40 backdrop-blur-sm rounded px-1.5 py-0.5",
            media?.type?.includes("audio") && "mt-1"
          )}>
            <span className={cn(
              "text-[11px]",
              isCurrentUserSender 
                ? ((media?.type?.includes("image") || media?.name) && !content ? "text-white" : "text-gray-600")
                : "text-gray-500"
            )}>
              {`${HourAndMinitFormat} ${AmPm}`}
            </span>
            {isCurrentUserSender && (
              <div className={cn(
                "flex items-center ml-0.5",
                isRead ? "text-blue-500" : "text-gray-500"
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
