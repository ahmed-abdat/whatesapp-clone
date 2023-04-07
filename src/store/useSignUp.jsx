import { create } from 'zustand'

const useSignUp = create((set) => ({
  confirmationResult : {},
  setconfirmationResult: (confiramtion) => set(() => ({ confirmationResult: confiramtion})),
}))

export default useSignUp