import { Timestamp } from 'firebase/firestore';

export type UserRole = 'buyer' | 'seller' | 'moderator' | 'admin';

export interface AppUser {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  isVerified: boolean;
  nid?: string;
  idPhotoURL?: string;
  createdAt: Timestamp;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  sellerId: string;
  status: 'pending' | 'approved' | 'rejected' | 'sold';
  createdAt: Timestamp;
}

export interface Conversation {
  id: string;
  participants: string[];
  productId?: string;
  lastMessage?: string;
  updatedAt: Timestamp;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: Timestamp;
}
