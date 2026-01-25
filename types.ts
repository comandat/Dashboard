
// Based on the n8n Architecture Spec

export interface FinancialSummary {
  net_profit: number;
  revenue: number;
  expenses_total: number;
  expense_coverage_percent: number;
  margin_percent: number;
  break_even_target: number;
}

export type ExpenseCategory = 'Logistica' | 'Taxe' | 'Consumabile' | 'Salarii' | 'Marketing' | 'Admin' | 'Fixed';

export interface Expense {
  id: string;
  vendor: string;
  amount: number;
  date: string;
  status: 'Paid' | 'Pending';
  category: ExpenseCategory;
  invoice_id?: string;
}

export interface Product {
  sku: string;
  name: string;
  image_url: string;
  stock_qty: number;
  cost_price: number; // Bani Blocati
  retail_price: number; // Potential
  status: 'Lent (>60z)' | 'Stagnant (30z)' | 'Activ';
  last_sold_at: string;
  category: string;
  rotation_speed: string; // e.g., "Rapid (2z/buc)"
  avg_items_per_day?: number;
  total_revenue_1y?: number;
}

export interface OrderItem {
  sku: string;
  name: string;
  image_url: string;
  quantity: number;
}

export interface Order {
  id: string; // Command ID
  client_name: string;
  alert: string; // e.g., "Peste 48h"
  time_in_status: number; // hours
  status: 'Received' | 'Processing';
  items: OrderItem[];
}

export interface MonthlyData {
  month: string;
  profit: number;
  cogs: number;
  logistics: number;
  platform_fees: number;
  fixed_ops: number;
  revenue: number;
  expenses: number;
}

export type TimePeriod = 'current_month' | 'last_month' | 'last_quarter';
