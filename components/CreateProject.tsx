
import React, { useState, useEffect } from 'react';
import { createProject } from '../services/projectService';
import { fetchAllProfiles } from '../services/userService';
import { Profile, ProjectRole } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { ToggleSwitch } from './ToggleSwitch';
import { MultiSelectUsers } from './MultiSelectUsers';
import { FolderPlus, Shield } from 'lucide-react';

interface CreateProjectProps {
  ownerId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateProject: React.FC<CreateProjectProps> = ({ ownerId, onSuccess, onCancel }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPersonal, setIsPersonal] = useState(true);
  
  // Estado para miembros seleccionados
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  
  // Estado para el rol seleccionado (Gestor vs Trabajador)
  // Por defecto "Trabajador" como se solicitó
  const [selectedRole, setSelectedRole] = useState<ProjectRole>('trabajador');
  
  const [availableUsers, setAvailableUsers] = useState<Profile[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Cargar usuarios si cambiamos a modo equipo
    const loadUsers = async () => {
        const users = await fetchAllProfiles();
        // Filtrar al dueño actual de la lista
        setAvailableUsers(users.filter(u => u.id !== ownerId));
    };
    loadUsers();
  }, [ownerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Formatear miembros con el rol seleccionado
      const membersPayload = selectedUserIds.map(userId => ({
        userId,
        role: selectedRole
      }));

      await createProject(name, description, ownerId, isPersonal, membersPayload);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#E0E5EC]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="neu-flat p-8 w-full max-w-md animate-zoom-in max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 neu-inset rounded-full flex items-center justify-center text-[#667EEA]">
                <FolderPlus size={24} strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-black text-gray-700">Nuevo Proyecto</h2>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input 
            label="Nombre del Proyecto" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            className="input-modal"
          />
          
          <div className="mb-6">
            <label className="block text-sm font-extrabold text-[#4A5568] mb-2 ml-2 tracking-wide">Descripción</label>
            <textarea 
              className="w-full px-4 py-3 rounded-xl input-modal resize-none outline-none focus:ring-2 focus:ring-[#667EEA]/50 transition-all text-gray-800"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <ToggleSwitch 
            label={isPersonal ? "Proyecto Personal" : "Proyecto de Equipo"}
            checked={!isPersonal} 
            onChange={(checked) => {
                setIsPersonal(!checked); 
                if (!checked) setSelectedUserIds([]);
            }}
          />

          {!isPersonal && (
            <div className="animate-fade-in space-y-5 mb-6">
                
                {/* Selector de Rol Visual */}
                <div className="bg-white rounded-xl border-2 border-blue-50 p-4 shadow-sm">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Shield size={14} className="text-blue-500" /> Rol para los nuevos miembros
                    </label>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setSelectedRole('trabajador')}
                            className={`relative p-3 rounded-lg border-2 text-left transition-all ${
                                selectedRole === 'trabajador' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-100 hover:border-blue-200'
                            }`}
                        >
                            <div className="font-bold text-sm text-gray-800">Trabajador</div>
                            <div className="text-[10px] text-gray-500 mt-1 leading-tight">Acceso estándar a tareas asignadas.</div>
                            {selectedRole === 'trabajador' && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => setSelectedRole('gestor')}
                            className={`relative p-3 rounded-lg border-2 text-left transition-all ${
                                selectedRole === 'gestor' 
                                ? 'border-purple-500 bg-purple-50' 
                                : 'border-gray-100 hover:border-purple-200'
                            }`}
                        >
                            <div className="font-bold text-sm text-gray-800">Gestor</div>
                            <div className="text-[10px] text-gray-500 mt-1 leading-tight">Puede gestionar tareas y configurar.</div>
                            {selectedRole === 'gestor' && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full"></div>
                            )}
                        </button>
                    </div>
                </div>

                <MultiSelectUsers 
                    label={`Seleccionar usuarios (${selectedRole})`}
                    users={availableUsers}
                    selectedUserIds={selectedUserIds}
                    onChange={setSelectedUserIds}
                />
            </div>
          )}

          <div className="flex gap-4 mt-8">
            <div className="w-1/2">
                <Button type="button" variant="secondary" onClick={onCancel} className="w-full">
                Cancelar
                </Button>
            </div>
            <div className="w-1/2">
                <Button type="submit" isLoading={loading} className="w-full">
                Crear Proyecto
                </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
