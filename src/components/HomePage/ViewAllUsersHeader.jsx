import { BiArrowBack } from "react-icons/bi";
import '../styles/ViewAllUserHeader.css'
import { HiDotsVertical } from "react-icons/hi";
export default function ViewAllUsersHeader({setIsAllUsersShow , usersLength}) {
  return (
    <header className="alluser--header">
      <div className="alluser--header-text">
        <BiArrowBack  className="r-180" onClick={()=> setIsAllUsersShow(false)} />
        <div className="head">
        <h4>الملف الشخصي</h4>
        <p> <span>{usersLength}</span> جهة إتصال </p>
        </div>
      </div>
    </header>
  );
}
