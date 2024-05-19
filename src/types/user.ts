export interface connection_schema {
    from: string;
    connectionId: string;
}

export interface user_schema {
    uniqueName: string;
    name: string;
    email: string;
    password: string;
    status: string;
    feeling: string;
    profileImage: string;
    connections: connection_schema[];
    createdAt: Date;
}

export interface temp_user_schema {
    user: {
        name: string;
        email: string;
        password: string;
    };
    expireAt?: Date;
    emailLastSent: Date;
    createdAt: Date;
}

export interface export_connection_schema extends connection_schema {
    _id: string;
}

export interface export_user_schema extends user_schema {
    _id: string;
}

export interface export_temp_user_schema extends temp_user_schema {
    _id: string;
}