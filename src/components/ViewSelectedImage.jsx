import { MdClose } from "react-icons/md";
import { BiImageAdd } from "react-icons/bi";
import Send from "./svg/Send";
import "./styles/ViewSelectedImage.css";
import { useState } from "react";

export default function ViewSelectedImage({ file, setFile, displayName }) {
  // state
  const [message, setMessage] = useState("");
  const [isArabic, setIsArabic] = useState(true);

  // handel message
  const handelMessage = (e) => {
    const { value } = e.target;
    const isArabic = /[\u0600-\u06FF]/.test(value);
    isArabic ? setIsArabic(true) : setIsArabic(false);

    if (value.length === 0) {
      setIsArabic(true);
    }

    setMessage(value);
  };

  return (
    <div className="viewImage--container">
      <header>
        <div className="icon" onClick={() => setFile(null)}>
          <MdClose />
        </div>
      </header>
      <main className="d-f">
        <div className="img d-f">
          <img src={URL.createObjectURL(file)} alt="image" />
        </div>
      </main>
      <footer>
        <form>
          <div className="input">
            <BiImageAdd />
            <input
              type="text"
              placeholder="إضافة شرح..."
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
      </footer>
    </div>
  );
}
