import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { startOfToday, startOfTomorrow, stockStatus, toNumber } from '../common/numbers';
import { PrismaService } from '../prisma/prisma.service';

export type ProductPerformance = {
  productId: string;
  name: string;
  unit: string;
  quantitySold: number;
  revenue: number;
  profit: number;
  todayQuantity: number;
  todayRevenue: number;
  todayProfit: number;
};

export type StockAttention = {
  id: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minThreshold: number;
  stockStatus: 'LOW_STOCK' | 'OUT_OF_STOCK';
};

export type DashboardResponse = {
  inventoryValue: number;
  todayRevenue: number;
  todayProfit: number;
  todayCost: number;
  highStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  productCount: number;
  todaySalesCount: number;
  byProduct: ProductPerformance[];
  needsRestock: StockAttention[];
};

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(now = new Date()): Promise<DashboardResponse> {
    const from = startOfToday(now);
    const to = startOfTomorrow(now);

    const [products, sales, todaySales, todayTotals] = await Promise.all([
      this.prisma.product.findMany({
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
      }),
      this.prisma.sale.groupBy({
        by: ['productId'],
        _sum: { quantity: true, totalRevenue: true, profit: true },
      }),
      this.prisma.sale.groupBy({
        by: ['productId'],
        where: { date: { gte: from, lt: to } },
        _sum: { quantity: true, totalRevenue: true, profit: true },
      }),
      this.prisma.sale.aggregate({
        where: { date: { gte: from, lt: to } },
        _sum: { totalRevenue: true, totalCost: true, profit: true },
        _count: { _all: true },
      }),
    ]);

    const salesByProduct = new Map(sales.map((row) => [row.productId, row]));
    const todayByProduct = new Map(todaySales.map((row) => [row.productId, row]));

    let inventoryValue = new Prisma.Decimal(0);
    let highStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    const needsRestock: StockAttention[] = [];

    for (const product of products) {
      const currentStock = toNumber(product.currentStock);
      const minThreshold = toNumber(product.minThreshold);
      const status = stockStatus(currentStock, minThreshold);

      if (product.currentStock.gt(0)) {
        inventoryValue = inventoryValue.add(product.currentStock.mul(product.defaultBuyingPrice));
      }

      if (status === 'OUT_OF_STOCK') {
        outOfStockCount += 1;
      } else if (status === 'LOW_STOCK') {
        lowStockCount += 1;
      } else {
        highStockCount += 1;
      }

      if (status !== 'IN_STOCK') {
        needsRestock.push({
          id: product.id,
          name: product.name,
          category: product.category,
          unit: product.unit,
          currentStock,
          minThreshold,
          stockStatus: status,
        });
      }
    }

    needsRestock.sort((left, right) => left.currentStock - right.currentStock);

    const byProduct = products
      .filter((product) => salesByProduct.has(product.id))
      .map((product) => {
        const all = salesByProduct.get(product.id);
        const today = todayByProduct.get(product.id);
        return {
          productId: product.id,
          name: product.name,
          unit: product.unit,
          quantitySold: toNumber(all?._sum.quantity ?? 0),
          revenue: toNumber(all?._sum.totalRevenue ?? 0),
          profit: toNumber(all?._sum.profit ?? 0),
          todayQuantity: toNumber(today?._sum.quantity ?? 0),
          todayRevenue: toNumber(today?._sum.totalRevenue ?? 0),
          todayProfit: toNumber(today?._sum.profit ?? 0),
        };
      })
      .sort((left, right) => right.profit - left.profit);

    return {
      inventoryValue: toNumber(inventoryValue),
      todayRevenue: toNumber(todayTotals._sum.totalRevenue ?? 0),
      todayProfit: toNumber(todayTotals._sum.profit ?? 0),
      todayCost: toNumber(todayTotals._sum.totalCost ?? 0),
      highStockCount,
      lowStockCount,
      outOfStockCount,
      productCount: products.length,
      todaySalesCount: todayTotals._count._all,
      byProduct,
      needsRestock,
    };
  }
}
