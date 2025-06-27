'use client';
import { useEffect, useState } from 'react';
import { getstoreUser } from "@/data/services/localStorageService";
import { useSelector } from 'react-redux';

const getUserId = () => {
  const userEmail = useSelector((state) => state.auth.user);
  const [userId, setUserId] = useState(userEmail?.id);

  useEffect(() => {
    const id = getstoreUser();
    setUserId(id);
  }, []); 

  return userId;
};

export default getUserId;
