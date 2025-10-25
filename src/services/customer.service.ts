import { Injectable, signal } from '@angular/core';
import { Customer, Status } from '../types/customer.model';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private _customers = signal<Customer[]>([
    { id: 101, name: 'Aarav Sharma', email: 'aarav.s@example.com', plan: 'Fiber 100Mbps', monthlyCharge: 799, dueDate: '2024-07-25', status: 'Paid' },
    { id: 102, name: 'Sanya Verma', email: 'sanya.v@example.com', plan: 'Fiber 500Mbps', monthlyCharge: 1299, dueDate: '2024-07-28', status: 'Paid' },
    { id: 103, name: 'Rohan Mehta', email: 'rohan.m@example.com', plan: 'Gigabit Fiber', monthlyCharge: 2499, dueDate: '2024-07-22', status: 'Unpaid' },
    { id: 104, name: 'Priya Patel', email: 'priya.p@example.com', plan: 'Fiber 50Mbps', monthlyCharge: 599, dueDate: '2024-06-20', status: 'Overdue' },
    { id: 105, name: 'Vikram Singh', email: 'vikram.s@example.com', plan: 'Fiber 100Mbps', monthlyCharge: 799, dueDate: '2024-07-30', status: 'Unpaid' },
  ]);

  customers = this._customers.asReadonly();

  private nextId = 106;

  addCustomer(customer: Omit<Customer, 'id'>) {
    const newCustomer = { ...customer, id: this.nextId++ };
    this._customers.update(customers => [...customers, newCustomer]);
  }

  updateCustomer(updatedCustomer: Customer) {
    this._customers.update(customers => 
      customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c)
    );
  }

  deleteCustomer(id: number) {
    this._customers.update(customers => customers.filter(c => c.id !== id));
  }

  getCustomerById(id: number): Customer | undefined {
    return this.customers().find(c => c.id === id);
  }

  executeQuery(query: string): { data: unknown; message: string } {
    query = query.trim().toLowerCase();
    const customers = this.customers();

    try {
      if (query.startsWith('select * from customers where')) {
        const whereClause = query.substring('select * from customers where'.length).trim();
        const [field, value] = whereClause.split('=').map(s => s.trim().replace(/'/g, ''));
        
        if (!field || value === undefined) throw new Error("Invalid WHERE clause. Expected format: field = 'value'");

        const validFields = ['status', 'plan', 'id'];
        if (!validFields.includes(field)) {
          throw new Error(`Invalid field '${field}'. Can only filter by: ${validFields.join(', ')}.`);
        }
        
        const results = customers.filter(c => {
            const customerValue = c[field as keyof Customer];
            if (field === 'id') {
                return customerValue == Number(value);
            }
            return String(customerValue).toLowerCase() === value;
        });
        
        return { data: results, message: `Query successful. Found ${results.length} record(s).` };

      } else if (query === 'select * from customers') {
        return { data: customers, message: `Query successful. Found ${customers.length} records.` };
      } else if (query.startsWith('delete from customers where id')) {
        const idStr = query.split('=')[1]?.trim();
        if (!idStr) throw new Error('Invalid DELETE statement. Missing ID.');
        
        const id = parseInt(idStr, 10);
        if (isNaN(id)) throw new Error('Invalid ID provided for DELETE.');
        
        if (!this.customers().some(c => c.id === id)) {
           return { data: null, message: `No record found with ID ${id}. 0 rows affected.` };
        }
        
        this.deleteCustomer(id);
        return { data: null, message: `Record with ID ${id} deleted. 1 row affected.` };
      } else {
        throw new Error('Unsupported query. Supported queries: SELECT * FROM customers [WHERE ...], DELETE FROM customers WHERE id = ...');
      }
    } catch (e: any) {
        return { data: null, message: `Error: ${e.message}` };
    }
  }
}
