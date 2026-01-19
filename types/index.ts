export interface Location {
  latitude: number;
  longitude: number;
}

export interface LiquorStore {
  id: string;
  name: string;
  address: string;
  location: Location;
  addedBy: string;
  addedAt: string;
}

export interface BourbonFind {
  id: string;
  storeName: string;
  storeAddress: string;
  location: Location;
  bourbonName: string;
  bourbonBrand: string;
  price?: number;
  photos: string[];
  description: string;
  hunterName: string;
  hunterAvatar?: string;
  timestamp: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  city?: string;
  state?: string;
  points: number;
  joinedAt: string;
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: "pending" | "accepted" | "declined";
  addedAt: string;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserEmail: string;
  fromUserAvatar?: string;
  toUserId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: string[];
  participantAvatars: (string | undefined)[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}

export interface Speakeasy {
  id: string;
  name: string;
  address: string;
  location: Location;
  description: string;
  coverPhoto: string;
  ambiance: string;
  signature: string;
  priceRange: string;
  rating: number;
  recommendedBy: string;
  recommendedByAvatar?: string;
  addedAt: string;
}
