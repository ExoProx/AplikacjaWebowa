// app/page.tsx


import React from 'react';
import RegisterForm from '../components/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-300 via-blue-900 to-blue-300">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
