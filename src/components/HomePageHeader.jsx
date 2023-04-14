import { BsFillChatRightTextFill } from "react-icons/bs";
import { HiDotsVertical } from "react-icons/hi";
import useUsers from "../store/useUsers";
import useUser from "../store/useUser";
import { useState } from "react";
import useSelectedUser from "../store/useSelectedUser";
import HomePageHeaderPopup from "./HomePageHeaderPopup";

export default function HomePageHeader() {
  // get the current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  // set is profile show
  const setIsProfileShow = useUsers((state) => state.setIsProfileShow);

  // is popup show
  const [isPopupShow, setIsPopupShow] = useState(false);

  // set is popup show
  const setIsHeaderPopupShow = useSelectedUser(
    (state) => state.setIsHeaderPopupShow
  );

  return (
    <header>
      <div className="header--container">
        <div className="header--logo" onClick={() => setIsProfileShow(true)}>
          <img
            src={getCurrentUser().photoURL || "/default-avatar.svg"}
            alt="avatar"
          />
        </div>
        <div className="header--icons">
          <BsFillChatRightTextFill />
          <div className="d-f">
            <HiDotsVertical
              onClick={() => setIsPopupShow((prev) => !prev)}
              className={isPopupShow ? "bg--hover" : ""}
            />
          </div>
        </div>
      </div>
            {
              isPopupShow && ( <HomePageHeaderPopup /> )
            }
    </header>
  );
}
