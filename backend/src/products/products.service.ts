import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { stockStatus, toDecimal, toNumber } from '../common/numbers';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export type ProductResponse = {
  id: string;
  name: string;
  category: string;
  unit: string;
  minThreshold: number;
  currentStock: number;
  defaultBuyingPrice: number;
  defaultSellingPrice: number;
  stockStatus: ReturnType<typeof stockStatus>;
  inventoryValue: number;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProductDto): Promise<ProductResponse> {
    const openingStock = toDecimal(dto.currentStock ?? 0);
    const buyingPrice = toDecimal(dto.defaultBuyingPrice);

    const product = await this.prisma.$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          name: dto.name.trim(),
          category: dto.category.trim(),
          unit: dto.unit.trim(),
          minThreshold: toDecimal(dto.minThreshold),
          currentStock: openingStock,
          defaultBuyingPrice: buyingPrice,
          defaultSellingPrice: toDecimal(dto.defaultSellingPrice),
        },
      });

      if (openingStock.gt(0)) {
        await tx.stockPurchase.create({
          data: {
            productId: created.id,
            quantity: openingStock,
            unitBuyingPrice: buyingPrice,
            totalCost: openingStock.mul(buyingPrice),
            supplierName: 'Opening stock',
          },
        });
      }

      return created;
    });

    return this.toResponse(product);
  }

  async findAll(query: QueryProductsDto): Promise<ProductResponse[]> {
    const search = query.search?.trim();
    const category = query.category?.trim();
    const where: Prisma.ProductWhereInput = {
      AND: [
        search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {},
        category ? { category: { equals: category, mode: 'insensitive' } } : {},
      ],
    };

    const products = await this.prisma.product.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return products.map((product) => this.toResponse(product));
  }

  async categories(): Promise<string[]> {
    const rows = await this.prisma.product.findMany({
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    });
    return rows.map((row) => row.category);
  }

  async findOne(id: string): Promise<ProductResponse> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.toResponse(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductResponse> {
    await this.findOne(id);
    const product = await this.prisma.product.update({
      where: { id },
      data: {
        name: dto.name?.trim(),
        category: dto.category?.trim(),
        unit: dto.unit?.trim(),
        minThreshold: dto.minThreshold === undefined ? undefined : toDecimal(dto.minThreshold),
        defaultBuyingPrice:
          dto.defaultBuyingPrice === undefined ? undefined : toDecimal(dto.defaultBuyingPrice),
        defaultSellingPrice:
          dto.defaultSellingPrice === undefined ? undefined : toDecimal(dto.defaultSellingPrice),
      },
    });
    return this.toResponse(product);
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.findOne(id);
    const [purchases, sales] = await Promise.all([
      this.prisma.stockPurchase.count({ where: { productId: id } }),
      this.prisma.sale.count({ where: { productId: id } }),
    ]);
    if (purchases > 0 || sales > 0) {
      throw new ConflictException('Product has stock history and cannot be deleted');
    }
    await this.prisma.product.delete({ where: { id } });
    return { id };
  }

  toResponse(product: Product): ProductResponse {
    const currentStock = toNumber(product.currentStock);
    const defaultBuyingPrice = toNumber(product.defaultBuyingPrice);
    const minThreshold = toNumber(product.minThreshold);
    const inventoryValue = currentStock > 0 ? toNumber(product.currentStock.mul(product.defaultBuyingPrice)) : 0;

    return {
      id: product.id,
      name: product.name,
      category: product.category,
      unit: product.unit,
      minThreshold,
      currentStock,
      defaultBuyingPrice,
      defaultSellingPrice: toNumber(product.defaultSellingPrice),
      stockStatus: stockStatus(currentStock, minThreshold),
      inventoryValue,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  }
}
