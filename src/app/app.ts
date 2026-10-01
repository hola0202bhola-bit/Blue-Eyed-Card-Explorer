import { Component, signal } from '@angular/core';
import { BlueEyesCollectionComponent } from './components/blue-eyes-collection/blue-eyes-collection.component';
import { CardDetailComponent } from './components/card-detail/card-detail.component';
import { CardSearchComponent } from './components/card-search/card-search.component';
import { YgoCard } from './models/interfaces/card.interface';

@Component({
  selector: 'app-root',
  imports: [BlueEyesCollectionComponent, CardDetailComponent, CardSearchComponent],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly selectedCard = signal<YgoCard | null>(null);
  protected openCard(card: YgoCard): void { this.selectedCard.set(card); }
  protected closeCard(): void { this.selectedCard.set(null); }
}
