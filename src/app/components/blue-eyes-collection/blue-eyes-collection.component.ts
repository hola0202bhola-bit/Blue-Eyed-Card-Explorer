import { Component, computed, inject, OnInit, output, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { RequestStatus, YgoCard } from '../../models/interfaces/card.interface';
import { YgoprodeckService } from '../../services/ygoprodeck.service';
import { CardGridComponent } from '../card-grid/card-grid.component';
import { StatusMessageComponent } from '../status-message/status-message.component';

@Component({
  selector: 'app-blue-eyes-collection',
  imports: [CardGridComponent, StatusMessageComponent],
  templateUrl: './blue-eyes-collection.component.html',
  styleUrl: './blue-eyes-collection.component.css',
  host: { class: 'section-anchor' },
})
export class BlueEyesCollectionComponent implements OnInit {
  private readonly service = inject(YgoprodeckService);
  readonly cardSelected = output<YgoCard>();

  protected readonly cards = signal<readonly YgoCard[]>([]);
  protected readonly status = signal<RequestStatus>('loading');
  protected readonly selectedSet = signal('');
  protected readonly expansions = computed(() => Array.from(new Set(
    this.cards().flatMap((card) => (card.card_sets ?? []).map((set) => set.set_name)),
  )).sort((a, b) => a.localeCompare(b)));
  protected readonly filteredCards = computed(() => {
    const setName = this.selectedSet();
    return setName
      ? this.cards().filter((card) => (card.card_sets ?? []).some((set) => set.set_name === setName))
      : this.cards();
  });

  ngOnInit(): void { this.loadCollection(); }

  protected selectExpansion(event: Event): void {
    if (event.target instanceof HTMLSelectElement) { this.selectedSet.set(event.target.value); }
  }

  protected loadCollection(): void {
    this.status.set('loading');
    this.service.getBlueEyesCards().pipe(
      catchError((error: unknown) => {
        console.error('Blue-Eyes collection request failed', error);
        this.status.set('error');
        return of([] as readonly YgoCard[]);
      }),
    ).subscribe((cards) => {
      this.cards.set(cards);
      if (this.status() !== 'error') { this.status.set(cards.length > 0 ? 'success' : 'empty'); }
    });
  }
}
