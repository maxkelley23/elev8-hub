'use client';

import dynamic from 'next/dynamic';

const ExpenseTracker = dynamic(() => import('@/components/expenses/ExpenseTracker'), {
  ssr: false
});

export default function ExpensesPage() {
  return <ExpenseTracker />;
}
