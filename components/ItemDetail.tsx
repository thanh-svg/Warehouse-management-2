import React, { useRef } from 'react';
import { Item, Event, EventType } from '../types';
import { ChevronLeftIcon, PrintIcon } from './icons';
import Button from './Button';
import PrintableQRCode from './PrintableQRCode';

interface ItemDetailProps {
  item: Item;
  onBack: () => void;
}

const EventTypeBadge: React.FC<{ type: EventType }> = ({ type }) => {
    const colorClasses = {
        [EventType.RECEIVE]: 'bg-green-100 text-green-800',
        [EventType.SELL]: 'bg-blue-100 text-blue-800',
        [EventType.LEND]: 'bg-yellow-100 text-yellow-800',
        [EventType.WARRANTY]: 'bg-red-100 text-red-800',
    };
    return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses[type]}`}>{type}</span>;
}

const ItemDetail: React.FC<ItemDetailProps> = ({ item, onBack }) => {
    const printableRef = useRef<HTMLDivElement>(null);

    const handlePrint = () => {
        const printContent = printableRef.current;
        if (printContent) {
            const printWindow = window.open('', '', 'height=600,width=800');
            if (printWindow) {
                printWindow.document.write('<html><head><title>Print QR Code</title>');
                printWindow.document.write('<script src="https://cdn.tailwindcss.com"><\/script>');
                printWindow.document.write('</head><body >');
                printWindow.document.write('<div class="p-10 flex justify-center items-center h-screen">');
                printWindow.document.write(printContent.innerHTML);
                printWindow.document.write('</div>');
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => { // allow content to load
                    printWindow.print();
                    printWindow.close();
                }, 250);
            }
        }
    };
    
  return (
    <div className="p-4 md:p-6">
        <div className="hidden">
            <PrintableQRCode item={item} printableRef={printableRef} />
        </div>
        <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4">
            <ChevronLeftIcon className="w-4 h-4 mr-1"/>
            Back to Item List
        </button>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="md:flex md:justify-between md:items-start">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
            </div>
            <div className="mt-4 md:mt-0 flex-shrink-0">
                <Button onClick={handlePrint} variant="ghost">
                    <PrintIcon className="w-5 h-5 mr-2" />
                    Print QR Code
                </Button>
            </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Item Details</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4 text-sm">
                    <div className="sm:col-span-1">
                        <dt className="font-medium text-gray-500">Brand</dt>
                        <dd className="mt-1 text-gray-900">{item.brand}</dd>
                    </div>
                    <div className="sm:col-span-1">
                        <dt className="font-medium text-gray-500">Item Type</dt>
                        <dd className="mt-1 text-gray-900">{item.itemType}</dd>
                    </div>
                    <div className="sm:col-span-1">
                        <dt className="font-medium text-gray-500">Current Quantity</dt>
                        <dd className="mt-1 text-2xl font-bold text-primary">{item.currentQuantity}</dd>
                    </div>
                    <div className="sm:col-span-1">
                        <dt className="font-medium text-gray-500">Location</dt>
                        <dd className="mt-1 text-gray-900">{item.location || 'N/A'}</dd>
                    </div>
                     <div className="sm:col-span-2">
                        <dt className="font-medium text-gray-500">Description</dt>
                        <dd className="mt-1 text-gray-900">{item.description || 'No description provided.'}</dd>
                    </div>
                </dl>
            </div>
            <div className="flex justify-center items-center p-4 border rounded-lg bg-gray-50">
               <div className="text-center">
                <PrintableQRCode item={item} />
               </div>
            </div>
        </div>
        
        <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Event History</h2>
            <div className="mt-4 flow-root">
                <ul role="list" className="-mb-8">
                    {item.events.length > 0 ? [...item.events].reverse().map((event, eventIdx) => (
                        <li key={event.id}>
                            <div className="relative pb-8">
                            {eventIdx !== item.events.length - 1 ? (
                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                                    <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13.25a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V4.75z" clipRule="evenodd" />
                                    </svg>
                                </span>
                                </div>
                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                    <p className="text-sm text-gray-500">
                                        <EventTypeBadge type={event.type} />
                                        <span className="font-bold text-gray-900 ml-2">
                                            {event.type === EventType.RECEIVE ? '+' : '-'}{event.quantity}
                                        </span>
                                    </p>
                                    {event.notes && <p className="text-sm text-gray-600 mt-1">{event.notes}</p>}
                                </div>
                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                    <time dateTime={event.timestamp}>{new Date(event.timestamp).toLocaleString()}</time>
                                </div>
                                </div>
                            </div>
                            </div>
                        </li>
                    )) : (
                        <p className="text-sm text-gray-500">No events logged for this item yet.</p>
                    )}
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetail;
