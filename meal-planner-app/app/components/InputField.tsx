// components/InputField.tsx
import React from 'react';

interface InputFieldProps {
  label: string;
  type: string;
  id: string;
  name: string;
  value: string;
  placeholder: string;
  icon: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  id,
  name,
  value,
  placeholder,
  icon,
  onChange,
  required = true,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center border hover:bg-blue-200 border-gray-300 rounded bg-blue-50 focus-within:ring-2 focus-within:ring-blue-500">
        <span className="ml-2">{icon}</span>
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full p-2 bg-transparent focus:outline-none transition duration-300 ease-in-out"
          required={required}
        />
      </div>
    </div>
  );
};

export default InputField;
