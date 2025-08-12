import { useMemo } from 'react';
// import '../styles/NoFreinds.css'; // Removed - using Tailwind CSS only

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
        <div className="relative" key={user.uid}>
          <img 
            referrerPolicy="no-referrer" 
            src={user.photoURL} 
            alt={`img-${user.uid}`} 
            loading="lazy" 
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
        </div>
      )),
    [filteredUsers]
  );

  const userNames = useMemo(() => generateUserNames(filteredUsers), [filteredUsers]);

  const leftUsers = useMemo(() => allUser.length - 3, [allUser]);

  return (
    <section className="flex flex-col items-center py-16 px-4">
      <div className="flex items-center justify-center space-x-2 mb-6">{userImages}</div>
      <p className="text-center text-sm text-gray-600 font-arabic max-w-xs leading-relaxed">
        {userNames}
        {` ${leftUsers} جهة إتصال أخرى `}
        يستخدمون واتساب
      </p>
    </section>
  );
}
