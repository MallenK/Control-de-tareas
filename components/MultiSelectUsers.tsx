import React from 'react';
import { Profile } from '../types';
import { Check } from 'lucide-react';

interface MultiSelectUsersProps {
  users: Profile[];
  selectedUserIds: string[];
  onChange: (ids: string[]) => void;
  label: string;
}

export const MultiSelectUsers: React.FC<MultiSelectUsersProps> = ({ users, selectedUserIds, onChange, label }) => {
  const toggleUser = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      onChange(selectedUserIds.filter(id => id !== userId));
    } else {
      onChange([...selectedUserIds, userId]);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-extrabold text-[#4A5568] mb-2 ml-2 tracking-wide">{label}</label>
      <div className="neu-inset bg-[#E0E5EC] rounded-xl p-2 max-h-48 overflow-y-auto custom-scrollbar">
        {users.length === 0 ? (
            <p className="text-xs text-gray-500 p-2 text-center">No hay usuarios disponibles.</p>
        ) : (
            <div className="space-y-1">
                {users.map(user => {
                    const isSelected = selectedUserIds.includes(user.id);
                    // Lógica robusta para mostrar el nombre: Full Name -> Username -> Email -> "Usuario"
                    const displayName = user.full_name || user.username || user.email || 'Usuario';
                    const initial = displayName.charAt(0).toUpperCase();

                    return (
                        <div 
                            key={user.id} 
                            onClick={() => toggleUser(user.id)}
                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                                isSelected ? 'bg-white shadow-sm' : 'hover:bg-gray-200/50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isSelected ? 'bg-[#667EEA] text-white' : 'bg-gray-300 text-gray-600'
                                }`}>
                                    {initial}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-gray-600'}`}>
                                        {displayName}
                                    </span>
                                    {isSelected && <span className="text-[10px] text-blue-500 font-semibold">Seleccionado</span>}
                                </div>
                            </div>
                            {isSelected && <Check size={16} className="text-[#667EEA]" strokeWidth={3} />}
                        </div>
                    );
                })}
            </div>
        )}
      </div>
    </div>
  );
};