import rawContent from "../data/content.json";

export interface ProductItem {
  id: string;
  slug: string;
  number: string;
  name: string;
  category: string;
  colorway: string;
  price: string | number;
  tag_price?: string;
  front_img: string;
  side_img?: string;
  rack_img?: string;
  catalog_img?: string;
  shopee_url: string;
  colors: string[];
  color_images?: Record<string, any>;
  sizes: string[];
  fabric: string;
  fit: string;
  care_note: string;
  description: string;
  chapter?: string;
  is_new?: boolean;
  on_rack?: boolean;
  sideScale?: number;
  frontScale?: number;
}

export type GarmentProduct = ProductItem;

export type ContentData = typeof rawContent;
export type SiteSettings = ContentData["site_settings"];

export function parseRupiahAmount(price: string | number): number {
  if (typeof price === "number") return price;
  const digits = String(price).replace(/[^\d]/g, "");
  return Number(digits) || 0;
}

export function formatRupiahAmount(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function normalizeExternalUrl(url?: string, fallback = ""): string {
  const raw = (url && url.trim()) || fallback.trim();
  if (!raw) return "#";
  if (/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(raw)) {
    return raw;
  }
  return `https://${raw}`;
}

export const content: ContentData = rawContent;

export default content;
