import "./styles/userProfile.css";
import { BiArrowBack } from "react-icons/bi";
import { CgProfile } from "react-icons/cg";
import { RiInformationLine } from "react-icons/ri";
import { MdOutlineLocalPhone } from "react-icons/md";
import { HiPencil } from "react-icons/hi";
import useUsers from "../store/useUsers";
import useUser from "../store/useUser";
import { BsCamera } from "react-icons/bs";

export default function UserProfile() {
  // get current user
  const getCurrentUser = useUser((state) => state.getCurrentUser);
  const user = getCurrentUser();

  // set is profile show 
  const setIsProfileShow = useUsers((state) => state.setIsProfileShow);

  // is profile show
  const isProfileShow = useUsers((state) => state.isProfileShow);

  // is name Arabic
  const isArabic = /[\u0600-\u06FF]/.test(user.displayName);


  // handle back
  const handelBack = () => {
    setIsProfileShow(false)
  }
  return (
    <div className={`user-profile ${isProfileShow ? 'profile-show' : ''}`}>
      <header className="user-profile--header">
        <div className="header--text">
          <BiArrowBack onClick={handelBack}/>
          <h4>الملف الشخصي</h4>
        </div>
      </header>
      {/* profile imagae */}
      <div className="profile--image d-f">
        <div className="img">
        <img
          src={user.photoURL ? user.photoURL : "default-avatar.svg"}
          alt="avatar"
        />
        <div className="icon d-f">
        <BsCamera />
        </div>
        </div>
      </div>
      {/* profile info */}
      <div className="profile--info">
         {/* profile name */}
      <div className="profile--name">
        <div className="icon">
          <CgProfile />
        </div>
        <div className="display">
          <h3 >الإسم</h3>
          <h4 className={isArabic ? 'f-ar' : 'f-en'}>{user.displayName}</h4>
        </div>
        <div className="edit">
          <HiPencil />
        </div>
        <div></div>
        <p className="info">
          هذا الاسم ليس كلمة مرور ولا رقم تعريف. إنما يكون هذا الاسم ظاهراً
          لجهات اتصالك في واتساب.
        </p>
      </div>
      {/* profile status */}
      <div className="profile--status">
        <div className="icon">
          <RiInformationLine />
        </div>
          <div className="display">
            <h3>الحالة</h3>
            <h4>مالايدرك كله لايترك جله</h4>
          </div>
        <div className="edit">
          <HiPencil />
        </div>
      </div>
      {/* profile phone number */}
      <div className="profile--phone-number">
        <div className="icon">
          <MdOutlineLocalPhone />
        </div>
          <div className="display">
            <h3>رقم الهاتف</h3>
          <p className="info dr-en">+222 37928327</p>
          </div>
        </div>
        </div>
    </div>
  );
}
