import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerService } from '../../services/customer.service';

interface QueryResult {
  data: unknown;
  message: string;
}

@Component({
  selector: 'db-console',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './db-console.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DbConsoleComponent {
  customerService = inject(CustomerService);

  query = signal('');
  result = signal<QueryResult | null>(null);
  isLoading = signal(false);

  exampleQueries = [
    "SELECT * FROM customers",
    "SELECT * FROM customers WHERE status = 'Unpaid'",
    "SELECT * FROM customers WHERE plan = 'Gigabit Fiber'",
    "DELETE FROM customers WHERE id = 101"
  ];
  
  highlightedResult = computed(() => {
    const res = this.result();
    if (!res || res.data === null || res.data === undefined) {
      return '';
    }
    
    const jsonString = JSON.stringify(res.data, null, 2);
    
    // Basic HTML escaping for safety, though data is trusted here.
    let html = jsonString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Regex for syntax highlighting
    return html.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
      let cls = 'text-sky-300'; // Default for numbers
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-slate-200'; // Matched a key
        } else {
          cls = 'text-emerald-300'; // Matched a string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-indigo-300'; // Matched a boolean
      } else if (/null/.test(match)) {
        cls = 'text-rose-400'; // Matched null
      }
      return `<span class="${cls}">${match}</span>`;
    });
  });

  setQuery(example: string) {
    this.query.set(example);
  }

  runQuery() {
    this.isLoading.set(true);
    this.result.set(null);

    // Simulate network latency for a better "loading" feel
    setTimeout(() => {
      const res = this.customerService.executeQuery(this.query());
      this.result.set(res);
      this.isLoading.set(false);
    }, 500);
  }
}