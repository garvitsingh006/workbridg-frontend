import { MessageCircle, Shield, FolderOpen, Hash } from 'lucide-react';
import type { ChatChannel } from '../../types/chat';

interface ChatSidebarProps {
  channels: ChatChannel[];
  activeChannelId: string;
  onChannelSelect: (channelId: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function ChatSidebar({ 
  channels, 
  activeChannelId, 
  onChannelSelect, 
  isMobileOpen, 
  onCloseMobile 
}: ChatSidebarProps) {
  const adminChannels = channels.filter(channel => channel.type === 'admin');
  const projectChannels = channels.filter(channel => channel.type === 'project');

  const formatLastMessage = (channel: ChatChannel) => {
    if (!channel.lastMessage) return 'No messages yet';
    
    const content = channel.lastMessage.content;
    return content.length > 40 ? `${content.substring(0, 40)}...` : content;
  };

  const formatLastMessageTime = (channel: ChatChannel) => {
    if (!channel.lastMessage) return '';
    
    const now = new Date();
    const messageTime = new Date(channel.lastMessage.timestamp);
    const diffInHours = Math.abs(now.getTime() - messageTime.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return messageTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return messageTime.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const ChannelItem = ({ channel }: { channel: ChatChannel }) => (
    <button
      onClick={() => {
        onChannelSelect(channel.id);
        onCloseMobile();
      }}
      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-l-4 ${
        activeChannelId === channel.id
          ? 'bg-blue-50 border-blue-600 text-blue-900'
          : 'border-transparent text-gray-900'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center space-x-3">
          {channel.type === 'admin' ? (
            <Shield className="w-4 h-4 text-red-500" />
          ) : (
            <FolderOpen className="w-4 h-4 text-green-500" />
          )}
          <span className="font-medium text-sm">{channel.name}</span>
        </div>
        {channel.unreadCount > 0 && (
          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center">
            {channel.unreadCount}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-600 truncate flex-1">
          {formatLastMessage(channel)}
        </p>
        {channel.lastMessage && (
          <span className="text-xs text-gray-500 ml-2">
            {formatLastMessageTime(channel)}
          </span>
        )}
      </div>
    </button>
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onCloseMobile}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        w-80 bg-white border-r border-gray-200 flex flex-col
        transform lg:transform-none transition-transform duration-300 ease-in-out
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto">
          {/* Admin Section */}
          <div className="py-2">
            <div className="px-6 py-2">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                <Shield className="w-3 h-3 mr-2" />
                Support
              </h2>
            </div>
            {adminChannels.map(channel => (
              <ChannelItem key={channel.id} channel={channel} />
            ))}
          </div>

          {/* Projects Section */}
          {projectChannels.length > 0 && (
            <div className="py-2 border-t border-gray-100">
              <div className="px-6 py-2">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
                  <Hash className="w-3 h-3 mr-2" />
                  Approved Projects
                </h2>
              </div>
              {projectChannels.map(channel => (
                <ChannelItem key={channel.id} channel={channel} />
              ))}
            </div>
          )}

          {/* Empty State for Projects */}
          {projectChannels.length === 0 && (
            <div className="py-8 px-6 text-center border-t border-gray-100">
              <FolderOpen className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                No approved projects yet
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Project chats will appear here once approved by admin
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}