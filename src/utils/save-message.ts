import { Chat, Dispose, Message } from '../types/message-type';
import ChatDB from '../models/chats';
import DisposeDB from '../models/waiting';

export function converstionData(from:string,to: string, type: string, data: string): Dispose {
    const message: Message = {
        message_type: type,
        data: data,
    };
    const disposeChat: Dispose = {
        from: from,
        to: to,
        message: message,
        sent_time: new Date(),
    };
    return disposeChat;
}

export function converstionDataToChat(message:Dispose,onPage:boolean = false): Chat {
    return {
        ...message,
        meta_data: {
            read: onPage,
            seen_time: onPage ? new Date() : null,
            delivered_time: new Date(),
        },
    };;
}

export async function saveMessageToChatDB(message:Chat) {
    //save to chat collection
    try{
        const saveChat = new ChatDB(message);
        await saveChat.save();
    } catch (error) {
        console.log("Error in saving message to chat db. Error:", error);
    }
}

export async function saveMessageToDisposeDB(message:Dispose) {
    //save to dispose collection
    try{
        const saveDispose = new DisposeDB(message);
        await saveDispose.save();
    } catch (error) {
        console.log("Error in saving message to dispose db. Error:", error);
    }
}