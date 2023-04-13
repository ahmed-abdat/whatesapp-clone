import { BsFillChatRightTextFill } from "react-icons/bs";
import { HiDotsVertical } from "react-icons/hi";
import useUsers from "../store/useUsers";
import useUser from "../store/useUser";
import { useState } from "react";

export default function HomePageHeader() {
          // get the current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  // set is profile show
  const setIsProfileShow = useUsers((state) => state.setIsProfileShow);

  // is popup show 
  const [isPopupShow , setIsPopupShow] = useState(false)

  // handel popup
  const handelPopup = () => {
    setIsPopupShow(true)
    
  };

 
  return (
    <header>
            <div className="header--container">
              <div className="header--logo" onClick={()=> setIsProfileShow(true)}>
                <img
                  src={getCurrentUser().photoURL || "/default-avatar.svg"}
                  alt="avatar"
                />
              </div>
              <div className="header--icons">
                <BsFillChatRightTextFill  />
                <HiDotsVertical onClick={handelPopup} />
              </div>
            </div>
          </header>
  )
}