
import { supabase } from './supabaseClient';
import { Project, ProjectMember, ProjectStatus, ProjectRole } from '../types';
import { fetchProfilesByIds } from './userService';

/**
 * Obtiene proyectos activos donde el usuario es miembro.
 */
export const fetchUserProjects = async (userId: string) => {
  const { data: memberData, error: memberError } = await supabase
    .from('project_members')
    .select('project_id')
    .eq('user_id', userId);

  if (memberError) {
    console.error('Error fetching project members:', JSON.stringify(memberError, null, 2));
    throw new Error(memberError.message);
  }

  const projectIds = (memberData || []).map((row: any) => row.project_id);

  if (projectIds.length === 0) return [];

  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('*')
    .in('id', projectIds)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (projectsError) {
    console.error('Error fetching projects:', JSON.stringify(projectsError, null, 2));
    throw new Error(projectsError.message);
  }
  return projects as Project[];
};

/**
 * Crea un proyecto y asigna miembros iniciales con rol específico.
 * ACTUALIZADO: Soporta la nueva estructura de roles.
 */
export const createProject = async (
  name: string, 
  description: string, 
  ownerId: string, 
  isPersonal: boolean,
  // Recibimos un objeto con userId y el rol específico para ese usuario (o el seleccionado en UI)
  members: { userId: string, role: ProjectRole }[] = []
) => {
  // 1. Crear proyecto
  const { data: project, error } = await supabase
    .from('projects')
    .insert([{ name, description, owner_id: ownerId, is_personal: isPersonal }])
    .select()
    .single();

  if (error) throw new Error(error.message);

  // 2. Añadir al dueño como 'super_admin' AUTOMÁTICAMENTE
  const ownerMember = {
    project_id: project.id,
    user_id: ownerId,
    role: 'super_admin' 
  };

  // Preparar lista de inserción
  let membersToInsert = [ownerMember];

  if (!isPersonal && members.length > 0) {
    const additionalMembers = members
        .filter(m => m.userId !== ownerId)
        .map(m => ({
            project_id: project.id,
            user_id: m.userId,
            role: m.role // Usamos el rol que viene del componente (gestor o trabajador)
        }));
    membersToInsert = [...membersToInsert, ...additionalMembers];
  }

  // Insertar todos los miembros
  if (membersToInsert.length > 0) {
      const { error: membersError } = await supabase
          .from('project_members')
          .insert(membersToInsert);
      
      if (membersError) {
        // Si falla la inserción de miembros, logueamos el error pero no fallamos toda la creación del proyecto
        // para evitar un estado inconsistente visual grave.
        console.error("Error adding members:", membersError);
        // Opcional: Podríamos borrar el proyecto si fallan los miembros, pero por ahora lanzamos advertencia.
      }
  }

  return project as Project;
};

export const softDeleteProject = async (projectId: string) => {
  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', projectId);

  if (error) throw new Error(error.message);
};

export const fetchProjectStatuses = async (projectId: string) => {
  const { data, error } = await supabase
    .from('project_statuses')
    .select('*')
    .eq('project_id', projectId)
    .order('position', { ascending: true });

  if (error) throw new Error(error.message);
  return data as ProjectStatus[];
};

/**
 * Obtiene miembros del proyecto y sus perfiles manualmente.
 */
export const fetchProjectMembers = async (projectId: string) => {
  // 1. Fetch Members
  const { data: members, error } = await supabase
    .from('project_members')
    .select('*')
    .eq('project_id', projectId);

  if (error) throw new Error(error.message);
  
  if (!members || members.length === 0) return [];

  // 2. Fetch Profiles for these members manually (safer than SQL join)
  const userIds = members.map((m: any) => m.user_id);
  const profiles = await fetchProfilesByIds(userIds);

  // 3. Merge data
  return members.map((member: any) => ({
    ...member,
    profile: profiles.find(p => p.id === member.user_id)
  })) as ProjectMember[];
};
