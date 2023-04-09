import { create } from "zustand";

const useUser = create((set , get) => ({
  currentUser: {},
  isEmailUser : false,
  imageFile : null,
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
  setImageFile : (file)=> {
    set(() => ({ imageFile : file }));
    localStorage.setItem("imageFile", JSON.stringify(file));
  },
  getImageFile : ()=> {
    const savedImageFile = JSON.parse(localStorage.getItem('imageFile'))
    return savedImageFile
  }
}));

export default useUser;
