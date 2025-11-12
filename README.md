# Blue Feathers Gym - Frontend

Modern web application for gym membership management built with Next.js and TypeScript.

## Tech Stack

- Next.js 14+ (App Router)
- React 19+
- TypeScript
- Tailwind CSS
- NextAuth for OAuth
- Axios for API calls
- React Hot Toast for notifications

## Features

- User authentication (Email/Password & Google OAuth)
- Password reset with OTP
- User dashboard with membership tracking
- Admin panel with full CRUD operations
- Responsive design
- Role-based access control

## Prerequisites

- Node.js v16+
- Backend API running
- Google OAuth credentials (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Blue-Feathers-001/Front.git
cd Front
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file from `.env.example`:
```bash
cp .env.example .env.local
```

4. Configure environment variables in `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-min-32-chars

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

5. Start the development server:
```bash
npm run dev
```

The application will run on http://localhost:3000

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Run production build
npm run lint     # Run ESLint
```

## Project Structure

```
app/
├── admin/
│   └── users/              # Admin user management
├── api/
│   └── auth/
│       └── [...nextauth]/  # NextAuth configuration
├── dashboard/              # User dashboard
├── forgot-password/        # Password reset request
├── login/                  # Login page
├── register/               # Registration page
├── reset-password/         # Password reset with OTP
├── layout.tsx              # Root layout
├── page.tsx                # Home page
└── globals.css             # Global styles

components/
└── Navbar.tsx              # Navigation component

lib/
└── authContext.tsx         # Authentication context
```

## Pages

### Public Pages
- `/` - Home/Landing page
- `/login` - User login
- `/register` - User registration
- `/forgot-password` - Request password reset
- `/reset-password` - Reset password with OTP

### Protected Pages
- `/dashboard` - User dashboard (User role)
- `/admin/users` - User management (Admin role)

## Features Detail

### User Dashboard
- Membership status overview
- Days remaining calculator
- Plan details with pricing
- Profile information

### Admin Panel
- View all users in table format
- Create new users
- Edit user details (name, email, phone, role, membership)
- Delete users
- Update membership status and plans

### Membership Plans

| Plan | Price | Features |
|------|-------|----------|
| Basic | $29/month | Off-peak hours, Basic equipment, Locker facilities |
| Premium | $59/month | 24/7 access, All equipment, 1 PT session/month, Nutrition consultation |
| VIP | $99/month | All Premium + Unlimited PT, Spa access, Priority booking, Guest passes |

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NEXT_PUBLIC_API_URL | Backend API URL | Yes |
| NEXTAUTH_URL | Frontend URL | Yes |
| NEXTAUTH_SECRET | NextAuth secret (min 32 chars) | Yes |
| GOOGLE_CLIENT_ID | Google OAuth client ID | No |
| GOOGLE_CLIENT_SECRET | Google OAuth secret | No |

## Authentication

This app uses a dual authentication approach:

1. **JWT Authentication**: For email/password login
2. **NextAuth**: For Google OAuth

The authentication state is managed through React Context ([lib/authContext.tsx](lib/authContext.tsx)) and provides:
- Login/logout functionality
- Protected route handling
- User state management
- Token storage

## Admin Access

To create an admin user:

1. Register through the UI
2. Update the user document in MongoDB:
   - Set `role` to `"admin"`
   - Set `membershipStatus` to `"active"`

Or use credentials:
- **Email:** admin
- **Password:** admin123

## Styling

The application uses Tailwind CSS with custom configurations:

- Gradient backgrounds
- Custom color schemes
- Responsive breakpoints
- Modern card designs
- Smooth transitions

## Deployment

### Recommended Platforms
- Vercel (recommended for Next.js)
- Netlify
- Render

### Production Environment Variables

Update for production:
- `NEXT_PUBLIC_API_URL` - Your production API URL
- `NEXTAUTH_URL` - Your production frontend URL
- `NEXTAUTH_SECRET` - Strong random string (min 32 chars)

### Vercel Deployment

```bash
npm run build
# Push to GitHub
# Connect repository to Vercel
# Add environment variables in Vercel dashboard
```

## API Integration

The frontend communicates with the backend API using Axios. Base URL is configured via `NEXT_PUBLIC_API_URL`.

Example API call:
```typescript
const response = await axios.get(`${API_URL}/auth/me`, {
  headers: { Authorization: `Bearer ${token}` }
});
```

## Backend Repository

Backend API: https://github.com/Blue-Feathers-001/Back.git

## License

MIT
