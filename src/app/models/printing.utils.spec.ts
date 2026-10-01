import { CardSet } from './interfaces/card.interface';
import { getPrintingPrice, orderPrintings } from './printing.utils';

function printing(price: string): CardSet {
  return { set_name: 'Test set', set_code: 'TEST', set_rarity: 'Test rarity', set_rarity_code: '', set_price: price };
}

describe('Printing prices', () => {
  it('orders numeric prices rather than price strings without mutating the source', () => {
    const source = [printing('9'), printing('100'), printing('20')];
    expect(orderPrintings(source, 'descending').map(getPrintingPrice)).toEqual([100, 20, 9]);
    expect(orderPrintings(source, 'ascending').map(getPrintingPrice)).toEqual([9, 20, 100]);
    expect(source.map(getPrintingPrice)).toEqual([9, 100, 20]);
  });

  it('preserves zero and leaves missing or invalid prices at the end in both directions', () => {
    const source = [printing(''), printing('0.00'), printing('N/A'), printing('12.34')];
    expect(orderPrintings(source, 'ascending').map(getPrintingPrice)).toEqual([0, 12.34, null, null]);
    expect(orderPrintings(source, 'descending').map(getPrintingPrice)).toEqual([12.34, 0, null, null]);
    expect(getPrintingPrice(printing('-10'))).toBeNull();
  });
});
