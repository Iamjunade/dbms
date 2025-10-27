export type PlanName = 'Fiber 50Mbps' | 'Fiber 100Mbps' | 'Fiber 500Mbps' | 'Gigabit Fiber';

export interface Plan {
  id: number;
  plan_name: PlanName;
  monthly_charge: number;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  plan: PlanName;
  planId: number;
  monthlyCharge: number;
  joinDate: string; // YYYY-MM-DD
}
