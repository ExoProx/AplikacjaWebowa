// src/hooks/useAuth.ts
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const useAuth = () => {
  const router = useRouter();

  useEffect(() => {
    // Check for cookie or token in localStorage
    const token = localStorage.getItem('token');

    // If token is not found, redirect to login page
    if (!token) {
      router.push('/login');  // Redirect to login
    }
  }, [router]);
};

export default useAuth;
