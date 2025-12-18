import React, { useState, useEffect } from 'react';
import { updateTaskDetails } from '../services/taskService';
import { fetchProjectMembers } from '../services/projectService';
import { Task, Profile } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { MultiSelectUsers } from './MultiSelectUsers';
import { Pencil } from 'lucide-react';

interface EditTaskProps {
  task: Task;
  onSuccess: () => void;
  onCancel: () => void;
}

export const EditTask: React.FC<EditTaskProps> = ({ task, onSuccess, onCancel }) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [assignees, setAssignees] = useState<string[]>([]);
  const [projectMembers, setProjectMembers] = useState<Profile[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description || '');
    // Cargar asignados actuales
    if (task.assignees) {
        setAssignees(task.assignees.map(a => a.user_id));
    }
  }, [task]);

  useEffect(() => {
    const loadMembers = async () => {
        try {
            const members = await fetchProjectMembers(task.project_id);
            const profiles = members
                .map(m => m.profile)
                .filter((p): p is Profile => !!p);
            setProjectMembers(profiles);
        } catch (e) {
            console.error("Failed to load members", e);
        }
    };
    loadMembers();
  }, [task.project_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateTaskDetails(task.id, title, description, assignees);
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Error al actualizar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#E0E5EC]/80 backdrop-blur-sm flex items-center justify-center p-4 z-[80]">
      <div className="neu-flat p-8 w-full max-w-md animate-zoom-in max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 neu-inset rounded-full flex items-center justify-center text-[#667EEA]">
                <Pencil size={20} strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-black text-gray-700">Editar Tarea</h2>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input 
            label="Título" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
            autoFocus
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

          <MultiSelectUsers 
            label="Asignar a"
            users={projectMembers}
            selectedUserIds={assignees}
            onChange={setAssignees}
          />

          <div className="flex gap-4 pt-4">
            <div className="w-1/2">
                <Button type="button" variant="secondary" onClick={onCancel} className="w-full">
                    Cancelar
                </Button>
            </div>
            <div className="w-1/2">
                <Button type="submit" isLoading={loading} variant="primary" className="w-full">
                    Guardar
                </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};