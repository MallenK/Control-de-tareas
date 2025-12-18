import React from 'react';
import { Task, ProjectStatus } from '../types';
import { GripVertical, Trash2, Pencil, User } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  allStatuses: ProjectStatus[];
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onMove: (taskId: string, newStatusId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, allStatuses, onDelete, onEdit, onMove }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div 
      className="neu-flat p-5 mb-4 cursor-grab active:cursor-grabbing group relative hover:-translate-y-1 transition-transform duration-300"
      draggable="true"
      onDragStart={handleDragStart}
    >
      <div className="flex justify-between items-start gap-3 mb-2">
        <h4 className="text-sm font-bold text-gray-700 break-words flex-1 leading-snug">{task.title}</h4>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-gray-400">
            <GripVertical size={16} />
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-500 mb-4 line-clamp-3 leading-relaxed font-medium">{task.description}</p>
      )}

      {/* Assignees List */}
      <div className="flex -space-x-2 mb-3 overflow-hidden pl-1">
        {task.assignees && task.assignees.length > 0 ? (
            task.assignees.map((assignee) => {
                const displayName = assignee.profile?.full_name || assignee.profile?.username || assignee.profile?.email || "U";
                const initial = displayName.charAt(0).toUpperCase();
                
                return (
                    <div 
                        key={assignee.user_id} 
                        className="w-6 h-6 rounded-full bg-[#E0E5EC] border border-white flex items-center justify-center text-[10px] font-bold text-[#667EEA] shadow-sm"
                        title={displayName}
                    >
                        {initial}
                    </div>
                );
            })
        ) : (
            <span className="text-[10px] text-gray-400 italic">Sin asignar</span>
        )}
      </div>

      {/* Controls */}
      <div className="pt-3 border-t border-gray-200/50 flex justify-between items-center gap-2">
        <div className="relative flex-1">
            <select 
                className="appearance-none w-full text-[10px] font-bold text-[#667EEA] bg-transparent py-1 pr-4 rounded outline-none cursor-pointer uppercase tracking-wider hover:text-[#5a67d8] transition-colors"
                value={task.status_id}
                onChange={(e) => onMove(task.id, e.target.value)}
            >
                {allStatuses.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>
        </div>

        <div className="flex items-center gap-3">
            <button 
                onClick={() => onEdit(task)}
                className="neu-icon-btn w-8 h-8 text-gray-400 hover:text-[#667EEA]"
                title="Editar"
            >
                <Pencil size={12} strokeWidth={2.5} />
            </button>
            <button 
                onClick={() => onDelete(task.id)}
                className="neu-icon-btn w-8 h-8 text-gray-400 hover:text-[#FC8181]"
                title="Eliminar"
            >
                <Trash2 size={12} strokeWidth={2.5} />
            </button>
        </div>
      </div>
    </div>
  );
};