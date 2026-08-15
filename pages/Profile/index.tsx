import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectCurrentUser, selectToken } from '../../store/selectors/appSelectors';
import { updateCurrentUser } from '../../store/slices/appSlice';
import { fetchUserById, updateUser, ApiUser } from '../../services/usersApi';

export const Profile: React.FC = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectToken);
  const authUser = useAppSelector(selectCurrentUser);

  const [profileData, setProfileData] = useState<ApiUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!token || !authUser?.userId) return;
    setIsLoading(true);
    setError(null);
    try {
      const numericId = parseInt(authUser.userId, 10);
      if (isNaN(numericId)) {
        throw new Error('Invalid user ID format.');
      }
      
      const details = await fetchUserById(token, numericId);
      setProfileData(details);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user profile.');
    } finally {
      setIsLoading(false);
    }
  }, [token, authUser]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !profileData || !authUser?.userId) return;
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const numericId = parseInt(authUser.userId, 10);
      if (isNaN(numericId)) {
        throw new Error('Invalid user ID.');
      }

      if (!profileData.Name.trim()) {
        throw new Error('Full Name is required.');
      }

      await updateUser(token, numericId, profileData);
      
      // Update Redux state user name in real-time
      dispatch(updateCurrentUser({ name: profileData.Name }));
      
      setSuccessMessage('Your profile has been updated successfully.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-[1000px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Section */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <div className="p-2 bg-teal-500 rounded-xl shadow-lg shadow-teal-500/20">
            <User className="text-white" size={32} />
          </div>
          User Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
          Manage your personal information, contact numbers, address details, and login credentials.
        </p>
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-rose-600 dark:text-rose-400">
          <AlertCircle size={20} />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-emerald-600 dark:text-emerald-400 animate-pulse">
          <CheckCircle size={20} />
          <p className="text-sm font-semibold">{successMessage}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-40">
          <RefreshCw size={40} className="animate-spin text-teal-500" />
        </div>
      ) : profileData ? (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <User size={12} className="text-slate-400" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileData.Name}
                onChange={(e) => setProfileData({ ...profileData, Name: e.target.value })}
                placeholder="e.g. John Doe"
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
              />
            </div>

            {/* Email Address (Locked) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Mail size={12} className="text-slate-400" />
                Email Address (Locked)
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={profileData.Email}
                  className="w-full bg-slate-100 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-800/80 rounded-2xl px-5 py-4 text-sm outline-none text-slate-400 cursor-not-allowed"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <Lock size={16} className="text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Phone Number */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Phone size={12} className="text-slate-400" />
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.Phone}
                onChange={(e) => setProfileData({ ...profileData, Phone: e.target.value })}
                placeholder="e.g. +923001234567"
                className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Lock size={12} className="text-slate-400" />
                Account Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={profileData.Password || ''}
                  onChange={(e) => setProfileData({ ...profileData, Password: e.target.value })}
                  placeholder="Enter new password to update"
                  className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 pr-12 text-sm transition-all outline-none dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Home Address */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <MapPin size={12} className="text-slate-400" />
              Home Address
            </label>
            <textarea
              rows={4}
              value={profileData.Address}
              onChange={(e) => setProfileData({ ...profileData, Address: e.target.value })}
              placeholder="Enter complete physical home or office address..."
              className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white resize-none"
            />
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={loadProfile}
              className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300 transition-all"
            >
              Reset Changes
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-10 py-4 bg-teal-500 text-white rounded-2xl font-bold shadow-xl shadow-teal-500/20 transition-all hover:scale-105 active:scale-95 disabled:bg-slate-300 dark:disabled:bg-slate-800"
            >
              {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
              Save Profile Details
            </button>
          </div>
        </form>
      ) : (
        <div className="py-20 text-center text-slate-400">
          <AlertCircle size={40} className="mx-auto mb-3" />
          <p className="text-lg">No profile data available.</p>
        </div>
      )}
    </div>
  );
};
export default Profile;
