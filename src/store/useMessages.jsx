import { create } from "zustand";

const useMessages = create((set , get) => ({
    allMessages: [],
    setAllMessages : (messages , isUpdated) => {
        const prevMessages = get().allMessages
        let newMessages = []
        if(Array.isArray(messages)) {
            if(isUpdated) {
                newMessages = [...messages , ...prevMessages]
            }else {
                newMessages = messages
            }
        }else {
             newMessages = [...prevMessages , messages]
        }
        set(() => ({ allMessages : newMessages }));
    },
    getlastMessage : () => {
        const messages = get().allMessages
        const lastMessage = messages[messages.length - 1]
        return lastMessage
    },
}));

export default useMessages;
