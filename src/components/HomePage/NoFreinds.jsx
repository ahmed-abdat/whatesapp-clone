import { useMemo } from 'react';
import '../styles/NoFreinds.css';

export default function NoFreinds({ allUser }) {
  const filteredUsers = useMemo(() => {
    return allUser.filter(user => user.photoURL !== null)
                  .sort((a, b) => b.lastSeen.seconds - a.lastSeen.seconds)
                  .slice(0, 5);
  }, [allUser]);

  const isArabicName = useMemo(() => {
    const arabic = /[\u0600-\u06FF]/;
    return (name) => arabic.test(name);
  }, []);

  const userImages = filteredUsers.map(user => (
    <div className="img" key={user.uid}>
      <img
        src={user.photoURL}
        alt={`img-${user.uid}`}
        loading='lazy'
      />
    </div>
  ));

  const userNames = filteredUsers.slice(0, 3).map(user => (
    <span
      className={`${isArabicName(user.displayName) ? 'f-ar dr-ar' : 'f-en dr-en'}`}
      key={user.uid}
    >
      {user.displayName} <span >و</span>
    </span>
  ));



  return (
    <section className="no-frends">
      <div className="images d-f d-init">
        {userImages}
      </div>
      <p className='text f-ar-dflt'>
        {userNames}
        {` ${filteredUsers.length} جهة إتصال أخرى`}
        يستخدمون واتساب
      </p>
    </section>
  );
}
