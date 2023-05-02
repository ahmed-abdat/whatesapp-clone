import { useMemo } from 'react';
import '../styles/NoFreinds.css';

const arabicRegex = /[\u0600-\u06FF]/;

function filterAndSortUsers(allUser) {
  return allUser
    .filter(user => user.photoURL !== null)
    .sort((a, b) => b.lastSeen.seconds - a.lastSeen.seconds)
    .slice(0, 5);
}

function isArabicName(name) {
  return arabicRegex.test(name);
}

function generateUserNames(filteredUsers) {
  return filteredUsers
    .filter(user => user.displayName.length <= 15)
    .slice(0, 3)
    .map(user => (
      <span
        className={`${isArabicName(user.displayName) ? 'f-ar dr-ar' : 'f-en dr-en'}`}
        key={user.uid}
      >
        {user.displayName} <span>و</span>
      </span>
    ));
}

export default function NoFreinds({ allUser }) {
  const filteredUsers = useMemo(() => filterAndSortUsers(allUser), [allUser]);

  const userImages = useMemo(
    () =>
      filteredUsers.map(user => (
        <div className="img" key={user.uid}>
          <img src={user.photoURL} alt={`img-${user.uid}`} loading="lazy" />
        </div>
      )),
    [filteredUsers]
  );

  const userNames = useMemo(() => generateUserNames(filteredUsers), [filteredUsers]);

  const leftUsers = useMemo(() => allUser.length - 3, [allUser]);

  return (
    <section className="no-frends">
      <div className="images d-f d-init">{userImages}</div>
      <p className="text f-ar">
        {userNames}
        {` ${leftUsers} جهة إتصال أخرى `}
        يستخدمون واتساب
      </p>
    </section>
  );
}
