import Event from './Event';
import Socket from './Socket';
import { SocketContext } from './SocketContext';

declare global {
  interface Window {
    ReactSocketIO: any;
  }
}

if (typeof window !== 'undefined') {
  // eslint-disable-next-line no-undef
  if (window) window.ReactSocketIO = { Socket, Event, SocketContext };
}

export { Event, Socket, SocketContext };
