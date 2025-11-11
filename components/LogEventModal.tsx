
import React, { useState } from 'react';
import { Item, Event, EventType } from '../types';
import { EVENT_TYPE_OPTIONS } from '../constants';
import Modal from './Modal';
import Button from './Button';

interface LogEventModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onLogEvent: (item: Item, event: Omit<Event, 'id' | 'timestamp'>) => void;
}

const LogEventModal: React.FC<LogEventModalProps> = ({ item, isOpen, onClose, onLogEvent }) => {
  const [eventType, setEventType] = useState<EventType>(EventType.RECEIVE);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setError('Quantity must be greater than 0.');
      return;
    }

    if (eventType !== EventType.RECEIVE && quantity > item.currentQuantity) {
      setError('Cannot process more than the current stock.');
      return;
    }

    onLogEvent(item, { type: eventType, quantity, notes });
    handleClose();
  };

  const handleClose = () => {
    setEventType(EventType.RECEIVE);
    setQuantity(1);
    setNotes('');
    setError('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Log Event for ${item.name}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-gray-700">Event Type</label>
          <select
            id="eventType"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
          >
            {EVENT_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            min="1"
            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
          <textarea
            id="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button type="submit">Log Event</Button>
        </div>
      </form>
    </Modal>
  );
};

export default LogEventModal;
