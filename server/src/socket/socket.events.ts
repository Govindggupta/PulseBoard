import type { Socket } from "socket.io";

export function registerSocketEvents(socket: Socket) {
  // Creator joins a poll room to receive live analytics updates
  socket.on("join_poll", (pollId: string) => {
    socket.join(`poll:${pollId}`);
    console.log(`Socket ${socket.id} joined poll room: ${pollId}`);
  });

  // Creator leaves a poll room
  socket.on("leave_poll", (pollId: string) => {
    socket.leave(`poll:${pollId}`);
    console.log(`Socket ${socket.id} left poll room: ${pollId}`);
  });
}
