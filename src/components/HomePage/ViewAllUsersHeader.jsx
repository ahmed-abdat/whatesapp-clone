import { BiArrowBack } from "react-icons/bi";
import '../styles/ViewAllUserHeader.css'
import { HiDotsVertical } from "react-icons/hi";
export default function ViewAllUsersHeader({setIsAllUsersShow}) {
  return (
    <header className="alluser--header">
      <div className="alluser--header-text">
        <BiArrowBack  className="r-180" onClick={()=> setIsAllUsersShow(false)} />
        <div className="head">
        <h4>الملف الشخصي</h4>
        <p> <span>210</span> جهة إتصال </p>
        </div>
      </div>
      <div className="header--icon d-f">
       <HiDotsVertical />
      </div>
    </header>
  );
}
