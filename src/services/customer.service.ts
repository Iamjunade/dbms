import { Injectable, signal, inject } from '@angular/core';
import { Customer, Plan, PlanName } from '../types/customer.model';
import { SupabaseService } from './supabase.service';

// From Supabase (snake_case with joined 'plans' table) to App (camelCase)
function fromSupabase(record: any): Customer {
  const planName = (record.plans?.plan_name as PlanName) || ('N/A' as PlanName);
  const monthlyCharge = record.plans?.monthly_charge || 0;

  return {
    id: record.id,
    name: record.name,
    email: record.email,
    plan: planName,
    planId: record.plan_id,
    monthlyCharge: monthlyCharge,
    joinDate: record.join_date,
  };
}

// From App (camelCase) to Supabase (snake_case)
function toSupabase(customer: Partial<Omit<Customer, 'id' | 'monthlyCharge' | 'plan'>>): any {
  // We only send fields that exist in the DB: name, email, plan_id, join_date
  const { joinDate, planId, ...rest } = customer;
  const supabaseRecord: any = { ...rest };
  if (joinDate !== undefined) {
    supabaseRecord.join_date = joinDate;
  }
  if (planId !== undefined) {
    supabaseRecord.plan_id = planId; // This is the permanent fix
  }
  return supabaseRecord;
}


@Injectable({ providedIn: 'root' })
export class CustomerService {
  private supabaseService = inject(SupabaseService);
  private _customers = signal<Customer[]>([]);
  private _plans = signal<Plan[]>([]);

  customers = this._customers.asReadonly();
  plans = this._plans.asReadonly();

  constructor() {
    this.fetchInitialData();
  }
  
  async fetchInitialData() {
    await this.fetchPlans();
    await this.fetchCustomers();
  }

  async fetchPlans() {
    const { data, error } = await this.supabaseService.supabase
      .from('plans')
      .select('*');

    if (error) {
      console.error('Error fetching plans:', error.message);
      return;
    }
    if (data) {
      this._plans.set(data);
    }
  }

  async fetchCustomers() {
    const { data, error } = await this.supabaseService.supabase
      .from('customers')
      .select('*, plans(*)') // Join with plans table
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching customers:', error.message);
      return;
    }
    if (data) {
      this._customers.set(data.map(fromSupabase));
    }
  }

  async addCustomer(customer: Omit<Customer, 'id' | 'monthlyCharge' | 'plan'>) {
    const supabaseRecord = toSupabase(customer);
    const { data, error } = await this.supabaseService.supabase
      .from('customers')
      .insert([supabaseRecord])
      .select('*, plans(*)') // Re-fetch with join
      .single();

    if (error) {
      console.error('Error adding customer:', error.message);
      throw error;
    }
    if (data) {
        this._customers.update(customers => [...customers, fromSupabase(data)]);
    }
  }

  async updateCustomer(updatedCustomer: Omit<Customer, 'monthlyCharge' | 'plan'>) {
    const { id, ...customerData } = updatedCustomer;
    const supabaseRecord = toSupabase(customerData);

    const { data, error } = await this.supabaseService.supabase
      .from('customers')
      .update(supabaseRecord)
      .eq('id', id)
      .select('*, plans(*)') // Re-fetch with join
      .single();

    if (error) {
      console.error('Error updating customer:', error.message);
      throw error;
    }
    
    if (data) {
        const updated = fromSupabase(data);
        this._customers.update(customers => 
          customers.map(c => c.id === id ? updated : c)
        );
    }
  }

  async deleteCustomer(id: number) {
    const { error } = await this.supabaseService.supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting customer:', error.message);
      throw error;
    } else {
        this._customers.update(customers => customers.filter(c => c.id !== id));
    }
  }

  getCustomerById(id: number): Customer | undefined {
    return this.customers().find(c => c.id === id);
  }

  async executeQuery(query: string): Promise<{ data: unknown; message: string }> {
    query = query.trim().toLowerCase();
    const client = this.supabaseService.supabase;

    try {
      if (query.startsWith('select * from customers where')) {
        const whereClause = query.substring('select * from customers where'.length).trim();
        const [field, value] = whereClause.split('=').map(s => s.trim().replace(/'/g, ''));
        
        if (!field || value === undefined) throw new Error("Invalid WHERE clause. Expected format: field = 'value'");
        
        // Note: This simplified query console doesn't support joins on WHERE clauses
        const validFields = ['plan_id', 'id'];
        if (!validFields.includes(field)) {
          throw new Error(`Invalid field '${field}'. Can only filter by: ${validFields.join(', ')}.`);
        }
        
        const { data, error } = await client.from('customers').select('*, plans(*)').eq(field, value);

        if (error) throw error;
        
        return { data: (data || []).map(fromSupabase), message: `Query successful. Found ${data?.length || 0} record(s).` };

      } else if (query === 'select * from customers') {
        const { data, error } = await client.from('customers').select('*, plans(*)');
        if (error) throw error;
        return { data: (data || []).map(fromSupabase), message: `Query successful. Found ${data?.length || 0} records.` };
      } else if (query.startsWith('delete from customers where id')) {
        const idStr = query.split('=')[1]?.trim();
        if (!idStr) throw new Error('Invalid DELETE statement. Missing ID.');
        
        const id = parseInt(idStr, 10);
        if (isNaN(id)) throw new Error('Invalid ID provided for DELETE.');
        
        const { count, error: findError } = await client.from('customers').select('id', { count: 'exact', head: true }).eq('id', id);
        
        if (findError) throw findError;
        
        if (!count || count === 0) {
           return { data: null, message: `No record found with ID ${id}. 0 rows affected.` };
        }
        
        const { error: deleteError } = await client.from('customers').delete().eq('id', id);
        if (deleteError) throw deleteError;
        
        this._customers.update(customers => customers.filter(c => c.id !== id));
        return { data: null, message: `Record with ID ${id} deleted. 1 row affected.` };
      } else {
        throw new Error('Unsupported query. Supported queries: SELECT * FROM customers [WHERE ...], DELETE FROM customers WHERE id = ...');
      }
    } catch (e: any) {
        const message = e.message || 'An unknown error occurred.';
        return { data: null, message: `Error: ${message}` };
    }
  }
}
