
import React, { useState } from 'react';
import { QrCodeIcon, SearchIcon, ChevronLeftIcon } from './icons';
import Button from './Button';

interface ScannerViewProps {
  onScan: (id: string) => void;
  onBack: () => void;
  scanError: string | null;
}

const ScannerView: React.FC<ScannerViewProps> = ({ onScan, onBack, scanError }) => {
  const [itemId, setItemId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemId.trim()) {
      onScan(itemId.trim());
    }
  };

  return (
    <div className="p-4 md:p-6">
       <button onClick={onBack} className="flex items-center text-sm text-primary hover:underline mb-4">
          <ChevronLeftIcon className="w-4 h-4 mr-1"/>
          Back to Item List
       </button>
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
        <div className="text-center">
            <QrCodeIcon className="mx-auto h-12 w-12 text-primary"/>
            <h2 className="mt-2 text-lg font-medium text-gray-900">Scan Item QR Code</h2>
            <p className="mt-1 text-sm text-gray-500">
                Use your device's QR scanner, then paste the Item ID below to log an event.
            </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6">
            <div className="relative">
                <input
                    type="text"
                    value={itemId}
                    onChange={(e) => setItemId(e.target.value)}
                    placeholder="Paste Item ID here..."
                    className="block w-full pl-4 pr-12 py-3 text-lg border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    aria-label="Item ID"
                />
                <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                    <button type="submit" className="inline-flex items-center border border-gray-200 rounded px-2 text-sm font-sans font-medium text-gray-400 hover:bg-gray-50">
                        <SearchIcon className="w-5 h-5"/>
                    </button>
                </div>
            </div>
            {scanError && <p className="mt-2 text-sm text-red-600 text-center">{scanError}</p>}
            <Button type="submit" className="w-full mt-4">Find Item & Log Event</Button>
        </form>
      </div>
    </div>
  );
};

export default ScannerView;
