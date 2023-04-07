
import React, { useState, createContext } from 'react';

// Create a context API to store state using useState
export const StateContext = createContext(null);

export const StateProvider = ({ children }) => {
  const [isWelcomePage, setIsWelcomePage] = useState(true);

  return (
    <StateContext.Provider value={[isWelcomePage, setIsWelcomePage]}>
      {children}
    </StateContext.Provider>
  );
};

