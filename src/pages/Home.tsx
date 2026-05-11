import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Product, AppUser } from '../types';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star, ShieldCheck } from 'lucide-react';

export default function Home({ appUser }: { appUser: AppUser | null }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const q = query(
        collection(db, 'products'),
        where('status', '==', 'approved'),
        orderBy('createdAt', 'desc'),
        limit(12)
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedProducts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      setProducts(fetchedProducts);
      setLoading(false);
    }

    fetchProducts();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#222] p-8 md:p-16">
        <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-6xl font-bold leading-tight font-['Noto_Sans_Bengali']">
              বাংলাদেশের নতুন <br/>
              <span className="text-[#f5c542]">অনলাইন মার্কেটপ্লেস</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl">
              এখানে সবাই নিরাপদে একাউন্ট খুলতে পারবে, পণ্য বিক্রি ও কিনতে পারবে। ভেরিফাইড সেলার এবং নিরাপদ পেমেন্ট গেটওয়ে।
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/sell" className="bg-[#f5c542] text-black px-8 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform">
                বিক্রি শুরু করুন
              </Link>
              <button className="border border-[#444] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#222] transition-colors">
                আরও জানুন
              </button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="hidden md:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-[#f5c542]/20 blur-3xl rounded-full"></div>
              <img 
                src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=600" 
                alt="Shopping Illustration"
                className="relative z-10 rounded-2xl shadow-2xl border border-[#333]"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: ShieldCheck, title: 'ভেরিফাইড ইউজার', desc: 'নিরাপদ লেনদেনের জন্য প্রত্যেক সেলার ভেরিফাইড।' },
          { icon: Star, title: 'সেরা ডিল', desc: 'সাশ্রয়ী মূল্যে সেরা সব পণ্য খুঁজে নিন।' },
          { icon: ShoppingCart, title: 'সহজ পেমেন্ট', desc: 'বিকাশ, নগদ এবং রকেটের মাধ্যমে দ্রুত পেমেন্ট।' },
        ].map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#1a1a1a] p-8 rounded-2xl border border-[#222] hover:border-[#f5c542]/50 transition-colors group"
          >
            <f.icon className="w-12 h-12 text-[#f5c542] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-bold mb-2 font-['Noto_Sans_Bengali']">{f.title}</h3>
            <p className="text-gray-400">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Trending Products */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-[#f5c542] font-['Noto_Sans_Bengali']">জনপ্রিয় পণ্যসমূহ</h2>
            <p className="text-gray-500 mt-2">সেরা বিক্রিত এবং নতুন আসা পণ্য দেখে নিন</p>
          </div>
          <Link to="/" className="text-[#f5c542] hover:underline">সবগুলো দেখুন</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#1a1a1a] rounded-2xl h-80 animate-pulse border border-[#222]"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-[#1a1a1a] rounded-2xl border border-[#222] overflow-hidden group hover:shadow-[0_0_20px_rgba(245,197,66,0.1)] transition-all"
              >
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-square overflow-hidden bg-[#222]">
                    <img 
                      src={product.images[0] || 'https://via.placeholder.com/300?text=No+Image'} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </Link>
                <div className="p-4 space-y-3">
                  <div className="text-sm text-gray-500">{product.category}</div>
                  <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-[#f5c542] font-bold text-xl">৳ {product.price.toLocaleString()}</span>
                    <button className="bg-[#f5c542] text-black p-2 rounded-lg hover:scale-105 transition-transform">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {products.length === 0 && !loading && (
          <div className="text-center py-20 bg-[#161616] rounded-3xl border border-dashed border-[#333]">
            <p className="text-gray-500">বর্তমানে কোনো পণ্য নেই।</p>
          </div>
        )}
      </section>
    </div>
  );
}
