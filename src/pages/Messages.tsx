import { useState, useEffect, useRef } from 'react';
import React from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AppUser, Conversation, Message } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Send, MessageSquare, User, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Messages({ appUser }: { appUser: AppUser }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUsers, setOtherUsers] = useState<Record<string, AppUser>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'conversations'),
      where('participants', 'array-contains', appUser.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Conversation[];
      setConversations(convs);

      // Fetch other user profiles
      convs.forEach(async (conv) => {
        const otherUid = conv.participants.find(p => p !== appUser.uid);
        if (otherUid && !otherUsers[otherUid]) {
          const userSnap = await getDoc(doc(db, 'users', otherUid));
          if (userSnap.exists()) {
            setOtherUsers(prev => ({ ...prev, [otherUid]: userSnap.data() as AppUser }));
          }
        }
      });
    });

    return () => unsubscribe();
  }, [appUser.uid]);

  useEffect(() => {
    if (!activeConv) return;

    const q = query(
      collection(db, 'conversations', activeConv.id, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      setMessages(msgs);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [activeConv]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    const text = newMessage;
    setNewMessage('');

    try {
      await addDoc(collection(db, 'conversations', activeConv.id, 'messages'), {
        senderId: appUser.uid,
        text,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getOtherUser = (conv: Conversation) => {
    const uid = conv.participants.find(p => p !== appUser.uid);
    return uid ? otherUsers[uid] : null;
  };

  return (
    <div className="h-[calc(100vh-200px)] bg-[#1a1a1a] rounded-3xl border border-[#222] overflow-hidden flex shadow-2xl">
      {/* Sidebar */}
      <div className="w-80 border-r border-[#222] bg-[#161616] flex flex-col">
        <div className="p-6 border-b border-[#222]">
          <h2 className="text-xl font-bold font-['Noto_Sans_Bengali'] flex items-center gap-2">
            <MessageSquare className="text-[#f5c542] w-6 h-6" />
            চ্যাট লিস্ট
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-sm italic">
              কোনো মেসেজ নেই।
            </div>
          ) : (
            conversations.map(conv => {
              const other = getOtherUser(conv);
              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConv(conv)}
                  className={`w-full p-4 flex items-center gap-4 transition-colors hover:bg-[#222] ${activeConv?.id === conv.id ? 'bg-[#222] border-l-4 border-[#f5c542]' : ''}`}
                >
                  <img 
                    src={other?.photoURL || `https://ui-avatars.com/api/?name=${other?.displayName}&background=f5c542`} 
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="text-left flex-1 min-w-0">
                    <div className="font-bold truncate">{other?.displayName || 'Loading...'}</div>
                    <div className="text-xs text-gray-500 truncate">{conv.lastMessage || 'নতুন কনভারসেশন শুরু করুন'}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[#222] flex items-center justify-between bg-[#1f1f1f]">
              <div className="flex items-center gap-3">
                <img 
                  src={getOtherUser(activeConv)?.photoURL || `https://ui-avatars.com/api/?name=${getOtherUser(activeConv)?.displayName}&background=f5c542`} 
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <div className="font-bold">{getOtherUser(activeConv)?.displayName}</div>
                  <div className="text-xs text-green-500">অনলাইনে আছেন</div>
                </div>
              </div>
              {activeConv.productId && (
                <Link to={`/product/${activeConv.productId}`} className="text-sm text-[#f5c542] hover:underline flex items-center gap-1">
                  পণ্য দেখুন <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-dots">
              {messages.map((msg, i) => {
                const isMine = msg.senderId === appUser.uid;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] p-3 rounded-2xl ${isMine ? 'bg-[#f5c542] text-black rounded-tr-none' : 'bg-[#222] text-white rounded-tl-none'}`}>
                      <p className="text-sm">{msg.text}</p>
                      <div className={`text-[10px] mt-1 opacity-60 ${isMine ? 'text-black' : 'text-gray-400'}`}>
                        {msg.createdAt?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Footer */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#1f1f1f] border-t border-[#222] flex gap-3">
              <input
                type="text"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="মেসেজ লিখুন..."
                className="flex-1 bg-[#161616] border border-[#333] rounded-xl px-4 py-3 focus:outline-none focus:border-[#f5c542] transition-colors"
              />
              <button className="bg-[#f5c542] text-black p-3 rounded-xl hover:bg-[#e6b83b] transition-all transform active:scale-95">
                <Send className="w-6 h-6" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
            <div className="bg-[#222] p-6 rounded-full">
              <MessageSquare className="w-16 h-16 opacity-20" />
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-300">মেসেজিং সিস্টেম</h3>
              <p className="text-sm">বামদিকের লিস্ট থেকে কাউকে সিলেক্ট করুন চ্যাট শুরু করতে।</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
