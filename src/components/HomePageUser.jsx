import moment from "moment/moment";

export default function HomePageUser({displayName , photoURL , isOnline , latestSean}) {

  console.log(`name ${displayName} isOnline : ${isOnline}`)
  console.log(`latestSean ${latestSean}`);
  const timeAgo = moment(latestSean).fromNow(); 
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
