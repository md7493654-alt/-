import { useState } from 'react';
import React from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { AppUser } from '../types';
import { useNavigate } from 'react-router-dom';
import { Upload, AlertCircle } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Fashion', 'Home & Living', 'Mobile & Tablets', 'Vehicles', 'Other'];

export default function Sell({ appUser }: { appUser: AppUser }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appUser.isVerified) {
      alert("নিবন্ধিত সেলার হিসেবে পণ্য বিক্রি করতে আপনার অ্যাকাউন্ট ভেরিফাই করুন।");
      navigate('/profile');
      return;
    }

    setLoading(true);
    const path = 'products';
    try {
      await addDoc(collection(db, path), {
        ...formData,
        price: parseFloat(formData.price),
        sellerId: appUser.uid,
        status: 'pending',
        images: [formData.imageUrl],
        createdAt: serverTimestamp(),
      });
      alert("পণ্যটি সাফল্যের সাথে জমা দেয়া হয়েছে। অ্যাডমিন অ্যাপ্রুভ করলে এটি লাইভ হবে।");
      navigate('/');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-[#222]">
        <h2 className="text-3xl font-bold text-[#f5c542] mb-2 font-['Noto_Sans_Bengali']">নতুন পণ্য যোগ করুন</h2>
        <p className="text-gray-400 mb-8 text-sm">আপনার পণ্যের সঠিক তথ্য দিন যাতে ক্রেতারা দ্রুত পছন্দ করতে পারে।</p>

        {!appUser.isVerified && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl mb-8 flex items-start gap-3">
            <AlertCircle className="text-yellow-500 shrink-0 w-6 h-6" />
            <div>
              <p className="text-yellow-500 font-bold">অ্যাকাউন্ট ভেরিফিকেশন প্রয়োজন</p>
              <p className="text-sm text-yellow-500/80">পণ্য বিক্রি শুরু করতে প্রোফাইল পেজে গিয়ে NID/Passport দিয়ে ভেরিফাই করুন।</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">পণ্যের নাম (Product Name)</label>
            <input
              required
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-[#222] border border-[#333] rounded-xl p-3 focus:outline-none focus:border-[#f5c542]"
              placeholder="উদাঃ iPhone 13 Pro Max"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">মূল্য (Price in ৳)</label>
              <input
                required
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: e.target.value })}
                className="w-full bg-[#222] border border-[#333] rounded-xl p-3 focus:outline-none focus:border-[#f5c542]"
                placeholder="25,000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">ক্যাটাগরি (Category)</label>
              <select
                required
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#222] border border-[#333] rounded-xl p-3 focus:outline-none focus:border-[#f5c542]"
              >
                <option value="">নির্বাচন করুন</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">পণ্যের বিবরণ (Description)</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#222] border border-[#333] rounded-xl p-3 focus:outline-none focus:border-[#f5c542]"
              placeholder="পণ্যের অবস্থা, কতদিন ব্যবহার করেছেন ইত্যাদি বিস্তারিত লিখুন..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400">ছবির লিঙ্ক (Image URL - for demo)</label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                required
                type="url"
                value={formData.imageUrl}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full bg-[#222] border border-[#333] rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#f5c542]"
                placeholder="https://images.unsplash.com/..."
              />
            </div>
            <p className="text-xs text-gray-500 italic">* বর্তমানে শুধুমাত্র ইমেজ লিঙ্ক সাপোর্ট করা হচ্ছে। শীঘ্রই ডিরেক্ট আপলোড সুবিধা আসছে।</p>
          </div>

          <button
            disabled={loading || !appUser.isVerified}
            className="w-full bg-[#f5c542] text-black py-4 rounded-xl font-bold text-lg hover:bg-[#e6b83b] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
          >
            {loading ? 'প্রসেসিং হচ্ছে...' : 'পণ্য হোস্ট করুন'}
          </button>
        </form>
      </div>
    </div>
  );
}
