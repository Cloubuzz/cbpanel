import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Shield,
  Search,
  CheckSquare,
  Square,
  Save,
  RotateCcw,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  ChevronRight,
  Info
} from 'lucide-react';
import { useAppSelector } from '../../store/hooks';
import { selectToken } from '../../store/selectors/appSelectors';
import { fetchUserTypes } from '../../services/usersApi';
import { fetchRolePermissions, saveRolePermissions } from '../../services/roleManagementApi';
import { NAV_ITEMS, DEFAULT_ROLE_MODULES } from '../../constants';

interface ModuleItemFlat {
  id: string;
  label: string;
  category: string;
}

export const RoleManagement: React.FC = () => {
  const token = useAppSelector(selectToken);
  
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [permissions, setPermissions] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [roleSearch, setRoleSearch] = useState('');
  const [moduleSearch, setModuleSearch] = useState('');

  // 1. Flatten NAV_ITEMS to easily map modules to their labels and parent categories
  const allModulesList = useMemo(() => {
    const list: ModuleItemFlat[] = [];
    NAV_ITEMS.forEach((item) => {
      if (item.subItems) {
        item.subItems.forEach((sub) => {
          list.push({
            id: sub.id,
            label: sub.label,
            category: item.label
          });
        });
      } else {
        list.push({
          id: item.id,
          label: item.label,
          category: 'General'
        });
      }
    });
    return list;
  }, []);

  // 2. Fetch User Types and database-backed permissions
  const loadData = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      // Fetch dynamic user types (roles)
      const rolesData = await fetchUserTypes(token);
      setRoles(rolesData);
      
      // Select first role by default
      if (rolesData.length > 0) {
        const firstRole = rolesData[0].value || rolesData[0].Value || rolesData[0].Name || 'Admin';
        setSelectedRole(firstRole);
      }

      // Fetch permissions from database
      const dbPermissions = await fetchRolePermissions(token);
      const permMap: Record<string, string[]> = {};
      
      // Populate map of lowercased role -> array of ModuleIds
      dbPermissions.forEach((p) => {
        const roleKey = p.UserType.toLowerCase();
        if (!permMap[roleKey]) {
          permMap[roleKey] = [];
        }
        permMap[roleKey].push(p.ModuleId.toLowerCase());
      });

      // Overlay on top of default role modules to ensure a fallback is always present
      const finalPerms = { ...DEFAULT_ROLE_MODULES };
      Object.keys(permMap).forEach((roleKey) => {
        finalPerms[roleKey] = permMap[roleKey];
      });

      setPermissions(finalPerms);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load role permissions.');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Selected role's current modules
  const currentRoleModules = useMemo(() => {
    const roleKey = selectedRole.toLowerCase();
    return permissions[roleKey] || [];
  }, [permissions, selectedRole]);

  // Handle individual module toggles
  const handleToggleModule = (moduleId: string) => {
    const roleKey = selectedRole.toLowerCase();
    const current = permissions[roleKey] || [];
    const lowerId = moduleId.toLowerCase();
    
    let updated: string[];
    if (current.includes(lowerId)) {
      updated = current.filter((id) => id !== lowerId);
    } else {
      updated = [...current, lowerId];
    }

    setPermissions({
      ...permissions,
      [roleKey]: updated
    });
  };

  // Select all modules for current role
  const handleSelectAll = () => {
    const roleKey = selectedRole.toLowerCase();
    const allIds = allModulesList.map((m) => m.id.toLowerCase());
    setPermissions({
      ...permissions,
      [roleKey]: allIds
    });
  };

  // Deselect all modules for current role
  const handleDeselectAll = () => {
    const roleKey = selectedRole.toLowerCase();
    setPermissions({
      ...permissions,
      [roleKey]: []
    });
  };

  // Reset permissions to default config
  const handleReset = () => {
    const roleKey = selectedRole.toLowerCase();
    const defaultModules = DEFAULT_ROLE_MODULES[roleKey] || DEFAULT_ROLE_MODULES['admin'] || [];
    setPermissions({
      ...permissions,
      [roleKey]: defaultModules.map((m) => m.toLowerCase())
    });
  };

  // Save permissions to server & local storage
  const handleSave = async () => {
    if (!token || !selectedRole) return;
    setIsSaving(true);
    setSuccessMessage(null);
    setError(null);
    try {
      const roleKey = selectedRole.toLowerCase();
      const modulesToSave = permissions[roleKey] || [];
      
      // Save permissions to DB
      const success = await saveRolePermissions(token, selectedRole, modulesToSave);
      if (success) {
        // Update local storage
        const storedModulesRaw = localStorage.getItem('pizzamax_role_modules');
        let currentStorage: Record<string, string[]> = {};
        try {
          if (storedModulesRaw) {
            currentStorage = JSON.parse(storedModulesRaw);
          }
        } catch {
          // ignore
        }
        
        currentStorage[roleKey] = modulesToSave;
        localStorage.setItem('pizzamax_role_modules', JSON.stringify(currentStorage));

        // Dispatch storage changed event to sync sidebar and launchpad
        window.dispatchEvent(new Event('role_modules_changed'));
        
        setSuccessMessage(`Permissions for role '${selectedRole}' updated successfully.`);
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        throw new Error('Server returned failure status.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered lists
  const filteredRoles = useMemo(() => {
    return roles.filter((r) => {
      const name = r.value || r.Value || r.Name || '';
      return name.toLowerCase().includes(roleSearch.toLowerCase());
    });
  }, [roles, roleSearch]);

  const filteredModulesList = useMemo(() => {
    return allModulesList.filter((m) => {
      const matchesSearch = m.label.toLowerCase().includes(moduleSearch.toLowerCase()) || 
                            m.category.toLowerCase().includes(moduleSearch.toLowerCase());
      return matchesSearch;
    });
  }, [allModulesList, moduleSearch]);

  // Group modules by category for rendering
  const groupedModules = useMemo(() => {
    const groups: Record<string, ModuleItemFlat[]> = {};
    filteredModulesList.forEach((m) => {
      if (!groups[m.category]) {
        groups[m.category] = [];
      }
      groups[m.category].push(m);
    });
    return groups;
  }, [filteredModulesList]);

  return (
    <div className="p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-teal-500 rounded-xl shadow-lg shadow-teal-500/20">
              <Shield className="text-white" size={32} />
            </div>
            Role Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Configure system module visibility, access levels, and views based on administrative user types.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={isLoading}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 hover:text-teal-500 transition-all shadow-sm"
            title="Refresh permissions"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !selectedRole}
            className="flex items-center gap-2 px-8 py-3.5 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-2xl font-bold transition-all shadow-lg shadow-teal-500/20 active:scale-95"
          >
            {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
            Save Permissions
          </button>
        </div>
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Pane - Roles Listing */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col h-[70vh]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Roles &amp; User Types</h3>
            <div className="relative group mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search roles..."
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl outline-none transition-all dark:text-white text-sm"
              />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {filteredRoles.map((roleObj) => {
                const roleName = roleObj.value || roleObj.Value || roleObj.Name || 'Admin';
                const isSelected = selectedRole.toLowerCase() === roleName.toLowerCase();
                const activeCount = permissions[roleName.toLowerCase()]?.length || 0;

                return (
                  <button
                    key={roleName}
                    onClick={() => {
                      setSelectedRole(roleName);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border text-left ${
                      isSelected
                        ? 'bg-gradient-to-r from-teal-500/10 to-transparent border-teal-500/30 text-teal-500 dark:text-teal-400 font-bold'
                        : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isSelected ? 'bg-teal-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Shield size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{roleName}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                          {activeCount} active modules
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={16} className={`${isSelected ? 'text-teal-500' : 'text-slate-300 dark:text-slate-700'}`} />
                  </button>
                );
              })}

              {filteredRoles.length === 0 && (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-sm">No roles found matching query.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Pane - Permissions Configuration */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex flex-col h-[70vh]">
            
            {/* Header Tools */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Configure Modules</span>
                  <span className="text-xs font-bold bg-teal-500/10 text-teal-500 dark:text-teal-400 border border-teal-500/20 px-2 py-0.5 rounded-lg uppercase">
                    {selectedRole || 'None Selected'}
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Assign accessible views and navigation links for this role type.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-teal-500 hover:bg-teal-500/10 rounded-xl transition-all"
                >
                  <CheckSquare size={14} />
                  Select All
                </button>
                <button
                  onClick={handleDeselectAll}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <XCircle size={14} />
                  Deselect All
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <RotateCcw size={14} />
                  Reset
                </button>
              </div>
            </div>

            {/* Module Search */}
            <div className="relative group mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors" size={18} />
              <input
                type="text"
                placeholder="Search modules..."
                value={moduleSearch}
                onChange={(e) => setModuleSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-teal-500 rounded-2xl outline-none transition-all dark:text-white text-sm"
              />
            </div>

            {/* Modules Checkbox Grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-1">
              {Object.keys(groupedModules).map((categoryName) => {
                const modules = groupedModules[categoryName];
                return (
                  <div key={categoryName} className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-2 border-teal-500 pl-2">
                      {categoryName}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {modules.map((mod) => {
                        const isChecked = currentRoleModules.includes(mod.id.toLowerCase());
                        return (
                          <div
                            key={mod.id}
                            onClick={() => handleToggleModule(mod.id)}
                            className={`flex items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-slate-50/50 dark:bg-teal-950/10 border-teal-500/20 dark:border-teal-500/30'
                                : 'bg-transparent border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/10'
                            }`}
                          >
                            <div className={`transition-colors ${isChecked ? 'text-teal-500' : 'text-slate-400'}`}>
                              {isChecked ? <CheckSquare size={20} /> : <Square size={20} />}
                            </div>
                            <div>
                              <p className={`text-sm font-semibold transition-colors ${isChecked ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                {mod.label}
                              </p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                ID: {mod.id}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {Object.keys(groupedModules).length === 0 && (
                <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Info size={32} className="opacity-40" />
                  <p className="text-sm font-medium">No modules found matching query.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RoleManagement;
