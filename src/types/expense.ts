export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'annual';
  category?: string;
}

export interface ExpenseStats {
  totalMonthly: number;
  totalAnnual: number;
  monthlyCount: number;
  annualCount: number;
}
