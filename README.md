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

- **Authentication & Authorization**
  - Email/Password authentication with JWT
  - Google OAuth integration
  - Password reset with OTP via email
  - Role-based access control (Admin/User)
  - Secure token management

- **User Features**
  - Personalized dashboard with membership tracking
  - Real-time membership status and expiry countdown
  - Notification center with in-app alerts
  - Profile management with notification preferences
  - Payment history tracking
  - Membership package browsing and selection
  - Secure payment processing with PayHere

- **Admin Features**
  - Complete user management (CRUD operations)
  - User details with registered date and payment history
  - Membership package management
  - Revenue statistics dashboard
  - Weekly and monthly revenue reports
  - Payment tracking and monitoring
  - Bulk notification system

- **Payment Integration**
  - PayHere payment gateway integration
  - Secure payment initiation and processing
  - Real-time payment status updates
  - Payment history with detailed records
  - Automatic membership activation

- **Design & UX**
  - Modern glass-morphism UI design
  - Fully responsive for all devices
  - Smooth animations and transitions
  - Custom gradient color schemes
  - Intuitive navigation and user flows

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
│   ├── packages/           # Package management
│   ├── reports/
│   │   ├── monthly/        # Monthly revenue reports
│   │   └── weekly/         # Weekly revenue reports
│   ├── revenue/            # Revenue statistics dashboard
│   └── users/
│       ├── [userId]/       # User detail view with payment history
│       └── page.tsx        # User management table
├── api/
│   └── auth/
│       └── [...nextauth]/  # NextAuth configuration
├── dashboard/              # User dashboard with notifications
├── forgot-password/        # Password reset request
├── login/                  # Login page
├── packages/               # Browse membership packages
├── payment/
│   ├── cancel/             # Payment cancellation
│   └── success/            # Payment success
├── profile/                # User profile management
├── register/               # Registration page
├── reset-password/         # Password reset with OTP
├── layout.tsx              # Root layout
├── page.tsx                # Home/Landing page
└── globals.css             # Global styles with custom utilities

components/
├── Navbar.tsx              # Navigation with role-based menus
└── NotificationCenter.tsx  # Notification display component

lib/
├── api.ts                  # API service layer (Axios)
├── authContext.tsx         # Authentication context
└── types.ts                # TypeScript type definitions
```

## Pages

### Public Pages
- `/` - Home/Landing page
- `/login` - User login with JWT and Google OAuth
- `/register` - User registration
- `/forgot-password` - Request password reset OTP
- `/reset-password` - Reset password with OTP code
- `/packages` - Browse available membership packages

### User Pages (Protected - User Role)
- `/dashboard` - User dashboard with membership status and notifications
- `/profile` - Profile management and notification preferences
- `/payment/success` - Payment success confirmation
- `/payment/cancel` - Payment cancellation page

### Admin Pages (Protected - Admin Role)
- `/admin/users` - User management table with CRUD operations
- `/admin/users/[userId]` - Detailed user view with payment history
- `/admin/packages` - Membership package management
- `/admin/revenue` - Revenue statistics dashboard
- `/admin/reports/weekly` - Weekly revenue reports and analytics
- `/admin/reports/monthly` - Monthly revenue reports with package distribution

## Features Detail

### User Dashboard
- Membership status overview with visual indicators
- Real-time days remaining calculator
- Current plan details with pricing and features
- Grace period tracking for expired memberships
- Notification center with unread badges
- Quick access to profile and payment history
- Payment initiation for membership renewal

### Admin Panel

#### User Management
- View all users in sortable table with pagination
- Display registered date, membership status, and plan
- Create new users with role assignment
- Edit user details (name, email, phone, role, membership)
- Delete users with confirmation
- View detailed user profile with complete payment history
- Track user payment statistics (total spent, success/failure rates)

#### Package Management
- Create and manage membership packages
- Set package pricing, duration, and features
- Define package categories (Basic, Premium, VIP)
- Toggle package active/inactive status
- Set member limits per package
- Apply discount percentages
- View package statistics and enrollment

#### Revenue & Reporting
- **Revenue Dashboard**: Real-time statistics with key metrics
  - Total revenue (all-time and monthly)
  - Payment success rate with visual indicators
  - Transaction breakdown by status
  - Average transaction value

- **Weekly Reports**: Detailed weekly revenue analysis
  - Configurable time periods (4, 8, 12, 26 weeks)
  - Week-by-week revenue and transaction counts
  - Average weekly performance metrics
  - Active/expired member statistics

- **Monthly Reports**: Comprehensive monthly analytics
  - Configurable time periods (6, 12, 24 months)
  - Month-by-month revenue comparison
  - Variance from average revenue
  - Package distribution and popularity
  - Revenue share by package type

#### Notifications
- Send individual notifications to users
- Bulk notification system for announcements
- Track notification delivery and read status

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
