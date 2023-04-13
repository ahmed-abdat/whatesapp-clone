import { BsFillChatRightTextFill } from "react-icons/bs";
import { HiDotsVertical } from "react-icons/hi";
import useUsers from "../store/useUsers";
import useUser from "../store/useUser";

export default function HomePageHeader() {
          // get the current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  // set is profile show
  const setIsProfileShow = useUsers((state) => state.setIsProfileShow);



  // handle profile show
  const handeProfileShow = () => {
    setIsProfileShow(true)
  }
  return (
    <header>
            <div className="header--container">
              <div className="header--logo" onClick={handeProfileShow}>
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