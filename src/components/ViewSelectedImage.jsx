import { MdClose } from "react-icons/md";
import Send from "./svg/Send";
import "./styles/ViewSelectedImage.css";
import { useRef, useState } from "react";
import { FaKeyboard } from "react-icons/fa";
import SmileFace from "./svg/SmileFace";

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
  
  // handel show Emoji picker component
  const handelShowEmojiPicker = () => {
    setIsEmojiPickerShow((prev) => !prev);
    if (isEmojiPikerShow) {
      messageInputRef.current.focus();
    } else {
      messageInputRef.current.blur();
    }
  };
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
      
      <footer className={`footer ${isEmojiPikerShow ? "show-emoji" : ""}`}>
        <form onSubmit={handelSendMessage}>
          <div className="input">
          <div className="icon d-f" onClick={handelShowEmojiPicker}>
          {isEmojiPikerShow ? <FaKeyboard /> : <SmileFace />}
          </div>
            <input
              type="text"
              placeholder="إضافة شرح..."
              onFocus={() => setIsEmojiPickerShow(false)}
              ref={messageInputRef}
              onChange={handelMessage}
              onKeyDown={(e) => {
                e.key === "Enter" && console.log("send message");
              }}
              value={message}
              className={isArabic ? "f-ar" : "f-en dr-en"}
            />
          </div>
          <div className="btns">
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
