import { Socket } from "socket.io";
export default (io: any) => {
  return (socket: Socket) => {
    const socketId = socket.id;
    console.log(`Socket ${socketId} connected!`);
  };
};
