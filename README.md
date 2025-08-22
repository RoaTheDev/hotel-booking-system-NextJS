# Next.js Project with Prisma and shadcn/ui

This is a [Next.js](https://nextjs.org/) project set up with [Prisma](https://www.prisma.io/) for database management and [shadcn/ui](https://ui.shadcn.com/) for customizable UI components. The project includes a robust backend with a PostgreSQL database and a modern frontend styled with Tailwind CSS and shadcn/ui components.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
    - [1. Clone the Repository](#1-clone-the-repository)
    - [2. Install Dependencies](#2-install-dependencies)
    - [3. Set Up Environment Variables](#3-set-up-environment-variables)
    - [4. Set Up the Database](#4-set-up-the-database)
    - [5. Run the Application](#5-run-the-application)
- [Project Structure](#project-structure)
- [shadcn/ui Setup](#shadcnui-setup)
- [Prisma Usage](#prisma-usage)
- [Scripts](#scripts)

## Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js**: Version 18.x or later (LTS recommended)
- **npm** or **yarn**: For managing dependencies
- **PostgreSQL**: A running PostgreSQL database (local or hosted)
- **Git**: For cloning the repository

## Getting Started

Follow these steps to set up and run the project locally.

### 1. Clone the Repository
Clone the project to your local machine:
```bash
git clone https://github.com/RoaTheDev/hotel-booking-system-NextJS
cd your-repo-name
```

### 2. Install Dependencies
Install the project dependencies using npm or yarn:
```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables
Create a `.env` file in the root of the project and add the following environment variables:
```env
JWT_SECRET_KEY=your-secret-key
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL="postgresql://username:password@localhost:5432/your-database-name?schema=public"
```

- Replace `username`, `password`, and `your-database-name` with your PostgreSQL credentials and database name.
- `NEXT_PUBLIC_API_URL` is used for API calls from the frontend. Update it if you deploy to a different host.

### 4. Set Up the Database
This project uses Prisma as the ORM to interact with a PostgreSQL database. Follow these steps to set up the database:

1. Ensure your PostgreSQL server is running and the `DATABASE_URL` in the `.env` file points to a valid database.
2. Run the Prisma migration to create the database schema:
   ```bash
   npx prisma migrate dev --name init
   ```
   This command creates the tables defined in the `prisma/schema.prisma` file and generates the Prisma Client.

3. (Optional) Seed the database with initial data if you have a seed script:
   ```bash
   npx prisma db seed
   ```

### 5. Run the Application
Start the Next.js development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`. Open this URL in your browser to view the app.

## Project Structure
A high-level overview of the project structure:
```
├── app
│   ├── (additional-info)
│   │   ├── amenities
│   │   ├── dining
│   │   ├── garden
│   │   ├── onsen
│   │   └── rooms
│   ├── admin
│   ├── api
│   │   ├── (domain)
│   │   ├── (protected)
│   │   └── (public)
│   ├── (auth)
│   │   ├── login
│   │   └── signup
│   ├── generated
│   │   └── prisma
│   └── (protected)
│       ├── booking
│       └── profile
├── components
│   ├── admin
│   ├── common
│   ├── layout
│   ├── skeleton
│   ├── ui
│   └── users
├── data
├── hooks
├── lib
├── middleware
├── prisma
│   └── migrations
│       ├── 20250720182645_init
│       └── 20250805093937_add
├── public
├── stores
├── types
└── utils
```

## shadcn/ui Setup
This project uses [shadcn/ui](https://ui.shadcn.com/) for UI components. These components are not installed as a dependency but are copied directly into the `app/components/ui/` directory during development. Therefore, **no additional setup for shadcn/ui is required**. The components are already integrated and styled with Tailwind CSS.

If you need to add more shadcn/ui components, you can use the shadcn/ui CLI:
```bash
npx shadcn-ui@latest add <component-name>
```
For example, to add a button component:
```bash
npx shadcn-ui@latest add button
```
This will add the component to the `app/components/ui/` directory. Refer to the [shadcn/ui documentation](https://ui.shadcn.com/docs) for available components.

## Prisma Usage
Prisma is configured to work with a PostgreSQL database. The schema is defined in `prisma/schema.prisma` and includes models for users, bookings, rooms, amenities, and more.

To update the database schema:
1. Modify `prisma/schema.prisma` as needed.
2. Generate a new migration:
   ```bash
   npx prisma migrate dev --name your-migration-name
   ```
3. Update the Prisma Client:
   ```bash
   npx prisma generate
   ```

To explore the database interactively, use Prisma Studio:
```bash
npx prisma studio
```

## Scripts
Available scripts in `package.json`:
- `npm run dev`: Starts the Next.js development server
- `npm run build`: Builds the application for production
- `npm run start`: Starts the production server
- `npm run lint`: Runs the linter
- `npm prisma:migrate`: Runs Prisma migrations
- `npm prisma:generate`: Generates the Prisma Client
- `npm prisma:studio`: Opens Prisma Studio
