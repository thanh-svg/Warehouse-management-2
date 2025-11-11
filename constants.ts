
import { EventType } from './types';

export const BRANDS = [
  "Anritsu",
  "Henkelman",
  "eShrink",
  "Nishihara",
  "POF films",
  "Other"
];

export const ITEM_TYPES = ['Machine', 'Spare Part'];

export const EVENT_TYPE_OPTIONS = [
  { value: EventType.RECEIVE, label: 'Nhập Kho (Receive)' },
  { value: EventType.SELL, label: 'Xuất Bán (Sell)' },
  { value: EventType.LEND, label: 'Xuất Mượn (Lend)' },
  { value: EventType.WARRANTY, label: 'Xuất Bảo Hành (Warranty)' },
];
