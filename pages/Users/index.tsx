import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Trash2,
  Users as UsersIcon,
  Save,
  X,
  Settings2,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Lock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppSelector } from '../../store/hooks';
import { selectToken } from '../../store/selectors/appSelectors';
import {
  fetchUsers,
  fetchUserTypes,
  createUser,
  updateUser,
  deleteUser,
  ApiUser
} from '../../services/usersApi';

export const Users: React.FC = () => {
  const token = useAppSelector(selectToken);
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [userTypes, setUserTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState<ApiUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const usersData = await fetchUsers(token);
      setUsers(usersData);

      const typesData = await fetchUserTypes(token);
      setUserTypes(typesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateNew = () => {
    const newUser: ApiUser = {
      Name: '',
      Email: '',
      Phone: '',
      Address: '',
      Type: userTypes[0]?.value || userTypes[0]?.Value || 'Admin',
      Status: 'Active',
      Password: '',
      IsActive: true
    };
    setCurrentUser(newUser);
    setIsEditing(true);
  };

  const handleEdit = (user: ApiUser) => {
    setCurrentUser({ ...user });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!token) return;
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(token, id);
        setUsers(users.filter(u => u.ID !== id));
        if (currentUser?.ID === id) {
          setIsEditing(false);
          setCurrentUser(null);
        }
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete user.');
      }
    }
  };

  const handleSave = async () => {
    if (!token || !currentUser) return;
    if (!currentUser.Name || !currentUser.Email) {
      alert('Please fill in Name and Email.');
      return;
    }

    try {
      if (currentUser.ID !== undefined && currentUser.ID !== null && currentUser.ID !== 0) {
        await updateUser(token, currentUser.ID, currentUser);
      } else {
        await createUser(token, currentUser);
      }
      await loadData();
      setIsEditing(false);
      setCurrentUser(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save user.');
    }
  };

  const filteredUsers = users.filter(u => {
    const nameStr = u.Name || '';
    const emailStr = u.Email || '';
    const phoneStr = u.Phone || '';
    const matchesSearch = nameStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emailStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          phoneStr.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || u.Type === filterType;
    return matchesSearch && matchesType;
  });

  const uniqueTypes = Array.from(new Set(users.map(u => u.Type).filter(Boolean)));

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-teal-500 rounded-xl shadow-lg shadow-teal-500/20">
              <UsersIcon className="text-white" size={32} />
            </div>
            User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Create, update, and manage system administrators, staff, and customer accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-teal-500 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-95"
          >
            <Plus size={20} />
            Add New User
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-40">
          <RefreshCw size={40} className="animate-spin text-teal-500" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 gap-3">
          <AlertCircle size={40} />
          <p>{error}</p>
          <button onClick={loadData} className="px-4 py-2 bg-teal-500 text-white rounded-xl">Try Again</button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl outline-none transition-all dark:text-white text-sm"
              />
            </div>
            <div className="flex items-center gap-2 p-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto max-w-full font-bold">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterType === 'ALL' ? 'bg-white dark:bg-slate-800 text-teal-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                ALL TYPES
              </button>
              {uniqueTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filterType === type ? 'bg-white dark:bg-slate-800 text-teal-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {String(type).toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                    <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">User Details</th>
                    <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</th>
                    <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Type</th>
                    <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Active</th>
                    <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-16 text-center text-slate-400">
                        <UsersIcon size={32} className="mx-auto opacity-50 mb-2" />
                        <p className="text-sm font-medium">No users found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.ID} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="p-6">
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-base leading-tight">{user.Name}</p>
                            <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                              <Mail size={14} className="text-slate-400" />
                              {user.Email}
                            </p>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="space-y-1">
                            {user.Phone && (
                              <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                                <Phone size={14} className="text-slate-400" />
                                {user.Phone}
                              </p>
                            )}
                            {user.Address && (
                              <p className="text-xs text-slate-400 flex items-center gap-1.5 truncate max-w-xs">
                                <MapPin size={12} className="text-slate-400 shrink-0" />
                                {user.Address}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-6">
                          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                            {user.Type}
                          </span>
                        </td>
                        <td className="p-6">
                          {user.IsActive ? (
                            <CheckCircle className="text-emerald-500" size={20} />
                          ) : (
                            <XCircle className="text-slate-300 dark:text-slate-700" size={20} />
                          )}
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl transition-all"
                            >
                              <Settings2 size={18} />
                            </button>
                            {user.ID && (
                              <button
                                onClick={() => handleDelete(user.ID!)}
                                className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 rounded-xl transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditing && currentUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-full"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                    <Settings2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {currentUser.ID ? 'Edit User' : 'Add New User'}
                    </h2>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Configure user login credentials and roles</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl hover:scale-110 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                    <input
                      type="text"
                      required
                      value={currentUser.Name}
                      onChange={(e) => setCurrentUser({...currentUser, Name: e.target.value})}
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                    <input
                      type="email"
                      required
                      value={currentUser.Email}
                      onChange={(e) => setCurrentUser({...currentUser, Email: e.target.value})}
                      placeholder="e.g. john@example.com"
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone Number</label>
                    <input
                      type="tel"
                      value={currentUser.Phone}
                      onChange={(e) => setCurrentUser({...currentUser, Phone: e.target.value})}
                      placeholder="e.g. +923001234567"
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">User Type (Role)</label>
                    <select
                      value={currentUser.Type}
                      onChange={(e) => setCurrentUser({...currentUser, Type: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white appearance-none"
                    >
                      {userTypes.map((type) => {
                        const label = type.value || type.Value || type.Term || type.TermName || type.Name || 'Admin';
                        const val = type.value || type.Value || type.Term || type.Name || 'Admin';
                        return (
                          <option key={val} value={val}>{label}</option>
                        );
                      })}
                      {userTypes.length === 0 && (
                        <>
                          <option value="Admin">Admin</option>
                          <option value="MergnUser">MergnUser</option>
                          <option value="FeedbackTeam">FeedbackTeam</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                    <select
                      value={currentUser.Status}
                      onChange={(e) => setCurrentUser({...currentUser, Status: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white appearance-none"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="">None</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                      <Lock size={12} className="text-slate-400" />
                      Password
                    </label>
                    <input
                      type="text"
                      value={currentUser.Password || ''}
                      onChange={(e) => setCurrentUser({...currentUser, Password: e.target.value})}
                      placeholder={currentUser.ID ? 'Leave blank to keep existing' : 'Enter account password'}
                      className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Home Address</label>
                  <textarea
                    rows={3}
                    value={currentUser.Address}
                    onChange={(e) => setCurrentUser({...currentUser, Address: e.target.value})}
                    placeholder="Enter complete physical address..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl px-5 py-4 text-sm transition-all outline-none dark:text-white resize-none"
                  />
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="sm:text-sm text-xs font-bold text-slate-900 dark:text-white">Active Status</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Allow this user to sign in to Broadway Pizza portal</p>
                  </div>
                  <button
                    onClick={() => setCurrentUser({...currentUser, IsActive: !currentUser.IsActive})}
                    className={`w-14 h-8 rounded-full transition-all relative ${currentUser.IsActive ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-all ${currentUser.IsActive ? 'left-7' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between sticky bottom-0">
                {currentUser.ID ? (
                  <button
                    onClick={() => handleDelete(currentUser.ID!)}
                    className="flex items-center gap-2 px-6 py-3 text-rose-500 hover:bg-rose-500/10 rounded-2xl font-bold transition-all"
                  >
                    <Trash2 size={20} />
                    Delete User
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-10 py-4 bg-teal-500 text-white rounded-2xl font-bold shadow-xl shadow-teal-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <Save size={20} />
                    <span>Save User</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
