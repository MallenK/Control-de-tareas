import React, { useEffect, useState } from 'react';
import { Project, ProjectStatus, Task } from '../types';
import { fetchProjectStatuses } from '../services/projectService';
import { fetchProjectTasks, updateTaskLocation, softDeleteTask } from '../services/taskService';
import { supabase } from '../services/supabaseClient';
import { TaskCard } from './TaskCard';
import { CreateTask } from './CreateTask';
import { EditTask } from './EditTask';
import { Plus, Loader2, AlertCircle } from 'lucide-react';

interface ProjectKanbanProps {
  project: Project;
  onClose: () => void;
  onStatusChange: () => void; // Used to refresh project list if needed
}

export const ProjectKanban: React.FC<ProjectKanbanProps> = ({ project, onClose }) => {
  const [statuses, setStatuses] = useState<ProjectStatus[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for modals
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  // Cargar usuario actual para asignación
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        if (data.user) setCurrentUser(data.user.id);
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [project.id]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statusesData, tasksData] = await Promise.all([
        fetchProjectStatuses(project.id),
        fetchProjectTasks(project.id)
      ]);
      setStatuses(statusesData);
      setTasks(tasksData);
    } catch (err: any) {
      console.error("Error loading board data", err);
      setError("No se pudieron cargar los datos del tablero.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("¿Eliminar esta tarea permanentemente?")) return;
    try {
        await softDeleteTask(taskId);
        setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
        alert("Error al eliminar tarea");
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleTaskUpdated = () => {
    setEditingTask(null);
    loadData(); // Recargamos para asegurar consistencia
  };

  const handleMoveTask = async (taskId: string, newStatusId: string) => {
    // Optimistic UI Update
    const originalTasks = [...tasks];
    setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status_id: newStatusId } : t
    ));

    try {
        await updateTaskLocation(taskId, newStatusId);
    } catch (err) {
        console.error("Move failed", err);
        // Revertir si falla
        setTasks(originalTasks);
        alert("No se pudo mover la tarea.");
    }
  };

  // --- Drag & Drop Handlers ---

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necesario para permitir el drop
  };

  const onDrop = (e: React.DragEvent, targetStatusId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (task && task.status_id !== targetStatusId) {
        handleMoveTask(taskId, targetStatusId);
    }
  };

  if (loading) return (
      <div className="flex flex-col items-center justify-center h-[500px] text-gray-500">
          <Loader2 className="animate-spin mb-2" size={32}/>
          <p>Cargando tablero...</p>
      </div>
  );

  if (error) return (
      <div className="p-8 text-center text-red-500 bg-red-50 rounded-lg">
          <AlertCircle className="mx-auto mb-2" />
          {error}
          <button onClick={loadData} className="block mx-auto mt-4 text-sm text-blue-600 underline">Reintentar</button>
      </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[75vh]">
      {/* Header del Tablero */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white shadow-sm z-10">
        <div>
          <h3 className="font-bold text-xl text-gray-800 flex items-center gap-2">
            {project.name}
          </h3>
          <p className="text-xs text-gray-500">Tablero de Tareas</p>
        </div>
        <div className="flex items-center gap-2">
            <button 
                onClick={() => setShowCreateTask(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center transition-colors"
            >
                <Plus size={16} className="mr-1" /> Nueva Tarea
            </button>
            <button onClick={onClose} className="ml-2 text-sm text-gray-500 hover:text-gray-800 border-l pl-3">
                Cerrar
            </button>
        </div>
      </div>

      {/* Área de Columnas (Kanban) */}
      <div className="flex-1 overflow-x-auto p-4 bg-gray-100">
        <div className="flex gap-4 h-full min-w-max">
          {statuses.map((status) => {
            const columnTasks = tasks.filter(t => t.status_id === status.id);
            
            return (
              <div 
                key={status.id} 
                className="w-80 flex flex-col h-full bg-gray-200/60 rounded-lg border border-gray-300/50"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, status.id)}
              >
                {/* Header Columna */}
                <div className="p-3 font-semibold text-sm text-gray-700 flex justify-between items-center sticky top-0 bg-gray-200/60 backdrop-blur-sm rounded-t-lg z-10">
                  <span className="uppercase tracking-wider text-xs font-bold">{status.name}</span>
                  <span className="bg-gray-300 text-gray-600 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Lista de Tareas */}
                <div className="flex-1 p-2 overflow-y-auto space-y-3 custom-scrollbar">
                  {columnTasks.length === 0 ? (
                    <div className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        Arrastra tareas aquí
                    </div>
                  ) : (
                    columnTasks.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            allStatuses={statuses}
                            onDelete={handleDeleteTask}
                            onEdit={handleEditTask}
                            onMove={handleMoveTask}
                        />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="bg-white p-2 border-t text-[10px] text-gray-400 text-center flex justify-between px-4">
        <span>Drag & Drop habilitado</span>
        <span>ID Proyecto: {project.id}</span>
      </div>

      {/* Modal Crear Tarea */}
      {showCreateTask && currentUser && statuses.length > 0 && (
        <CreateTask
            projectId={project.id}
            initialStatusId={statuses[0].id} 
            currentUserId={currentUser}
            onSuccess={() => { setShowCreateTask(false); loadData(); }}
            onCancel={() => setShowCreateTask(false)}
        />
      )}

      {/* Modal Editar Tarea */}
      {editingTask && (
        <EditTask
            task={editingTask}
            onSuccess={handleTaskUpdated}
            onCancel={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};