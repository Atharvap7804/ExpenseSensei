import React, { useState } from 'react';
import { FiCamera, FiLoader, FiCheckCircle } from 'react-icons/fi';
import api from '../services/api';

export default function ReceiptScanner({ onScanSuccess }) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setLoading(true);
      try {
        const res = await api.post("/api/ocr/scan", { image: reader.result });
        if (res.data.success) {
          onScanSuccess(res.data.transaction);
        }
      } catch (err) {
        alert("OCR failed to read receipt. Please enter manually.");
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="w-full p-10 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/10 hover:border-purple-500/50 transition-all text-center">
      <input type="file" accept="image/*" id="receiptInput" className="hidden" onChange={handleFile} />
      <label htmlFor="receiptInput" className="cursor-pointer flex flex-col items-center">
        {loading ? (
          <>
            <FiLoader className="text-purple-500 animate-spin mb-4" size={32} />
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Analyzing Receipt...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-600/20">
              <FiCamera size={24} className="text-white" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-white mb-2">Scan Receipt</p>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Drop Image or Click to Upload</p>
          </>
        )}
      </label>
    </div>
  );
}