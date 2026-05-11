/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logout } from './lib/firebase';
import { AppUser } from './types';
import { ShoppingBag, Search, User as UserIcon, LogOut, MessageSquare, PlusCircle, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Pages (to be created)
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Sell from './pages/Sell';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          setAppUser(userDoc.data() as AppUser);
        } else {
          // New user
          const newUser: Partial<AppUser> = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            role: 'buyer',
            isVerified: false,
            createdAt: serverTimestamp() as any,
          };
          await setDoc(userRef, newUser);
          setAppUser(newUser as AppUser);
        }
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-[#f5c542] text-2xl font-bold font-['Noto_Sans_Bengali']"
        >
          কেনা কাঁটা...
        </motion.div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0f0f0f] text-white selection:bg-[#f5c542] selection:text-black">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#111] border-bottom border-[#222] px-6 py-4 flex items-center justify-between shadow-lg">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-[#f5c542] p-2 rounded-full transform transition-transform group-hover:rotate-12">
              <ShoppingBag className="text-black w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-[#f5c542] to-[#ffda7a] bg-clip-text text-transparent hidden sm:block">
              কেনা কাঁটা
            </h1>
          </Link>

          <div className="flex-1 max-w-xl mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="পণ্য খুঁজুন (Search Products...)"
                className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl py-2 pl-12 pr-4 focus:outline-none focus:border-[#f5c542] transition-colors"
              />
            </div>
          </div>

          <nav className="flex items-center gap-2 sm:gap-4">
            {appUser ? (
              <>
                <Link to="/sell" className="bg-[#f5c542] text-black px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-[#e6b83b] transition-colors">
                  <PlusCircle className="w-5 h-5" />
                  <span className="hidden sm:inline">বিক্রি করুন</span>
                </Link>
                <Link to="/messages" className="p-2 hover:bg-[#222] rounded-full relative">
                  <MessageSquare className="w-6 h-6 text-[#f5c542]" />
                </Link>
                {appUser.email === 'md7493654@gmail.com' && (
                  <Link to="/admin" className="p-2 hover:bg-[#222] rounded-full">
                    <ShieldCheck className="w-6 h-6 text-[#f5c542]" />
                  </Link>
                )}
                <Link to="/profile" className="flex items-center gap-2 p-1 pl-3 bg-[#1a1a1a] rounded-full border border-[#333] hover:border-[#f5c542] transition-colors">
                  <span className="hidden lg:inline text-sm font-medium">{appUser.displayName || 'User'}</span>
                  <img src={appUser.photoURL || `https://ui-avatars.com/api/?name=${appUser.displayName}&background=f5c542&color=000`} className="w-8 h-8 rounded-full" />
                </Link>
                <button onClick={logout} className="p-2 hover:bg-[#222] rounded-full text-red-400">
                  <LogOut className="w-6 h-6" />
                </button>
              </>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="bg-[#f5c542] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#e6b83b] transition-all transform active:scale-95"
              >
                Login
              </button>
            )}
          </nav>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home appUser={appUser} />} />
              <Route path="/product/:id" element={<ProductDetail appUser={appUser} />} />
              <Route path="/sell" element={appUser ? <Sell appUser={appUser} /> : <Navigate to="/" />} />
              <Route path="/profile" element={appUser ? <Profile appUser={appUser} /> : <Navigate to="/" />} />
              <Route path="/messages" element={appUser ? <Messages appUser={appUser} /> : <Navigate to="/" />} />
              <Route path="/admin" element={appUser?.email === 'md7493654@gmail.com' ? <AdminDashboard /> : <Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>

        <footer className="mt-20 py-12 border-t border-[#222] bg-[#0a0a0a]">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-2xl font-bold text-[#f5c542] mb-2 font-['Noto_Sans_Bengali']">কেনা কাঁটা</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">বাংলাদেশের বিশ্বস্ত অনলাইন মার্কেটপ্লেস। নিরাপদে কিনুন এবং বেছে নিন সেরা পণ্য।</p>
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Kena Kata Marketplace. All Rights Reserved.
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
