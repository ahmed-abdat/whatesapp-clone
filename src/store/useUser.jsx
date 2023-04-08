import { create } from "zustand";

const useUser = create((set , get) => ({
  currentUser: {},
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

}));

export default useUser;
