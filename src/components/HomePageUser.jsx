import moment from 'moment';
import 'moment/locale/ar'; 
import { useState, useEffect } from 'react';
import useSelectedUser from '../store/useSelectedUser';
import defaultAvatar from '../assets/img/default-avatar.svg'

export default function HomePageUser({ displayName, photoURL, isOnline, lastSeen }) {
  moment.locale('ar');
  const [timeAgo, setTimeAgo] = useState(moment(lastSeen).fromNow("DD/MM/YYYY, hh:mm A"));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(moment(lastSeen).fromNow("DD/MM/YYYY, hh:mm A"));
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


  return (
    <div className="user--profile" onClick={handelSelectedUser}>
      <div className="user--profile--img">
        <img src={photoURL || defaultAvatar} alt="user profile" />
      </div>
      <div className="user--profile--info">
        <div className="info">
            <h3>{displayName || 'Ahmed Abdat'}</h3>
            <p className='dr-en f-en'>{isOnline ? 'متصل الآن' : timeAgo}</p>
        </div>
        <div className="last-message">
            <p>أهلا بك في واتساب</p>
        </div>
      </div>
    </div>
  );
}
