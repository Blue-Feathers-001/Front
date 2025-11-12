import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    backendUser?: any;
    backendToken?: string;
    user: {
      id?: string;
    } & DefaultSession['user'];
  }

  interface JWT {
    accessToken?: string;
    backendUser?: any;
    backendToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    backendUser?: any;
    backendToken?: string;
  }
}
