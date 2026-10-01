import { Component, input } from '@angular/core';
import { RequestStatus } from '../../models/interfaces/card.interface';

@Component({ selector: 'app-status-message', templateUrl: './status-message.component.html', styleUrl: './status-message.component.css' })
export class StatusMessageComponent {
  readonly status = input.required<RequestStatus>();
  readonly emptyMessage = input('No encontramos cartas para esta búsqueda.');
}
