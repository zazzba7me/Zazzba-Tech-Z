import { 
  CreditCard, 
  Percent, 
  Wrench, 
  Truck, 
  Smartphone, 
  Watch, 
  Headphones, 
  Laptop,
  Gamepad2,
  Camera,
  Speaker
} from "lucide-react";
import { Product, QuickAction, Category } from "./types";

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "gadgets",
    title: "Gaming Zone",
    icon: Gamepad2,
    gradient: "from-rose-500 to-pink-400"
  },
  {
    id: "emi",
    title: "EMI Plans",
    icon: Percent,
    gradient: "from-orange-400 to-amber-300"
  },
  {
    id: "tracking",
    title: "Track Order",
    icon: Truck,
    gradient: "from-blue-600 to-indigo-500"
  },
  {
    id: "service",
    title: "Support",
    icon: Wrench,
    gradient: "from-emerald-500 to-teal-400"
  }
];

export const CATEGORIES: Category[] = [
  { 
    id: "c1", 
    name: "Phones", 
    icon: Smartphone,
    subcategories: [
      { id: "sc1-1", name: "Android" },
      { id: "sc1-2", name: "iPhone" },
      { id: "sc1-3", name: "Feature Phone" }
    ]
  },
  { 
    id: "c2", 
    name: "Watches", 
    icon: Watch,
    subcategories: [
      { id: "sc2-1", name: "Smart Watch" },
      { id: "sc2-2", name: "Fitness Band" }
    ]
  },
  { 
    id: "c3", 
    name: "Audio", 
    icon: Headphones,
    subcategories: [
      { id: "sc3-1", name: "TWS" },
      { id: "sc3-2", name: "Neckband" },
      { id: "sc3-3", name: "Headphone" },
      { id: "sc3-4", name: "Speaker" }
    ] 
  },
  { 
    id: "c4", 
    name: "Laptops", 
    icon: Laptop,
    subcategories: [
        { id: "sc4-1", name: "Gaming" },
        { id: "sc4-2", name: "Ultrabook" }
    ]
  },
  { 
    id: "c5", 
    name: "Gaming", 
    icon: Gamepad2,
    subcategories: [
        { id: "sc5-1", name: "Console" },
        { id: "sc5-2", name: "Accessories" }
    ]
  },
  { id: "c6", name: "Cameras", icon: Camera },
];

export const FLASH_SALE_PRODUCTS: Product[] = [
  {
    id: "fs1",
    name: "Ultra Bass Buds Pro",
    price: 1250,
    oldPrice: 2500,
    rating: 4.8,
    image: "https://picsum.photos/400/400?random=1",
    category: "Audio",
    subcategory: "TWS",
    isFlashSale: true,
    stock: 25
  },
  {
    id: "fs2",
    name: "Smart Fitness Watch 5",
    price: 3500,
    oldPrice: 5000,
    rating: 4.5,
    image: "https://picsum.photos/400/400?random=2",
    category: "Watches",
    subcategory: "Smart Watch",
    isFlashSale: true,
    stock: 15
  },
  {
    id: "fs3",
    name: "Fast Gan Charger 65W",
    price: 1800,
    oldPrice: 2400,
    rating: 4.9,
    image: "https://picsum.photos/400/400?random=3",
    category: "Accessories",
    isFlashSale: true,
    stock: 40
  },
  {
    id: "fs4",
    name: "Gaming Mouse RGB",
    price: 950,
    oldPrice: 1500,
    rating: 4.6,
    image: "https://picsum.photos/400/400?random=4",
    category: "Gaming",
    subcategory: "Accessories",
    isFlashSale: true,
    stock: 10
  }
];

export const NEW_ARRIVALS: Product[] = [
  {
    id: "na1",
    name: "Zazzba Phone X1",
    price: 22000,
    rating: 4.7,
    image: "https://picsum.photos/400/400?random=10",
    category: "Phones",
    subcategory: "Android",
    stock: 8
  },
  {
    id: "na2",
    name: "Mech Keyboard K2",
    price: 4500,
    rating: 4.8,
    image: "https://picsum.photos/400/400?random=11",
    category: "Gaming",
    subcategory: "Accessories",
    stock: 20
  },
  {
    id: "na3",
    name: "4K Action Camera",
    price: 8500,
    rating: 4.4,
    image: "https://picsum.photos/400/400?random=12",
    category: "Cameras",
    stock: 12
  },
  {
    id: "na4",
    name: "PowerBank 20k mAh",
    price: 2100,
    rating: 4.9,
    image: "https://picsum.photos/400/400?random=13",
    category: "Accessories",
    stock: 50
  },
  {
    id: "na5",
    name: "Wireless Speaker Boom",
    price: 3200,
    rating: 4.5,
    image: "https://picsum.photos/400/400?random=14",
    category: "Audio",
    subcategory: "Speaker",
    stock: 18
  },
  {
    id: "na6",
    name: "Laptop Sleeve Pro",
    price: 850,
    rating: 4.2,
    image: "https://picsum.photos/400/400?random=15",
    category: "Accessories",
    stock: 35
  },
  {
    id: "na7",
    name: "Smart Home Hub",
    price: 4200,
    rating: 4.6,
    image: "https://picsum.photos/400/400?random=16",
    category: "Home",
    stock: 15
  },
  {
    id: "na8",
    name: "VR Headset Pro",
    price: 25000,
    rating: 4.9,
    image: "https://picsum.photos/400/400?random=17",
    category: "Gaming",
    subcategory: "Accessories",
    stock: 5
  },
  {
    id: "na9",
    name: "Mini Drone 4K",
    price: 6500,
    rating: 4.3,
    image: "https://picsum.photos/400/400?random=18",
    category: "Gadgets",
    stock: 10
  },
  {
    id: "na10",
    name: "Gaming Headset 7.1",
    price: 3800,
    rating: 4.7,
    image: "https://picsum.photos/400/400?random=19",
    category: "Audio",
    subcategory: "Headphone",
    stock: 22
  },
  {
    id: "na11",
    name: "Smart Scale WiFi",
    price: 1500,
    rating: 4.1,
    image: "https://picsum.photos/400/400?random=20",
    category: "Home",
    stock: 5
  },
  {
    id: "na12",
    name: "USB-C Hub 8-in-1",
    price: 2200,
    rating: 4.6,
    image: "https://picsum.photos/400/400?random=21",
    category: "Accessories",
    stock: 45
  }
];