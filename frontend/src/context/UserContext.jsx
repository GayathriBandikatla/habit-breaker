import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('user_name') || 'Mindful User';
  });

  const saveUserName = (name) => {
    setUserName(name);
    localStorage.setItem('user_name', name);
  };

  return (
    <UserContext.Provider value={{ userName, saveUserName }}>
      {children}
    </UserContext.Provider>
  );
};
