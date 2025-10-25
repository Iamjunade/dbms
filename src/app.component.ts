import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerTableComponent } from './components/customer-table/customer-table.component';
import { DbConsoleComponent } from './components/db-console/db-console.component';
import { DbArchitectureComponent } from './components/db-architecture/db-architecture.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, CustomerTableComponent, DbConsoleComponent, DbArchitectureComponent],
})
export class AppComponent {
  activeView = signal<'customers' | 'console' | 'architecture'>('customers');

  setView(view: 'customers' | 'console' | 'architecture') {
    this.activeView.set(view);
  }
}