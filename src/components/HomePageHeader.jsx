import { BsFillChatRightTextFill } from "react-icons/bs";
import { HiDotsVertical } from "react-icons/hi";
import useUser from "../store/useUser";

export default function HomePageHeader() {
          // get the current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  return (
    <header>
            <div className="header--container">
              <div className="header--logo">
                <img
                  src={getCurrentUser().photoURL || "/default-avatar.svg"}
                  alt="avatar"
                />
              </div>
              <div className="header--icons">
                <BsFillChatRightTextFill />
                <HiDotsVertical />
              </div>
            </div>
          </header>
  )
}