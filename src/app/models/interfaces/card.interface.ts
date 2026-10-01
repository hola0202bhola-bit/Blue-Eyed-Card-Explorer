export interface CardImage {
  readonly id: number;
  readonly image_url: string;
  readonly image_url_small: string;
  readonly image_url_cropped: string;
}
export interface CardSet {
  readonly set_name: string;
  readonly set_code: string;
  readonly set_rarity: string;
  readonly set_rarity_code: string;
  readonly set_price: string;
}
export interface YgoCard {
  readonly id: number;
  readonly name: string;
  readonly type: string;
  readonly frameType: string;
  readonly desc: string;
  readonly race: string;
  readonly archetype?: string;
  readonly atk?: number;
  readonly def?: number;
  readonly level?: number;
  readonly attribute?: string;
  readonly card_images: readonly CardImage[];
  readonly card_sets?: readonly CardSet[];
}
export interface CardApiResponse { readonly data: readonly YgoCard[]; }
export type RequestStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';
