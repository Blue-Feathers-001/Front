'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthProvider } from '@/lib/authContext';
import { SocketProvider } from '@/lib/socketContext';
import { ThemeProvider } from '@/lib/themeContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
