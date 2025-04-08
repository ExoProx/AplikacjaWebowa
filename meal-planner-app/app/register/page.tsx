// app/page.tsx


import React from 'react';
import RegisterForm from '../components/RegisterForm';

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
