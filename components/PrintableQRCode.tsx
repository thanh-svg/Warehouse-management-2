import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Item } from '../types';

interface PrintableQRCodeProps {
  item: Item;
  printableRef?: React.RefObject<HTMLDivElement>;
}

const PrintableQRCode: React.FC<PrintableQRCodeProps> = ({ item, printableRef }) => {
  return (
    <div ref={printableRef} className="p-4 border-2 border-dashed border-gray-400 rounded-lg text-center bg-white">
        <h3 className="text-xl font-bold text-gray-800">{item.name}</h3>
        <p className="text-sm text-gray-600">SKU: {item.sku}</p>
        <div className="my-4 inline-block">
          <QRCodeSVG
            value={item.id}
            size={160}
            level={"H"}
            includeMargin={true}
          />
        </div>
        <p className="text-xs text-gray-500 font-mono">ID: {item.id}</p>
        <p className="text-sm font-semibold text-primary mt-2">ame.vn - Warehouse</p>
    </div>
  );
};

export default PrintableQRCode;
