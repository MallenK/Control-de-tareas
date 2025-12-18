import { supabase } from './supabaseClient';
import { Profile } from '../types';

export const fetchAllProfiles = async () => {
  // Ordenamos por username ya que full_name no existe en la tabla profiles
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('username', { ascending: true });

  if (error) {
    console.error('Error fetching profiles:', JSON.stringify(error, null, 2));
    return [];
  }
  return data as Profile[];
};

export const fetchProfilesByIds = async (ids: string[]) => {
  if (ids.length === 0) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', ids);
    
  if (error) {
     console.error('Error fetching profiles by IDs:', JSON.stringify(error, null, 2));
     throw error;
  }
  return data as Profile[];
};