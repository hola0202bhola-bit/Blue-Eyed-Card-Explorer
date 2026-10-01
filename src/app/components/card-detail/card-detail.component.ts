import { Component, computed, HostListener, input, OnChanges, output, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { YgoCard } from '../../models/interfaces/card.interface';
import { getPrintingPrice, orderPrintings, PriceOrder } from '../../models/printing.utils';

@Component({ selector: 'app-card-detail', imports: [CurrencyPipe], templateUrl: './card-detail.component.html', styleUrl: './card-detail.component.css' })
export class CardDetailComponent implements OnChanges {
  readonly card = input.required<YgoCard>();
  readonly closed = output<void>();
  protected readonly selectedExpansion = signal('');
  protected readonly priceOrder = signal<PriceOrder>('descending');
  protected readonly expansions = computed(() => [...new Set(
    (this.card().card_sets ?? []).map((printing) => printing.set_name),
  )].sort((a, b) => a.localeCompare(b)));
  protected readonly visiblePrintings = computed(() => orderPrintings(
    (this.card().card_sets ?? []).filter((printing) =>
      !this.selectedExpansion() || printing.set_name === this.selectedExpansion(),
    ),
    this.priceOrder(),
  ));
  protected readonly mostExpensive = computed(() => {
    const priced = orderPrintings(this.visiblePrintings(), 'descending');
    const highest = priced[0] ? getPrintingPrice(priced[0]) : null;
    return highest === null ? [] : priced.filter((printing) => getPrintingPrice(printing) === highest);
  });
  protected readonly price = getPrintingPrice;

  ngOnChanges(): void {
    this.selectedExpansion.set('');
    this.priceOrder.set('descending');
  }

  protected selectExpansion(event: Event): void {
    if (event.target instanceof HTMLSelectElement) {
      this.selectedExpansion.set(event.target.value);
    }
  }

  protected selectOrder(event: Event): void {
    if (event.target instanceof HTMLSelectElement &&
      (event.target.value === 'ascending' || event.target.value === 'descending')) {
      this.priceOrder.set(event.target.value);
    }
  }

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void { this.closed.emit(); }
}
