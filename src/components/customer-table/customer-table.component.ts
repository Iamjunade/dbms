import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../services/customer.service';
import { Customer, PlanName } from '../../types/customer.model';

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
  plans = this.customerService.plans;

  // Form state
  showForm = signal(false);
  editingCustomer = signal<Customer | null>(null);

  // Delete confirmation state
  showDeleteConfirm = signal(false);
  deletingCustomerId = signal<number | null>(null);

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

  async confirmDelete() {
    const id = this.deletingCustomerId();
    if (id !== null) {
      try {
        await this.customerService.deleteCustomer(id);
      } catch (error: any) {
        console.error('Failed to delete customer:', error);
        alert(`Failed to delete customer: ${error.message}`);
      }
    }
    this.cancelDelete(); // Reset state and close modal
  }

  async handleSubmit(event: Event) {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const planName = formData.get('plan') as PlanName;
    const selectedPlan = this.plans().find(p => p.plan_name === planName);

    if (!selectedPlan) {
      alert('An error occurred. The selected plan is invalid.');
      return;
    }

    const customerData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      planId: selectedPlan.id,
      joinDate: formData.get('joinDate') as string,
    };

    try {
      if (this.editingCustomer()) {
        // Update
        const id = this.editingCustomer()!.id;
        await this.customerService.updateCustomer({ ...customerData, id });
      } else {
        // Add new
        await this.customerService.addCustomer(customerData);
      }
      form.reset();
      this.closeForm();
    } catch (error: any) {
        console.error('Failed to save customer data:', error);
        alert(`Error: ${error.message}\n\nPlease check the console for more details. This could be due to invalid data (e.g., duplicate email) or a database policy preventing the operation.`);
    }
  }
}
