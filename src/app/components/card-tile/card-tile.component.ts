import { Component, input, output } from '@angular/core';
import { YgoCard } from '../../models/interfaces/card.interface';

@Component({ selector: 'app-card-tile', templateUrl: './card-tile.component.html', styleUrl: './card-tile.component.css' })
export class CardTileComponent {
  readonly card = input.required<YgoCard>();
  readonly selected = output<YgoCard>();
  protected selectCard(): void { this.selected.emit(this.card()); }
}
