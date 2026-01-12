# The Great Catch

A modern, test-optimized e-commerce SPA for sport fishing enthusiasts.

## Features

- **Store**: Browse products, filter by category/price, and sort.
- **Product Details**: View images, stock status, reviews.
- **Cart & Checkout**: Full checkout flow with simulated payment and validation.
- **Admin Dashboard**: Protected area for inventory management.
- **Chaos Engine**: Built-in tools to simulate latency, errors, and edge cases for robust testing.

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (Custom "Outdoor" Theme)
- Lucide React (Icons)
- React Router DOM

## Getting Started

### Local Development (Frontend only)
1.  Current directory: `/Users/nicodemus/Egen test sida`
2.  Install dependencies: `npm install`
3.  Run dev server: `npm run dev`

### Full Stack (Docker)
1.  Make sure Docker Desktop is running.
2.  Run `docker compose up --build`
3.  In a new terminal, run migrations & seed:
    ```bash
    # Run migrations
    docker compose exec api npx prisma migrate dev --name init
    # Seed data
    docker compose exec api npm run seed
    ```
4.  The API will be available at `http://localhost:4000` and proxied from the frontend.

## Testing Guide

### Test Accounts

- **Customer**: `customer@test.se` / `Password123!`
- **Admin**: `admin@test.se` / `Password123!`

### Chaos Engine (Tester's Control Panel)

Use the floating lightning bolt icon in the bottom-right corner to toggle chaos modes:

- **Latency**: Adds 2000ms delay to all API calls.
- **500 Error**: Forces server errors on data fetch.
- **Validation Fail**: Forces checkout validation to fail.
- **Stock Mismatch**: Shows "In Stock" in UI but fails checkout with "Out of Stock".

### Data Test IDs

Key elements have `data-testid` attributes for automation (Playwright/Cypress):

- **Navigation**: `nav-login`, `nav-admin`, `cart-btn`, `cart-badge`
- **Shop**: `product-card-{id}`, `add-to-cart-{id}`, `filter-category-{id}`
- **Checkout**: `input-email`, `input-card`, `submit-order-btn`, `order-success-msg`
- **Chaos**: `chaos-toggle-btn`, `toggle-latency`, `toggle-500`

## Mock Data

The application uses deterministic mock data generated in `src/data/mockData.ts`. It resets on page reload.
