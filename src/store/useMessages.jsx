import { create } from "zustand";

const useMessages = create((set , get) => ({
    allMessages: [],
    setAllMessages : (messages) => {
        const prevMessages = get().allMessages
        let newMessages = []
        if(Array.isArray(messages)) {
            newMessages = messages
        }else {
             newMessages = [...prevMessages , messages]
        }
        set(() => ({ allMessages : newMessages }));
    },
    getLastMessage : () => {
        const messages = get().allMessages
        return messages[messages.length - 1]
    },
    
}));

export default useMessages;
