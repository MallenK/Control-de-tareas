import { supabase } from './supabaseClient';
import { Task } from '../types';
import { fetchProfilesByIds } from './userService';

/**
 * Obtiene todas las tareas activas de un proyecto con sus asignados.
 */
export const fetchProjectTasks = async (projectId: string) => {
  // 1. Get Tasks
  const { data: tasks, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('position', { ascending: true });

  if (error) throw new Error(error.message);
  if (!tasks || tasks.length === 0) return [];

  const taskIds = tasks.map((t: any) => t.id);
  
  // 2. Get Assignments
  const { data: assignments, error: assignError } = await supabase
    .from('task_assignments')
    .select('task_id, user_id')
    .in('task_id', taskIds);

  if (assignError) console.error("Error fetching assignments", assignError);

  // 3. Get Profiles for assignees
  let profiles: any[] = [];
  if (assignments && assignments.length > 0) {
      const userIds: string[] = [...new Set((assignments as any[]).map((a: any) => String(a.user_id)))];
      profiles = await fetchProfilesByIds(userIds);
  }

  // 4. Merge Data
  const tasksWithAssignees = tasks.map((t: any) => {
    const taskAssignments = assignments?.filter((a: any) => a.task_id === t.id) || [];
    return {
        ...t,
        assignees: taskAssignments.map((a: any) => ({
            user_id: a.user_id,
            profile: profiles.find(p => p.id === a.user_id)
        }))
    };
  });

  return tasksWithAssignees as Task[];
};

/**
 * Crea una nueva tarea y asigna usuarios.
 */
export const createTask = async (
  projectId: string, 
  statusId: string, 
  title: string, 
  description: string, 
  userId: string,
  assigneeIds: string[] = []
) => {
  // 1. Calcular posición
  const { count, error: countError } = await supabase
    .from('project_tasks')
    .select('*', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('status_id', statusId)
    .is('deleted_at', null);

  if (countError) throw new Error("Error al calcular posición");
  const nextPosition = (count || 0) + 1;

  // 2. Insertar Tarea
  const { data: task, error } = await supabase
    .from('project_tasks')
    .insert([{
        project_id: projectId,
        status_id: statusId,
        title,
        description,
        created_by: userId,
        position: nextPosition 
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // 3. Insertar Asignaciones
  if (assigneeIds.length > 0) {
    const assignments = assigneeIds.map(uid => ({
        task_id: task.id,
        user_id: uid
    }));
    await supabase.from('task_assignments').insert(assignments);
  }

  return task as Task;
};

/**
 * Actualiza detalles y asignaciones.
 */
export const updateTaskDetails = async (
    taskId: string, 
    title: string, 
    description: string,
    assigneeIds: string[]
) => {
  // 1. Actualizar texto
  const { error } = await supabase
    .from('project_tasks')
    .update({ title, description, updated_at: new Date().toISOString() })
    .eq('id', taskId);

  if (error) throw new Error(error.message);

  // 2. Actualizar Asignaciones (Borrar previas e insertar nuevas)
  const { error: deleteError } = await supabase
    .from('task_assignments')
    .delete()
    .eq('task_id', taskId);
    
  if (deleteError) throw deleteError;

  if (assigneeIds.length > 0) {
    const newAssignments = assigneeIds.map(uid => ({
        task_id: taskId,
        user_id: uid
    }));
    const { error: insertError } = await supabase.from('task_assignments').insert(newAssignments);
    if (insertError) throw insertError;
  }
};

export const updateTaskLocation = async (taskId: string, newStatusId: string, newPosition?: number) => {
  let finalPosition = newPosition;

  if (finalPosition === undefined) {
    const { data: currentTask } = await supabase.from('project_tasks').select('project_id').eq('id', taskId).single();
    const { count } = await supabase
        .from('project_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', currentTask.project_id)
        .eq('status_id', newStatusId)
        .is('deleted_at', null);
    finalPosition = (count || 0) + 1;
  }

  const { data, error } = await supabase
    .from('project_tasks')
    .update({ status_id: newStatusId, position: finalPosition, updated_at: new Date().toISOString() })
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Task;
};

export const softDeleteTask = async (taskId: string) => {
  const { error } = await supabase
    .from('project_tasks')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', taskId);
  if (error) throw new Error(error.message);
};