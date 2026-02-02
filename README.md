# Enopoly Dashboard

A modern dashboard application built with React, TypeScript, and Vite.

## Features

- **Dashboard** - Overview with statistics and charts
- **Transactions** - View and manage transactions
- **Invoices** - Manage and track your customer invoices


## Tech Stack

- **React** 18.3
- **TypeScript**
- **Vite** - Build tool
- **React Router** - Routing
- **TanStack Query** - Data fetching
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Recharts** - Charts and graphs

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── contexts/      # React contexts
├── hooks/         # Custom React hooks
└── lib/           # Utility functions and API
```

## Documentation

This project includes comprehensive documentation for adding Stripe payment processing, invoice management, and customer portal features.

📋 **All documentation is in the [`docs/`](./docs/) folder:**

### Essential Documents

- [`docs/PROJECT_SUMMARY.md`](./docs/PROJECT_SUMMARY.md) - Quick overview of the project
- [`docs/IMPLEMENTATION_PLAN.md`](./docs/IMPLEMENTATION_PLAN.md) - Detailed implementation plan
- [`docs/TIMELINE.md`](./docs/TIMELINE.md) - Realistic project timeline (12-15 days)
- [`docs/CLIENT_CHECKLIST.md`](./docs/CLIENT_CHECKLIST.md) - Required information from client

### Reference Documents

- [`docs/TECH_STACK.md`](./docs/TECH_STACK.md) - Complete technology stack details
- [`docs/QUICK_START.md`](./docs/QUICK_START.md) - Setup checklist and commands
- [`docs/PDF_STORAGE_STRATEGY.md`](./docs/PDF_STORAGE_STRATEGY.md) - PDF storage approach

## Next Steps

1. Review the implementation plan documents above
2. Get Stripe API keys from client
3. Follow the day-by-day plan to implement backend API and features

## License

Private project
