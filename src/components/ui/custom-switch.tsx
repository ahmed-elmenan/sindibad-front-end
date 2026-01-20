import React from 'react';

interface CustomSwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const CustomSwitch: React.FC<CustomSwitchProps> = ({ 
  checked, 
  onCheckedChange, 
  disabled = false 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onCheckedChange(e.target.checked);
    }
  };

  return (
    <label className={`relative inline-block w-12 h-6 ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
      <input
        type="checkbox"
        className="hidden"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
      />
      <div
        className={`absolute top-0 left-0 w-full h-full rounded-full shadow-inner transition-all duration-300 ease-in-out ${
          checked
            ? 'bg-[#05c46b] shadow-[inset_0_0_0_1.5px_#04b360]'
            : 'bg-gray-300 shadow-[inset_0_0_0_1.5px_#ccc]'
        }`}
      >
        <div
          className={`absolute top-[3px] left-[3px] w-[18px] h-[18px] bg-white rounded-full shadow-md transition-transform duration-300 ease-in-out ${
            checked
              ? 'translate-x-[24px] shadow-[0_1px_3px_rgba(0,0,0,0.2),0_0_0_2px_#05c46b]'
              : 'translate-x-0 shadow-[0_1px_3px_rgba(0,0,0,0.2)]'
          }`}
        />
      </div>
    </label>
  );
};

export default CustomSwitch;
