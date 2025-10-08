
export interface ShoppingListItem {
  id: number;
  name: string;
  quantity: number;
  completed: boolean;
  imageUrl?: string;
}

export interface HistoricItem {
  id: number;
  name: string;
  quantity: number;
}

export interface PurchaseRecord {
  date: string;
  items: HistoricItem[];
}

export interface ItemPrice {
  name: string;
  price: number;
}

export interface SupermarketComparison {
  name: string;
  address: string;
  totalCost: number;
  items: ItemPrice[];
  flyerUrl?: string; // Link para a revista de promoções
}

export interface PriceComparisonResult {
  supermarkets: SupermarketComparison[];
}

export interface ProductSuggestion {
  name: string;
  imageUrl: string | null;
}
