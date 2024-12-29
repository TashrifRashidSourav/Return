import io from 'socket.io-client';

const SOCKET_URL = 'http://192.168.0.103:5000'; // Replace with your backend URL

let socket: any;

export const connectSocket = (token: string) => {
  socket = io(SOCKET_URL, {
    query: { token },
    transports: ['websocket'],
  });

  socket.on('connect', () => {
    console.log('Socket connected: ', socket.id);
  });

  socket.on('messageReceived', (message: any) => {
    console.log('New message received:', message);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });
};

export const sendMessage = (chatId: string, senderId: string, text: string) => {
  if (socket && socket.connected) {
    socket.emit('sendMessage', { chatId, senderId, text });
  } else {
    console.error('Socket not connected');
  }
};

export const joinRoom = (chatId: string) => {
  if (socket && socket.connected) {
    socket.emit('joinRoom', { chatId });
  } else {
    console.error('Socket not connected');
  }
};

export const receiveMessages = (callback: (message: any) => void) => {
  if (socket) {
    socket.on('messageReceived', callback);
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
  }
};
