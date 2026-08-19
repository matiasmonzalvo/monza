'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/Input';

interface FormErrors {
  email?: string;
  password?: string;
}

export default function AdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!email.trim()) {
      errors.email = 'El email es requerido';
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        errors.email = 'El email no es válido';
        isValid = false;
      }
    }

    if (!password.trim()) {
      errors.password = 'La contraseña es requerida';
      isValid = false;
    } else if (password.length < 4) {
      errors.password = 'La contraseña debe tener al menos 4 caracteres';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await login(email, password);
    } catch (error) {
      setError('Credenciales inválidas');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#072505]">
      <div className="bg-white/30 backdrop-blur-md rounded-lg p-8 w-full max-w-sm">
        <div className="w-20 h-20 mx-auto mb-6 flex justify-center items-center">
          <Image
            src={'/logos/isologoVerde.png'}
            alt="Logo"
            width={200}
            height={200}
            className="w-full h-full object-contain"
          />
        </div>
        {error && (
          <div className="mb-4 p-2 text-sm text-red-400 bg-red-100/10 rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-sm text-gray-100 block mb-2">
              Email <span className="text-red-400">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
              className={`text-white ${
                formErrors.email ? 'border-red-500' : ''
              }`}
            />
            {formErrors.email && (
              <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-100 block mb-2">
              Contraseña <span className="text-red-400">*</span>
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              className={`text-white ${
                formErrors.password ? 'border-red-500' : ''
              }`}
            />
            {formErrors.password && (
              <p className="text-red-400 text-sm mt-1">{formErrors.password}</p>
            )}
          </div>
          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#8ee368] hover:bg-[#8ee368]/80 focus:outline-none focus:ring-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Procesando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
