import { create } from "zustand";

const useMessages = create((set , get) => ({
    allMessages: [],
    lastMessage : null,
    setAllMessages : (messages) => {
        const prevMessages = get().allMessages
        let newMessages = []
        if(Array.isArray(messages)) {
            newMessages = messages
        }else {
             newMessages = [...prevMessages , messages]

        }

        const lastMessageUSer = newMessages[newMessages.length - 1]
        set(() => ({ lastMessage : lastMessageUSer }));
    },
    
}));

export default useMessages;
