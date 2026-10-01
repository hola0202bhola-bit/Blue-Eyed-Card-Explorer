import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, filter, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
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
      distinctUntilChanged(),
      tap((term) => {
        this.lastTerm.set(term);
        this.cards.set([]);
        this.status.set(term.length < 2 ? 'idle' : 'loading');
      }),
      debounceTime(450),
      switchMap((term) => term.length < 2
        ? of({ cards: [], status: 'idle' } satisfies SearchResult)
        : this.service.searchCards(term).pipe(
        // Cancel immediately on a changed input, including clearing the search.
        takeUntil(this.searchTerms.pipe(filter((nextTerm) => nextTerm.trim() !== term))),
        map((cards): SearchResult => ({ cards, status: cards.length > 0 ? 'success' : 'empty' })),
        catchError((error: unknown) => of({
          cards: [],
          status: this.isNoResults(error) ? 'empty' : 'error',
        } satisfies SearchResult)),
      )),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((result) => {
      this.cards.set(result.cards);
      this.status.set(result.status);
    });
  }

  private isNoResults(error: unknown): boolean {
    if (!(error instanceof HttpErrorResponse) || error.status !== 400) { return false; }
    const body: unknown = error.error;
    return typeof body === 'object' && body !== null && 'error' in body &&
      typeof body.error === 'string' && /no card matching/i.test(body.error);
  }

  protected onInput(event: Event): void {
    if (event.target instanceof HTMLInputElement) {
      this.searchTerms.next(event.target.value);
    }
  }
}
