import { CardSet } from './interfaces/card.interface';

export type PriceOrder = 'ascending' | 'descending';

export function getPrintingPrice(printing: CardSet): number | null {
  const raw = printing.set_price.trim();
  const value = Number(raw);
  return raw !== '' && Number.isFinite(value) && value >= 0 ? value : null;
}

export function orderPrintings(printings: readonly CardSet[], order: PriceOrder): CardSet[] {
  return [...printings].sort((a, b) => {
    const first = getPrintingPrice(a);
    const second = getPrintingPrice(b);
    if (first === null) { return second === null ? 0 : 1; }
    if (second === null) { return -1; }
    return order === 'descending' ? second - first : first - second;
  });
}
