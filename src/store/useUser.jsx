import { create } from "zustand";

const useUser = create((set , get) => ({
  currentUser: null,
  isEmailUser : false,
  isPhoneUserVerified : false,
  setCurrentUser: (user) => {
    localStorage.setItem("currentUser", JSON.stringify(user));
    set(() => ({ currentUser: user }));
  },
  getCurrentUser : ()=> {
    const savedUser = JSON.parse(localStorage.getItem('currentUser'))
    const curentUser = get().currentUser
    const user = curentUser?.email ? curentUser : savedUser
    return user
  },
  setIsEmailUser : (boolean) => {
    set(() => ({ isEmailUser : boolean }));
    localStorage.setItem("isEmailUser", JSON.stringify(boolean));
    
  },
  getIsEmailUser : ()=> {
    const savedIsEmailUser = JSON.parse(localStorage.getItem('isEmailUser'))
    return savedIsEmailUser
  },
  setIsPhoneUserVerified : (boolean) => {
    set(() => ({ isPhoneUserVerified : boolean }));
    localStorage.setItem("isPhoneUserVerified", JSON.stringify(boolean));
  },
  getIsPhoneUserVerified : ()=> {
    const savedIsPhoneUserVerified = (localStorage.getItem('isPhoneUserVerified') === 'undefined') ? false : JSON.parse(localStorage.getItem('isPhoneUserVerified'))
    return savedIsPhoneUserVerified
  },
}));

export default useUser;
