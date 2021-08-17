import io from 'socket.io-client';

export const Socket = (url: string, option = {}) => {
  let socket = io(url, {
    ...option,
    transports: ['websocket'],
    reconnectionDelay: 8000,
  });
  return socket;
};
