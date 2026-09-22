import { Prisma } from '@prisma/client';

export function toDecimal(value: number | string | Prisma.Decimal): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

export function toNumber(value: Prisma.Decimal | number | string): number {
  return Number(new Prisma.Decimal(value).toFixed(2));
}

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export function stockStatus(currentStock: number, minThreshold: number): StockStatus {
  if (currentStock <= 0) {
    return 'OUT_OF_STOCK';
  }
  if (currentStock <= minThreshold) {
    return 'LOW_STOCK';
  }
  return 'IN_STOCK';
}

export function parseOptionalDate(value?: string): Date {
  if (!value) {
    return new Date();
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}

export function startOfToday(now = new Date()): Date {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function startOfTomorrow(now = new Date()): Date {
  const start = startOfToday(now);
  return new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
}
