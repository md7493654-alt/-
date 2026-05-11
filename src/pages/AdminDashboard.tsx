import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, AppUser } from '../types';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, UserCheck, Package, ExternalLink, ShieldAlert } from 'lucide-react';

export default function AdminDashboard() {
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Pending Products
      const prodQ = query(collection(db, 'products'), where('status', '==', 'pending'));
      const prodSnap = await getDocs(prodQ);
      setPendingProducts(prodSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[]);

      // Fetch Unverified Users who have submitted NID
      const userQ = query(
        collection(db, 'users'), 
        where('isVerified', '==', false),
        where('role', '==', 'seller')
      );
      const userSnap = await getDocs(userQ);
      setUnverifiedUsers(userSnap.docs.map(d => ({ uid: d.id, ...d.data() })) as AppUser[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveProduct = async (id: string) => {
    try {
      await updateDoc(doc(db, 'products', id), { status: 'approved' });
      fetchData();
    } catch (error) {
      alert("Error approving product");
    }
  };

  const handleRejectProduct = async (id: string) => {
    try {
      await updateDoc(doc(db, 'products', id), { status: 'rejected' });
      fetchData();
    } catch (error) {
      alert("Error rejecting product");
    }
  };

  const handleVerifyUser = async (uid: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { isVerified: true });
      fetchData();
    } catch (error) {
      alert("Error verifying user");
    }
  };

  if (loading) return <div className="text-center py-20">অ্যাডমিন প্যানেল লোড হচ্ছে...</div>;

  return (
    <div className="space-y-12">
      <div className="flex items-center gap-4 border-b border-[#222] pb-6">
        <div className="bg-[#f5c542] p-3 rounded-2xl">
          <ShieldAlert className="text-black w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-['Noto_Sans_Bengali']">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-gray-500">কেনা কাঁটা মার্কেটপ্লেস ম্যানেজমেন্ট</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Products Approval */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="text-[#f5c542]" />
            পণ্য অ্যাপ্রুভাল ({pendingProducts.length})
          </h2>
          <div className="space-y-4">
            {pendingProducts.map(product => (
              <motion.div
                key={product.id}
                layout
                className="bg-[#1a1a1a] p-4 rounded-2xl border border-[#222] flex gap-4"
              >
                <img src={product.images[0]} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{product.name}</h3>
                  <p className="text-sm text-gray-500">৳ {product.price}</p>
                  <div className="flex gap-2 mt-3">
                    <button 
                      onClick={() => handleApproveProduct(product.id)}
                      className="bg-green-500/20 text-green-500 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-green-500/30"
                    >
                      <CheckCircle className="w-3 h-3" /> অ্যাপ্রুভ
                    </button>
                    <button 
                      onClick={() => handleRejectProduct(product.id)}
                      className="bg-red-500/20 text-red-500 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-red-500/30"
                    >
                      <XCircle className="w-3 h-3" /> রিজেক্ট
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            {pendingProducts.length === 0 && <p className="text-gray-500 text-sm">কোনো পেন্ডিং পণ্য নেই।</p>}
          </div>
        </section>

        {/* User Verification */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="text-[#f5c542]" />
            ইউজার ভেরিফিকেশন ({unverifiedUsers.length})
          </h2>
          <div className="space-y-4">
            {unverifiedUsers.map(user => (
              <motion.div
                key={user.uid}
                layout
                className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#222] space-y-4"
              >
                <div className="flex items-center gap-4">
                  <img src={user.photoURL || ''} className="w-12 h-12 rounded-full" />
                  <div>
                    <h3 className="font-bold">{user.displayName}</h3>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="bg-[#222] p-4 rounded-xl space-y-2">
                  <p className="text-xs text-gray-400">NID: {user.nid}</p>
                  <a 
                    href={user.idPhotoURL} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[#f5c542] text-xs flex items-center gap-1 hover:underline"
                  >
                    NID ফটো দেখুন <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <button 
                  onClick={() => handleVerifyUser(user.uid)}
                  className="w-full bg-[#f5c542] text-black py-2 rounded-xl font-bold text-sm hover:bg-[#e6b83b]"
                >
                  সেলার হিসেবে ভেরিফাই করুন
                </button>
              </motion.div>
            ))}
            {unverifiedUsers.length === 0 && <p className="text-gray-500 text-sm">ভেরিফিকেশনের জন্য কোনো রিকোয়েস্ট নেই।</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
