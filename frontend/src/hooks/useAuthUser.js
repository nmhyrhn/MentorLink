'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/services/authService';

export default function useAuthUser() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const syncUser = () => {
      setUser(getCurrentUser());
      setReady(true);
    };

    syncUser();
    window.addEventListener('mentorlink-auth-changed', syncUser);
    return () => window.removeEventListener('mentorlink-auth-changed', syncUser);
  }, []);

  return { user, ready };
}
