import { useState, type FormEvent, type ChangeEvent, useEffect } from 'react';
import { Evento } from '@/types/Evento';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { PerfilService, type CreateEventoDto } from '@/services/PerfilService';
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
import Input from '@/components/Input';

interface EventosSectionProps {
  perfilId: number;
  onItemChange?: () => void;
}

interface FormErrors {
  titulo?: string;
  descripcion?: string;
}

export function EventosSection({
  perfilId,
  onItemChange
}: EventosSectionProps) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventoActual, setEventoActual] = useState<Partial<Evento>>({});
  const [eventoModalOpen, setEventoModalOpen] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const [reloadTrigger, setReloadTrigger] = useState(0);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    const fetchEventos = async () => {
      try {
        setIsLoading(true);
        const response = await PerfilService.getEventosDePerfil(
          perfilId,
          currentPage,
          pageSize
        );
        setEventos(response.items);
        setTotalPages(response.pageCount);
      } catch (error) {
        console.error('Error al cargar eventos:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventos();
  }, [perfilId, currentPage, reloadTrigger]);

  const handleEventoChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setEventoActual({ ...eventoActual, [id]: value });
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!eventoActual.titulo?.trim()) {
      errors.titulo = 'El título es requerido';
      isValid = false;
    }

    if (!eventoActual.descripcion?.trim()) {
      errors.descripcion = 'La descripción es requerida';
      isValid = false;
    } else if (eventoActual.descripcion.length > 255) {
      errors.descripcion =
        'La descripción no puede tener más de 255 caracteres';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const agregarEvento = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const createEventoDto: CreateEventoDto = {
        titulo: eventoActual.titulo || '',
        descripcion: eventoActual.descripcion || ''
      };

      const nuevoEvento = await PerfilService.createEvento(
        perfilId,
        createEventoDto
      );
      setEventos([...eventos, nuevoEvento]);
      setEventoActual({});
      setEventoModalOpen(false);
      console.log('Evento creado exitosamente');
      setReloadTrigger((prev) => prev + 1);
      onItemChange?.();
    } catch (error) {
      console.error('Error al crear evento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const editarEvento = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!eventoActual.id) return;

    try {
      setIsLoading(true);
      const updateEventoDto: Partial<CreateEventoDto> = {
        titulo: eventoActual.titulo,
        descripcion: eventoActual.descripcion
      };

      const eventoActualizado = await PerfilService.updateEvento(
        perfilId,
        eventoActual.id,
        updateEventoDto
      );

      setEventos(
        eventos.map((e) => (e.id === eventoActual.id ? eventoActualizado : e))
      );
      setEventoActual({});
      setEventoModalOpen(false);
      setModoEdicion(false);
      console.log('Evento actualizado exitosamente');
      setReloadTrigger((prev) => prev + 1);
      onItemChange?.();
    } catch (error) {
      console.error('Error al actualizar evento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarEvento = async (id: number) => {
    try {
      setIsLoading(true);
      await PerfilService.deleteEvento(perfilId, id);
      setEventos(eventos.filter((e) => e.id !== id));
      console.log('Evento eliminado exitosamente');
      setReloadTrigger((prev) => prev + 1);
      onItemChange?.();
    } catch (error) {
      console.error('Error al eliminar evento:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetearFormulario = () => {
    setEventoActual({});
    setModoEdicion(false);
    setFormErrors({});
  };

  const abrirEditarEvento = (evento: Evento) => {
    setEventoActual({ ...evento });
    setModoEdicion(true);
    setEventoModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="bg-white/30 rounded-lg overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b h-20">
          <div>
            <h2 className="text-xl font-bold text-white">Eventos</h2>
            <p className="text-gray-100">Gestiona los eventos disponibles</p>
          </div>
          <Skeleton className="h-10 w-[150px] bg-white/20" />
        </div>
        <SkeletonTabla columns={2} showActions={true} />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/30 rounded-lg overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b h-20">
          <div>
            <h2 className="text-xl font-bold text-white">Eventos</h2>
            <p className="text-gray-100">Gestiona los eventos disponibles</p>
          </div>
          <button
            className="bg-[#8ee368] hover:bg-[#8ee368]/80 cursor-pointer text-[#072505] px-4 py-2 rounded-md flex items-center font-extrabold transition-all"
            onClick={() => {
              setEventoActual({});
              setModoEdicion(false);
              setEventoModalOpen(true);
            }}
          >
            <span className="mr-2">+</span> Nuevo Evento
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Título
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider hidden md:table-cell">
                  Descripción
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {eventos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-5 text-center text-white">
                    No hay eventos disponibles
                  </td>
                </tr>
              ) : (
                eventos.map((evento) => (
                  <tr key={evento.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {evento.titulo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell text-white">
                      {evento.descripcion.length > 50
                        ? `${evento.descripcion.substring(0, 50)}...`
                        : evento.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex space-x-2 justify-end">
                        <button
                          className="text-[#072505] px-4 py-1 bg-[#8ee368] rounded-3xl hover:bg-[#8ee368]/90 text-sm font-semibold cursor-pointer transition-all flex items-center gap-1"
                          onClick={() => abrirEditarEvento(evento)}
                        >
                          <Pencil className="w-3 h-3" strokeWidth={3} />
                          Editar
                        </button>
                        <button
                          className="text-white px-2 py-1 bg-red-500 rounded-3xl hover:bg-red-600 text-sm font-semibold cursor-pointer transition-all flex items-center gap-1"
                          onClick={() => {
                            eliminarEvento(evento.id);
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

      {/* MODAL DE EVENTO */}
      <Dialog
        open={eventoModalOpen}
        onOpenChange={(open) => {
          setEventoModalOpen(open);
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
              {modoEdicion ? 'Editar Evento' : 'Nuevo Evento'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={modoEdicion ? editarEvento : agregarEvento}
            className="space-y-4"
          >
            <div>
              <label className="text-sm text-gray-100">
                Título <span className="text-red-400">*</span>
              </label>
              <Input
                id="titulo"
                value={eventoActual.titulo || ''}
                onChange={handleEventoChange}
                className={`text-white ${
                  formErrors.titulo ? 'border-red-500' : ''
                }`}
              />
              {formErrors.titulo && (
                <p className="text-red-400 text-sm mt-1">{formErrors.titulo}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-100">
                Descripción <span className="text-red-400">*</span>
              </label>
              <Input
                id="descripcion"
                isTextArea
                value={eventoActual.descripcion || ''}
                onChange={handleEventoChange}
                rows={3}
                maxLength={255}
                className={`text-white ${
                  formErrors.descripcion ? 'border-red-500' : ''
                }`}
              />
              {formErrors.descripcion && (
                <p className="text-red-400 text-sm mt-1">
                  {formErrors.descripcion}
                </p>
              )}
              <p className="text-gray-400 text-sm mt-1">
                {eventoActual.descripcion?.length || 0}/255 caracteres
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setEventoModalOpen(false);
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
                  : 'Crear evento'}
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
