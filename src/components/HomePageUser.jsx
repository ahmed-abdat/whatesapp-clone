export default function HomePageUser({displayName , photoURL , uid}) {
  return (
    <div className="user--profile">
      <div className="user--profile--img">
        <img src={photoURL} alt="user profile" />
      </div>
      <div className="user--profile--info">
        <div className="info">
            <h3>{displayName}</h3>
            <p>متصل الآن</p>
        </div>
        <div className="last-message">
            <p>أهلا بك في واتساب</p>
        </div>
      </div>
    </div>
  );
}
