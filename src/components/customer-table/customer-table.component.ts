import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../services/customer.service';
import { Customer, Plan, Status } from '../../types/customer.model';

@Component({
  selector: 'customer-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './customer-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerTableComponent {
  customerService = inject(CustomerService);
  customers = this.customerService.customers;

  // Form state
  showForm = signal(false);
  editingCustomer = signal<Customer | null>(null);

  // Delete confirmation state
  showDeleteConfirm = signal(false);
  deletingCustomerId = signal<number | null>(null);
  
  // Available options for form dropdowns
  readonly plans: Plan[] = ['Fiber 50Mbps', 'Fiber 100Mbps', 'Fiber 500Mbps', 'Gigabit Fiber'];
  readonly statuses: Status[] = ['Paid', 'Unpaid', 'Overdue'];
  
  readonly planCharges: Record<Plan, number> = {
    'Fiber 50Mbps': 599,
    'Fiber 100Mbps': 799,
    'Fiber 500Mbps': 1299,
    'Gigabit Fiber': 2499
  };

  openAddForm() {
    this.editingCustomer.set(null);
    this.showForm.set(true);
  }

  openEditForm(customer: Customer) {
    this.editingCustomer.set(customer);
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingCustomer.set(null);
  }

  requestDelete(id: number) {
    this.deletingCustomerId.set(id);
    this.showDeleteConfirm.set(true);
  }

  cancelDelete() {
    this.deletingCustomerId.set(null);
    this.showDeleteConfirm.set(false);
  }

  confirmDelete() {
    const id = this.deletingCustomerId();
    if (id !== null) {
      this.customerService.deleteCustomer(id);
    }
    this.cancelDelete(); // Reset state and close modal
  }

  handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const plan = formData.get('plan') as Plan;

    const customerData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      plan: plan,
      monthlyCharge: this.planCharges[plan],
      dueDate: formData.get('dueDate') as string,
      status: formData.get('status') as Status,
    };

    if (this.editingCustomer()) {
      // Update
      const id = this.editingCustomer()!.id;
      this.customerService.updateCustomer({ ...customerData, id });
    } else {
      // Add new
      this.customerService.addCustomer(customerData);
    }

    form.reset();
    this.closeForm();
  }
}
