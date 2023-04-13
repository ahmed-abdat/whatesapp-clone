import moment from 'moment';
import 'moment/locale/ar'; 

export default function HomePageUser({displayName , photoURL , isOnline , latestSean}) {
  moment.locale('ar'); // Set the locale to Arabic
  const timeAgo = moment(latestSean).fromNow("DD/MM/YYYY, hh:mm A"); 
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
