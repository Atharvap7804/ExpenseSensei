// pages/AddTransaction.jsx
import React, { useState, useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { FiUploadCloud, FiArrowLeft, FiZap, FiLoader, FiCpu } from "react-icons/fi";
import api from "../services/api";

export default function AddTransaction() {
  const { addTransaction, updateBudgetLimit, activeGoal, contributeToGoal, fetchData } = useContext(AppContext);
  const navigate = useNavigate();

  const [type, setType] = useState("expense");
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [receiptImage, setReceiptImage] = useState(null); 
  const [isScanning, setIsScanning] = useState(false);
  const [isCategorizing, setIsCategorizing] = useState(false);
  const [limitInput, setLimitInput] = useState("");
  const [deductEMI, setDeductEMI] = useState(false);

  const handleAutoCategorize = async (inputText) => {
    if (!inputText || inputText.length < 3 || type === "income") return;
    setIsCategorizing(true);
    try {
      const res = await api.post("/api/ai/categorize", { text: inputText });
      if (res.data.success) setCategory(res.data.category); 
    } catch (err) {
      console.error("AI Categorization failed");
    } finally {
      setIsCategorizing(false);
    }
  };

  const handleScan = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      setIsScanning(true);
      try {
        const res = await api.post("/api/ocr/extract", { image: reader.result });
        if (res.data.success) {
          const { amount, merchant, category, receiptImage } = res.data.data;
          setAmount(amount || "");
          setMerchant(merchant || "");
          setCategory(category || "");
          setReceiptImage(receiptImage);
        }
      } catch (err) {
        alert("OCR failed.");
      } finally {
        setIsScanning(false);
      }
    };
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!amount) return alert("Amount is required");
    const isManualGoalMatch = activeGoal && category.trim().toLowerCase() === activeGoal.title.toLowerCase();
    const finalCategory = type === "income" ? "Income" : (isManualGoalMatch ? "Goal Contribution" : category || "Other");
    const finalNote = type === "income" ? note : (isManualGoalMatch ? `Manual add to ${activeGoal.title}` : merchant || note);

    const success = await addTransaction(amount, finalCategory, finalNote, type, receiptImage);
    if (success) {
      if (type === "income") {
        if (limitInput) await updateBudgetLimit(limitInput);
        if ((deductEMI || isManualGoalMatch) && activeGoal) {
          const contributionAmount = isManualGoalMatch ? parseFloat(amount) : activeGoal.installment;
          await contributeToGoal(activeGoal._id, contributionAmount);
        }
      } else if (type === "expense" && isManualGoalMatch) {
        await contributeToGoal(activeGoal._id, parseFloat(amount));
      }
      await fetchData();
      navigate("/transactions"); 
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-8">

      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>

      <div className="max-w-[1100px] mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-6 font-black text-[10px] uppercase tracking-widest">
          <FiArrowLeft /> Back to Workspace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
          <div className="lg:col-span-4">
            <h1 className="text-4xl font-black tracking-tighter mb-2">Add Entry</h1>
            <p className="text-zinc-500 mb-6 text-sm">Sync with your AI Sensei.</p>
            
            <div className="bg-zinc-900/50 p-8 rounded-[40px] border border-white/5 flex flex-col items-center text-center relative overflow-hidden">
              {receiptImage && <img src={receiptImage} alt="Scanned" className="absolute inset-0 w-full h-full object-cover opacity-10" />}
              <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 z-10">
                {isScanning ? <FiLoader className="animate-spin text-white" /> : <FiUploadCloud className="text-zinc-500" />}
              </div>
              <label htmlFor="file-upload" className="bg-zinc-800 hover:bg-zinc-700 px-8 py-3 rounded-xl font-black cursor-pointer transition-all uppercase text-[10px] tracking-widest z-10">
                {receiptImage ? "Rescan" : "Select Image"}
              </label>
              <input type="file" id="file-upload" className="hidden" onChange={handleScan} disabled={isScanning} />
            </div>
          </div>

          
          <div className="lg:col-span-8 bg-zinc-900 p-8 md:p-10 rounded-[48px] border border-white/5 shadow-2xl">
            <div className="flex bg-black p-1.5 rounded-2xl mb-10 w-fit">
              <button type="button" onClick={() => setType("expense")} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${type === "expense" ? 'bg-red-500 text-white' : 'text-zinc-600'}`}>Expense</button>
              <button type="button" onClick={() => setType("income")} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${type === "income" ? 'bg-green-500 text-white' : 'text-zinc-600'}`}>Income</button>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
              <div>
                <label className="text-[10px] uppercase font-black text-zinc-600 tracking-widest mb-3 block">Amount (₹)</label>
                <input 
                  type="number" 
                  required 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  className="w-full bg-black text-5xl font-black p-6 rounded-[28px] outline-none focus:ring-2 focus:ring-purple-500/20 border-none placeholder-zinc-900" 
                  placeholder="0.00" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {type === "expense" ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-black text-zinc-600 tracking-widest">Merchant</label>
                      <input type="text" value={merchant} onChange={(e) => setMerchant(e.target.value)} onBlur={() => handleAutoCategorize(merchant)} className="w-full bg-black p-4 rounded-xl outline-none border border-white/5 text-sm" placeholder="e.g. Amazon" />
                    </div>
                    <div className="space-y-2 relative">
                      <label className="text-[9px] uppercase font-black text-zinc-600 tracking-widest flex justify-between">
                        Category {isCategorizing && <FiLoader className="animate-spin text-purple-500" />}
                      </label>
                      <div className="relative">
                        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-black p-4 rounded-xl outline-none border border-white/5 text-sm pr-10" placeholder="e.g. Food" />
                        {category && !isCategorizing && <FiCpu className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500/30" />}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-black text-zinc-600 tracking-widest">Source</label>
                      <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-black p-4 rounded-xl outline-none border border-white/5 text-sm" placeholder="e.g. Salary" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] uppercase font-black text-zinc-600 tracking-widest">Monthly Limit</label>
                      <input type="number" value={limitInput} onChange={(e) => setLimitInput(e.target.value)} className="w-full bg-black p-4 rounded-xl outline-none border border-white/5 text-sm" placeholder="Set Limit" />
                    </div>
                  </>
                )}
              </div>

              <button className="w-full bg-white text-black py-5 rounded-[24px] font-black text-lg hover:bg-zinc-200 transition-all uppercase tracking-widest">
                Confirm {type}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}