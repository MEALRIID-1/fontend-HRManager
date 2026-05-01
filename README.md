# HRManager Frontend

Frontend application for HRManager - A comprehensive HR management system built with Next.js 16, React 19, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Data Fetching**: React Query (@tanstack/react-query)
- **HTTP Client**: Axios
- **Form Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **Container**: Docker

## 📋 Prerequisites

- Node.js 20+
- npm or yarn or pnpm
- Docker (optional, for containerized deployment)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd frontend-hrmanager
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create environment file:
```bash
cp .env.local.example .env.local
```

4. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:80/api/v1
NEXT_PUBLIC_APP_NAME=HRManager
```

## 🏃 Development

### Local Development

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Docker Development

Build and run with Docker Compose:

```bash
# From the project root
docker-compose --profile dev up frontend-dev
```

The development server will be available at [http://localhost:3001](http://localhost:3001).

## 🐳 Docker Deployment

### Production Build

Build and run the production container:

```bash
# From the project root
docker-compose up frontend
```

The production app will be available at [http://localhost:3000](http://localhost:3000).

### Docker Build Commands

Build the production image:
```bash
docker build -t hrmanager-frontend .
```

Run the container:
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://nginx/api/v1 \
  hrmanager-frontend
```

## 📁 Project Structure

```
frontend-hrmanager/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard routes
│   │   ├── directeur/     # Admin dashboard
│   │   ├── rh/           # HR dashboard
│   │   ├── manager/      # Manager dashboard
│   │   └── employe/      # Employee dashboard
│   ├── login/            # Login page
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── contrats/         # Contract components
│   ├── modals/           # Modal components
│   ├── shared/           # Shared components
│   └── ui/               # UI components (shadcn/ui)
├── hooks/                # Custom React hooks
│   ├── useAuth.ts        # Authentication hook
│   ├── useEmployes.ts    # Employees hooks
│   ├── useConges.ts      # Leaves hooks
│   ├── useContrats.ts    # Contracts hooks
│   ├── useNotifications.ts # Notifications hooks
│   └── useDashboard.ts   # Dashboard hooks
├── lib/                  # Utility libraries
│   ├── api.ts            # Axios instance
│   ├── utils.ts          # Utility functions
│   └── validations/      # Zod validation schemas
├── stores/               # Zustand stores
│   ├── authStore.ts      # Authentication store
│   └── notificationStore.ts # Notification store
├── types/                # TypeScript types
│   └── index.ts          # All type definitions
├── Dockerfile            # Production Dockerfile
├── Dockerfile.dev        # Development Dockerfile
├── next.config.js        # Next.js configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── package.json          # Dependencies
```

## 🔧 Configuration

### Next.js Configuration

The `next.config.js` file includes:
- Image optimization settings
- API rewrites for CORS handling
- Environment variable exposure

### Tailwind CSS Configuration

Custom colors defined in `tailwind.config.ts`:
- `primary`: #2563EB (blue)
- `primary-dark`: #1D4ED8 (dark blue)
- `success`: #059669 (green)
- `warning`: #D97706 (amber)
- `error`: #DC2626 (red)

### Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_APP_NAME`: Application name

## 🔐 Authentication

The application uses JWT-based authentication:
- Token stored in localStorage and cookies
- Automatic token refresh
- Role-based access control (Admin, RH, Manager, Employee)

## 📊 Features

### Admin (Directeur)
- Employee management
- Contract management
- Leave request management
- Payslip management
- Dashboard with statistics

### HR
- Employee management
- Contract management
- Leave request approval
- Payslip generation
- Dashboard with statistics

### Manager
- Team leave management
- Leave request approval
- Dashboard with team statistics

### Employee
- Personal profile
- Leave request submission
- Payslip viewing
- Dashboard with personal statistics

## 🧪 Testing

```bash
npm run lint
```

## 📦 Build for Production

```bash
npm run build
npm start
```

## 🌐 Docker Compose

The project includes a complete Docker Compose setup at the root level with:
- Backend service (Laravel)
- Frontend service (Next.js)
- Nginx reverse proxy
- MySQL database

Start all services:
```bash
docker-compose up
```

Start only development services:
```bash
docker-compose --profile dev up
```

## 📝 License

This project is proprietary software.

## 🤝 Support

For support, please contact the development team.
