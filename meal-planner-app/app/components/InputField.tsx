// components/InputField.tsx
import React from "react";
import {
  User,
  UsersRound,
  MailCheck,
  CaseLower,
  Phone,
  FileLockIcon,
} from "lucide-react";

interface InputFieldProps {
  label: string;
  type: string;
  field: string; //name == id
  value: string;
  placeholder: string;
  icon?: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength?: number;
  required?: boolean;
}

// Mapa domyślnych ikon dla konkretnych pól:
const defaultIcons: Record<string, React.ReactNode> = {
  firstName: <User className="text-gray-500" size={20} />,
  lastName: <UsersRound className="text-gray-500" size={20} />,
  email: <MailCheck className="text-gray-500" size={20} />,
  username: <CaseLower className="text-gray-500" size={20} />,
  phoneNumber: <Phone className="text-gray-500" size={20} />,
  password: <FileLockIcon className="text-gray-500" size={20} />,
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  type,
  field,
  value,
  placeholder,
  icon,
  onChange,
  maxLength = 30,
  required = true,
}) => {
  const usedIcon = icon || defaultIcons[field];
  return (
    <div className="mb-4">
      <label htmlFor={field} className="block mb-1 font-semibold text-white">
        {label}
      </label>
      <div className="flex items-center border hover:bg-gray-300 border-gray-300 rounded bg-stone-50 focus-within:ring-2 focus-within:ring-stone-300">
        <span className="ml-2">{usedIcon}</span>
        <input
          type={type}
          id={field}
          name={field}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full p-2 bg-transparent placeholder-gray-500 focus:outline-none transition duration-300 ease-in-out"
          maxLength={maxLength}
          required={required}
        />
      </div>
    </div>
  );
};

export default InputField;
