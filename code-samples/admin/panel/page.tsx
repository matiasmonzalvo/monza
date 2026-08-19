'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Perfil } from '@/types/Perfil';
import { PerfilService } from '@/services/PerfilService';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import Input from '@/components/Input';
import {
  CircleX,
  Pencil,
  Search,
  X,
  Star,
  StarOff,
  LogOut
} from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { SkeletonTabla } from '@/app/admin/components/SkeletonTabla';
import debounce from 'lodash/debounce';
import ProfileImageUploader from '@/app/admin/components/ProfileImageUploader';
import BannerImageUploader from '@/app/admin/components/BannerImageUploader';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

interface FormErrors {
  nombre?: string;
  email?: string;
  telefono?: string;
  ubicacion?: string;
  descripcion?: string;
  fotoPerfil?: string;
  fotoBanner?: string;
  username?: string;
}

export default function AdminPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [perfilActual, setPerfilActual] = useState<
    Partial<
      Omit<Perfil, 'fotoPerfil' | 'fotoBanner'> & {
        fotoPerfil?: string | File;
        fotoBanner?: string | File;
      }
    >
  >({});
  const [perfilModalOpen, setPerfilModalOpen] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const pageSize = 20;
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const fetchPerfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      let perfilesData;

      if (searchTerm.trim()) {
        perfilesData = await PerfilService.buscarPerfil(
          searchTerm,
          currentPage,
          pageSize
        );
      } else {
        perfilesData = await PerfilService.getTodosLosPerfiles(
          currentPage,
          pageSize
        );
      }

      setPerfiles(perfilesData.items);
      setTotalPages(perfilesData.pageCount);
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, pageSize]);

  const debouncedFetchPerfiles = useMemo(
    () => debounce(fetchPerfiles, 300),
    [fetchPerfiles]
  );

  useEffect(() => {
    debouncedFetchPerfiles();
    return () => {
      debouncedFetchPerfiles.cancel();
    };
  }, [debouncedFetchPerfiles]);

  const handlePerfilClick = (perfilId: number) => {
    router.push(`/admin/panel/perfil/${perfilId}`);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!perfilActual.nombre?.trim()) {
      errors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (perfilActual.email?.trim() && !validateEmail(perfilActual.email)) {
      errors.email = 'El email no tiene un formato válido';
      isValid = false;
    }

    if (
      perfilActual.telefono?.trim() &&
      !validatePhone(perfilActual.telefono)
    ) {
      errors.telefono =
        'El teléfono debe estar en formato E.164 (ej: +54123456789)';
      isValid = false;
    }

    if (!perfilActual.descripcion?.trim()) {
      errors.descripcion = 'La descripción es requerida';
      isValid = false;
    } else if (perfilActual.descripcion.length > 500) {
      errors.descripcion =
        'La descripción no puede tener más de 500 caracteres';
      isValid = false;
    }

    if (!modoEdicion) {
      if (!perfilActual.fotoPerfil) {
        errors.fotoPerfil = 'La foto de perfil es requerida';
        isValid = false;
      }
      if (!perfilActual.fotoBanner) {
        errors.fotoBanner = 'La foto de banner es requerida';
        isValid = false;
      }
    }

    if (!perfilActual.username?.trim()) {
      errors.username = 'El username es requerido';
      isValid = false;
    } else {
      const usernameRegex = /^[a-z0-9-]+$/;
      if (!usernameRegex.test(perfilActual.username)) {
        errors.username =
          'El username solo puede contener letras minúsculas, números y guiones';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const agregarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const createPerfilDto = {
        nombre: perfilActual.nombre!,
        username: perfilActual.username!,
        descripcion: perfilActual.descripcion!,
        fotoPerfil: perfilActual.fotoPerfil!,
        fotoBanner: perfilActual.fotoBanner!,
        categorias: perfilActual.categorias?.map((c) => c.id) || [],
        email: perfilActual.email || '',
        telefono: perfilActual.telefono || '',
        ubicacion: perfilActual.ubicacion || ''
      };

      const nuevoPerfil = await PerfilService.createPerfil(createPerfilDto);
      setPerfiles([...perfiles, nuevoPerfil]);
      setPerfilActual({});
      setPerfilModalOpen(false);
      console.log('Perfil creado exitosamente');
    } catch (error) {
      console.error('Error al crear perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const editarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!perfilActual.id) return;

    try {
      setIsLoading(true);
      const updatePerfilDto = {
        nombre: perfilActual.nombre,
        username: perfilActual.username,
        descripcion: perfilActual.descripcion || '',
        fotoPerfil: perfilActual.fotoPerfil || undefined,
        fotoBanner: perfilActual.fotoBanner || undefined,
        categorias: perfilActual.categorias?.map((c) => c.id) || [],
        email: perfilActual.email || '',
        telefono: perfilActual.telefono || '',
        ubicacion: perfilActual.ubicacion || ''
      };

      const perfilActualizado = await PerfilService.updatePerfil(
        perfilActual.id,
        updatePerfilDto
      );

      setPerfiles(
        perfiles.map((p) => (p.id === perfilActual.id ? perfilActualizado : p))
      );
      setPerfilActual({});
      setPerfilModalOpen(false);
      setModoEdicion(false);
      console.log('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarPerfil = async (id: number) => {
    try {
      setIsLoading(true);
      await PerfilService.deletePerfil(id);
      setPerfiles(perfiles.filter((p) => p.id !== id));
      console.log('Perfil eliminado exitosamente');
    } catch (error) {
      console.error('Error al eliminar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePerfilChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setPerfilActual({ ...perfilActual, [id]: value });
  };

  const toggleDestacar = async (e: React.MouseEvent, perfilId: number) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      const perfilActualizado = await PerfilService.destacarPerfil(perfilId);
      setPerfiles(
        perfiles.map((p) => (p.id === perfilId ? perfilActualizado : p))
      );
      console.log('Perfil destacado actualizado exitosamente');
    } catch (error) {
      console.error('Error al destacar perfil:', error);
      setErrorMessage(String(error));
      setErrorDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModalClose = () => {
    setPerfilModalOpen(false);
    setFormErrors({});
    setPerfilActual({});
    setModoEdicion(false);
  };

  return (
    <ProtectedRoute>
      <div className="w-full mx-auto py-20 px-4 sm:px-[10%] bg-home min-h-screen relative">
        <button
          onClick={logout}
          className="absolute top-4 sm:top-8 right-4 sm:right-8 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-100 hover:text-red-400 transition-all cursor-pointer"
          title="Cerrar Sesión"
        >
          <LogOut className="w-4 h-4" />
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-5">
              <Image
                src={'/logos/isologoVerde.png'}
                width={300}
                height={300}
                alt="Logo"
                className="w-full h-full"
              ></Image>
            </div>
            <div className="w-[2px] h-7 bg-[#8ee368]"></div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#8ee368]">
              Panel de Administración
            </h1>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isLoading ? (
              <Skeleton className="h-10 w-full sm:w-[150px] bg-white/20" />
            ) : (
              <button
                className="bg-[#8ee368] hover:bg-[#8ee368]/80 cursor-pointer text-[#072505] px-4 py-2 rounded-md flex items-center font-extrabold transition-all w-full sm:w-auto justify-center"
                onClick={() => {
                  setPerfilActual({});
                  setModoEdicion(false);
                  setPerfilModalOpen(true);
                }}
              >
                <span className="mr-2">+</span> Nuevo Perfil
              </button>
            )}
          </div>
        </div>

        <div className="bg-white/30 rounded-lg overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center border-b relative min-h-[80px] sm:h-20 p-4 sm:p-0">
            <div className="pl-4 pr-8 border-b sm:border-b-0 sm:border-r h-full flex items-start flex-col justify-center w-full sm:w-auto mb-4 sm:mb-0 pb-4 sm:pb-0">
              <h2 className="text-xl font-bold text-white mb-1">Perfiles</h2>
              <p className="text-gray-100">
                Gestiona los perfiles de emprendedores
              </p>
            </div>
            <div className="px-4 h-full flex items-center flex-row justify-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-gray-100" />
              <input
                type="text"
                placeholder="Buscar perfil..."
                className="text-white placeholder:text-gray-100 focus:outline-none bg-transparent w-full"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          {isLoading ? (
            <SkeletonTabla columns={3} showActions={true} />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider whitespace-nowrap">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">
                      Ubicación
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-50 uppercase tracking-wider whitespace-nowrap">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {perfiles.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-5 text-center text-white"
                      >
                        No hay perfiles disponibles
                      </td>
                    </tr>
                  ) : (
                    perfiles.map((perfil) => (
                      <tr
                        key={perfil.id}
                        className="hover:bg-white/10 transition-all cursor-pointer"
                        onClick={() => handlePerfilClick(perfil.id)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap text-white">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white flex items-center justify-center flex-shrink-0">
                              <Image
                                src={perfil.fotoPerfil}
                                alt={perfil.nombre}
                                width={100}
                                height={100}
                                className="rounded-full object-cover object-center w-full h-full"
                              />
                            </div>
                            <span className="truncate max-w-[150px] sm:max-w-none">
                              {perfil.nombre}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell text-white">
                          {perfil.email}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell text-white">
                          {perfil.ubicacion}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex flex-wrap sm:flex-nowrap gap-2 justify-end">
                            <button
                              className={`px-4 py-1 rounded-3xl text-sm font-semibold cursor-pointer transition-all flex items-center gap-1 group whitespace-nowrap ${
                                perfil.destacado
                                  ? 'bg-yellow-300 text-black hover:bg-yellow-300/90'
                                  : 'bg-transparent text-[#fff] border border-yellow-300 hover:bg-yellow-300/90 hover:text-black'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDestacar(e, perfil.id);
                              }}
                            >
                              {perfil.destacado ? (
                                <>
                                  <div className="relative">
                                    <Star
                                      className="w-3 h-3"
                                      fill="currentColor"
                                    />
                                    <StarOff className="w-3 h-3 absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                  Destacado
                                </>
                              ) : (
                                <>
                                  <Star
                                    className="w-3 h-3"
                                    fill="currentColor"
                                  />
                                  Destacar
                                </>
                              )}
                            </button>
                            <button
                              className="text-[#072505] px-4 py-1 bg-[#8ee368] rounded-3xl hover:bg-[#8ee368]/90 text-sm font-semibold cursor-pointer transition-all flex items-center gap-1 whitespace-nowrap"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPerfilActual(perfil);
                                setModoEdicion(true);
                                setPerfilModalOpen(true);
                              }}
                            >
                              <Pencil className="w-3 h-3" strokeWidth={3} />
                              Editar
                            </button>
                            <button
                              className="text-white px-2 py-1 bg-red-500 rounded-3xl hover:bg-red-600 text-sm font-semibold cursor-pointer transition-all flex items-center gap-1 whitespace-nowrap"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    '¿Estás seguro de eliminar este perfil?'
                                  )
                                ) {
                                  eliminarPerfil(perfil.id);
                                }
                              }}
                            >
                              <CircleX className="w-3 h-3" strokeWidth={3} />
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINACION */}
        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    className={`${
                      currentPage === 1
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    } text-[#8ee368] hover:text-[#8ee368]/80`}
                  />
                </PaginationItem>

                {/* PRIMERA PAGINA */}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => setCurrentPage(1)}
                    isActive={currentPage === 1}
                    className={`cursor-pointer ${
                      currentPage === 1
                        ? 'bg-[#8ee368] text-[#072505] hover:bg-[#8ee368]/90'
                        : 'text-[#8ee368] hover:text-[#8ee368]/80'
                    }`}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>

                {/* ELIPSIS SI SE NECESITA */}
                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis className="text-[#8ee368]" />
                  </PaginationItem>
                )}

                {/* CURRENT PAGE */}
                {Array.from({ length: 3 }, (_, i) => {
                  const pageNumber = currentPage - 1 + i;
                  if (pageNumber > 1 && pageNumber < totalPages) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNumber)}
                          isActive={currentPage === pageNumber}
                          className={`cursor-pointer ${
                            currentPage === pageNumber
                              ? 'bg-[#8ee368] text-[#072505] hover:bg-[#8ee368]/90'
                              : 'text-[#8ee368] hover:text-[#8ee368]/80'
                          }`}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                {/* ELIPSIS SI SE NECESITA */}
                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis className="text-[#8ee368]" />
                  </PaginationItem>
                )}

                {/* ULTIMA PAGINA*/}
                {totalPages > 1 && (
                  <PaginationItem>
                    <PaginationLink
                      onClick={() => setCurrentPage(totalPages)}
                      isActive={currentPage === totalPages}
                      className={`cursor-pointer ${
                        currentPage === totalPages
                          ? 'bg-[#8ee368] text-[#072505] hover:bg-[#8ee368]/90'
                          : 'text-[#8ee368] hover:text-[#8ee368]/80'
                      }`}
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    className={`${
                      currentPage === totalPages
                        ? 'pointer-events-none opacity-50'
                        : 'cursor-pointer'
                    } text-[#8ee368] hover:text-[#8ee368]/80`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* MODAL DE PERFIL */}
        <Dialog open={perfilModalOpen} onOpenChange={handleModalClose}>
          <DialogContent className="max-w-md md:max-w-xl max-h-[90vh] overflow-y-auto bg-white/30 backdrop-blur-md">
            <DialogClose className="z-50 absolute right-4 top-4 text-white hover:text-gray-200 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </DialogClose>
            <DialogHeader>
              <DialogTitle className="text-white">
                {modoEdicion ? 'Editar Perfil' : 'Nuevo Perfil'}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={modoEdicion ? editarPerfil : agregarPerfil}
              className="space-y-2"
            >
              {/* IMAGENES */}
              <div className="grid grid-cols-3 w-full">
                {/* PERFIL */}
                <div className="col-span-1">
                  <label className="text-sm text-gray-100 block mb-2">
                    Foto de perfil{' '}
                    {!modoEdicion && <span className="text-red-400">*</span>}
                  </label>
                  <ProfileImageUploader
                    imageUrl={
                      perfilActual.fotoPerfil
                        ? typeof perfilActual.fotoPerfil === 'string'
                          ? perfilActual.fotoPerfil
                          : URL.createObjectURL(perfilActual.fotoPerfil)
                        : ''
                    }
                    onChange={(file) =>
                      setPerfilActual({ ...perfilActual, fotoPerfil: file })
                    }
                    error={formErrors.fotoPerfil}
                  />
                </div>

                {/* BANNER */}
                <div className="col-span-2">
                  <label className="text-sm text-gray-100 block mb-2">
                    Foto de banner{' '}
                    {!modoEdicion && <span className="text-red-400">*</span>}
                  </label>
                  <BannerImageUploader
                    imageUrl={
                      perfilActual.fotoBanner
                        ? typeof perfilActual.fotoBanner === 'string'
                          ? perfilActual.fotoBanner
                          : URL.createObjectURL(perfilActual.fotoBanner)
                        : ''
                    }
                    onChange={(file) =>
                      setPerfilActual({ ...perfilActual, fotoBanner: file })
                    }
                    error={formErrors.fotoBanner}
                  />
                </div>
              </div>

              {/* INPUTS */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-100 block mb-2">
                    Username <span className="text-red-400">*</span>
                  </label>
                  <Input
                    id="username"
                    value={perfilActual.username || ''}
                    onChange={handlePerfilChange}
                    placeholder="ej: tu-marca"
                    className={`text-white lowercase ${
                      formErrors.username ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.username && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.username}
                    </p>
                  )}
                  <p className="text-gray-400 text-sm mt-1">
                    Solo letras minúsculas, números y guiones
                  </p>
                </div>

                <div>
                  <label className="text-sm text-gray-100 block mb-2">
                    Nombre <span className="text-red-400">*</span>
                  </label>
                  <Input
                    id="nombre"
                    value={perfilActual.nombre || ''}
                    onChange={handlePerfilChange}
                    className={`text-white ${
                      formErrors.nombre ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.nombre && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-100 block mb-2">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={perfilActual.email || ''}
                    onChange={handlePerfilChange}
                    className={`text-white ${
                      formErrors.email ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.email && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-100 block mb-2">
                    Teléfono
                  </label>
                  <Input
                    id="telefono"
                    value={perfilActual.telefono || ''}
                    onChange={handlePerfilChange}
                    placeholder="+54123456789"
                    className={`text-white ${
                      formErrors.telefono ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.telefono && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.telefono}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-100 block mb-2">
                    Ubicación
                  </label>
                  <Input
                    id="ubicacion"
                    value={perfilActual.ubicacion || ''}
                    onChange={handlePerfilChange}
                    className={`text-white ${
                      formErrors.ubicacion ? 'border-red-500' : ''
                    }`}
                  />
                  {formErrors.ubicacion && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.ubicacion}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-gray-100 block mb-2">
                    Descripción <span className="text-red-400">*</span>
                  </label>
                  <Input
                    id="descripcion"
                    isTextArea
                    value={perfilActual.descripcion || ''}
                    onChange={handlePerfilChange}
                    maxLength={500}
                    className={`text-white ${
                      formErrors.descripcion ? 'border-red-500' : ''
                    }`}
                    rows={3}
                  />
                  {formErrors.descripcion && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.descripcion}
                    </p>
                  )}
                  <p className="text-gray-400 text-sm mt-1">
                    {perfilActual.descripcion?.length || 0}/500 caracteres
                  </p>
                </div>
              </div>

              {/* BOTONES */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 rounded-md text-sm font-medium text-[#8ee368] bg-gray-50/0 hover:bg-gray-50/10 transition-all cursor-pointer focus:outline-none"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black cursor-pointer bg-[#8ee368] hover:bg-[#8ee368]/70 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading
                    ? 'Procesando...'
                    : modoEdicion
                    ? 'Guardar cambios'
                    : 'Crear perfil'}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <DialogContent className="max-w-md bg-white/30 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle className="text-white">Error</DialogTitle>
              <DialogDescription className="text-gray-100">
                {errorMessage}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end">
              <button
                onClick={() => setErrorDialogOpen(false)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black cursor-pointer bg-[#8ee368] hover:bg-[#8ee368]/70 focus:outline-none transition-all"
              >
                Cerrar
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
