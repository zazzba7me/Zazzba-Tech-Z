import { LucideIcon } from "lucide-react";

export interface User {
  id?: string;
  name: string;
  phone?: string;
  email: string;
  address?: string;
  role: 'customer' | 'admin';
}

export interface SubCategory {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  image: string;
  rating: number; // This can act as a base/cached rating
  isFlashSale?: boolean;
  category: string;
  subcategory?: string;
  description?: string;
  warranty?: string;
  publishedAt?: string;
  stock?: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface QuickAction {
  id: string;
  title: string;
  icon: LucideIcon;
  gradient: string;
  action?: () => void;
}

export interface Category {
  id: string;
  name: string;
  icon?: LucideIcon;
  iconName?: string; // Added for persistence
  iconUrl?: string; // For custom image links
  subcategories?: SubCategory[];
}

export interface OrderStatusLog {
  status: Order['status'];
  date: string;
  note?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  deliveryCharge?: number;
  deliveryZone?: string;
  date: string;
  status: 'pending' | 'processing' | 'delivered' | 'cancelled';
  statusHistory?: OrderStatusLog[]; // Added for timeline tracking
  paymentMethod: 'cod' | 'online';
  trxId?: string;
  userId?: string;
}

export interface BannerConfig {
  title: string;
  subtitle: string;
  image: string;
  tagText: string;
  buttonText: string;
}

export interface FooterConfig {
  description: string;
  facebook: string;
  instagram: string;
  youtube: string;
  address: string;
  phone: string;
  email: string;
}