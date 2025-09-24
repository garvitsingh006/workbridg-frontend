import type { ChatChannel, ChatMessage, Project } from '../types/chat';

// Mock current user ID (freelancer)
export const CURRENT_USER_ID = 'freelancer-1';

// Mock projects
export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'E-commerce Website Redesign',
    clientName: 'Tech Solutions Inc.',
    status: 'approved',
    approvedAt: new Date('2024-01-15T10:00:00Z'),
  },
  {
    id: 'project-2',
    name: 'Mobile App UI/UX Design',
    clientName: 'StartupXYZ',
    status: 'approved',
    approvedAt: new Date('2024-01-10T14:30:00Z'),
  },
  {
    id: 'project-3',
    name: 'Logo Design Package',
    clientName: 'Local Business',
    status: 'pending',
  },
];

// Mock messages
export const mockMessages: { [channelId: string]: ChatMessage[] } = {
  'admin-chat': [
    {
      id: 'msg-1',
      senderId: 'admin-1',
      senderName: 'Admin Sarah',
      senderType: 'admin',
      content: 'Welcome to Workbridg! How can I help you today?',
      timestamp: new Date('2024-01-20T09:00:00Z'),
      isRead: true,
    },
    {
      id: 'msg-2',
      senderId: CURRENT_USER_ID,
      senderName: 'You',
      senderType: 'freelancer',
      content: 'Hi! I have a question about payment processing.',
      timestamp: new Date('2024-01-20T09:15:00Z'),
      isRead: true,
    },
    {
      id: 'msg-3',
      senderId: 'admin-1',
      senderName: 'Admin Sarah',
      senderType: 'admin',
      content: 'I\'d be happy to help! What specific aspect of payment processing would you like to know about?',
      timestamp: new Date('2024-01-20T09:20:00Z'),
      isRead: true,
    },
  ],
  'project-1': [
    {
      id: 'msg-4',
      senderId: 'client-1',
      senderName: 'John Smith',
      senderType: 'client',
      content: 'Hi! I\'m excited to work with you on the e-commerce website redesign. When can we schedule a kick-off call?',
      timestamp: new Date('2024-01-18T11:00:00Z'),
      isRead: true,
    },
    {
      id: 'msg-5',
      senderId: CURRENT_USER_ID,
      senderName: 'You',
      senderType: 'freelancer',
      content: 'Great! I\'m available tomorrow at 2 PM or Thursday at 10 AM. Which works better for you?',
      timestamp: new Date('2024-01-18T11:30:00Z'),
      isRead: true,
    },
    {
      id: 'msg-6',
      senderId: 'client-1',
      senderName: 'John Smith',
      senderType: 'client',
      content: 'Tomorrow at 2 PM works perfectly! I\'ll send you the current website details and brand guidelines.',
      timestamp: new Date('2024-01-18T12:00:00Z'),
      isRead: false,
    },
  ],
  'project-2': [
    {
      id: 'msg-7',
      senderId: 'client-2',
      senderName: 'Emma Wilson',
      senderType: 'client',
      content: 'Hi there! Looking forward to collaborating on the mobile app design. Do you have experience with fintech apps?',
      timestamp: new Date('2024-01-16T15:00:00Z'),
      isRead: true,
    },
    {
      id: 'msg-8',
      senderId: CURRENT_USER_ID,
      senderName: 'You',
      senderType: 'freelancer',
      content: 'Absolutely! I\'ve worked on several fintech projects. I understand the importance of trust, security, and user-friendly interfaces in financial applications.',
      timestamp: new Date('2024-01-16T15:45:00Z'),
      isRead: true,
    },
  ],
};

// Create chat channels
export const mockChatChannels: ChatChannel[] = [
  {
    id: 'admin-chat',
    name: 'Admin Support',
    type: 'admin',
    lastMessage: mockMessages['admin-chat'][mockMessages['admin-chat'].length - 1],
    unreadCount: 0,
    participants: ['admin-1', CURRENT_USER_ID],
  },
  ...mockProjects
    .filter(project => project.status === 'approved')
    .map(project => ({
      id: project.id,
      name: project.name,
      type: 'project' as const,
      projectId: project.id,
      lastMessage: mockMessages[project.id]?.[mockMessages[project.id].length - 1],
      unreadCount: mockMessages[project.id]?.filter(msg => !msg.isRead && msg.senderId !== CURRENT_USER_ID).length || 0,
      participants: [CURRENT_USER_ID, `client-${project.id.split('-')[1]}`],
    })),
];