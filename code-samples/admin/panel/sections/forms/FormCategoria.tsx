import { useState } from 'react';
import Input from '@/components/Input';

interface FormCategoriaProps {
  onSubmit: (data: { nombre: string; identificador: string }) => void;
  onCancel: () => void;
  closeDialog: () => void;
}

interface FormErrors {
  nombre?: string;
  identificador?: string;
}

export function FormCategoria({ onSubmit, closeDialog }: FormCategoriaProps) {
  const [nombre, setNombre] = useState('');
  const [identificador, setIdentificador] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (!nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (!identificador.trim()) {
      newErrors.identificador = 'El identificador es requerido';
      isValid = false;
    } else {
      const identificadorRegex = /^[a-z0-9-]+$/;
      if (!identificadorRegex.test(identificador)) {
        newErrors.identificador =
          'El identificador solo puede contener letras minúsculas, números y guiones';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (validateForm()) {
      try {
        await onSubmit({ nombre, identificador });
        closeDialog();
      } catch (error) {
        console.error('Error al crear categoría:', error);
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 space-y-4 bg-white/30 backdrop-blur-md rounded-lg"
    >
      <div>
        <label className="text-sm text-black block mb-2">
          Nombre <span className="text-red-400">*</span>
        </label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setNombre(e.target.value)
          }
          className={`text-black ${errors.nombre ? 'border-red-500' : ''}`}
        />
        {errors.nombre && (
          <p className="text-red-400 text-sm mt-1">{errors.nombre}</p>
        )}
      </div>

      <div>
        <label className="text-sm text-black block mb-2">
          Identificador <span className="text-red-400">*</span>
        </label>
        <Input
          id="identificador"
          value={identificador}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setIdentificador(e.target.value.toLowerCase())
          }
          className={`text-black lowercase ${
            errors.identificador ? 'border-red-500' : ''
          }`}
          placeholder="ej: nombre-categoria"
        />
        {errors.identificador && (
          <p className="text-red-400 text-sm mt-1">{errors.identificador}</p>
        )}
        <p className="text-gray-400 text-sm mt-1">
          Solo letras minúsculas, números y guiones
        </p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={closeDialog}
          className="cursor-pointer px-4 py-2 rounded-md text-sm font-medium text-[#8ee368] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="cursor-pointer px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#8ee368] hover:bg-[#8ee368]/80 focus:outline-none focus:ring-2"
        >
          Crear categoría
        </button>
      </div>
    </form>
  );
}
