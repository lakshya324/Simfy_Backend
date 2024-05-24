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

export function converstionDataToChat(message:Dispose,delivered:boolean = true): Chat {
    return {
        ...message,
        meta_data: {
            read: false,
            seen_time: null,
            delivered_time: delivered ? new Date() : null,
        },
    };;
}

export async function saveMessageToChatDB(message:Chat):Promise<string|undefined> {
    //save to chat collection
    try{
        const saveChat = new ChatDB(message);
        await saveChat.save();
        return saveChat._id.toString();
    } catch (error) {
        console.log("Error in saving message to chat db. Error:", error);
        return;
    }
}

export async function saveMessageToDisposeDB(message:Dispose,chatId:string) {
    //save to dispose collection
    try{
        const saveDispose = new DisposeDB({...message,chatId});
        await saveDispose.save();
    } catch (error) {
        console.log("Error in saving message to dispose db. Error:", error);
    }
}