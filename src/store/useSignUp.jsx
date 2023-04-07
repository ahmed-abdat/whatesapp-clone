import { create } from 'zustand'

const useSignUp = create((set) => ({
  phone : '',
  setPhones : (phone) => set(() => ({ phone })),
  confirmationResult : {},
  setconfirmationResult: (confiramtion) => set(() => ({ confirmationResult: confiramtion})),
}))

export default useSignUp