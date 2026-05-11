import { useState } from 'react';
import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppUser } from '../types';
import { motion } from 'motion/react';
import { CheckCircle2, ShieldAlert, User, Mail, CreditCard, Upload } from 'lucide-react';

export default function Profile({ appUser }: { appUser: AppUser }) {
  const [loading, setLoading] = useState(false);
  const [verificationData, setVerificationData] = useState({
    nid: appUser.nid || '',
    idPhotoURL: appUser.idPhotoURL || '',
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userRef = doc(db, 'users', appUser.uid);
      await updateDoc(userRef, {
        nid: verificationData.nid,
        idPhotoURL: verificationData.idPhotoURL,
        // In a real app, this would be set by admin after manual review
        // For this demo, we'll auto-verify IF both fields are present
        isVerified: !!(verificationData.nid && verificationData.idPhotoURL),
        role: 'seller'
      });
      alert("তথ্য জমা হয়েছে। সেলার হিসেবে ভেরিফাই করা হয়েছে।");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1 space-y-6">
        <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-[#222] text-center">
          <div className="relative inline-block mb-4">
            <img 
              src={appUser.photoURL || `https://ui-avatars.com/api/?name=${appUser.displayName}&background=f5c542&color=000`} 
              className="w-24 h-24 rounded-full border-4 border-[#222]" 
            />
            {appUser.isVerified && (
              <div className="absolute bottom-0 right-0 bg-[#f5c542] p-1 rounded-full border-2 border-[#1a1a1a]">
                <CheckCircle2 className="text-black w-4 h-4" />
              </div>
            )}
          </div>
          <h2 className="text-xl font-bold">{appUser.displayName}</h2>
          <p className="text-gray-500 text-sm mb-4">{appUser.email}</p>
          <div className="inline-block px-3 py-1 bg-[#222] rounded-full text-xs font-semibold text-[#f5c542] uppercase tracking-wider">
            {appUser.role}
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#222]">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <ShieldAlert className="text-[#f5c542] w-5 h-5" />
            অ্যাকাউন্ট স্ট্যাটাস
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">ইমেইল ভেরিফাইড:</span>
              <span className="text-green-500">হ্যাঁ</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">সেলার ভেরিফাইড:</span>
              <span className={appUser.isVerified ? 'text-green-500' : 'text-yellow-500'}>
                {appUser.isVerified ? 'হ্যাঁ' : 'না'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="bg-[#1a1a1a] p-8 rounded-3xl border border-[#222]">
          <h2 className="text-2xl font-bold mb-6 font-['Noto_Sans_Bengali']">ইউজার ভেরিফিকেশন (NID/Passport)</h2>
          
          {appUser.isVerified ? (
            <div className="bg-green-500/10 border border-green-500/50 p-6 rounded-2xl text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-500 mb-2">আপনার অ্যাকাউন্ট ভেরিফাইড!</h3>
              <p className="text-gray-400">আপনি এখন যেকোনো পণ্য লিস্ট করতে পারবেন।</p>
            </div>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    required
                    type="text"
                    placeholder="NID অথবা পাসপোর্ট নম্বর"
                    value={verificationData.nid}
                    onChange={e => setVerificationData({...verificationData, nid: e.target.value})}
                    className="w-full bg-[#222] border border-[#333] rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#f5c542]"
                  />
                </div>

                <div className="relative">
                  <Upload className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    required
                    type="url"
                    placeholder="ID কার্ডের ছবির লিঙ্ক (ID Card Photo URL)"
                    value={verificationData.idPhotoURL}
                    onChange={e => setVerificationData({...verificationData, idPhotoURL: e.target.value})}
                    className="w-full bg-[#222] border border-[#333] rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-[#f5c542]"
                  />
                </div>
              </div>

              <div className="bg-[#222] p-4 rounded-xl text-sm text-gray-400">
                <p><b>কেন ভেরিফিকেশন প্রয়োজন?</b></p>
                <p>কেনা কাঁটা একটি নিরাপদ মার্কেটপ্লেস। সেলারদের পরিচয় নিশ্চিত করার মাধ্যমে ক্রেতাদের নিরাপত্তা বজায় রাখা হয়।</p>
              </div>

              <button
                disabled={loading}
                className="w-full bg-[#f5c542] text-black py-4 rounded-xl font-bold hover:bg-[#e6b83b] transition-all transform active:scale-95"
              >
                {loading ? 'প্রসেসিং হচ্ছে...' : 'ভেরিফিকেশন রিকোয়েস্ট পাঠান'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
