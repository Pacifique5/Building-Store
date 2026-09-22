"use client";

import { Droplets, PackagePlus, ShoppingCart, Tag } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { z } from "zod";
import { createProduct, createPurchase, createSale, updateProduct } from "@/lib/api";
import { CATEGORIES, UNIT_GROUPS, UNITS, withCurrent } from "@/lib/catalog";
import { formatMoney, formatQuantity } from "@/lib/format";
import type { Product } from "@/lib/types";
import { Field, fieldClass, FormError, Modal, SubmitButton } from "./modal";

const productSchema = z.object({
  name: z.string().trim().min(1, "Enter the product name").max(200),
  category: z.string().trim().min(1, "Choose a category").max(100),
  unit: z.string().trim().min(1, "Choose how this product is counted").max(40),
  minThreshold: z.coerce.number().min(0, "The alert cannot be negative"),
  defaultBuyingPrice: z.coerce.number().min(0, "The buying price cannot be negative"),
  defaultSellingPrice: z.coerce.number().min(0, "The selling price cannot be negative"),
});

const purchaseSchema = z.object({
  productId: z.string().min(1, "Choose a product"),
  quantity: z.coerce.number().positive("Enter how many you bought"),
  unitBuyingPrice: z.coerce.number().min(0, "The buying price cannot be negative"),
  supplierName: z.string().trim().max(200).optional(),
});

const saleSchema = z.object({
  productId: z.string().min(1, "Choose a product"),
  quantity: z.coerce.number().positive("Enter how many you are selling"),
  unitSellingPrice: z.coerce.number().min(0, "Enter the selling price"),
  customerName: z.string().trim().max(200).optional(),
});

function firstError(error: z.ZodError) {
  return error.issues[0]?.message ?? "Check the form and try again";
}

function UnitSelect({ value, onChange, current }: { value: string; onChange: (value: string) => void; current?: string }) {
  const extra = current && !UNITS.includes(current) ? [current] : [];
  return (
    <select name="unit" value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>
      <option value="">Choose a unit</option>
      {extra.map((unit) => (
        <option key={unit} value={unit}>
          {unit}
        </option>
      ))}
      {UNIT_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.units.map((unit) => (
            <option key={unit} value={unit}>
              {unit}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

export function ProductForm({
  product,
  categories,
  onClose,
  onSaved,
}: {
  product?: Product | null;
  categories: string[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState(product?.category ?? "");
  const [unit, setUnit] = useState(product?.unit ?? "");
  const categoryOptions = useMemo(() => withCurrent(CATEGORIES, [product?.category, ...categories]), [categories, product?.category]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = productSchema.safeParse({
      name: form.get("name"),
      category,
      unit,
      minThreshold: form.get("minThreshold"),
      defaultBuyingPrice: form.get("defaultBuyingPrice"),
      defaultSellingPrice: form.get("defaultSellingPrice"),
    });
    if (!parsed.success) {
      setError(firstError(parsed.error));
      return;
    }

    setPending(true);
    setError(null);
    try {
      if (product) {
        await updateProduct(product.id, parsed.data);
      } else {
        await createProduct(parsed.data);
      }
      await onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the product");
      setPending(false);
    }
  }

  return (
    <Modal
      title={product ? "Edit product" : "Add a product"}
      description="Name what the shop sells. Quantity is added later, when you buy stock."
      icon={<Tag size={22} />}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="mx-auto grid max-w-lg gap-4">
        <Field label="Product name" hint="Use the name customers ask for.">
          <input name="name" defaultValue={product?.name} className={fieldClass} placeholder="Example: Cement Simba 32.5R" />
        </Field>
        <Field label="Category" hint="The kind of building material this is.">
          <select name="category" value={category} onChange={(event) => setCategory(event.target.value)} className={fieldClass}>
            <option value="">Choose a category</option>
            {categoryOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Unit" hint="How you count it. Use a can size for paint, thinner, oil, and other liquids.">
          <UnitSelect value={unit} onChange={setUnit} current={product?.unit} />
        </Field>
        <Field label="Low-stock alert" hint="The shop warns you when the remaining amount reaches this number.">
          <input name="minThreshold" type="number" min="0" step="0.01" defaultValue={product?.minThreshold ?? 0} className={fieldClass} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Usual buying price" hint="What you normally pay for one unit.">
            <input name="defaultBuyingPrice" type="number" min="0" step="0.01" defaultValue={product?.defaultBuyingPrice ?? ""} placeholder="0" className={fieldClass} />
          </Field>
          <Field label="Suggested selling price" hint="The price you usually charge. You can change it on each sale.">
            <input name="defaultSellingPrice" type="number" min="0" step="0.01" defaultValue={product?.defaultSellingPrice ?? ""} placeholder="0" className={fieldClass} />
          </Field>
        </div>
        <p className="flex items-start gap-2 rounded-xl bg-[#f6f1e7] px-3 py-2 text-sm text-[#57534e]">
          <Droplets size={16} className="mt-0.5 shrink-0 text-[#c4531a]" />
          Liquids such as paint and primer are counted in cans, litres, tins, gallons, or drums.
        </p>
        <FormError message={error} />
        <SubmitButton pending={pending}>{product ? "Save product" : "Add to the catalog"}</SubmitButton>
      </form>
    </Modal>
  );
}

export function PurchaseForm({
  products,
  initialProductId,
  onClose,
  onSaved,
}: {
  products: Product[];
  initialProductId?: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [productId, setProductId] = useState(initialProductId ?? "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = products.find((product) => product.id === productId);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = purchaseSchema.safeParse({
      productId,
      quantity: form.get("quantity"),
      unitBuyingPrice: form.get("unitBuyingPrice"),
      supplierName: String(form.get("supplierName") ?? ""),
    });
    if (!parsed.success) {
      setError(firstError(parsed.error));
      return;
    }

    setPending(true);
    setError(null);
    try {
      await createPurchase({
        ...parsed.data,
        supplierName: parsed.data.supplierName || undefined,
      });
      await onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not record the purchase");
      setPending(false);
    }
  }

  return (
    <Modal
      title="Record a purchase"
      description="This puts the product on the shelf and updates the average buying price."
      icon={<PackagePlus size={22} />}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="mx-auto grid max-w-lg gap-4">
        <Field label="Product" hint="Choose from the catalog, even if the shelf is empty.">
          <select name="productId" value={productId} onChange={(event) => setProductId(event.target.value)} className={fieldClass}>
            <option value="">Choose a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} · {formatQuantity(product.currentStock, product.unit)} now
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quantity received" hint={selected ? `Counted in ${selected.unit}.` : "Choose a product first."}>
            <input name="quantity" type="number" min="0.01" step="0.01" defaultValue={1} className={fieldClass} />
          </Field>
          <Field label="Price paid per unit" hint="The price on this delivery, for one unit.">
            <input
              key={selected?.id ?? "price"}
              name="unitBuyingPrice"
              type="number"
              min="0"
              step="0.01"
              defaultValue={selected?.defaultBuyingPrice ?? ""}
              placeholder="0"
              className={fieldClass}
            />
          </Field>
        </div>
        <Field label="Supplier" hint="Optional. Who you bought it from.">
          <input name="supplierName" className={fieldClass} placeholder="Supplier name" />
        </Field>
        <FormError message={error} />
        <SubmitButton pending={pending || !productId}>Add to the shelf</SubmitButton>
      </form>
    </Modal>
  );
}

export function SaleForm({
  products,
  onClose,
  onSaved,
}: {
  products: Product[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitSellingPrice, setUnitSellingPrice] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selected = products.find((product) => product.id === productId);
  const qty = Number(quantity);
  const price = Number(unitSellingPrice);
  const revenue = Number.isFinite(qty) && Number.isFinite(price) ? qty * price : 0;
  const cost = selected && Number.isFinite(qty) ? qty * selected.defaultBuyingPrice : 0;
  const profit = revenue - cost;
  const overStock = Boolean(selected && Number.isFinite(qty) && qty > selected.currentStock);

  function chooseProduct(nextId: string) {
    const next = products.find((product) => product.id === nextId);
    setProductId(nextId);
    setUnitSellingPrice(next ? String(next.defaultSellingPrice) : "");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = saleSchema.safeParse({
      productId,
      quantity,
      unitSellingPrice,
      customerName: String(form.get("customerName") ?? ""),
    });
    if (!parsed.success) {
      setError(firstError(parsed.error));
      return;
    }
    if (selected && parsed.data.quantity > selected.currentStock) {
      setError(`Only ${formatQuantity(selected.currentStock, selected.unit)} can be sold.`);
      return;
    }

    setPending(true);
    setError(null);
    try {
      await createSale({
        ...parsed.data,
        customerName: parsed.data.customerName || undefined,
      });
      await onSaved();
      onClose();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not record the sale");
      setPending(false);
    }
  }

  return (
    <Modal
      title="New sale"
      description="Sell only what is on the shelf. The profit updates as you type the price."
      icon={<ShoppingCart size={22} />}
      onClose={onClose}
    >
      <form onSubmit={onSubmit} className="mx-auto grid max-w-lg gap-4">
        <Field label="Product on the shelf" hint="Only products with remaining stock are listed.">
          <select name="productId" value={productId} onChange={(event) => chooseProduct(event.target.value)} className={fieldClass}>
            <option value="">Choose a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} · {formatQuantity(product.currentStock, product.unit)} available
              </option>
            ))}
          </select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Quantity sold" hint={selected ? `Available: ${formatQuantity(selected.currentStock, selected.unit)}.` : "Choose a product first."}>
            <input
              name="quantity"
              type="number"
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              className={fieldClass}
            />
          </Field>
          <Field label="Selling price per unit" hint="The price this customer pays for one unit.">
            <input
              name="unitSellingPrice"
              type="number"
              min="0"
              step="0.01"
              value={unitSellingPrice}
              onChange={(event) => setUnitSellingPrice(event.target.value)}
              placeholder="0"
              className={fieldClass}
            />
          </Field>
        </div>
        <Field label="Customer" hint="Optional.">
          <input name="customerName" className={fieldClass} placeholder="Customer name" />
        </Field>
        <div className="grid grid-cols-1 gap-2 rounded-2xl bg-[#f6f1e7] p-3 text-center sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#78716c]">Revenue</p>
            <p className="mt-1 text-lg font-semibold">{formatMoney(revenue)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#78716c]">Cost</p>
            <p className="mt-1 text-lg font-semibold">{formatMoney(cost)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#78716c]">Profit</p>
            <p className={`mt-1 text-lg ${profit < 0 ? "font-semibold text-[#b42318]" : "font-semibold text-[#166534]"}`}>{formatMoney(profit)}</p>
          </div>
        </div>
        <FormError message={overStock ? `That is more than the ${formatQuantity(selected?.currentStock ?? 0, selected?.unit)} on the shelf.` : error} />
        <SubmitButton pending={pending || overStock || !productId}>Complete sale</SubmitButton>
      </form>
    </Modal>
  );
}
