import {
  useState,
  type FormEvent,
  type ChangeEvent,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import { Producto } from '@/types/Producto';
import type { Categoria } from '@/types/Categoria';
import type { Subcategoria } from '@/types/Subcategoria';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ProductosService } from '@/services/ProductosService';
import {
  CategoriasService,
  CreateCategoriaDto
} from '@/services/CategoriasService';
import Input from '@/components/Input';
import Dropdown from '@/components/Dropdown';
import { CircleX, Pencil, Search, X } from 'lucide-react';
import ImageDropzone from '@/app/admin/components/ImageDropzone';
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
import { debounce } from 'lodash';
import { FormCategoria } from '@/app/admin/panel/sections/forms/FormCategoria';
import Image from 'next/image';

interface ProductosSectionProps {
  perfilId: number;
  onItemChange?: () => void;
}

interface FormErrors {
  nombre?: string;
  detalle?: string;
  descripcionCaracteristicas?: string;
  itemsCaracteristicas?: string;
  imagenes?: string;
  categorias?: string;
}

export function ProductosSection({
  perfilId,
  onItemChange
}: ProductosSectionProps) {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 20;
  const [productoActual, setProductoActual] = useState<
    Partial<
      Producto & {
        imagenes: (string | File)[];
        imagenesEliminadas?: string[];
      }
    >
  >({});
  const [productoModalOpen, setProductoModalOpen] = useState<boolean>(false);
  const [modoEdicion, setModoEdicion] = useState<boolean>(false);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [subcategorias, setSubcategorias] = useState<Subcategoria[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<number | null>(
    null
  );
  const [selectedSubcategoria, setSelectedSubcategoria] = useState<
    number | null
  >(null);
  const [nuevoItemCaracteristica, setNuevoItemCaracteristica] =
    useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const fetchProductos = useCallback(async () => {
    try {
      setIsLoading(true);
      let response;

      if (searchTerm.trim()) {
        response = await ProductosService.buscarProductoDePerfil(
          perfilId,
          searchTerm,
          (currentPage - 1) * pageSize,
          pageSize
        );
      } else {
        response = await ProductosService.getProductosDePerfil(
          perfilId,
          (currentPage - 1) * pageSize,
          pageSize
        );
      }

      setProductos(response.items);
      setTotalPages(response.pageCount);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setIsLoading(false);
    }
  }, [perfilId, currentPage, searchTerm, pageSize]);

  const debouncedFetchProductos = useMemo(
    () => debounce(fetchProductos, 300),
    [fetchProductos]
  );

  useEffect(() => {
    debouncedFetchProductos();
    return () => {
      debouncedFetchProductos.cancel();
    };
  }, [debouncedFetchProductos]);

  useEffect(() => {
    const fetchSubcategorias = async () => {
      if (!selectedCategoria) {
        setSubcategorias([]);
        setSelectedSubcategoria(null);
        return;
      }

      try {
        const subcategoriasData =
          await CategoriasService.getSubcategoriasByCategoriaId(
            selectedCategoria
          );
        setSubcategorias(subcategoriasData);
      } catch (error) {
        console.error('Error al cargar subcategorías:', error);
      }
    };

    fetchSubcategorias();
  }, [selectedCategoria]);

  useEffect(() => {
    const fetchInitialCategorias = async () => {
      try {
        const categoriasData = await CategoriasService.getTodasLasCategorias();
        setCategorias(categoriasData);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    };

    fetchInitialCategorias();
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!productoActual.nombre?.trim()) {
      errors.nombre = 'El nombre es requerido';
      isValid = false;
    }

    if (!productoActual.detalle?.trim()) {
      errors.detalle = 'El detalle es requerido';
      isValid = false;
    } else if (productoActual.detalle.length > 255) {
      errors.detalle = 'El detalle no puede tener más de 255 caracteres';
      isValid = false;
    }

    if (!productoActual.caracteristicas?.descripcion?.trim()) {
      errors.descripcionCaracteristicas =
        'La descripción de características es requerida';
      isValid = false;
    } else if (productoActual.caracteristicas.descripcion.length > 255) {
      errors.descripcionCaracteristicas =
        'La descripción de características no puede tener más de 255 caracteres';
      isValid = false;
    }

    if (!productoActual.caracteristicas?.items?.length) {
      errors.itemsCaracteristicas =
        'Debe agregar al menos un item de característica';
      isValid = false;
    }

    if (
      !modoEdicion &&
      (!productoActual.imagenes || productoActual.imagenes.length === 0)
    ) {
      errors.imagenes = 'Debe agregar al menos una imagen';
      isValid = false;
    }

    if (!selectedSubcategoria) {
      errors.categorias = 'Debe seleccionar una subcategoría';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const agregarProducto = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      await ProductosService.createProducto({
        nombre: productoActual.nombre!,
        detalle: productoActual.detalle!,
        perfilId,
        caracteristicas: productoActual.caracteristicas,
        subcategoriaId: selectedSubcategoria!,
        imagenes: productoActual.imagenes || []
      });

      setProductoActual({});
      setProductoModalOpen(false);
      resetearCategorias();
      setCurrentPage(1);
      await fetchProductos();
      onItemChange?.();
    } catch (error) {
      console.error('Error al crear producto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const editarProducto = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!productoActual.id) return;

    try {
      setIsLoading(true);
      await ProductosService.updateProducto(productoActual.id, {
        nombre: productoActual.nombre!,
        detalle: productoActual.detalle,
        perfilId,
        caracteristicas: productoActual.caracteristicas,
        subcategoriaId: selectedSubcategoria!,
        imagenes: productoActual.imagenes || [],
        imagenesEliminadas: productoActual.imagenesEliminadas || []
      });

      setProductoActual({});
      setProductoModalOpen(false);
      setModoEdicion(false);
      setCurrentPage(1);
      await fetchProductos();
      onItemChange?.();
    } catch (error) {
      console.error('Error al actualizar producto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const eliminarProducto = async (id: number) => {
    try {
      setIsLoading(true);
      await ProductosService.deleteProducto(id);
      console.log('Producto eliminado exitosamente');
      await fetchProductos();
      onItemChange?.();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetearCategorias = () => {
    setSelectedCategoria(null);
    setSelectedSubcategoria(null);
    setSubcategorias([]);
  };

  const resetearFormulario = () => {
    setProductoActual({});
    setModoEdicion(false);
    resetearCategorias();
    setFormErrors({});
  };

  const abrirEditarProducto = async (producto: Producto) => {
    setProductoActual({
      ...producto,
      imagenesEliminadas: []
    });
    setModoEdicion(true);
    setProductoModalOpen(true);

    if (producto.subcategoria) {
      const categoria = producto.subcategoria.categoria;

      if (categorias.length === 0) {
        const categoriasData = await CategoriasService.getTodasLasCategorias();
        setCategorias(categoriasData);
      }

      setSelectedCategoria(categoria.id);

      const subcategoriasData =
        await CategoriasService.getSubcategoriasByCategoriaId(categoria.id);
      setSubcategorias(subcategoriasData);
      setSelectedSubcategoria(producto.subcategoria.id);
    }
  };

  const handleProductoChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;

    if (id === 'descripcionCaracteristicas') {
      setProductoActual({
        ...productoActual,
        caracteristicas: {
          ...(productoActual.caracteristicas || { items: [] }),
          descripcion: value
        }
      });
    } else if (id === 'imagenes') {
      setProductoActual({
        ...productoActual,
        imagenes: value
          .split(',')
          .map((url) => url.trim())
          .filter((url) => url !== '')
      });
    } else {
      setProductoActual({ ...productoActual, [id]: value });
    }
  };

  const agregarItemCaracteristica = () => {
    if (!nuevoItemCaracteristica.trim()) return;

    setProductoActual({
      ...productoActual,
      caracteristicas: {
        ...(productoActual.caracteristicas || { descripcion: '' }),
        items: [
          ...(productoActual.caracteristicas?.items || []),
          nuevoItemCaracteristica.trim()
        ]
      }
    });
    setNuevoItemCaracteristica('');
  };

  const eliminarItemCaracteristica = (index: number) => {
    setProductoActual({
      ...productoActual,
      caracteristicas: {
        ...(productoActual.caracteristicas || { descripcion: '' }),
        items: (productoActual.caracteristicas?.items || []).filter(
          (_, i) => i !== index
        )
      }
    });
  };

  const fetchCategoriasForDropdown = async () => {
    return categorias.map((cat) => ({ id: cat.id, name: cat.nombre }));
  };

  const fetchSubcategoriasForDropdown = async () => {
    if (!selectedCategoria) return [];
    return subcategorias.map((sub) => ({ id: sub.id, name: sub.nombre }));
  };

  const handleCategoriaSelect = (item: { id: number; name: string }) => {
    setSelectedCategoria(item.id);
    setSelectedSubcategoria(null);
  };

  const handleSubcategoriaSelect = (item: { id: number; name: string }) => {
    setSelectedSubcategoria(item.id);
  };

  const handleAddCategoria = async (data: CreateCategoriaDto) => {
    try {
      const newCategoria = await CategoriasService.createCategoria(data);
      setCategorias([...categorias, newCategoria]);
      setSelectedCategoria(newCategoria.id);
      setSelectedSubcategoria(null);
      return { id: newCategoria.id, name: newCategoria.nombre };
    } catch (error) {
      console.error('Error al crear categoría:', error);
      throw error;
    }
  };

  const handleAddSubcategoria = async (nombre: string) => {
    if (!selectedCategoria) {
      throw new Error('Debe seleccionar una categoría primero');
    }
    try {
      const newSubcategoria = await CategoriasService.createSubcategoria(
        selectedCategoria,
        { nombre }
      );
      setSubcategorias([...subcategorias, newSubcategoria]);
      return { id: newSubcategoria.id, name: newSubcategoria.nombre };
    } catch (error) {
      console.error('Error al crear subcategoría:', error);
      throw error;
    }
  };

  const handleDeleteCategoria = async (item: { id: number; name: string }) => {
    try {
      await CategoriasService.deleteCategoria(item.id);
      setCategorias(categorias.filter((cat) => cat.id !== item.id));
      if (selectedCategoria === item.id) {
        setSelectedCategoria(null);
        setSelectedSubcategoria(null);
        setSubcategorias([]);
      }
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      throw error;
    }
  };

  const handleDeleteSubcategoria = async (item: {
    id: number;
    name: string;
  }) => {
    try {
      await CategoriasService.deleteSubcategoria(item.id);
      setSubcategorias(subcategorias.filter((sub) => sub.id !== item.id));
      if (selectedSubcategoria === item.id) {
        setSelectedSubcategoria(null);
      }
    } catch (error) {
      console.error('Error al eliminar subcategoría:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/30 rounded-lg overflow-hidden">
        <div className="p-4 flex justify-between items-center border-b h-20">
          <div className="flex items-center relative h-20">
            <div className="pr-8 border-r h-full flex items-start flex-col justify-center">
              <h2 className="text-xl font-bold text-white">Productos</h2>
              <p className="text-gray-100">
                Gestiona los productos disponibles
              </p>
            </div>
            <div className="px-4 border-r h-full flex items-center flex-row justify-center gap-2">
              <Search className="w-4 h-4 text-gray-100" />
              <input
                type="text"
                placeholder="Buscar producto..."
                className="text-white placeholder:text-gray-100 focus:outline-none bg-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <Skeleton className="h-10 w-[150px] bg-white/20" />
        </div>
        <SkeletonTabla columns={3} showActions={true} />
      </div>
    );
  }

  return (
    <>
      <div className="bg-white/30 rounded-lg overflow-hidden">
        <div className="flex justify-between items-center border-b px-4 ">
          <div className="flex items-center relative h-20">
            <div className="pr-8 border-r h-full flex items-start flex-col justify-center">
              <h2 className="text-xl font-bold text-white">Productos</h2>
              <p className="text-gray-100">
                Gestiona los productos disponibles
              </p>
            </div>
            <div className="px-4 border-r h-full flex items-center flex-row justify-center gap-2">
              <Search className="w-4 h-4 text-gray-100" />
              <input
                type="text"
                placeholder="Buscar producto..."
                className="text-white placeholder:text-gray-100 focus:outline-none bg-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
          <button
            className="bg-[#8ee368] hover:bg-[#8ee368]/80 cursor-pointer text-[#072505] px-4 py-2 rounded-md flex items-center font-extrabold transition-all"
            onClick={() => {
              setProductoActual({});
              setModoEdicion(false);
              setProductoModalOpen(true);
            }}
          >
            <span className="mr-2">+</span> Nuevo Producto
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Nombre
                </th>
                {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider hidden md:table-cell">
                  Detalle
                </th> */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-50 uppercase tracking-wider hidden md:table-cell">
                  Subcategoría
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-50 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {productos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-5 text-center text-white">
                    No hay productos disponibles
                  </td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr key={producto.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-white">
                      <div className="flex items-center gap-2">
                        {producto.imagenes &&
                          producto.imagenes.length > 0 &&
                          typeof producto.imagenes[0] === 'string' && (
                            <Image
                              src={producto.imagenes[0]}
                              alt={producto.nombre}
                              width={100}
                              height={100}
                              className="w-8 h-10 object-cover rounded-md border border-gray-300 bg-white"
                            />
                          )}
                        <span>{producto.nombre}</span>
                      </div>
                    </td>
                    {/* <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell text-white">
                      {producto.detalle.length > 20
                        ? `${producto.detalle.substring(0, 20)}...`
                        : producto.detalle}
                    </td> */}
                    <td className="px-4 py-4 whitespace-nowrap hidden md:table-cell text-white">
                      {producto.subcategoria?.nombre}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      <div className="flex space-x-2 justify-end">
                        <button
                          className="text-[#072505] px-4 py-1 bg-[#8ee368] rounded-3xl hover:bg-[#8ee368]/90 text-sm font-semibold cursor-pointer transition-all flex items-center gap-1"
                          onClick={() => abrirEditarProducto(producto)}
                        >
                          <Pencil className="w-3 h-3" strokeWidth={3} />
                          Editar
                        </button>
                        <button
                          className="text-white px-2 py-1 bg-red-500 rounded-3xl hover:bg-red-600 text-sm font-semibold cursor-pointer transition-all flex items-center gap-1"
                          onClick={() => {
                            eliminarProducto(producto.id);
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

      {/* MODAL DE PRODUCTO */}
      <Dialog
        open={productoModalOpen}
        onOpenChange={(open) => {
          setProductoModalOpen(open);
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
              {modoEdicion ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={modoEdicion ? editarProducto : agregarProducto}
            className="space-y-4"
          >
            <div>
              <label className="text-sm text-gray-100">
                Nombre <span className="text-red-400">*</span>
              </label>
              <Input
                id="nombre"
                value={productoActual.nombre || ''}
                onChange={handleProductoChange}
                className={`text-white ${
                  formErrors.nombre ? 'border-red-500' : ''
                }`}
              />
              {formErrors.nombre && (
                <p className="text-red-400 text-sm mt-1">{formErrors.nombre}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-100">
                Detalle <span className="text-red-400">*</span>
              </label>
              <Input
                id="detalle"
                isTextArea
                value={productoActual.detalle || ''}
                onChange={handleProductoChange}
                rows={3}
                className={`text-white ${
                  formErrors.detalle ? 'border-red-500' : ''
                }`}
              />
              {formErrors.detalle && (
                <p className="text-red-400 text-sm mt-1">
                  {formErrors.detalle}
                </p>
              )}
              <p className="text-gray-400 text-sm mt-1">
                {productoActual.detalle?.length || 0}/255 caracteres
              </p>
            </div>

            <div>
              <label className="text-sm text-gray-100">
                Descripción de Características{' '}
                <span className="text-red-400">*</span>
              </label>
              <Input
                id="descripcionCaracteristicas"
                isTextArea
                value={productoActual.caracteristicas?.descripcion || ''}
                onChange={handleProductoChange}
                rows={2}
                className={`text-white ${
                  formErrors.descripcionCaracteristicas ? 'border-red-500' : ''
                }`}
              />
              {formErrors.descripcionCaracteristicas && (
                <p className="text-red-400 text-sm mt-1">
                  {formErrors.descripcionCaracteristicas}
                </p>
              )}
              <p className="text-gray-400 text-sm mt-1">
                {productoActual.caracteristicas?.descripcion?.length || 0}/255
                caracteres
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-sm text-gray-100">
                    Nuevo item <span className="text-red-400">*</span>
                  </label>

                  <Input
                    id="nuevoItemCaracteristica"
                    value={nuevoItemCaracteristica}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setNuevoItemCaracteristica(e.target.value)
                    }
                    placeholder="Nuevo item de característica"
                    className="text-white placeholder:text-gray-300"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        agregarItemCaracteristica();
                      }
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={agregarItemCaracteristica}
                    className="h-[38px] px-4 bg-[#8ee368] text-black rounded-md hover:bg-[#8ee368]/80 focus:outline-none text-sm font-medium"
                  >
                    Agregar
                  </button>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                {(productoActual.caracteristicas?.items || []).map(
                  (item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-white p-2 rounded-lg border border-gray-200"
                    >
                      <span className="flex-1">{item}</span>
                      <button
                        type="button"
                        onClick={() => eliminarItemCaracteristica(index)}
                        className="text-white px-2 py-1 bg-red-500 rounded-3xl hover:bg-red-600 text-sm font-semibold cursor-pointer transition-all flex items-center gap-1"
                      >
                        <CircleX className="w-3 h-3" strokeWidth={3} />
                        Eliminar
                      </button>
                    </div>
                  )
                )}
                {formErrors.itemsCaracteristicas && (
                  <p className="text-red-400 text-sm mt-1">
                    {formErrors.itemsCaracteristicas}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-gray-100">
                Imágenes{' '}
                {!modoEdicion && <span className="text-red-400">*</span>}
              </label>
              <ImageDropzone
                images={productoActual.imagenes || []}
                maxSizeBytes={350 * 1024}
                isEditMode={modoEdicion}
                onChange={(newImages) => {
                  const imagenesEliminadas = (productoActual.imagenes || [])
                    .filter(
                      (img) =>
                        typeof img === 'string' && !newImages.includes(img)
                    )
                    .map((img) => img as string);

                  setProductoActual({
                    ...productoActual,
                    imagenes: newImages as (string | File)[],
                    imagenesEliminadas: [
                      ...(productoActual.imagenesEliminadas || []),
                      ...imagenesEliminadas
                    ]
                  });
                }}
              />
              {formErrors.imagenes && (
                <p className="text-red-400 text-sm mt-1">
                  {formErrors.imagenes}
                </p>
              )}
            </div>
            <label className="text-sm text-gray-100">
              Categoría <span className="text-red-400">*</span>
            </label>

            <Dropdown
              fetchItems={fetchCategoriasForDropdown}
              onSelect={handleCategoriaSelect}
              onDelete={handleDeleteCategoria}
              placeholder="Seleccione una categoría"
              value={categorias.find((c) => c.id === selectedCategoria)?.nombre}
              disabled={isLoading}
              customForm={
                <FormCategoria
                  onSubmit={handleAddCategoria}
                  onCancel={() => {}}
                  closeDialog={() => {}}
                />
              }
            />

            <label className="text-sm text-gray-100">
              Subcategoría <span className="text-red-400">*</span>
            </label>

            <Dropdown
              fetchItems={fetchSubcategoriasForDropdown}
              onSelect={handleSubcategoriaSelect}
              onDelete={handleDeleteSubcategoria}
              placeholder="Seleccione una subcategoría"
              value={
                subcategorias.find((s) => s.id === selectedSubcategoria)?.nombre
              }
              disabled={!selectedCategoria || isLoading}
              addItem={handleAddSubcategoria}
            />

            {formErrors.categorias && (
              <p className="text-red-400 text-sm mt-1">
                {formErrors.categorias}
              </p>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setProductoModalOpen(false);
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
                  : 'Crear producto'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
