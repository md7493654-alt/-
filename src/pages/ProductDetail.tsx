import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, AppUser, Conversation } from '../types';
import { motion } from 'motion/react';
import { ShoppingCart, MessageSquare, ShieldCheck, MapPin, Calendar, User } from 'lucide-react';

export default function ProductDetail({ appUser }: { appUser: AppUser | null }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [seller, setSeller] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      if (!id) return;
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const prodData = { id: docSnap.id, ...docSnap.data() } as Product;
        setProduct(prodData);

        // Fetch Seller
        const sellerRef = doc(db, 'users', prodData.sellerId);
        const sellerSnap = await getDoc(sellerRef);
        if (sellerSnap.exists()) {
          setSeller(sellerSnap.data() as AppUser);
        }
      }
      setLoading(false);
    }
    fetchDetails();
  }, [id]);

  const handleStartChat = async () => {
    if (!appUser) {
      alert("মেসেজ করতে লগইন করুন।");
      return;
    }
    if (appUser.uid === product?.sellerId) {
      alert("এটি আপনার নিজের পণ্য।");
      return;
    }

    try {
      // Check if conversation already exists
      const q = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', appUser.uid)
      );
      const querySnapshot = await getDocs(q);
      let existingConv = querySnapshot.docs.find(doc => {
        const data = doc.data() as Conversation;
        return data.participants.includes(product!.sellerId);
      });

      if (existingConv) {
        navigate('/messages');
      } else {
        const newConv = await addDoc(collection(db, 'conversations'), {
          participants: [appUser.uid, product!.sellerId],
          productId: product!.id,
          updatedAt: serverTimestamp(),
        });
        navigate('/messages');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="text-center py-20">লোডিং হচ্ছে...</div>;
  if (!product) return <div className="text-center py-20">পণ্যটি পাওয়া যায়নি।</div>;

  return (
    <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl overflow-hidden bg-[#1a1a1a] border border-[#222]"
      >
        <img 
          src={product.images[0] || 'https://via.placeholder.com/600'} 
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </motion.div>

      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 text-[#f5c542] mb-2">
            <span className="bg-[#f5c542]/10 px-3 py-1 rounded-full text-sm font-semibold">
              {product.category}
            </span>
            {product.status === 'sold' && (
              <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-sm font-semibold">
                বিক্রিত (Sold)
              </span>
            )}
          </div>
          <h1 className="text-4xl font-bold font-['Noto_Sans_Bengali'] mb-4">{product.name}</h1>
          <div className="text-3xl font-bold text-[#f5c542]">৳ {product.price.toLocaleString()}</div>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#222] space-y-4">
          <h3 className="font-bold text-lg">পণ্যের বিবরণ</h3>
          <p className="text-gray-400 whitespace-pre-wrap leading-relaxed">{product.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#222] flex items-center gap-3">
            <div className="bg-[#222] p-2 rounded-lg">
              <Calendar className="text-[#f5c542] w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">পাবলিশ করা হয়েছে</div>
              <div className="text-sm font-medium">{product.createdAt?.toDate().toLocaleDateString('bn-BD')}</div>
            </div>
          </div>
          <div className="bg-[#1a1a1a] p-4 rounded-xl border border-[#222] flex items-center gap-3">
            <div className="bg-[#222] p-2 rounded-lg">
              <MapPin className="text-[#f5c542] w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 uppercase">অবস্থান</div>
              <div className="text-sm font-medium">ঢাকা, বাংলাদেশ</div>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1a1a] p-6 rounded-2xl border border-[#222] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img 
              src={seller?.photoURL || `https://ui-avatars.com/api/?name=${seller?.displayName}&background=f5c542`} 
              className="w-12 h-12 rounded-full ring-2 ring-[#f5c542]"
            />
            <div>
              <div className="font-bold flex items-center gap-1">
                {seller?.displayName}
                {seller?.isVerified && <ShieldCheck className="w-4 h-4 text-[#f5c542]" />}
              </div>
              <div className="text-xs text-gray-500">মেম্বার যেহেতু {seller?.createdAt?.toDate().getFullYear()}</div>
            </div>
          </div>
          <button onClick={handleStartChat} className="bg-[#222] text-[#f5c542] p-3 rounded-xl hover:bg-[#333] transition-colors border border-[#333]">
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 bg-[#f5c542] text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#e6b83b] transition-all transform active:scale-95">
            <ShoppingCart className="w-6 h-6" />
            অর্ডার করুন
          </button>
          <button onClick={handleStartChat} className="flex-1 bg-white/5 border border-white/10 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
            সেলারকে মেসেজ দিন
          </button>
        </div>
      </div>
    </div>
  );
}
