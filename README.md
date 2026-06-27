# Game Registration App

A mobile app built with React Native (Expo) and Supabase for managing game event registrations with bKash payment integration.

## Features

### Player Features
- Browse upcoming game events
- Register for events
- Pay via bKash
- View registration history
- Track payment status

### Admin Features
- Create and manage events
- View all registrations
- Track payments and revenue
- Dashboard with statistics

## Tech Stack

- **Frontend**: React Native (Expo) + TypeScript
- **Backend**: Supabase (Auth + PostgreSQL + Edge Functions)
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Payments**: bKash Payment Gateway

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Expo CLI (`npm install -g expo-cli`)
- Supabase account (https://supabase.com)
- bKash PGW merchant account (https://merchant.bkash.com)

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new project at https://supabase.com
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Get your project credentials:
   - Go to Project Settings > API
   - Copy `Project URL` and `anon/public` key

### 4. Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your Supabase credentials:
```
SUPABASE_URL=your_actual_supabase_url
SUPABASE_ANON_KEY=your_actual_anon_key
```

3. Update `src/constants/index.ts`:
```typescript
export const SUPABASE_URL = 'your_actual_supabase_url';
export const SUPABASE_ANON_KEY = 'your_actual_anon_key';
```

### 5. Set Up bKash Payment Gateway

1. Apply for bKash PGW merchant account at https://merchant.bkash.com
2. You'll receive sandbox credentials for testing
3. Update `.env` with bKash credentials:
```
BKASH_API_URL=https://tokenized.sandbox.bka.sh/v1.2.0-beta
BKASH_APP_KEY=your_app_key
BKASH_APP_SECRET=your_app_secret
BKASH_USERNAME=your_username
BKASH_PASSWORD=your_password
```

### 6. Deploy Supabase Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy edge functions
supabase functions deploy bkash-create-payment
supabase functions deploy bkash-execute-payment

# Set secrets for edge functions
supabase secrets set BKASH_API_URL=your_url
supabase secrets set BKASH_APP_KEY=your_key
supabase secrets set BKASH_APP_SECRET=your_secret
supabase secrets set BKASH_USERNAME=your_username
supabase secrets set BKASH_PASSWORD=your_password
```

### 7. Create Admin User

After signing up with your email, run this SQL in Supabase SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
```

### 8. Run the App

```bash
# Start Expo development server
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator
npm run ios
```

## Project Structure

```
GameRegistrationApp/
├── src/
│   ├── components/          # Reusable UI components
│   ├── constants/           # App constants and theme
│   ├── lib/                 # Supabase client and bKash service
│   ├── navigation/          # Navigation configuration
│   ├── screens/
│   │   ├── admin/          # Admin screens
│   │   ├── auth/           # Login/Signup screens
│   │   └── player/         # Player screens
│   ├── store/              # Zustand state management
│   └── types/              # TypeScript types
├── supabase/
│   └── functions/          # Edge Functions for bKash
├── App.tsx                 # Main app component
├── supabase-schema.sql     # Database schema
└── package.json
```

## Database Schema

- **profiles**: User profiles with roles (player/admin)
- **events**: Game events with details and pricing
- **registrations**: User registrations for events
- **payments**: Payment records with bKash transaction details

## Security Notes

- bKash API keys are stored in Supabase Edge Functions (server-side)
- Never expose bKash credentials in the mobile app
- Use Row Level Security (RLS) policies in Supabase
- Admin role is manually assigned via SQL

## Testing bKash

Use bKash sandbox credentials for testing:
- Sandbox URL: `https://tokenized.sandbox.bka.sh/v1.2.0-beta`
- Test number: `01770618815`
- OTP: `123456`

## Production Deployment

1. Switch bKash to production credentials
2. Update `BKASH_API_URL` to production URL
3. Build app for production:
   - Android: `eas build --platform android`
   - iOS: `eas build --platform ios`

## Troubleshooting

**App won't start**: Make sure all dependencies are installed (`npm install`)

**Supabase connection error**: Check your SUPABASE_URL and SUPABASE_ANON_KEY

**bKash payment fails**: Verify edge functions are deployed and secrets are set

**Can't login as admin**: Run the SQL to update your role to 'admin'

## License

MIT
