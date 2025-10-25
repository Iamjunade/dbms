export type Plan = 'Fiber 50Mbps' | 'Fiber 100Mbps' | 'Fiber 500Mbps' | 'Gigabit Fiber';
export type Status = 'Paid' | 'Unpaid' | 'Overdue';

export interface Customer {
  id: number;
  name: string;
  email: string;
  plan: Plan;
  monthlyCharge: number;
  dueDate: string; // YYYY-MM-DD
  status: Status;
}
