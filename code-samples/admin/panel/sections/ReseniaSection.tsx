import { useState, type FormEvent, type ChangeEvent, useEffect } from 'react';
import { Resenia } from '@/types/Resenia';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { PerfilService, type CreateReseniaDto } from '@/services/PerfilService';
import Input from '@/components/Input';
import { Pencil, X } from 'lucide-react';
import { CircleX } from 'lucide-react';
import { SkeletonTabla } from '@/app/admin/components/SkeletonTabla';
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
import ProfileImageUploader from '@/app/admin/components/ProfileImageUploader';

interface ReseniaSectionProps {
  perfilId: number;
  onItemChange?: () => void;
}

interface FormErrors {
  nombre?: string;
  comentario?: string;
  foto?: string;
}

export function ReseniaSection({
  perfilId,
  onItemChange
}: ReseniaSectionProps) {
  const [resenias, setResenias] = useState<Resenia[]>([]);
  const [reseniaActual, setReseniaActual] = useState<
    Partial<Omit<Resenia, 'foto'> & { foto: string | File }>
  >({});
  const [reseniaModalOpen, setReseniaModalOpen] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchResenias = async () => {
      try {
        setIsLoading(true);
        const response = await PerfilService.getReseniasDePerfil(
          perfilId,
          currentPage,
          pageSize
        );
        setResenias(response.items);
        setTotalPages(response.pageCount);
      } catch (error) {
        console.error('Error al cargar reseñas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResenias();
  }, [perfilId, currentPage, reloadTrigger]);

  const handleReseniaChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setReseniaActual({ ...reseniaActual, [id]: value });
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!reseniaActual.nombre?.trim()) {
      errors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (!reseniaActual.comentario?.trim()) {
      errors.comentario = 'El comentario es requerido';
      isValid = false;
    } else if (reseniaActual.comentario.length > 500) {
      errors.comentario = 'El comentario no puede tener más de 500 caracteres';
      isValid = false;
    }

    if (!modoEdicion && !reseniaActual.foto) {
      errors.foto = 'La foto es requerida';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const agregarResenia = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const createReseniaDto: CreateReseniaDto = {
        comentario: reseniaActual.comentario || '',
        foto: reseniaActual.foto || '',
        nombre: reseniaActual.nombre || ''
      };

      const nuevaResenia = await PerfilService.createResenia(
        perfilId,
        createReseniaDto
      );
      setResenias([...resenias, nuevaResenia]);
      setReseniaActual({});
      setReseniaModalOpen(false);
      setFormErrors({});
      console.log('Reseña creada exitosamente');
      setReloadTrigger((prev) => prev + 1);
      onItemChange?.();
    } catch (error) {
      console.error('Error al crear reseña:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const editarResenia = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!reseniaActual.id) return;

    try {
      setIsLoading(true);
      const updateReseniaDto: Partial<CreateReseniaDto> = {
        comentario: reseniaActual.comentario,
        foto: reseniaActual.foto,
        nombre: reseniaActual.nombre
      };

      const reseniaActualizada = await PerfilService.updateResenia(
        perfilId,
        reseniaActual.id,
        updateReseniaDto
      );

      setResenias(
        resenias.map((r) =>
          r.id === reseniaActual.id ? reseniaActualizada : r
        )
      );
      setReseniaActual({});
      setReseniaModalOpen(false);
      setModoEdicion(false);
      setFormErrors({});
      console.log('Reseña actualizada exitosamente');
      setReloadTrigger((prev) => prev + 1);
      onItemChange?.();
    } catch (error) {
      console.error('Error al actualizar reseña:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarResenia = async (id: number) => {
    try {
      setIsLoading(true);
      await PerfilService.deleteResenia(perfilId, id);
      setResenias(resenias.filter((r) => r.id !== id));
      console.log('Reseña eliminada exitosamente');
      setReloadTrigger((prev) => prev + 1);
      onItemChange?.();
    } catch (error) {
      console.error('Error al eliminar reseña:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetearFormulario = () => {
    setReseniaActual({});
    setModoEdicion(false);
    setFormErrors({});
  };

  const abrirEditarResenia = (resenia: Resenia) => {
    setReseniaActual({ ...resenia });
    setModoEdicion(true);
    setReseniaModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white/30 rounded-lg overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b h-20">
          <div>
            <h2 className="text-xl font-bold text-white">Reseñas</h2>
            <p className="text-gray-100">Gestiona las reseñas del perfil</p>
          </div>
          <Skeleton className="h-10 w-[150px] bg-white/20" />
        </div>
        <SkeletonTabla columns={2} showActions={true} />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/30 rounded-lg shadow-md overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b h-20">
          <div>
            <h2 className="text-xl font-bold text-white">Reseñas</h2>
            <p className="text-gray-100">Gestiona las reseñas del perfil</p>
          </div>
          <button
            className="bg-[#8ee368] hover:bg-[#8ee368]/80 cursor-pointer text-[#072505] px-4 py-2 rounded-md flex items-center font-extrabold transition-all"
            onClick={() => {
              setReseniaActual({});
              setModoEdicion(false);
              setReseniaModalOpen(true);
            }}
          >
            <span className="mr-2">+</span> Nueva Reseña
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider hidden md:table-cell">
                  Comentario
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {resenias.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-5 text-center text-white">
                    No hay reseñas disponibles
                  </td>
                </tr>
              ) : (
                resenias.map((resenia) => (
                  <tr key={resenia.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {resenia.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-white">
                      {resenia.comentario.length > 50
                        ? `${resenia.comentario.substring(0, 50)}...`
                        : resenia.comentario}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex space-x-2 justify-end">
                        <button
                          className="text-[#072505] px-4 py-1 bg-[#8ee368] rounded-3xl hover:bg-[#8ee368]/90 text-sm font-semibold cursor-pointer transition-all flex items-center gap-1"
                          onClick={() => abrirEditarResenia(resenia)}
                        >
                          <Pencil className="w-3 h-3" strokeWidth={3} />
                          Editar
                        </button>
                        <button
                          className="text-white px-2 py-1 bg-red-500 rounded-3xl hover:bg-red-600 text-sm font-semibold cursor-pointer transition-all flex items-center gap-1"
                          onClick={() => {
                            eliminarResenia(resenia.id);
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
      </div>

      {/* MODAL DE RESENIA */}
      <Dialog
        open={reseniaModalOpen}
        onOpenChange={(open) => {
          setReseniaModalOpen(open);
          if (!open) {
            resetearFormulario();
          }
        }}
      >
        <DialogContent className="max-w-md md:max-w-xl max-h-[90vh] overflow-y-auto bg-white/30 backdrop-blur-md">
          <DialogClose className="z-50 absolute right-4 top-4 text-white hover:text-gray-200 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none">
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </DialogClose>
          <DialogHeader>
            <DialogTitle className="text-white">
              {modoEdicion ? 'Editar Reseña' : 'Nueva Reseña'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={modoEdicion ? editarResenia : agregarResenia}
            className="space-y-4"
          >
            <div>
              <label className="text-sm text-gray-100 block mb-2">
                Nombre <span className="text-red-400">*</span>
              </label>
              <Input
                id="nombre"
                value={reseniaActual.nombre || ''}
                onChange={handleReseniaChange}
                className={`text-white ${
                  formErrors.nombre ? 'border-red-500' : ''
                }`}
              />
              {formErrors.nombre && (
                <p className="text-red-400 text-sm mt-1">{formErrors.nombre}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-100 block mb-2">
                Comentario <span className="text-red-400">*</span>
              </label>
              <Input
                id="comentario"
                isTextArea
                value={reseniaActual.comentario || ''}
                onChange={handleReseniaChange}
                rows={3}
                maxLength={500}
                className={`text-white ${
                  formErrors.comentario ? 'border-red-500' : ''
                }`}
              />
              {formErrors.comentario && (
                <p className="text-red-400 text-sm mt-1">
                  {formErrors.comentario}
                </p>
              )}
              <p className="text-gray-400 text-sm mt-1">
                {reseniaActual.comentario?.length || 0}/500 caracteres
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-100 block mb-2">
                Foto {!modoEdicion && <span className="text-red-400">*</span>}
              </label>
              <ProfileImageUploader
                imageUrl={
                  reseniaActual.foto
                    ? typeof reseniaActual.foto === 'string'
                      ? reseniaActual.foto
                      : URL.createObjectURL(reseniaActual.foto)
                    : ''
                }
                onChange={(file) =>
                  setReseniaActual({ ...reseniaActual, foto: file })
                }
                error={formErrors.foto}
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setReseniaModalOpen(false);
                  resetearFormulario();
                }}
                className="cursor-pointer px-4 py-2 rounded-md text-sm font-medium text-[#8ee368] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="cursor-pointer px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[#8ee368] hover:bg-[#8ee368]/80 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? 'Procesando...'
                  : modoEdicion
                  ? 'Guardar cambios'
                  : 'Crear reseña'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

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

              {/* PAGINA ACTUAL Y PAGINAS ALREDEDOR */}
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

              {/* ULTIMA PAGINA */}
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
    </>
  );
}
