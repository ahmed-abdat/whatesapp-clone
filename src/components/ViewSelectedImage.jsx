import { MdClose } from "react-icons/md";
import Send from "./svg/Send";
import "./styles/ViewSelectedImage.css";
import { useRef, useState } from "react";
import { FaKeyboard } from "react-icons/fa";
import SmileFace from "./svg/SmileFace";
import { useEffect } from "react";

export default function ViewSelectedImage({
  file,
  setFile,
  displayName,
  handelMessage,
  isArabic,
  handelSendMessage,
  message,
  EmojyPiker,
}) {

  const [isEmojiPikerShow, setIsEmojiPickerShow] = useState(false);
  const messageInputRef = useRef(null);
  // is Mobile
  const [isMobile, setIsMobile] = useState(false);

  const [isInputFocus , setIsInputFocus] = useState(false)
  
  // handel show Emoji picker component
  const handelShowEmojiPicker = () => {
    setIsEmojiPickerShow((prev) => !prev);
    if (isEmojiPikerShow) {
      messageInputRef.current.focus();
      setIsInputFocus(true)
    } else {
      messageInputRef.current.blur();
      setIsInputFocus(true)
    }
  };

  // handel input focus
  const handelInputFocus = () => {
    setIsEmojiPickerShow(false)
    setIsInputFocus(true)
  }

  // handel input blur
  const handelInputBlur = () => {
    setIsInputFocus(false)
    setIsEmojiPickerShow(false)
  }


    useEffect(() => {
      if (window.innerWidth < 768) {
        setIsMobile(true);
      }else {
        setIsMobile(false);
      }
    }, []);



  return (
    <div className="viewImage--container">
      <header>
        <div className="icon" onClick={() => setFile(null)}>
          <MdClose />
        </div>
      </header>
      <main >
        <div className="img d-f">
          <img src={URL.createObjectURL(file)} alt="image" />
        </div>
      </main>
      
      <footer className={`footer ${isEmojiPikerShow || (isMobile && isInputFocus) ? "show-emoji" : ""}`}>
        <form onSubmit={handelSendMessage}>
          <div className="input">
          <div className="icon d-f" onClick={handelShowEmojiPicker}>
          {isEmojiPikerShow ? <FaKeyboard /> : <SmileFace />}
          </div>
            <input
              type="text"
              placeholder="إضافة شرح..."
              onFocus={handelInputFocus}
              onBlur={handelInputBlur}
              ref={messageInputRef}
              onChange={handelMessage}
              onKeyDown={(e) => {
                e.key === "Enter" && console.log("send message");
              }}
              value={message}
              className={isArabic ? "f-ar" : "f-en dr-en"}
            />
          </div>
          <div className={`btns ${isInputFocus ? 'btns-bg' : ''}`}>
            <p className="f-en dr-en">{displayName}</p>
            <button>
              <Send />
            </button>
          </div>
        </form>
        {
        isEmojiPikerShow && (
          EmojyPiker
        )
      }
      </footer>
    </div>
  );
}
