import React, { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Item, Event, EventType } from './types';
import Header from './components/Header';
import ItemList from './components/ItemList';
import AddItemForm from './components/AddItemForm';
import ItemDetail from './components/ItemDetail';
import ScannerView from './components/ScannerView';
import LogEventModal from './components/LogEventModal';
import Button from './components/Button';
import { PlusIcon, QrCodeIcon } from './components/icons';

type View = 'list' | 'addItem' | 'detail' | 'scanner';

const App: React.FC = () => {
    const [items, setItems] = useLocalStorage<Item[]>('warehouse-items', []);
    const [currentView, setCurrentView] = useState<View>('list');
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [scanError, setScanError] = useState<string | null>(null);
    const [isLogModalOpen, setIsLogModalOpen] = useState(false);
    const [itemToLog, setItemToLog] = useState<Item | null>(null);

    const handleAddItem = (newItemData: Omit<Item, 'id' | 'events' | 'createdAt' | 'currentQuantity'> & { initialQuantity: number }) => {
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

        setItems([...items, newItem]);
        setCurrentView('list');
    };

    const handleSelectItem = (item: Item) => {
        setSelectedItem(item);
        setCurrentView('detail');
    };

    const handleBackToList = () => {
        setSelectedItem(null);
        setCurrentView('list');
        setScanError(null);
    };
    
    const handleScan = (itemId: string) => {
        const foundItem = items.find(item => item.id === itemId);
        if (foundItem) {
            setItemToLog(foundItem);
            setIsLogModalOpen(true);
            setScanError(null);
        } else {
            setScanError('Item ID not found. Please check the ID and try again.');
        }
    };
    
    const handleLogEvent = (item: Item, eventData: Omit<Event, 'id' | 'timestamp'>) => {
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
        
        const updatedItem = {
            ...item,
            currentQuantity: Math.max(0, newQuantity),
            events: [...item.events, newEvent],
        };

        const updatedItems = items.map(i => (i.id === item.id ? updatedItem : i));
        setItems(updatedItems);
        
        if (selectedItem?.id === item.id) {
            setSelectedItem(updatedItem);
        }
        
        setIsLogModalOpen(false);
        setItemToLog(null);
        // After logging, if we came from scanner view, go back to list
        if (currentView === 'scanner') {
            setCurrentView('list');
        }
    };

    const renderView = () => {
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
                        <ItemList items={items} onSelectItem={handleSelectItem} />
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
