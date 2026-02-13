import React, { useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { type Chat } from '../../contexts/ChatContext';
import { useChat } from '../../contexts/ChatContext';
import { useUser } from '../../contexts/UserContext';
import { useNotifications } from '../../contexts/NotificationContext';
import MessageInput from './MessageInput';
import { CircleCheck as CheckCircle2, Users, Menu, UserCheck } from 'lucide-react';
import GroupChatInfo from './GroupChatInfo';
import DateSeparator from './DateSeparator';
import { isSameDay } from '../../utils/dateUtils';
import api from '../../api';
import { toast } from 'react-toastify';

// const AdminModerationButton: React.FC<{ projectId: string }> = ({ projectId }) => {
//   const [isLoading, setIsLoading] = React.useState(false);
//   const [showTooltip, setShowTooltip] = React.useState(false);
//   const [showConfirmModal, setShowConfirmModal] = React.useState(false);

//   const handleRequestAdminModeration = async () => {
//     if (!projectId) {
//       toast.error('Project ID not found');
//       return;
//     }
    
//     setIsLoading(true);
//     try {
//       await api.post(`/projects/${projectId}/request-admin-management`);
//       toast.success('Admin moderation requested successfully!');
//       setShowConfirmModal(false);
//       window.location.reload();
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Failed to request admin moderation');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <>
//       <div className="relative">
//         <button
//           type="button"
//           onClick={() => setShowConfirmModal(true)}
//           onMouseEnter={() => setShowTooltip(true)}
//           onMouseLeave={() => setShowTooltip(false)}
//           className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium hover:bg-orange-200 transition-colors"
//         >
//           <Shield className="w-4 h-4" />
//           ?
//         </button>
        
//         {showTooltip && createPortal(
//           <div className="fixed bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap z-99998">
//             <div className="text-center">
//               <div className="font-medium mb-1">Request Admin Moderation</div>
//               <div className="text-gray-300">Available for 2 days after commitment</div>
//               <div className="text-gray-300">5% additional fee applies</div>
//               <div className="text-gray-300">Click to request admin oversight</div>
//             </div>
//             <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
//           </div>,
//           document.body
//         )}
        
//         {showConfirmModal && createPortal(
//           <div 
//             className="fixed inset-0 w-full h-full flex items-center justify-center"
//             style={{ 
//               backgroundColor: 'rgba(0, 0, 0, 0.3)',
//               backdropFilter: 'blur(4px)',
//               zIndex: 99999 
//             }}
//           >
//             <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
//               <h3 className="text-lg font-semibold mb-4">Request Admin Moderation</h3>
//               <div className="mb-4 text-sm text-gray-600">
//                 <p className="mb-2">This will:</p>
//                 <ul className="list-disc list-inside space-y-1">
//                   <li>Add admin oversight to this project</li>
//                   <li>Charge an additional 5% fee</li>
//                   <li>Lock chat for admin-only messages</li>
//                 </ul>
//               </div>
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setShowConfirmModal(false)}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleRequestAdminModeration}
//                   disabled={isLoading}
//                   className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
//                 >
//                   {isLoading ? 'Requesting...' : 'Confirm'}
//                 </button>
//               </div>
//             </div>
//           </div>,
//           document.body
//         )}
//       </div>
//     </>
//   );
// };

interface ChatThreadProps {
  chat: Chat;
  onToggleSidebar?: () => void;
  highlightMessageId?: string;
}

const ChatThread: React.FC<ChatThreadProps> = ({ chat, onToggleSidebar, highlightMessageId }) => {
  const { addMessage, markMessagesRead, getChatParticipants } = useChat();
  const { user } = useUser();
  const { markChatNotificationsAsRead } = useNotifications();
  const endRef = useRef<HTMLDivElement | null>(null);
  const [showGroupInfo, setShowGroupInfo] = React.useState(false);
  const [participants, setParticipants] = React.useState<any[]>([]);
  const [highlightedMessageId, setHighlightedMessageId] = React.useState<string | null>(null);

  const title = useMemo(() => {
    const otherParticipants = chat.participants.filter(p => p._id !== (user?.id || ''));
    if (chat.type === 'project' && chat.project) {
      return chat.project.title;
    }
    if (chat.type === 'group') {
      if (chat.project?.title && otherParticipants.length > 0) {
        // Show project name + other participant's name
        const otherParticipant = otherParticipants[0];
        return `${chat.project.title} - ${otherParticipant.username || 'User'}`;
      }
      return chat.project?.title || `Group Chat (${chat.participants.length})`;
    }
    return otherParticipants[0]?.username || 'Chat';
  }, [chat, user?.id]);

  useEffect(() => {
    const loadParticipants = async () => {
      if (chat.type === 'group' || chat.type === 'project') {
        try {
          const chatParticipants = await getChatParticipants(chat._id);
          setParticipants(chatParticipants);
        } catch (error) {
          console.error('Failed to load participants:', error);
        }
      }
    };
    loadParticipants();
  }, [chat._id, chat.type]);

  useEffect(() => {
    const markRead = async () => {
      await markMessagesRead(chat._id);
      // Mark all notifications for this chat as read
      await markChatNotificationsAsRead(chat._id);
    };
    markRead().catch(() => {});
  }, [chat._id, markChatNotificationsAsRead]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages.length]);

  // Handle message highlighting
  useEffect(() => {
    if (highlightMessageId) {
      setHighlightedMessageId(highlightMessageId);
      const timer = setTimeout(() => {
        setHighlightedMessageId(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightMessageId]);

  const handleSend = async (content: string) => {
    if (!content.trim()) return;
    await addMessage(chat._id, content.trim());
  };

  const getChatTypeLabel = () => {
    switch (chat.type) {
      case 'project':
        return 'Project chat';
      case 'group':
        return `Group chat • ${chat.participants.length} members`;
      default:
        return 'Direct chat';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile sidebar toggle */}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="w-9 h-9 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-xs">
                {title.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">
                {title}
                {/* Show admin moderated only when admin management is explicitly requested and within 2 days */}
                {chat.isLocked && chat.project?.hasRequestedAdminManagement && chat.project?.adminManagementRequestedAt && (
                  (() => {
                    const requestedAt = new Date(chat.project.adminManagementRequestedAt);
                    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
                    return requestedAt > twoDaysAgo;
                  })()
                ) && (
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    (Admin moderated since {new Date(chat.project.adminManagementRequestedAt).toLocaleDateString()})
                  </span>
                )}
                {chat.status && chat.status !== 'approved' && (
                  <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                    chat.status === 'discussion' ? 'bg-blue-100 text-blue-700' :
                    chat.status === 'committed' ? 'bg-green-100 text-green-700' :
                    chat.status === 'closed' ? 'bg-gray-100 text-gray-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {chat.status === 'discussion' ? 'Discussion' :
                     chat.status === 'committed' ? 'Committed' :
                     chat.status === 'closed' ? 'Closed' :
                     chat.status}
                  </span>
                )}
              </h2>
              <p className="text-xs text-gray-500">{getChatTypeLabel()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Proceed with Freelancer button for clients in discussion status */}
            {user?.userType === 'client' && chat.status === 'discussion' && chat.project && (
              <ProceedWithFreelancerButton chatId={chat._id} />
            )}
            
            {/* Group info button for group/project chats */}
            {(chat.type === 'group' || chat.type === 'project') && (
              <button
                type="button"
                onClick={() => setShowGroupInfo(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <Users className="w-4 h-4" />
                Info
              </button>
            )}
            
            {/* Admin actions */}
            {user?.userType === 'admin' && (
              <AdminActions chatId={chat._id} status={chat.status} />
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30">
        {chat.messages.map((m, idx) => {
          const isMine = m.sender._id === (user?.id || '');
          const isSystemMessage = m.type === 'system';
          const currentMessageDate = new Date(m.timestamp);
          const previousMessageDate = idx > 0 ? new Date(chat.messages[idx - 1].timestamp) : null;
          const showDateSeparator = !previousMessageDate || !isSameDay(currentMessageDate, previousMessageDate);
          
          return (
            <React.Fragment key={idx}>
              {/* Date Separator */}
              {showDateSeparator && (
                <DateSeparator date={currentMessageDate} />
              )}
              
              {/* Message */}
              {isSystemMessage ? (
                <div className="flex justify-center">
                  <div className="bg-white/80 backdrop-blur-sm text-gray-600 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm border border-gray-200">
                    {m.content}
                  </div>
                </div>
              ) : (
                <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] ${isMine ? 'order-2' : 'order-1'}`}>
                    {!isMine && (
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-gray-600">
                            {(m.sender.username?.toLowerCase() === 'admin' ? 'Admin' : m.sender.username).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {m.sender.username?.toLowerCase() === 'admin' ? 'Admin' : m.sender.username}
                        </span>
                      </div>
                    )}
                    <div className={`rounded-2xl px-3 py-2 shadow-sm transition-all duration-500 ${
                      isMine 
                        ? 'bg-black text-white' 
                        : 'bg-white border border-gray-200'
                    } ${
                      highlightedMessageId === (m._id || `msg-${idx}`) ? 'ring-2 ring-blue-400 bg-blue-50' : ''
                    }`}>
                      <div className="text-xs leading-relaxed">{m.content}</div>
                      <div className={`text-xs mt-1 ${isMine ? 'text-white/60' : 'text-gray-400'}`}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
        <div ref={endRef} />
      </div>

      {/* Message Input */}
      {chat.status === 'closed' ? (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="text-center text-gray-500 text-sm">
            This discussion has been closed.
          </div>
        </div>
      ) : (chat.isLocked && chat.project?.hasRequestedAdminManagement && user?.userType !== 'admin') ? (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="text-center text-gray-500 text-sm">
            This chat is under admin moderation. Only admin can post messages.
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-100 bg-white">
          <MessageInput
            onSend={handleSend}
            disabled={false}
            status={chat.status}
          />
        </div>
      )}
      
      {/* Group Info Modal */}
      {showGroupInfo && (chat.type === 'group' || chat.type === 'project') && createPortal(
        <GroupChatInfo
          chat={chat}
          participants={participants}
          onClose={() => setShowGroupInfo(false)}
          onParticipantAdded={() => {
            // Refresh participants
            getChatParticipants(chat._id).then(setParticipants);
          }}
        />,
        document.body
      )}
    </div>
  );
};

const AdminActions: React.FC<{ chatId: string; status: 'pending' | 'approved' | 'with_admin' | 'discussion' | 'committed' | 'closed' }> = ({ chatId, status }) => {
  const { approveChat } = useChat();
  return (
    <div className="flex items-center gap-2">
      {status === 'pending' && (
        <button
          type="button"
          onClick={() => approveChat(chatId)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 rounded-full text-xs font-medium text-green-700 hover:bg-green-200 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          Approve
        </button>
      )}
      
    </div>
  );
};

const ProceedWithFreelancerButton: React.FC<{ chatId: string }> = ({ chatId }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showBudgetModal, setShowBudgetModal] = React.useState(false);
  const [finalBudget, setFinalBudget] = React.useState('');
  const { fetchChats } = useChat();

  const handleProceed = async () => {
    if (!finalBudget || parseFloat(finalBudget) <= 0) {
      toast.error('Please enter a valid final budget');
      return;
    }
    
    setIsLoading(true);
    try {
      await api.patch(`/chats/${chatId}/proceed-freelancer`, {
        finalBudget: parseFloat(finalBudget)
      });
      toast.success('Proceeded with freelancer! Other discussions have been closed.');
      setShowBudgetModal(false);
      await fetchChats();
      // Force page reload to ensure all data is refreshed
      window.location.reload();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to proceed with freelancer');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowBudgetModal(true)}
        className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-full text-xs font-medium hover:bg-green-700 transition-colors"
      >
        <UserCheck className="w-4 h-4" />
        Proceed with this freelancer
      </button>
      
      {showBudgetModal && createPortal(
        <div 
          className="fixed inset-0 w-full h-full flex items-center justify-center"
          style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(4px)',
            zIndex: 99999 
          }}
        >
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative">
            <h3 className="text-lg font-semibold mb-4">Set Final Budget</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Budget Amount
              </label>
              <input
                type="number"
                value={finalBudget}
                onChange={(e) => setFinalBudget(e.target.value)}
                placeholder="Enter final budget"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBudgetModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProceed}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ChatThread;