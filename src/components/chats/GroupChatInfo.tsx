import React, { useState } from 'react';
import { X, UserPlus, UserMinus, Shield, User, Briefcase } from 'lucide-react';
import { useChat, type Chat } from '../../contexts/ChatContext';
import { useUser } from '../../contexts/UserContext';

interface GroupChatInfoProps {
  chat: Chat;
  participants: any[];
  onClose: () => void;
  onParticipantAdded: () => void;
}

const GroupChatInfo: React.FC<GroupChatInfoProps> = ({ 
  chat, 
  participants, 
  onClose, 
  onParticipantAdded 
}) => {
  const { addParticipantToChat, removeParticipantFromChat, addAdminToChat } = useChat();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.userType === 'admin';

  const handleAddAdmin = async () => {
    try {
      setLoading(true);
      await addAdminToChat(chat._id);
      onParticipantAdded();
    } catch (error) {
      console.error('Failed to add admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) return;
    
    try {
      setLoading(true);
      await removeParticipantFromChat(chat._id, participantId);
      onParticipantAdded();
    } catch (error) {
      console.error('Failed to remove participant:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (participant: any) => {
    const role = participant.role?.toLowerCase();
    switch (role) {
      case 'admin':
        return <Shield className="w-2.5 h-2.5 text-purple-600" />;
      case 'client':
        return <Briefcase className="w-2.5 h-2.5 text-blue-600" />;
      case 'freelancer':
        return <User className="w-2.5 h-2.5 text-green-600" />;
      default:
        return <User className="w-2.5 h-2.5 text-gray-600" />;
    }
  };

  const getRoleLabel = (participant: any) => {
    const role = participant.role?.toLowerCase();
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'client':
        return 'Client';
      case 'freelancer':
        return 'Freelancer';
      default:
        return 'Member';
    }
  };

  const handleExitGroup = async () => {
    if (!confirm('Are you sure you want to exit the group?')) return;

    try {
      setLoading(true);
      if (!user) throw new Error("User not found");
      await removeParticipantFromChat(chat._id, user.id);
      onParticipantAdded();
      onClose();
    } catch (error) {
      console.error('Failed to exit group:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm max-h-[70vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <div>
            <div className="font-medium text-sm text-gray-900">Group Info</div>
            <div className="text-xs text-gray-500">
              {chat.project?.title || 'Group Chat'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[50vh] overflow-y-auto">
          {/* Participants List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 text-sm">
                Participants ({participants.length})
              </h3>
            </div>

            {participants.map((participant) => (
              <div
                key={participant._id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      {(participant.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-xs text-gray-900">
                      {participant.username?.toLowerCase() === 'admin' 
                        ? 'Admin' 
                        : participant.fullName || participant.username}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {getRoleIcon(participant)}
                      {getRoleLabel(participant)}
                    </div>
                  </div>
                </div>
                
                {isAdmin && (
                  <button
                    onClick={() => handleRemoveParticipant(participant._id)}
                    className="text-red-600 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                    disabled={loading}
                  >
                    <UserMinus className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
            <button
              onClick={handleAddAdmin}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs font-medium"
              disabled={loading}
            >
              <Shield className="w-3 h-3" />
              Add Admin to Chat
            </button>
            
            <button
              onClick={handleExitGroup}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium"
              disabled={loading}
            >
              Exit Group
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChatInfo;