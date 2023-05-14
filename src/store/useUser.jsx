import { create } from "zustand";

const useUser = create((set , get) => ({
  currentUser: null,
  isEmailUser : false,
  isPhoneUserVerified : false,
  isLogoutLoading : false,
  isAnonymousUser : false,
  setCurrentUser: (user) => {
    localStorage.setItem("currentUser", JSON.stringify(user));
    set(() => ({ currentUser: user }));
  },
  getCurrentUser : ()=> {
    const savedUser = localStorage.getItem('currentUser') === 'undefined' ? null : JSON.parse(localStorage.getItem('currentUser'))
    const curentUser = get().currentUser
    const user = curentUser?.displayName ? curentUser : savedUser
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
  setIsLogoutLoading : (boolean) => {
    set(() => ({ isLogoutLoading : boolean }));
  },
  updateProfile : (user ) => {
    const savedUser = localStorage.getItem('currentUser') === 'undefined' ? null : JSON.parse(localStorage.getItem('currentUser'))
    const curentUser = get().currentUser ? get().currentUser : savedUser
    const updatedUser = { ...curentUser , ...user };
    set(() => ({ currentUser : updatedUser })),
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  },
  setIsAnonymousUser : (boolean) => {
    localStorage.setItem("isAnonymousUser", JSON.stringify(boolean));
    set(() => ({ isAnonymousUser : boolean }));
  },
  getIsAnonymousUser : ()=> {
    const savedIsAnonymousUser =  JSON.parse(localStorage.getItem('isAnonymousUser'))
    return savedIsAnonymousUser
  },
}));

export default useUser;
