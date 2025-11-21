
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Item } from '../types';

interface PrintableQRCodeProps {
  item: Item;
  printableRef?: React.RefObject<HTMLDivElement>;
}

const PrintableQRCode: React.FC<PrintableQRCodeProps> = ({ item, printableRef }) => {
  return (
    <div ref={printableRef} className="w-[400px] bg-white p-6 border-4 border-black flex flex-col items-center justify-center text-center mx-auto box-border">
        <div className="w-full border-b-4 border-black pb-2 mb-4">
            <h2 className="text-2xl font-extrabold text-black uppercase tracking-tight">{item.brand}</h2>
            <p className="text-xs text-gray-600 font-mono uppercase tracking-widest">Inventory Control</p>
        </div>
        
        <div className="w-full mb-4 text-left">
             <p className="text-[10px] uppercase font-bold text-gray-500">Item Name</p>
             <h3 className="text-xl font-bold text-black leading-tight">{item.name}</h3>
        </div>

        <div className="w-full grid grid-cols-2 gap-4 mb-4 text-left">
             <div>
                <p className="text-[10px] uppercase font-bold text-gray-500">SKU</p>
                <p className="font-mono font-bold text-lg text-black">{item.sku}</p>
             </div>
             <div>
                <p className="text-[10px] uppercase font-bold text-gray-500">Location</p>
                <p className="font-bold text-black">{item.location || 'N/A'}</p>
             </div>
             <div>
                <p className="text-[10px] uppercase font-bold text-gray-500">Type</p>
                <p className="font-bold text-black">{item.itemType}</p>
             </div>
             <div>
                <p className="text-[10px] uppercase font-bold text-gray-500">Date Added</p>
                <p className="font-bold text-black">{new Date(item.createdAt).toLocaleDateString()}</p>
             </div>
        </div>
        
        {item.description && (
            <div className="w-full mb-4 text-left border-t border-dashed border-gray-300 pt-2">
                 <p className="text-[10px] uppercase font-bold text-gray-500">Description</p>
                 <p className="text-xs text-gray-800 line-clamp-2">{item.description}</p>
            </div>
        )}

        <div className="p-2 border-2 border-black rounded mb-2">
          <QRCodeSVG
            value={item.id}
            size={140}
            level={"M"}
            includeMargin={false}
          />
        </div>
        
        <div className="w-full mt-2">
            <p className="text-[10px] font-mono text-center text-gray-500">{item.id}</p>
            <div className="flex items-center justify-center space-x-2 mt-1">
                 <span className="text-xs font-bold text-black tracking-widest">AME.VN</span>
            </div>
        </div>
    </div>
  );
};

export default PrintableQRCode;
