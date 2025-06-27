import React, { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from 'react';
import socketIo from './Socket';
import { getToken } from '@/data/services/localStorageService';

const initialState = {
  isConnected: false,
  socket: null, 
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'CONNECT':
      return { ...state, isConnected: true, socket: action.payload };
    case 'DISCONNECT':
      return { ...state, isConnected: false, socket: null };
    default:
      return state;
  }
};

export const SocketContext = createContext(null);

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const token = getToken();
  // useEffect(() => {
  //   const token = getToken();
  // }, []);
  

  const connectSocket = useCallback(() => {
    
    // if (!token) {
    //   console.log("No token available");
    //   return;
    // }
    
    // if (state.isConnected) {
    //   console.log("Already connected");
    //   return;
    // }
  
    // console.log("Attempting to connect...");
  
    const socket = socketIo.connectToSocket(
      token,
      (err) => {
        console.error('Socket connection error:', JSON.stringify(err));
        dispatch({ type: 'DISCONNECT' });
      },
      (sock) => {
        // console.log('Socket connected', sock);
        dispatch({ type: 'CONNECT', payload: sock });
      }
    );
  
    return socket; 
  }, [token, state.isConnected]);
  

  useEffect(() => {
    const socket = connectSocket(); 
  
    return () => {
      if (socket) {
        socket.disconnect();
        dispatch({ type: 'DISCONNECT' });
      }
    };
  }, [connectSocket, token]);
  

  const memoizedValue = useMemo(() => ({
    isConnected: state.isConnected,
    socket: state.socket, 
  }), [state.isConnected, state.socket]);

  return (
    <SocketContext.Provider value={memoizedValue}>
      {children}
    </SocketContext.Provider>
  );
}
