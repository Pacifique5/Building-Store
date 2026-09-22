export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  minThreshold: number;
  currentStock: number;
  defaultBuyingPrice: number;
  defaultSellingPrice: number;
  stockStatus: StockStatus;
  inventoryValue: number;
  createdAt: string;
  updatedAt: string;
};

export type Purchase = {
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

export type Sale = {
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
  stockStatus: "LOW_STOCK" | "OUT_OF_STOCK";
};

export type DashboardMetrics = {
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

export type StoreData = {
  dashboard: DashboardMetrics | null;
  products: Product[];
  sales: Sale[];
  purchases: Purchase[];
  error: string | null;
};
