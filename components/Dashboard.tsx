import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { fetchUserProjects, softDeleteProject } from '../services/projectService';
import { UserMetadata, Project } from '../types';
import { Button } from './Button';
import { CreateProject } from './CreateProject';
import { ProjectKanban } from './ProjectKanban';
import { User, LogOut, Layout, Plus, Trash2, Kanban, Users, AlertCircle } from 'lucide-react';
import { User as SupabaseUser } from 'https://esm.sh/@supabase/supabase-js@2';

interface DashboardProps {
  user: SupabaseUser;
  onLogout: () => void;
}

type ViewState = 'PROJECTS' | 'PROFILE';

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const metadata = user.user_metadata as UserMetadata;
  const [currentView, setCurrentView] = useState<ViewState>('PROJECTS');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals & Selected Project
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const loadProjects = async () => {
    setLoadingProjects(true);
    setError(null);
    try {
      const data = await fetchUserProjects(user.id);
      setProjects(data);
    } catch (err: any) {
      console.error("Error loading projects:", err);
      // If it is a standard error, use .message, otherwise stringify the object
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' 
          ? JSON.stringify(err) 
          : String(err);
      
      setError(errorMessage);
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    if (currentView === 'PROJECTS') {
      loadProjects();
    }
  }, [currentView]);

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("¿Estás seguro? Esto moverá el proyecto a la papelera.")) return;
    try {
      await softDeleteProject(projectId);
      loadProjects();
      if (selectedProject?.id === projectId) setSelectedProject(null);
    } catch (err: any) {
      console.error("Error deleting project:", err);
      alert(`Error eliminando proyecto: ${err.message || JSON.stringify(err)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              {metadata.full_name?.charAt(0).toUpperCase() || 'P'}
            </div>
            <span className="font-semibold text-gray-700 hidden sm:block">Gestor de Proyectos</span>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={() => { setCurrentView('PROJECTS'); setSelectedProject(null); }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'PROJECTS' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <Layout size={18} className="inline mr-2 -mt-1"/>
                Proyectos
            </button>
            <button 
                onClick={() => { setCurrentView('PROFILE'); setSelectedProject(null); }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'PROFILE' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
                <User size={18} className="inline mr-2 -mt-1"/>
                Perfil
            </button>
            <div className="h-6 w-px bg-gray-300 mx-2"></div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors" title="Cerrar sesión">
                <LogOut size={20} />
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl mx-auto w-full">
        
        {currentView === 'PROFILE' && (
             <div className="bg-white rounded-xl shadow p-6 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <User className="text-blue-500" /> Tu Perfil
                </h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded">
                            <label className="text-xs text-gray-500 font-bold uppercase">Usuario</label>
                            <p className="text-gray-900">{metadata.username || 'N/A'}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded">
                            <label className="text-xs text-gray-500 font-bold uppercase">Teléfono</label>
                            <p className="text-gray-900">{metadata.phone || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                        <label className="text-xs text-gray-500 font-bold uppercase">Email</label>
                        <p className="text-gray-900">{user.email}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                        <label className="text-xs text-gray-500 font-bold uppercase">ID</label>
                        <p className="text-gray-500 text-xs font-mono">{user.id}</p>
                    </div>
                </div>
             </div>
        )}

        {currentView === 'PROJECTS' && (
            <div className="space-y-6">
                {/* Header Acciones */}
                {!selectedProject && (
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-gray-900">Mis Proyectos</h2>
                        <Button onClick={() => setShowCreateModal(true)} className="!w-auto">
                            <Plus size={18} className="mr-2" /> Nuevo Proyecto
                        </Button>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center gap-3">
                        <AlertCircle className="text-red-500" />
                        <p className="text-red-700 text-sm font-medium break-words">{error}</p>
                        <button onClick={loadProjects} className="ml-auto text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded whitespace-nowrap">
                            Reintentar
                        </button>
                    </div>
                )}

                {/* Vista Kanban del Proyecto Seleccionado */}
                {selectedProject ? (
                    <div className="animate-in zoom-in duration-300">
                         <div className="mb-4">
                            <button 
                                onClick={() => setSelectedProject(null)}
                                className="text-sm text-gray-500 hover:text-blue-600 hover:underline mb-2 block"
                            >
                                ← Volver al listado
                            </button>
                         </div>
                         <ProjectKanban 
                            project={selectedProject} 
                            onClose={() => setSelectedProject(null)} 
                            onStatusChange={loadProjects} // Recargar si cambia algo importante
                        />
                    </div>
                ) : (
                    /* Lista de Proyectos */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loadingProjects ? (
                            <p className="text-gray-500 col-span-full text-center py-10">Cargando proyectos...</p>
                        ) : projects.length === 0 && !error ? (
                            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-4">No tienes proyectos activos.</p>
                                <Button variant="secondary" onClick={() => setShowCreateModal(true)} className="!w-auto">
                                    Crear el primero
                                </Button>
                            </div>
                        ) : (
                            projects.map(proj => (
                                <div key={proj.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col group">
                                    <div className={`h-2 ${proj.is_personal ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                                    <div className="p-5 flex-1">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded ${
                                                proj.is_personal ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                            }`}>
                                                {proj.is_personal ? 'Personal' : 'Equipo'}
                                            </span>
                                            {proj.owner_id === user.id && (
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteProject(proj.id); }}
                                                    className="text-gray-300 hover:text-red-500 transition-colors"
                                                    title="Eliminar proyecto"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 mb-1">{proj.name}</h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                            {proj.description || 'Sin descripción'}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-3 border-t border-gray-100 flex gap-2">
                                        <button 
                                            onClick={() => setSelectedProject(proj)}
                                            className="flex-1 flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:bg-blue-50 py-2 rounded transition-colors"
                                        >
                                            <Kanban size={16} /> Ver Tablero
                                        </button>
                                        {!proj.is_personal && (
                                             <button className="p-2 text-gray-400 hover:text-gray-600" title="Ver miembros (Próximamente)">
                                                <Users size={16} />
                                             </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        )}

        {/* Modal de Creación */}
        {showCreateModal && (
            <CreateProject 
                ownerId={user.id} 
                onSuccess={() => { setShowCreateModal(false); loadProjects(); }} 
                onCancel={() => setShowCreateModal(false)}
            />
        )}

      </main>
    </div>
  );
};