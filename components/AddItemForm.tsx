
import React, { useState } from 'react';
import { Item } from '../types';
import { BRANDS, ITEM_TYPES } from '../constants';
import Button from './Button';
import { ChevronLeftIcon } from './icons';

interface AddItemFormProps {
  onAddItem: (item: Omit<Item, 'id' | 'events' | 'createdAt' | 'currentQuantity'> & { initialQuantity: number }) => void;
  onBack: () => void;
}

const AddItemForm: React.FC<AddItemFormProps> = ({ onAddItem, onBack }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState(BRANDS[0]);
  const [sku, setSku] = useState('');
  const [itemType, setItemType] = useState<'Machine' | 'Spare Part'>(ITEM_TYPES[0] as 'Machine');
  const [initialQuantity, setInitialQuantity] = useState(1);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !sku || initialQuantity <= 0) {
        alert("Please fill in all required fields (Name, SKU, Quantity).");
        return;
    }
    onAddItem({ name, brand, sku, itemType, initialQuantity, location, description });
  };

  return (
    <div className="p-4 md:p-6">
        <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4">
          <ChevronLeftIcon className="w-4 h-4 mr-1"/>
          Back to Item List
        </button>
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3">Add New Warehouse Item</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Item Name*</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                </div>
                <div>
                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU / Part Number*</label>
                    <input type="text" id="sku" value={sku} onChange={(e) => setSku(e.target.value)} required className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                </div>
                <div>
                    <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
                    <select id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                        {BRANDS.map(b => <option key={b}>{b}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="itemType" className="block text-sm font-medium text-gray-700">Item Type</label>
                    <select id="itemType" value={itemType} onChange={(e) => setItemType(e.target.value as 'Machine' | 'Spare Part')} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md">
                        {ITEM_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">Initial Quantity*</label>
                    <input type="number" id="quantity" value={initialQuantity} onChange={(e) => setInitialQuantity(parseInt(e.target.value, 10))} min="1" required className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                </div>
                 <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">Warehouse Location</label>
                    <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                </div>
            </div>
            <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
            </div>
            <div className="text-right">
                <Button type="submit">Add Item</Button>
            </div>
        </form>
    </div>
  );
};

export default AddItemForm;
