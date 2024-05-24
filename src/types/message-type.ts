export interface Message {
    message_type: string;
    data: string;
}

export interface Dispose {
    from: string;
    to: string;
    message: Message;
    sent_time: Date;
}

export interface Chat extends Dispose {
    meta_data: {
        read: boolean;
        seen_time: Date | null;
        delivered_time: Date | null;
    };
}