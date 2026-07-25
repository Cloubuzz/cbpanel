export interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'template';
}

export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'typing';
  lastSeen?: string;
  email?: string;
  phone?: string;
  location?: string;
  ltv?: number;
  tags?: string[];
  lastOrder?: { id: string; date: string; amount: number; status: string };
}

export interface ChatSession {
  id: string;
  user: ChatUser;
  lastMessage: string;
  unreadCount: number;
  timestamp: string;
  messages: Message[];
  channel: 'whatsapp' | 'sms' | 'email';
}
