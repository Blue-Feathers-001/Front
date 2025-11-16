'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/lib/authContext';
import { SocketProvider } from '@/lib/socketContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <SocketProvider>
          {children}
        </SocketProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
