import React, { createContext, useContext, useState } from 'react';



// Create context
const UserContext = createContext(null);



// Create provider component
const UserProvider = ({ children }) => {

  const [user , setUser] = useState(null)


  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Create custom hook for using the context
const useUserContext = () => useContext(UserContext);

export { UserProvider, useUserContext };

