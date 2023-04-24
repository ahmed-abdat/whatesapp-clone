import { create } from "zustand";

const useUser = create((set , get) => ({
    allUsers: [],
    unreadMessages: null,
    isProfileShow: false,
    isAllUsersShow : false,
    setAllUsers: (users) => {
        set(() => ({ allUsers: users }));
    },
    setIsProfileShow: (isProfileShow) => {
        set(() => ({ isProfileShow }));
    },
    setUnreadMessages: (unreadMessages) => {
        localStorage.setItem("unreadMessages", JSON.stringify(unreadMessages));
        set(() => ({ unreadMessages }));
    },
    getUnreadMessages: () => {
        const savedUnreadMessages = JSON.parse(localStorage.getItem('unreadMessages'))
        const unreadMessages = get().unreadMessages ? get().unreadMessages : savedUnreadMessages
        return unreadMessages
    },
    setIsAllUsersShow: (isAllUsersShow) => {
        set(() => ({ isAllUsersShow }));
    },
    
}));

export default useUser;
