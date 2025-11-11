
export enum EventType {
  RECEIVE = 'Nhập Kho',
  LEND = 'Xuất Mượn',
  SELL = 'Xuất Bán',
  WARRANTY = 'Xuất Bảo Hành',
}

export interface Event {
  id: string;
  type: EventType;
  quantity: number;
  timestamp: string; // ISO 8601 string
  notes?: string;
}

export interface Item {
  id: string; // UUID
  name: string;
  brand: string;
  sku: string; // Stock Keeping Unit
  itemType: 'Machine' | 'Spare Part';
  currentQuantity: number;
  location: string;
  description?: string;
  events: Event[];
  createdAt: string; // ISO 8601 string
}
