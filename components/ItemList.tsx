import React, { useState, useMemo } from 'react';
import { Item } from '../types';
import { SearchIcon } from './icons';

interface ItemListProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
}

const ItemList: React.FC<ItemListProps> = ({ items, onSelectItem }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredItems = useMemo(() => {
        if (!searchTerm) return items;
        const lowercasedFilter = searchTerm.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(lowercasedFilter) ||
            item.sku.toLowerCase().includes(lowercasedFilter) ||
            item.brand.toLowerCase().includes(lowercasedFilter)
        );
    }, [items, searchTerm]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [filteredItems]);

    const renderContent = () => {
        if (items.length === 0) {
            return (
                <div className="text-center py-12 px-4 bg-white rounded-lg shadow-md">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No items in warehouse</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new item.</p>
                </div>
            );
        }

        if (sortedItems.length === 0) {
            return (
                <div className="text-center py-12 px-4 bg-white rounded-lg shadow-md">
                    <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
                    <p className="mt-1 text-sm text-gray-500">Your search for "{searchTerm}" did not match any items.</p>
                </div>
            );
        }
        
        return (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <ul role="list" className="divide-y divide-gray-200">
                    {sortedItems.map(item => (
                        <li key={item.id} onClick={() => onSelectItem(item)} className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSelectItem(item)}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-primary truncate">{item.name}</p>
                                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                                </div>
                                <div className="text-right ml-4 flex-shrink-0">
                                    <p className="text-lg font-semibold text-gray-900">{item.currentQuantity}</p>
                                    <p className="text-xs text-gray-500">in stock</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

  return (
    <>
      {items.length > 0 && (
          <div className="mb-4">
              <div className="relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name, SKU, or brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary focus:ring-primary sm:text-sm py-2"
                  aria-label="Search items"
                />
              </div>
          </div>
      )}
      {renderContent()}
    </>
  );
};

export default ItemList;
