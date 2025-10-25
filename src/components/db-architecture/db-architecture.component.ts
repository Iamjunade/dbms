import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'db-architecture',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './db-architecture.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DbArchitectureComponent {
  // This component is for static display purposes.
}
