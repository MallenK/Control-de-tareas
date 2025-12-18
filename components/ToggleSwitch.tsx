import React from 'react';

interface ToggleSwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center justify-between mb-6 neu-inset p-3 rounded-xl bg-gray-100">
      <span className="text-sm font-extrabold text-[#4A5568] ml-2 tracking-wide">{label}</span>
      <div 
        onClick={() => onChange(!checked)}
        className={`w-14 h-7 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
            checked ? 'bg-[#667EEA]' : 'bg-gray-300'
        }`}
      >
        <div 
            className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${
                checked ? 'translate-x-7' : 'translate-x-0'
            }`} 
        />
      </div>
    </div>
  );
};