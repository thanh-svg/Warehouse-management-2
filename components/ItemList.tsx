
import React from 'react';
import { Item } from '../types';
import { SearchIcon } from './icons';
import Button from './Button';

interface ItemListProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
  onSearch: (term: string) => void;
  searchTerm: string;
  hasMore: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
}

const ItemList: React.FC<ItemListProps> = ({ 
    items, 
    onSelectItem, 
    onSearch, 
    searchTerm, 
    hasMore, 
    onLoadMore,
    loadingMore 
}) => {
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearch(e.target.value);
    };

    const renderContent = () => {
        if (items.length === 0) {
            return (
                <div className="text-center py-12 px-4 bg-white rounded-lg shadow-md">
                    <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? `Your search for "${searchTerm}" did not match any items.` : "Get started by adding a new item."}
                    </p>
                </div>
            );
        }
        
        return (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <ul role="list" className="divide-y divide-gray-200">
                    {items.map(item => (
                        <li key={item.id} onClick={() => onSelectItem(item)} className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200" role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onSelectItem(item)}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm font-medium text-primary truncate">{item.name}</p>
                                    <p className="text-sm text-gray-500">SKU: {item.sku} | {item.brand}</p>
                                </div>
                                <div className="text-right ml-4 flex-shrink-0">
                                    <p className="text-lg font-semibold text-gray-900">{item.currentQuantity}</p>
                                    <p className="text-xs text-gray-500">in stock</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
                {hasMore && (
                    <div className="p-4 text-center border-t border-gray-200">
                        <Button 
                            variant="ghost" 
                            onClick={onLoadMore} 
                            disabled={loadingMore}
                            className="w-full sm:w-auto"
                        >
                            {loadingMore ? 'Loading...' : 'Load More Items'}
                        </Button>
                    </div>
                )}
            </div>
        );
    }

  return (
    <>
      <div className="mb-4">
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, SKU, or brand..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary focus:ring-primary sm:text-sm py-2"
              aria-label="Search items"
            />
          </div>
      </div>
      {renderContent()}
    </>
  );
};

export default ItemList;
