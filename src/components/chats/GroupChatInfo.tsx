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
  const [isAddingParticipant, setIsAddingParticipant] = useState(false);
  const [newParticipantId, setNewParticipantId] = useState('');
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const isAdmin = user?.userType === 'admin';

  const handleAddParticipant = async () => {
    if (!newParticipantId.trim()) return;
    
    try {
      setLoading(true);
      await addParticipantToChat(chat._id, newParticipantId);
      setNewParticipantId('');
      setIsAddingParticipant(false);
      onParticipantAdded();
    } catch (error) {
      console.error('Failed to add participant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveParticipant = async (participantId: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) return;
    
    try {
      setLoading(true);
      await removeParticipantFromChat(chat._id, participantId);
      onParticipantAdded(); // Refresh the list
    } catch (error) {
      console.error('Failed to remove participant:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async () => {
    try {
      setLoading(true);
      await addAdminToChat(chat._id);
      onParticipantAdded(); // Refresh the list
    } catch (error) {
      console.error('Failed to add admin:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (participant: any) => {
    const role = participant.role?.toLowerCase();
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-600" />;
      case 'client':
        return <Briefcase className="w-4 h-4 text-blue-600" />;
      case 'freelancer':
        return <User className="w-4 h-4 text-green-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
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
            onParticipantAdded(); // Refresh the list if needed
            onClose(); // Close group info after exit
        } catch (error) {
            console.error('Failed to exit group:', error);
        } finally {
            setLoading(false);
        }
    }


  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div>
            <div className="font-medium">Group Info</div>
            <div className="text-sm text-gray-500">
              {chat.project?.title || 'Group Chat'}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {/* Participants List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">
                Participants ({participants.length})
              </h3>
              
                <button
                  onClick={() => setIsAddingParticipant(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                >
                  <UserPlus className="w-4 h-4" />
                  Add
                </button>
            </div>

            {participants.map((participant) => (
              <div
                key={participant._id}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {(participant.username || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">
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
                
                {user?.id === "admin" && (
                  <button
                    onClick={() => handleRemoveParticipant(participant._id)}
                    className="text-red-600 hover:text-red-700 p-1"
                    disabled={loading}
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Admin Button */}
        
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={handleAddAdmin}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                disabled={loading}
              >
                <Shield className="w-4 h-4" />
                Add Admin to Chat
              </button>
            </div>
            <div className="mt-4 pt-4 border-t">
                <button
                    onClick={handleExitGroup}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    disabled={loading}
                >
                    Exit Group
                </button>
            </div>

        </div>
        

        {/* Add Participant Modal */}
        {/* {isAddingParticipant && (
          <div className="absolute inset-0 bg-white">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-medium">Add Participant</div>
              <button
                onClick={() => setIsAddingParticipant(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User ID or Username
                  </label>
                  <input
                    type="text"
                    value={newParticipantId}
                    onChange={(e) => setNewParticipantId(e.target.value)}
                    placeholder="Enter user ID or username"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsAddingParticipant(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddParticipant}
                    disabled={!newParticipantId.trim() || loading}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
};

export default GroupChatInfo;