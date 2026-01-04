🗂️ Control de Tareas · AI Studio App

App de gestión de proyectos y tareas tipo Kanban, con Supabase (PostgreSQL + RLS) y frontend en AI Studio.

🔐 Idea clave del proyecto
El frontend NO decide permisos.
Toda la lógica de acceso vive en la base de datos.

🚀 Ejecutar la app

🔗 Ver en AI Studio
https://ai.studio/apps/drive/14jc-ExgJZYu5CJ-IOQZGxf1EftT3Eb9L

Local

Instalar dependencias → npm install

Añadir GEMINI_API_KEY en .env.local

Arrancar → npm run dev

🧠 Arquitectura (muy resumida)
Frontend (React / AI Studio)
        ↓
Supabase Client
        ↓
PostgreSQL + RLS   ← aquí están los permisos reales


✅ El frontend solo pide datos
✅ PostgreSQL decide quién puede hacer qué

🗄️ Base de Datos – Mapa mental
Entidades principales
auth.users
    ↓
profiles
    ↓
projects  ← 🔑 AUTORIDAD
    ↓
project_members
    ↓
project_tasks
    ↓
task_assignments


Y además:

project_statuses → columnas Kanban

project_status_history → histórico proyecto

project_task_status_history → histórico tareas

🔑 Regla de oro (MUY IMPORTANTE)
projects manda sobre todo
projects.owner_id = autoridad absoluta


Ninguna tabla decide permisos por sí sola

project_members NO es autoridad

Esto evita:

bugs de seguridad

escaladas de privilegios

recursión infinita en RLS

👤 Usuarios
profiles

Perfil público del usuario

Se crea automáticamente al registrarse

Cada usuario solo puede editar el suyo

📦 Proyectos
projects

Tiene un owner_id

Puede ser personal o compartido

No se borra físicamente (soft delete)

⚙️ Al crear un proyecto, automáticamente:

Se añade el owner como miembro

Se crean los estados iniciales (To Do, In Progress, etc.)

👥 Miembros y roles
project_members

Roles posibles:

owner

admin

gestor

member

Reglas importantes:

Un usuario solo puede aparecer una vez por proyecto

Solo puede haber un gestor por proyecto

El rol NO da autoridad, la da projects.owner_id

📋 Tareas (Kanban)
project_tasks

Pertenecen a un proyecto

Tienen estado (project_statuses)

Se ordenan por position

Se borran con deleted_at (soft delete)

⚙️ Automatismos:

updated_at se actualiza solo

Cada cambio de estado se guarda en histórico

🧱 Estados
project_statuses

Cada proyecto tiene los suyos

Ordenados por posición

El owner puede gestionarlos

Los miembros solo pueden leerlos

🎯 Asignaciones
task_assignments

Relación tarea ↔ usuario

Una tarea puede tener varios usuarios

Solo uno puede ser is_owner = true

Reglas:

Solo el gestor puede asignar o desasignar

Un gestor no puede asignar a otro gestor

🕓 Históricos

project_status_history

project_task_status_history

Características:

Solo lectura

Se rellenan automáticamente

Solo visibles para miembros del proyecto

🔐 Seguridad (RLS)

✔️ RLS activado en todas las tablas
✔️ El frontend no usa service_role
✔️ Las policies viven en PostgreSQL

🚫 Cosas que NO se hacen:

Validar permisos en React

Confiar en datos del cliente

Policies recursivas mal diseñadas

⚙️ Funciones automáticas

Funciones clave:

handle_new_user → crea el perfil

handle_new_project_creation → crea miembros y estados

record_task_status_change → guarda históricos

Estas funciones usan SECURITY DEFINER para funcionar con RLS activo.

🔌 Relación con el Frontend

El frontend:

Asume usuario autenticado

No sabe roles

No decide permisos

Flujo real:

UI → Supabase → RLS → OK | ERROR


Si algo falla:
➡️ el problema está en la BBDD o en RLS

🔄 Documento vivo

Este proyecto no está cerrado.

Es normal:

añadir tablas

cambiar policies

crear nuevas funciones

Reglas para no romper nada:

No tocar RLS sin revisar dependencias

Evitar subqueries recursivas

Documentar los cambios

Probar siempre con:

owner

gestor

member

usuario externo

✅ Estado actual

✔️ Modelo sólido
✔️ Seguridad centralizada
✔️ Frontend limpio
✔️ Preparado para crecer
✔️ README entendible en 1 minuto
