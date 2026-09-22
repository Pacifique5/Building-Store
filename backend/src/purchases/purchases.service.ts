import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, StockPurchase } from '@prisma/client';
import { parseOptionalDate, toDecimal, toNumber } from '../common/numbers';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { QueryPurchasesDto } from './dto/query-purchases.dto';

type PurchaseWithProduct = StockPurchase & {
  product: { id: string; name: string; unit: string; category: string };
};

export type PurchaseResponse = {
  id: string;
  productId: string;
  productName: string;
  category: string;
  unit: string;
  quantity: number;
  unitBuyingPrice: number;
  totalCost: number;
  supplierName: string | null;
  date: string;
};

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePurchaseDto): Promise<PurchaseResponse> {
    const quantity = toDecimal(dto.quantity);
    const unitBuyingPrice = toDecimal(dto.unitBuyingPrice);
    const totalCost = quantity.mul(unitBuyingPrice);
    const date = parseOptionalDate(dto.date);

    const purchase = await this.prisma.$transaction(async (tx) => {
      await this.lockProduct(tx, dto.productId);
      const product = await tx.product.findUnique({ where: { id: dto.productId } });
      if (!product) {
        throw new NotFoundException('Product not found');
      }

      const currentStock = product.currentStock;
      const newStock = currentStock.add(quantity);
      const averageCost = this.nextAverageCost(currentStock, product.defaultBuyingPrice, quantity, unitBuyingPrice, newStock);

      const created = await tx.stockPurchase.create({
        data: {
          productId: product.id,
          quantity,
          unitBuyingPrice,
          totalCost,
          supplierName: dto.supplierName?.trim() || null,
          date,
        },
        include: {
          product: { select: { id: true, name: true, unit: true, category: true } },
        },
      });

      await tx.product.update({
        where: { id: product.id },
        data: {
          currentStock: newStock,
          defaultBuyingPrice: averageCost,
        },
      });

      return created;
    });

    return this.toResponse(purchase);
  }

  async findAll(query: QueryPurchasesDto): Promise<PurchaseResponse[]> {
    const where: Prisma.StockPurchaseWhereInput = {
      productId: query.productId,
      date: {
        gte: query.from ? new Date(query.from) : undefined,
        lte: query.to ? new Date(query.to) : undefined,
      },
    };

    const purchases = await this.prisma.stockPurchase.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, unit: true, category: true } },
      },
      orderBy: { date: 'desc' },
      take: query.limit ?? 100,
    });

    return purchases.map((purchase) => this.toResponse(purchase));
  }

  private nextAverageCost(
    currentStock: Prisma.Decimal,
    currentAverage: Prisma.Decimal,
    quantity: Prisma.Decimal,
    unitBuyingPrice: Prisma.Decimal,
    newStock: Prisma.Decimal,
  ): Prisma.Decimal {
    if (currentStock.lte(0) || newStock.lte(0)) {
      return unitBuyingPrice;
    }
    const existingValue = currentStock.mul(currentAverage);
    return existingValue.add(quantity.mul(unitBuyingPrice)).div(newStock);
  }

  private async lockProduct(tx: Prisma.TransactionClient, productId: string) {
    await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${productId} FOR UPDATE`;
  }

  private toResponse(purchase: PurchaseWithProduct): PurchaseResponse {
    return {
      id: purchase.id,
      productId: purchase.productId,
      productName: purchase.product.name,
      category: purchase.product.category,
      unit: purchase.product.unit,
      quantity: toNumber(purchase.quantity),
      unitBuyingPrice: toNumber(purchase.unitBuyingPrice),
      totalCost: toNumber(purchase.totalCost),
      supplierName: purchase.supplierName,
      date: purchase.date.toISOString(),
    };
  }
}
