# Hungry - Food Ordering Platform

A full-stack role-based food ordering web application built with Next.js 15, featuring country-based restaurant filtering and comprehensive order management.

## Features

### Authentication & Authorization
- **NextAuth.js** integration with JWT sessions
- **Role-based access control**: ADMIN, MANAGER, MEMBER
- **Country-based filtering**: India & America

### Restaurant Management
- Browse restaurants filtered by your country
- View detailed menus organized by categories
- Beautiful responsive UI with Unsplash images

### Shopping Experience
- Add items to cart with quantity controls
- Prevents mixing items from different restaurants
- Real-time cart updates using LocalStorage

### Checkout & Payments
- Role-based checkout (ADMIN & MANAGER only)
- Multiple payment methods support
- Secure order placement

### Order Management
- View order history
- Track order status (CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED)
- Cancel orders (ADMIN & MANAGER only)

### Admin Panel
- Manage payment methods (ADMIN only)
- Add/delete cards
- Set default payment method

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **UI**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd hungry
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # .env
   DATABASE_URL="your-postgres-connection-string"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev
   ```

5. **Seed the database**
   ```bash
   npm run prisma:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

Visit [http://localhost:3000](http://localhost:3000)

## Test Users

| Email | Password | Role | Country |
|-------|----------|------|---------|
| admin@test.com | password123 | ADMIN | INDIA |
| manager@test.com | password123 | MANAGER | INDIA |
| member@test.com | password123 | MEMBER | AMERICA |

## Role Permissions

| Feature | ADMIN | MANAGER | MEMBER |
|---------|-------|---------|--------|
| View restaurants & menus | Yes | Yes | Yes |
| Add items to cart | Yes | Yes | Yes |
| Checkout & pay | Yes | Yes | No |
| Cancel orders | Yes | Yes | No |
| Manage payment methods | Yes | No | No |

## Country-Based Filtering

Users only see restaurants from their assigned country:
- **India users**: See Indian restaurants (Spice Garden, Curry House)
- **America users**: See American restaurants (Burger Palace, Pizza Paradise)

## Project Structure

```
hungry/
├── app/
│   ├── actions/          # Server actions
│   ├── api/             # API routes
│   ├── admin/           # Admin pages
│   ├── cart/            # Shopping cart
│   ├── checkout/        # Checkout flow
│   ├── orders/          # Order management
│   ├── restaurants/     # Restaurant pages
│   ├── login/           # Authentication
│   └── register/
├── components/
│   └── ui/             # shadcn/ui components
├── lib/
│   ├── auth.ts         # NextAuth config
│   └── prisma.ts       # Prisma client
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.ts         # Seed data
└── types/              # TypeScript definitions
```

## Database Schema

- **User**: Authentication & role management
- **Restaurant**: Restaurant information with country
- **MenuItem**: Menu items linked to restaurants
- **Order**: Order tracking with status
- **OrderItem**: Junction table for orders & menu items
- **PaymentMethod**: User payment methods

## Development

```bash
# Run development server
npm run dev

# Run Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name <migration-name>
```

## Design Features

- Light color theme (orange/amber/yellow gradients)
- Responsive design for all screen sizes
- Backdrop blur effects on cards
- Smooth transitions and hover states
- Professional typography with Geist fonts

## License

MIT

---

Built with Next.js 15
