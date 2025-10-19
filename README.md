# Liturgist Signup - Ukiah United Methodist Church

A modern Next.js web application for managing liturgist signups for worship services at Ukiah United Methodist Church. Features a beautiful calendar interface, multiple signup roles, and real-time Airtable integration.

## 🌟 Features

### User-Facing
- **Interactive Pinned Calendar** - Month view that follows you as you scroll
- **Three Signup Types Per Service**:
  - Main Liturgist
  - Backup Liturgist
  - Church Attendance tracking
- **Calendar-Service Sync** - Hover over services to highlight dates on calendar
- **Click-to-Scroll** - Click calendar dates to jump to that service
- **Responsive Design** - Works beautifully on desktop, tablet, and mobile
- **Real-time Data** - All signups saved instantly to Airtable

### Admin Features
- **Liturgist Directory** (`/admin`) - Complete contact list with copy-to-clipboard
- **Airtable Backend** - View and manage all data in spreadsheet format
- **Email Integration** - All liturgist emails organized and accessible

## 🏗️ Technology Stack

- **Next.js 14** - React framework with App Router
- **React 18** - UI library with hooks
- **TypeScript** - Full type safety
- **Tailwind CSS** - Utility-first styling
- **Airtable** - Database and backend
- **npm** - Package management
- **Vercel** - Deployment platform

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main signup interface (pinned calendar + services)
│   ├── layout.tsx         # Root layout
│   ├── admin/
│   │   └── page.tsx       # Liturgist directory (/admin)
│   ├── schedule/
│   │   └── page.tsx       # Legacy schedule view
│   ├── signup/
│   │   └── page.tsx       # Legacy signup page
│   └── api/
│       ├── signup/
│       │   └── route.ts   # POST endpoint for new signups
│       └── services/
│           └── route.ts   # GET endpoint for fetching services
├── admin/
│   ├── liturgists.ts      # Master liturgist contact list (10 people)
│   └── README.md          # Admin directory documentation
├── components/
│   └── Header.tsx         # (Currently unused)
├── lib/
│   └── airtable.ts        # Airtable SDK wrapper and helper functions
└── types/
    └── liturgist.ts       # TypeScript type definitions

public/
├── logo-for-church-larger.jpg  # Church logo
└── sw.js                       # Service worker (PWA support)
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Airtable account (free tier works)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/samuelmholley1/liturgists.ukiahumc.org.git
   cd liturgists.ukiahumc.org
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.local` in the root directory:
   ```env
   AIRTABLE_PAT_TOKEN=your_pat_token_here
   AIRTABLE_BASE_ID=your_base_id_here
   AIRTABLE_TABLE_NAME=liturgists.ukiahumc.org
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## 🗄️ Airtable Setup

### Table Structure

Your Airtable base should have a table named `liturgists.ukiahumc.org` with these fields:

| Field Name | Field Type | Options |
|------------|------------|---------|
| Service Date | Date | Date only |
| Display Date | Single line text | - |
| Name | Single line text | - |
| Email | Email | - |
| Phone | Phone number | - |
| Role | Single select | Liturgist, Backup, Attendance |
| Attendance Status | Single select | Yes, No, Maybe |
| Notes | Long text | - |
| Submitted At | Date | Include time |

### Getting Credentials

1. **PAT Token**: https://airtable.com/create/tokens
   - Create token with `data.records:read` and `data.records:write` scopes
   - Add access to your base

2. **Base ID**: https://airtable.com/api
   - Click on your base
   - Find the Base ID (starts with `app...`)

See `AIRTABLE_SETUP.md` for detailed instructions.

## 🌐 Deployment

### Vercel (Recommended)

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit https://vercel.com
   - Import your GitHub repository
   - Add environment variables (see `VERCEL_DEPLOYMENT.md`)
   - Deploy!

Environment variables needed:
- `AIRTABLE_PAT_TOKEN`
- `AIRTABLE_BASE_ID`
- `AIRTABLE_TABLE_NAME`

## 👥 Liturgist Data

The app tracks **10 liturgists**:

**Regular (6):**
- Kay Lieberknecht
- Linda Nagel
- Lori
- Doug Pratt
- Gwen Hardage-Vergeer
- Mikey Pitts KLMP

**Occasional (4):**
- Paula Martin
- Patrick Okey
- Vicki Okey
- Chad Raugewitz

All contact information is stored in `/src/admin/liturgists.ts`

## 📚 Key Files Explained

### `/src/app/page.tsx`
Main interface with:
- Pinned calendar at top
- Service list with 3 signup options each
- Modal signup forms
- Real-time Airtable integration

### `/src/lib/airtable.ts`
Airtable connection layer:
- `submitSignup()` - Save new signup
- `getSignups()` - Fetch all signups
- Handles API authentication

### `/src/app/api/signup/route.ts`
POST endpoint for signup submissions
- Validates data
- Submits to Airtable
- Returns success/error

### `/src/app/api/services/route.ts`
GET endpoint for fetching services
- Queries Airtable
- Groups signups by service date
- Returns organized service data

### `/src/admin/liturgists.ts`
Static liturgist directory with helper functions:
- `getAllLiturgists()`
- `getRegularLiturgists()`
- `getOccasionalLiturgists()`
- `getAllEmails()`

## 🔒 Security Notes

- **Never commit `.env.local`** - Already in `.gitignore`
- **PAT tokens are sensitive** - GitHub will block pushes containing them
- **Admin page has no auth** - Consider adding password protection later

## 🐛 Troubleshooting

### "Cannot connect to Airtable"
- Check your PAT token is valid
- Verify Base ID is correct
- Ensure table name matches exactly: `liturgists.ukiahumc.org`

### "Hydration errors"
- Dates are fixed to avoid SSR/client mismatches
- If you see hydration errors, check for `new Date()` calls

### "Services not loading"
- Check browser console for API errors
- Verify Airtable credentials in environment variables
- Try running `npm run dev` and check terminal output

## 📖 Documentation Files

- `AIRTABLE_SETUP.md` - Detailed Airtable configuration
- `VERCEL_DEPLOYMENT.md` - Step-by-step deployment guide
- `src/admin/README.md` - Admin directory documentation

## 🔮 Future Enhancements

Potential additions:
- Password protection for admin page
- Email notifications when someone signs up
- Automatic reminder emails to liturgists
- Admin panel to manage services
- Export to PDF/print view
- Google Calendar integration
- SMS notifications

## 📞 Contact

**Ukiah United Methodist Church**  
270 N. Pine St., Ukiah, CA 95482  
Phone: 707.462.3360  
Website: [ukiahumc.org](https://ukiahumc.org)

## 📄 License

Private - For Ukiah United Methodist Church use only

---

**Built with ❤️ for the Ukiah UMC community**