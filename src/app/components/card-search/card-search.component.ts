import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, filter, map, of, Subject, switchMap, tap } from 'rxjs';
import { RequestStatus, YgoCard } from '../../models/interfaces/card.interface';
import { YgoprodeckService } from '../../services/ygoprodeck.service';
import { CardGridComponent } from '../card-grid/card-grid.component';
import { StatusMessageComponent } from '../status-message/status-message.component';

interface SearchResult {
  readonly cards: readonly YgoCard[];
  readonly status: RequestStatus;
}

@Component({
  selector: 'app-card-search',
  imports: [CardGridComponent, StatusMessageComponent],
  templateUrl: './card-search.component.html',
  styleUrl: './card-search.component.css',
  host: { class: 'section-anchor' },
})
export class CardSearchComponent {
  private readonly service = inject(YgoprodeckService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchTerms = new Subject<string>();

  readonly cardSelected = output<YgoCard>();
  protected readonly cards = signal<readonly YgoCard[]>([]);
  protected readonly status = signal<RequestStatus>('idle');
  protected readonly lastTerm = signal('');

  constructor() {
    this.searchTerms.pipe(
      map((term) => term.trim()),
      tap((term) => {
        this.lastTerm.set(term);
        if (term.length < 2) {
          this.cards.set([]);
          this.status.set('idle');
        }
      }),
      filter((term) => term.length >= 2),
      debounceTime(450),
      distinctUntilChanged(),
      tap(() => this.status.set('loading')),
      switchMap((term) => this.service.searchCards(term).pipe(
        map((cards): SearchResult => ({ cards, status: cards.length > 0 ? 'success' : 'empty' })),
        catchError((error: unknown) => of({
          cards: [],
          status: error instanceof HttpErrorResponse && error.status === 400 ? 'empty' : 'error',
        } satisfies SearchResult)),
      )),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((result) => {
      this.cards.set(result.cards);
      this.status.set(result.status);
    });
  }

  protected onInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.searchTerms.next(event.target.value);
    }
  }
}
