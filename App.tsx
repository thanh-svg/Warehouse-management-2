
import React, { useState, useEffect, useCallback } from 'react';
import { Item, Event, EventType } from './types';
import { searchItems, getItemDetails, createItemInDB, logEventInDB } from './services/db';
import Header from './components/Header';
import ItemList from './components/ItemList';
import AddItemForm from './components/AddItemForm';
import ItemDetail from './components/ItemDetail';
import ScannerView from './components/ScannerView';
import LogEventModal from './components/LogEventModal';
import Button from './components/Button';
import { PlusIcon, QrCodeIcon } from './components/icons';

type View = 'list' | 'addItem' | 'detail' | 'scanner';

const ITEMS_PER_PAGE = 20;

const App: React.FC = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // New error state
    const [currentView, setCurrentView] = useState<View>('list');
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [itemToLog, setItemToLog] = useState<Item | null>(null);
    
    // Pagination & Search State
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            loadData(true);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadData = async (reset = false) => {
        try {
            if (reset) {
                setLoading(true);
                setError(null); // Clear previous errors on retry
                setPage(0);
            } else {
                setLoadingMore(true);
            }

            const currentPage = reset ? 0 : page;
            const offset = currentPage * ITEMS_PER_PAGE;
            
            const { items: newItems, total } = await searchItems(searchTerm, ITEMS_PER_PAGE, offset);
            
            if (reset) {
                setItems(newItems);
            } else {
                setItems(prev => [...prev, ...newItems]);
            }
            
            setHasMore(offset + newItems.length < total);
        } catch (err: any) {
            console.error("Failed to load inventory:", err);
            // Only set global error if we are doing a full reload/initial load
            if (reset) {
                setError(err.message || "Failed to connect to the database.");
            }
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
    };

    // Effect to trigger load when page changes (but not on initial 0 reset which is handled by search effect)
    useEffect(() => {
        if (page > 0) {
            loadData(false);
        }
    }, [page]);

    const handleAddItem = async (newItemData: Omit<Item, 'id' | 'events' | 'createdAt' | 'currentQuantity'> & { initialQuantity: number }) => {
        const timestamp = new Date().toISOString();
        const initialEvent: Event = {
            id: crypto.randomUUID(),
            type: EventType.RECEIVE,
            quantity: newItemData.initialQuantity,
            timestamp,
            notes: 'Initial stock',
        };

        const newItem: Item = {
            id: crypto.randomUUID(),
            name: newItemData.name,
            brand: newItemData.brand,
            sku: newItemData.sku,
            itemType: newItemData.itemType,
            currentQuantity: newItemData.initialQuantity,
            location: newItemData.location,
            description: newItemData.description,
            events: [initialEvent],
            createdAt: timestamp,
        };

        try {
            await createItemInDB(newItem);
            setSearchTerm(''); // Reset search
            loadData(true); // Reload list
            setCurrentView('list');
        } catch (error) {
            alert("Failed to save item to database.");
        }
    };

    const handleSelectItem = async (item: Item) => {
        setLoading(true);
        try {
            // Fetch full details including history
            const fullItem = await getItemDetails(item.id);
            setSelectedItem(fullItem || item); // Fallback to list item if detail fetch fails
            setCurrentView('detail');
        } catch (e) {
            console.error("Failed to fetch item details", e);
            alert("Could not load item details");
        } finally {
            setLoading(false);
        }
    };

    const handleBackToList = () => {
        setSelectedItem(null);
        setCurrentView('list');
        setScanError(null);
    };
    
    const handleScan = async (itemId: string) => {
        try {
            // We need to fetch from DB to verify it exists and get details
            const item = await getItemDetails(itemId);
            if (item) {
                setItemToLog(item);
                setIsLogModalOpen(true);
                setScanError(null);
            } else {
                setScanError('Item ID not found. Please check the ID and try again.');
            }
        } catch (e) {
            setScanError('Error scanning item.');
        }
    };
    
    const handleLogEvent = async (item: Item, eventData: Omit<Event, 'id' | 'timestamp'>) => {
        const newEvent: Event = {
            ...eventData,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
        };

        let newQuantity = item.currentQuantity;
        if (eventData.type === EventType.RECEIVE) {
            newQuantity += eventData.quantity;
        } else {
            newQuantity -= eventData.quantity;
        }
        
        const finalQuantity = Math.max(0, newQuantity);

        try {
            await logEventInDB(item.id, newEvent, finalQuantity);
            
            // Update local state to reflect change immediately
            if (selectedItem?.id === item.id) {
                const updatedItem = await getItemDetails(item.id);
                setSelectedItem(updatedItem);
            }
            
            // Update the item in the main list if it exists there
            setItems(prevItems => prevItems.map(i => 
                i.id === item.id ? { ...i, currentQuantity: finalQuantity } : i
            ));

            setIsLogModalOpen(false);
            setItemToLog(null);
            
            // After logging, if we came from scanner view, go back to list
            if (currentView === 'scanner') {
                setCurrentView('list');
            }
        } catch (error) {
            alert("Failed to log event to database.");
        }
    };

    const renderView = () => {
        if (loading && items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-gray-500">Loading Database...</p>
                </div>
            );
        }

        // Display Error Screen if backend is unreachable
        if (error && items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-96 p-4 text-center">
                    <div className="bg-red-100 rounded-full p-4 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Connection Failed</h3>
                    <p className="mt-2 text-gray-600 max-w-md">
                        Could not connect to the warehouse database. 
                    </p>
                    <p className="mt-1 text-sm text-red-500 bg-red-50 px-2 py-1 rounded border border-red-100 mb-6">
                        {error}
                    </p>
                    <Button onClick={() => loadData(true)}>Retry Connection</Button>
                    <div className="mt-8 text-xs text-gray-400 border-t pt-4 w-full max-w-md">
                        <p>Troubleshooting:</p>
                        <ul className="list-disc text-left pl-5 mt-1 space-y-1">
                            <li>Ensure <code>api.php</code> is uploaded to the root folder of your web host.</li>
                            <li>Check that your server supports PHP and SQLite3.</li>
                            <li>Ensure the folder is writable so the DB file can be created.</li>
                        </ul>
                    </div>
                </div>
            );
        }

        switch (currentView) {
            case 'addItem':
                return <AddItemForm onAddItem={handleAddItem} onBack={handleBackToList} />;
            case 'detail':
                return selectedItem && <ItemDetail item={selectedItem} onBack={handleBackToList} />;
            case 'scanner':
                return <ScannerView onScan={handleScan} onBack={handleBackToList} scanError={scanError} />;
            case 'list':
            default:
                return (
                    <div className="p-4 md:p-6">
                        <div className="flex justify-end space-x-2 mb-4">
                            <Button variant="secondary" onClick={() => setCurrentView('scanner')}>
                                <QrCodeIcon className="w-5 h-5 mr-2" />
                                Scan & Log Event
                            </Button>
                            <Button onClick={() => setCurrentView('addItem')}>
                                <PlusIcon className="w-5 h-5 mr-2" />
                                Add New Item
                            </Button>
                        </div>
                        <ItemList 
                            items={items} 
                            onSelectItem={handleSelectItem} 
                            searchTerm={searchTerm}
                            onSearch={setSearchTerm}
                            hasMore={hasMore}
                            onLoadMore={handleLoadMore}
                            loadingMore={loadingMore}
                        />
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <Header title="Warehouse Management" />
            <main className="max-w-4xl mx-auto">
                {renderView()}
            </main>
            <LogEventModal 
                item={itemToLog}
                isOpen={isLogModalOpen}
                onClose={() => {
                    setIsLogModalOpen(false);
                    setItemToLog(null);
                }}
                onLogEvent={handleLogEvent}
            />
        </div>
    );
};

export default App;
