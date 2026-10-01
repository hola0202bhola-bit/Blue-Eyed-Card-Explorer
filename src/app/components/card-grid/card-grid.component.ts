import { Component, input, output } from '@angular/core';
import { YgoCard } from '../../models/interfaces/card.interface';
import { CardTileComponent } from '../card-tile/card-tile.component';

@Component({ selector: 'app-card-grid', imports: [CardTileComponent], templateUrl: './card-grid.component.html', styleUrl: './card-grid.component.css' })
export class CardGridComponent {
  readonly cards = input.required<readonly YgoCard[]>();
  readonly cardSelected = output<YgoCard>();
}
