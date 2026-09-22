import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Sale } from '@prisma/client';
import { parseOptionalDate, toDecimal, toNumber } from '../common/numbers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { QuerySalesDto } from './dto/query-sales.dto';

type SaleWithProduct = Sale & {
  product: { id: string; name: string; unit: string; category: string };
};

export type SaleResponse = {
  id: string;
  productId: string;
  productName: string;
  category: string;
  unit: string;
  quantity: number;
  unitSellingPrice: number;
  unitBuyingPriceAtSale: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  customerName: string | null;
  date: string;
};

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSaleDto): Promise<SaleResponse> {
    const quantity = toDecimal(dto.quantity);
    const unitSellingPrice = toDecimal(dto.unitSellingPrice);
    const date = parseOptionalDate(dto.date);

    const sale = await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Product" WHERE id = ${dto.productId} FOR UPDATE`;
      const product = await tx.product.findUnique({ where: { id: dto.productId } });
      if (!product) {
        throw new NotFoundException('Product not found');
      }
      if (product.currentStock.lt(quantity)) {
        throw new BadRequestException(
          `Not enough stock. Available: ${toNumber(product.currentStock)} ${product.unit}`,
        );
      }

      const unitBuyingPriceAtSale = product.defaultBuyingPrice;
      const totalRevenue = quantity.mul(unitSellingPrice);
      const totalCost = quantity.mul(unitBuyingPriceAtSale);
      const profit = totalRevenue.sub(totalCost);

      const created = await tx.sale.create({
        data: {
          productId: product.id,
          quantity,
          unitSellingPrice,
          unitBuyingPriceAtSale,
          totalRevenue,
          totalCost,
          profit,
          customerName: dto.customerName?.trim() || null,
          date,
        },
        include: {
          product: { select: { id: true, name: true, unit: true, category: true } },
        },
      });

      await tx.product.update({
        where: { id: product.id },
        data: { currentStock: product.currentStock.sub(quantity) },
      });

      return created;
    });

    return this.toResponse(sale);
  }

  async findAll(query: QuerySalesDto): Promise<SaleResponse[]> {
    const where: Prisma.SaleWhereInput = {
      productId: query.productId,
      date: {
        gte: query.from ? new Date(query.from) : undefined,
        lte: query.to ? new Date(query.to) : undefined,
      },
    };

    const sales = await this.prisma.sale.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, unit: true, category: true } },
      },
      orderBy: { date: 'desc' },
      take: query.limit ?? 100,
    });

    return sales.map((sale) => this.toResponse(sale));
  }

  private toResponse(sale: SaleWithProduct): SaleResponse {
    return {
      id: sale.id,
      productId: sale.productId,
      productName: sale.product.name,
      category: sale.product.category,
      unit: sale.product.unit,
      quantity: toNumber(sale.quantity),
      unitSellingPrice: toNumber(sale.unitSellingPrice),
      unitBuyingPriceAtSale: toNumber(sale.unitBuyingPriceAtSale),
      totalRevenue: toNumber(sale.totalRevenue),
      totalCost: toNumber(sale.totalCost),
      profit: toNumber(sale.profit),
      customerName: sale.customerName,
      date: sale.date.toISOString(),
    };
  }
}
