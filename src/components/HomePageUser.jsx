import moment from 'moment';
import 'moment/locale/ar'; 
import 'moment/locale/ar-sa';
import { useState, useEffect } from 'react';
import useSelectedUser from '../store/useSelectedUser';
import defaultAvatar from '../assets/img/default-avatar.svg'

export default function HomePageUser({ displayName, photoURL, isOnline, lastSeen }) {
  moment.locale('ar_SA');
  const [timeAgo, setTimeAgo] = useState(moment(lastSeen).locale('ar').fromNow("DD/MM/YYYY, hh:mm A"));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(moment(lastSeen).locale('ar').fromNow("DD/MM/YYYY, hh:mm A"));
    }, 10000); 

    return () => clearInterval(interval);
  }, [lastSeen]);

  // get the selected user
  const setSelectedUser = useSelectedUser((state) => state.setSelectedUser);
  // set is selected user
  const setIsSelectedUser = useSelectedUser((state) => state.setIsSelectedUser);

  const handelSelectedUser = () => {
    setSelectedUser({ displayName, photoURL, isOnline, lastSeen })
    setIsSelectedUser(true);
  };

  // is arabic Name 
  const isArabic = (str) => {
    const arabic = /[\u0600-\u06FF]/;
    return arabic.test(str);
  };


  return (
    <div className="user--profile" onClick={handelSelectedUser}>
      <div className="user--profile--img">
        <img src={photoURL || defaultAvatar} alt="user profile" />
      </div>
      <div className="user--profile--info">
        <div className="info">
            <h3 className={isArabic(displayName) ? 'f-ar dr-ar' : 'f-en dr-en'}>{displayName || 'Ahmed Abdat'}</h3>
            <p className='dr-ar f-ar'>{isOnline ? 'متصل الآن' : 'آخر ظهور قبل ' + timeAgo}</p>
        </div>
        <div className="last-message">
            <p>أهلا بك في واتساب</p>
        </div>
      </div>
    </div>
  );
}
