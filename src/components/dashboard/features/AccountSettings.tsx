import { useState } from "react";
import { useUser } from "../../../contexts/UserContext";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../api";

export default function AccountSettings() {
  const { user, checkUsernameAvailability, updateUsername } = useUser();
  const navigate = useNavigate();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [usernameStatus, setUsernameStatus] = useState<{
    message: string;
    isValid: boolean;
    color: string;
  }>({ message: "", isValid: false, color: "" });
  const [isSavingUsername, setIsSavingUsername] = useState(false);

  const getInitials = () => {
    if (!user?.fullName) return "U";
    const names = user.fullName.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.fullName.charAt(0).toUpperCase();
  };

  const handleUsernameChange = async (username: string) => {
    setNewUsername(username);
    
    if (username === user?.username) {
      setUsernameStatus({ message: "", isValid: true, color: "" });
      return;
    }

    if (username.length === 0) {
      setUsernameStatus({ message: "", isValid: false, color: "" });
      return;
    }

    if (username.length < 5) {
      setUsernameStatus({
        message: "Username must be at least 5 characters",
        isValid: false,
        color: "text-red-500"
      });
      return;
    }

    try {
      const isAvailable = await checkUsernameAvailability(username);
      if (isAvailable) {
        setUsernameStatus({
          message: "Username is available",
          isValid: true,
          color: "text-green-500"
        });
      } else {
        setUsernameStatus({
          message: "Username is not available",
          isValid: false,
          color: "text-red-500"
        });
      }
    } catch (error) {
      setUsernameStatus({
        message: "Error checking username",
        isValid: false,
        color: "text-red-500"
      });
    }
  };

  const handleSaveUsername = async () => {
    if (!usernameStatus.isValid || newUsername === user?.username) return;
    
    setIsSavingUsername(true);
    try {
      await updateUsername(newUsername);
      toast.success('Username updated successfully');
      setIsEditingUsername(false);
      setUsernameStatus({ message: "", isValid: false, color: "" });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update username');
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleCancelUsernameEdit = () => {
    setIsEditingUsername(false);
    setNewUsername(user?.username || '');
    setUsernameStatus({ message: "", isValid: false, color: "" });
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    
    setIsDeleting(true);
    try {
      await api.delete('/users/delete-account');
      localStorage.removeItem('token');
      toast.success('Account deleted successfully');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your profile information and account preferences
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Profile Details
          </h2>

          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white font-medium text-2xl">
                {getInitials()}
              </span>
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user?.fullName || ""}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <div className="flex items-center gap-2">
                  {isEditingUsername ? (
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                      />
                      {usernameStatus.message && (
                        <p className={`text-sm mt-1 ${usernameStatus.color}`}>
                          {usernameStatus.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={user?.username || ""}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                    />
                  )}
                  
                  {isEditingUsername ? (
                    <div className="flex gap-1">
                      <button
                        onClick={handleSaveUsername}
                        disabled={!usernameStatus.isValid || newUsername === user?.username || isSavingUsername}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelUsernameEdit}
                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditingUsername(true)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type
                </label>
                <input
                  type="text"
                  value={user?.userType || ""}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 capitalize"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Danger Zone
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Account
            </button>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800 font-medium mb-3">
                Type <strong>DELETE</strong> to confirm account deletion:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full px-3 py-2 border border-red-300 rounded-lg mb-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE' || isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Account'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
