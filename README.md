# Liturgist Signup - Ukiah United Methodist Church

A Next.js web application for managing liturgist signups for worship services at Ukiah United Methodist Church.

## Features

- **Service Schedule**: View upcoming and past worship services
- **Easy Signup**: Simple form to sign up as a liturgist for available dates
- **Contact Management**: Store liturgist contact information and preferences
- **Responsive Design**: Works on desktop and mobile devices
- **PWA Ready**: Progressive Web App capabilities for mobile installation

## Technology Stack

- **Next.js 14** - React framework with App Router
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Yarn Berry** - Package management

## Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn 4.0+

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```

3. Run the development server:
   ```bash
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yard start` - Start production server
- `yarn lint` - Run ESLint
- `yarn type-check` - Run TypeScript type checking

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx      # Root layout
│   ├── page.tsx        # Home page
│   ├── signup/         # Signup functionality
│   └── schedule/       # Schedule view
├── components/         # Reusable React components
├── types/             # TypeScript type definitions
└── hooks/             # Custom React hooks
```

## Future Enhancements

- Database integration (PostgreSQL/Supabase)
- User authentication
- Email notifications
- Admin dashboard
- Calendar integration
- Export functionality

## Deployment

This application is designed to be deployed as a static site or on platforms like:
- Vercel
- Netlify
- Railway
- Digital Ocean App Platform

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Contact

For questions about this application, contact the Ukiah United Methodist Church office at 707.462.3360.