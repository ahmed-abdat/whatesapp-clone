import { create } from 'zustand'

const useUser = create((set) => ({
  users : [],
  setUsers: (user) => set(() => ({ users: user})),
}))

export default useUser