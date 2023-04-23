import { create } from "zustand";

const useSelectedUser = create((set, get) => ({
  selectedUser: null,
  isSelectedUser : false,
  setSelectedUser: (selectedUser) => {
    // localStorage.setItem("SelectedUser", JSON.stringify(selectedUser));
    set(() => ({ selectedUser }));
  },
  setIsSelectedUser : (isSelectedUser) => {
    set(() => ({ isSelectedUser }));
  },
  getSelectedUser: () => {
    const { selectedUser } = get();
    // const savedUser = JSON.parse(localStorage.getItem("SelectedUser"));
    // const selectedUsere = selectedUser ? selectedUser : savedUser;
    return selectedUser;
  },
}));

export default useSelectedUser;
