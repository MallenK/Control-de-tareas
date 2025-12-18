
export interface UserMetadata {
  username?: string;
  full_name?: string;
  phone?: string;
  [key: string]: any;
}

export interface Profile {
  id: string;
  username?: string;     // En tu tabla es 'text', puede ser nulo o string
  email?: string;        // Añadido según tu esquema
  full_name?: string;    // Lo marcamos opcional por si acaso no viene de DB
  avatar_url?: string;
}

export interface AuthError {
  message: string;
}

export enum AuthView {
  SIGN_IN = 'SIGN_IN',
  SIGN_UP = 'SIGN_UP'
}

// --- Tipos de Proyecto ---

// ACTUALIZADO: Nuevos roles definidos
export type ProjectRole = 'super_admin' | 'admin' | 'gestor' | 'trabajador';

export interface Project {
  id: string;
  name: string;
  description?: string;
  owner_id: string;
  is_personal: boolean;
  created_at: string;
  deleted_at?: string | null;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectRole;
  profile?: Profile; // Joined data
}

export interface ProjectStatus {
  id: string;
  project_id: string;
  name: string;
  position: number;
  is_current: boolean; 
  created_at: string;
}

export interface ProjectStatusHistory {
  id: string;
  project_id: string;
  old_status_id?: string;
  new_status_id: string;
  changed_by: string;
  created_at: string;
}

// --- Nuevos tipos para Tareas ---

export interface TaskAssignment {
  user_id: string;
  profile?: Profile;
}

export interface Task {
  id: string;
  project_id: string;
  status_id: string;
  title: string;
  description?: string;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  assignees?: TaskAssignment[]; // Changed from single assigned_to
}
