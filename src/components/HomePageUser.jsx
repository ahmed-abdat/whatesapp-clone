import moment from 'moment';
import 'moment/locale/ar'; 
import { useState, useEffect } from 'react';

export default function HomePageUser({ displayName, photoURL, isOnline, latestSean }) {
  moment.locale('ar');
  const [timeAgo, setTimeAgo] = useState(moment(latestSean).fromNow("DD/MM/YYYY, hh:mm A"));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(moment(latestSean).fromNow("DD/MM/YYYY, hh:mm A"));
    }, 6000); 

    return () => clearInterval(interval);
  }, [latestSean]);

  return (
    <div className="user--profile">
      <div className="user--profile--img">
        <img src={photoURL || '/default-avatar.svg'} alt="user profile" />
      </div>
      <div className="user--profile--info">
        <div className="info">
            <h3>{displayName || 'Ahmed Abdat'}</h3>
            <p>{isOnline ? 'متصل الآن' : timeAgo}</p>
        </div>
        <div className="last-message">
            <p>أهلا بك في واتساب</p>
        </div>
      </div>
    </div>
  );
}
