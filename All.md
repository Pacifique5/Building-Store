Project Name: "Murakaza Neza Building Store - Inventory & Sales Management System"

Tech Stack:
- Frontend: Next.js (App Router), TypeScript, Tailwind CSS, Lucide Icons, Shadcn UI / TanStack Table.
- Backend: NestJS (TypeScript), Prisma ORM, class-validator, class-transformer.
- Database: PostgreSQL.

Objective:
Build a streamlined, responsive inventory and sales tracking web app for a building materials hardware store owner. The UI must be clean, touch-friendly, high-contrast, and fast to operate on a shop laptop or tablet.

Core Workflows & Business Rules:
1. Product Catalog:
   - Create products with fields: name (e.g., "Cement Simba 32.5R", "Iron Sheets 28G", "Rebar 12mm"), category, unit (bags, pieces, meters, kg), minimum alert threshold.

2. Stock In (Purchases):
   - Record purchases: select product, quantity purchased, and buying price per unit (or total cost).
   - Automatically increment current stock quantity.
   - Maintain average unit cost or track batch purchase prices.

3. Stock Out (Sales):
   - Fast POS/Sales Form: select product, input quantity sold, and selling price per unit.
   - Validation: Block or alert if quantity sold exceeds current stock.
   - Deduct sold quantity from product stock.
   - Calculate metrics immediately:
     * Total Revenue = quantity * sellingPrice
     * Total Cost = quantity * buyingPrice
     * Profit/Margin = Total Revenue - Total Cost

4. Dashboard & Reports:
   - Live KPI cards: Total Inventory Value (at cost), Today's Revenue, Today's Profit, Low Stock Alert Count.
   - Inventory Table: Search/filter by name/category, showing Current Stock, Buying Price, Suggested Selling Price, and Stock Status (In Stock, Low Stock, Out of Stock).
   - Sales History Table: Timestamp, Product, Qty Sold, Selling Price, Revenue, Profit made.

Database Schema (Prisma):
- Model `Product`: id, name, category, unit, minThreshold, currentStock, defaultBuyingPrice, defaultSellingPrice, createdAt, updatedAt
- Model `StockPurchase`: id, productId, quantity, unitBuyingPrice, totalCost, supplierName (optional), date
- Model `Sale`: id, productId, quantity, unitSellingPrice, unitBuyingPriceAtSale, totalRevenue, totalCost, profit, customerName (optional), date

Architecture & Code Standards:
- NestJS API:
  * Modular design: `ProductsModule`, `PurchasesModule`, `SalesModule`, `AnalyticsModule`.
  * DTOs with strict validation (`class-validator`).
  * Use Prisma transactions (`prisma.$transaction`) when creating a Sale or Purchase to guarantee stock count and transaction logs update atomically.
- Next.js Client:
  * Server components for data fetching where applicable, client components for dynamic forms and tables.
  * Form state management with Zod validation.
  * Number formatting for currency (support clean integer/decimal display, e.g., RWF / USD).

Please generate:
1. The complete Prisma schema (`schema.prisma`).
2. The core NestJS services and controllers for Products, Purchases, and Sales (including transaction logic for stock math).
3. The Next.js dashboard UI layout, including the Stock-In modal, Sales checkout modal, and real-time inventory overview table.
Step-by-Step Deployment Guide
1. Database Setup (Neon or Supabase)
Create a free project on Neon.tech or Supabase.com.

Copy the connection string (postgresql://user:password@host/dbname?sslmode=require).

2. Backend Deployment (Render)
Push your NestJS code to a GitHub repository.

In Render.com, click New + → Web Service.

Select your backend repository and set:

Build Command: npm install && npm run build && npx prisma migrate deploy

Start Command: npm run start:prod

Add environment variables:

DATABASE_URL = (Your Postgres connection string)

PORT = 3001

FRONTEND_URL = (Your Vercel URL, configured after next step)

Deploy and copy your backend URL (e.g., [https://murakaza-api.onrender.com](https://murakaza-api.onrender.com)).

3. Frontend Deployment (Vercel)
In Vercel.com, click Add New → Project.

Import your Next.js repository.

Add environment variable:

NEXT_PUBLIC_API_URL = [https://murakaza-api.onrender.com](https://murakaza-api.onrender.com)

Click Deploy. Update the backend CORS configuration with this Vercel domain.