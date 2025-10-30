export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'admin' | 'client' | 'freelancer';
  content: string;
  timestamp: Date;
  isRead: boolean;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: 'admin' | 'project';
  projectId?: string;
  lastMessage?: ChatMessage;
  unreadCount: number;
  participants: string[];
}

export interface Project {
  id: string;
  name: string;
  clientName: string;
  status: 'pending' | 'approved' | 'in_progress' | 'completed';
  approvedAt?: Date;
}