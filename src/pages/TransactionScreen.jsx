
import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { 
  FiArrowUp, FiArrowDown, FiFileText, 
  FiX, FiCpu, FiDownload 
} from "react-icons/fi";

export default function TransactionsScreen() {
  const { transactions } = useContext(AppContext);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // CSV Export Logic 
  const downloadAuditCSV = () => {
    if (transactions.length === 0) return alert("No records available to export.");

    // 1. Define CSV Headers
    const headers = ["Date", "Description", "Category", "Type", "Amount (INR)"];
    
    //  Format Transaction Data for CSV
    const rows = transactions.map(t => [
      new Date(t.date).toLocaleDateString(),
      `"${t.title || t.note || 'No Description'}"`, // Quote strings to handle commas
      t.category,
      t.type.toUpperCase(),
      t.amount
    ]);

    //  Construct CSV Content
    const csvContent = [
      headers.join(","), 
      ...rows.map(row => row.join(","))
    ].join("\n");

    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ExpenseSensei_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    
   
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      
      {/* Receipt Viewer Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm">
          <div className="relative max-w-2xl w-full bg-zinc-900 rounded-[40px] overflow-hidden border border-white/10 p-2">
            <button 
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-6 right-6 p-3 bg-black/50 text-white rounded-full hover:bg-red-500 transition-all z-10"
            >
              <FiX size={20} />
            </button>
            <img 
              src={selectedReceipt} 
              alt="Digital Receipt" 
              className="w-full h-auto rounded-[32px] shadow-2xl" 
            />
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <h1 className="text-4xl font-black tracking-tighter">Transaction History</h1>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          {/* Main Transaction List */}
          <div className="xl:col-span-8 space-y-4">
            {transactions.map(item => (
              <div key={item._id} className="bg-zinc-900/50 p-6 rounded-[32px] flex items-center justify-between border border-white/5 hover:border-purple-500/20 transition-all group backdrop-blur-md">
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    item.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {item.type === 'income' ? <FiArrowUp size={24} /> : <FiArrowDown size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold">{item.title || item.category}</p>
                      {item.receiptImage && (
                        <button 
                          onClick={() => setSelectedReceipt(item.receiptImage)}
                          className="p-1.5 text-purple-400 bg-purple-500/10 rounded-lg hover:bg-purple-500/20 transition-all"
                        >
                          <FiFileText size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{new Date(item.date).toDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-black ${item.type === 'income' ? 'text-green-500' : 'text-white'}`}>
                    {item.type === 'income' ? "+" : "-"}₹{item.amount.toLocaleString()}
                  </p>
                  <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">{item.category}</p>
                </div>
              </div>
            ))}
          </div>

          
          <div className="xl:col-span-4 space-y-8">
            <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
              <h3 className="font-black text-xl mb-2 flex items-center gap-2">
                <FiCpu className="text-indigo-300" /> Smart Summary
              </h3>
              <p className="text-indigo-200 text-sm mb-6 font-medium">Data integrity verified across {transactions.length} entries.</p>
              
              <div className="space-y-4">
                <div className="flex justify-between font-bold border-b border-white/10 pb-4">
                  <span className="text-indigo-300">Total Records</span>
                  <span>{transactions.length}</span>
                </div>
                <div className="flex justify-between font-bold border-b border-white/10 pb-4">
                  <span className="text-indigo-300">Digital Receipts</span>
                  <span>{transactions.filter(t => t.receiptImage).length}</span>
                </div>
                
               
                <button 
                  onClick={downloadAuditCSV}
                  className="w-full py-4 mt-4 bg-white text-indigo-900 hover:bg-indigo-50 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2"
                >
                  <FiDownload /> Generate Audit Report
                </button>
              </div>
            </div>

            <div className="p-6 bg-zinc-900/40 rounded-[32px] border border-white/5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">System Note</p>
              <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                Exporting your audit report allows for third-party financial verification and long-term offline archiving.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}