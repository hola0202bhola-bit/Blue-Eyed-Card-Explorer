import { Component, HostListener, input, output } from '@angular/core';
import { YgoCard } from '../../models/interfaces/card.interface';

@Component({ selector: 'app-card-detail', templateUrl: './card-detail.component.html', styleUrl: './card-detail.component.css' })
export class CardDetailComponent {
  readonly card = input.required<YgoCard>();
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void { this.closed.emit(); }
}
