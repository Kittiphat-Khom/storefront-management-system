export type Role = "seller" | "buyer";

export type User = {
  id: number;
  email: string;
  username: string;
  role: Role;
};

export type Product = {
  id: number;
  seller?: User;
  seller_name?: string;
  image: string | null;
  title: string;
  description: string;
  unit_price: string;
  available_quantity: number;
  stock_status: "in_stock" | "out_of_stock";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  id: number;
  product: Product;
  quantity: number;
  line_total: string;
};

export type Cart = {
  items: CartItem[];
  total: string;
};

export type OrderItem = {
  id: number;
  product: Product;
  quantity: number;
  unit_price: string;
  line_total: string;
};

export type Order = {
  id: number;
  status: "placed";
  total_amount: string;
  created_at: string;
  items: OrderItem[];
};
