import { create } from "zustand";

const useUser = create((set , get) => ({
    allUsers: [],
    isProfileShow: false,
    setAllUsers: (users) => {
        set(() => ({ allUsers: users }));
    },
    setIsProfileShow: (isProfileShow) => {
        set(() => ({ isProfileShow }));
    },
}));

export default useUser;
