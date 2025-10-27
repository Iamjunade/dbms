import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'project-documentation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-documentation.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDocumentationComponent {
  // This component is for static display purposes.
}
