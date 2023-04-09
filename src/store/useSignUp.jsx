import { create } from 'zustand'

const useSignUp = create((set, get) => ({
  phone : '',
  setPhones : (phone) => {
    localStorage.setItem('phone', JSON.stringify(phone))
    set(({ phone }))
  },
  getPhone : ()=> {
    const savedPhone = JSON.parse(localStorage.getItem("phone"))
    const curentphone = get().phone
    const phone = curentphone ? curentphone : savedPhone
    return phone
  },
  confirmationResult : {},
  setconfirmationResult: (confiramtion) => {
    localStorage.setItem('confirmationResult' , JSON.stringify(confiramtion))
    set( ({ confirmationResult: confiramtion}))
  }
}))

export default useSignUp