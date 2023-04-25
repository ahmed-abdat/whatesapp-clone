import { MdClose } from "react-icons/md";
import { BiImageAdd } from "react-icons/bi";
import Send from "./svg/Send";
import "./styles/ViewSelectedImage.css";


export default function ViewSelectedImage({ file, setFile, displayName , handelMessage , isArabic , handelSendMessage}) {


 

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
        <form onSubmit={handelSendMessage}>
          <div className="input">
            <BiImageAdd />
            <input
              type="text"
              placeholder="إضافة شرح..."
              onChange={handelMessage}
              onKeyDown={(e) => {
                e.key === "Enter" && console.log("send message");
              }}
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
