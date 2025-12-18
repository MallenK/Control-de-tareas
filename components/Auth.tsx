import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { AuthView } from '../types';
import { Input } from './Input';
import { Button } from './Button';
import { ShieldCheck, UserPlus, LogIn } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [view, setView] = useState<AuthView>(AuthView.SIGN_IN);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const toggleView = () => {
    setView(view === AuthView.SIGN_IN ? AuthView.SIGN_UP : AuthView.SIGN_IN);
    setError(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      onAuthSuccess();
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic Validation
    if (!email || !password || !username) {
        setError("Todos los campos son obligatorios");
        setLoading(false);
        return;
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            // Solo enviamos username, alineado con el nuevo trigger
          },
        },
      });

      if (error) throw error;

      onAuthSuccess();
    } catch (err: any) {
      console.error("Signup error:", err);
      // Mensaje de ayuda específico para el error de Trigger de base de datos
      let msg = err.message || 'Error al registrarse';
      if (msg.includes('Database error')) {
        msg = 'Error de Base de Datos: El "Trigger" de Supabase está fallando. Ejecuta el script "fix_supabase_trigger.sql" en tu panel de Supabase para solucionarlo.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 pt-8 pb-6 text-center">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
                {view === AuthView.SIGN_IN ? 'Bienvenido de nuevo' : 'Crear cuenta'}
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
                {view === AuthView.SIGN_IN 
                    ? 'Ingresa tus credenciales para acceder' 
                    : 'Regístrate para gestionar tus proyectos'}
            </p>
        </div>

        <div className="px-8 pb-8">
            {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={view === AuthView.SIGN_IN ? handleSignIn : handleSignUp}>
                {view === AuthView.SIGN_UP && (
                    <Input
                        label="Nombre de Usuario"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="jdoe123"
                        required
                    />
                )}

                <Input
                    label="Correo Electrónico"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                />
                
                <Input
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                />

                <Button type="submit" isLoading={loading} className="mt-2">
                    {view === AuthView.SIGN_IN ? 'Iniciar Sesión' : 'Registrarse'}
                </Button>
            </form>

            <div className="mt-6 text-center">
                <button 
                    onClick={toggleView}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center justify-center w-full gap-2"
                    type="button"
                >
                    {view === AuthView.SIGN_IN ? (
                        <>
                            <UserPlus size={16} />
                            ¿No tienes cuenta? Regístrate
                        </>
                    ) : (
                        <>
                            <LogIn size={16} />
                            ¿Ya tienes cuenta? Inicia sesión
                        </>
                    )}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};