'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import type { Perfil } from '@/types/Perfil';
import { ProductosSection } from '../../sections/ProductosSection';
import { ServiciosSection } from '../../sections/ServiciosSection';
import { EventosSection } from '../../sections/EventosSection';
import { ReseniaSection } from '../../sections/ReseniaSection';
import { PerfilService } from '@/services/PerfilService';
import Link from 'next/link';
import { ArrowLeft, Link as LinkIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function PerfilDetailPage() {
  const params = useParams();
  const perfilId = Number(params.id);

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('productos');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const productosRef = useRef<HTMLButtonElement>(null);
  const serviciosRef = useRef<HTMLButtonElement>(null);
  const eventosRef = useRef<HTMLButtonElement>(null);
  const reseniasRef = useRef<HTMLButtonElement>(null);

  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0
  });

  useEffect(() => {
    let activeRef;

    switch (activeTab) {
      case 'productos':
        activeRef = productosRef;
        break;
      case 'servicios':
        activeRef = serviciosRef;
        break;
      case 'eventos':
        activeRef = eventosRef;
        break;
      case 'resenias':
        activeRef = reseniasRef;
        break;
      default:
        activeRef = productosRef;
    }

    setTimeout(() => {
      if (activeRef.current) {
        setIndicatorStyle({
          left: activeRef.current.offsetLeft,
          width: activeRef.current.offsetWidth
        });
      }
    }, 0);
  }, [activeTab, perfil]);

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const perfilData = await PerfilService.getPerfilById(perfilId);
        setPerfil(perfilData);
      } catch (error) {
        console.error('Error al cargar perfil:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerfil();
  }, [perfilId, refreshTrigger]);

  if (isLoading) {
    return (
      <div className="w-full mx-auto py-20 px-[10%] bg-home min-h-screen">
        {/* Back button skeleton */}
        <div className="mb-6">
          <div className="flex items-center mb-2">
            <Skeleton className="h-4 w-4 mr-2 bg-white/20" /> {/* Arrow icon */}
            <Skeleton className="h-4 w-32 bg-white/20" /> {/* Back text */}
          </div>
          <Skeleton className="h-8 w-64 mb-2 bg-white/20" /> {/* Title */}
          <Skeleton className="h-4 w-96 bg-white/20" /> {/* Description */}
        </div>

        {/* Tabs skeleton */}
        <div className="mb-6 flex">
          <div className="flex gap-2 bg-white/30 relative p-2 rounded-full">
            {[1, 2, 3, 4].map((_, index) => (
              <Skeleton
                key={index}
                className="h-10 w-24 bg-white/20 rounded-3xl"
              />
            ))}
          </div>
        </div>

        {/* SKELETON DE CONTENIDO */}
        <div className="bg-white/30 rounded-lg overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b">
            <div>
              <Skeleton className="h-6 w-32 mb-2 bg-white/20" />{' '}
              <Skeleton className="h-4 w-48 bg-white/20" />{' '}
            </div>
            <Skeleton className="h-10 w-[150px] bg-white/20" />{' '}
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full bg-white/20" />{' '}
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-48 bg-white/20" />{' '}
                      <Skeleton className="h-3 w-32 bg-white/20" />{' '}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-20 bg-white/20" />{' '}
                    <Skeleton className="h-8 w-20 bg-white/20" />{' '}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return <div>Perfil no encontrado</div>;
  }

  return (
    <div className="w-full mx-auto py-20 px-[10%] bg-home min-h-screen">
      <div className="mb-6">
        <Link
          href="/admin/panel"
          className="flex items-center mb-2 text-[#8ee368] hover:text-[#8ee368]/90"
        >
          <ArrowLeft className="w-4 h-4 mr-2" strokeWidth={3} />
          Regresar al panel
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-[#fff]">{perfil.nombre}</h1>
          <Link
            href={`/${perfil.username}`}
            className="p-1.5 text-[#8ee368] hover:text-[#8ee368]/90 hover:bg-white/10 rounded-full transition-colors mt-1"
            target="_blank"
          >
            <LinkIcon className="w-4 h-4" />
          </Link>
        </div>
        <p className="text-[#fff]/80 w-3/4">{perfil.descripcion}</p>
      </div>

      {/* TABS */}
      <div className="mb-6 flex">
        <div className="flex gap-2 bg-white/30 relative p-2 rounded-full">
          <div
            className="absolute bg-[#8ee368] rounded-3xl transition-all duration-300 ease-in-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              height: '40px',
              top: '8px',
              zIndex: 0
            }}
          />

          <button
            ref={productosRef}
            className={`cursor-pointer py-2 px-4 rounded-3xl transition-colors duration-[300ms] font-medium relative z-10 ${
              activeTab === 'productos' ? 'text-black' : 'text-[#fff]'
            }`}
            onClick={() => setActiveTab('productos')}
          >
            Productos
          </button>
          <button
            ref={serviciosRef}
            className={`cursor-pointer py-2 px-4 rounded-3xl transition-colors duration-[300ms] font-medium relative z-10 ${
              activeTab === 'servicios' ? 'text-black' : 'text-[#fff]'
            }`}
            onClick={() => setActiveTab('servicios')}
          >
            Servicios
          </button>
          <button
            ref={eventosRef}
            className={`cursor-pointer py-2 px-4 rounded-3xl transition-colors duration-[300ms] font-medium relative z-10 ${
              activeTab === 'eventos' ? 'text-black' : 'text-[#fff]'
            }`}
            onClick={() => setActiveTab('eventos')}
          >
            Eventos
          </button>
          <button
            ref={reseniasRef}
            className={`cursor-pointer py-2 px-4 rounded-3xl transition-colors duration-[300ms] font-medium relative z-10 ${
              activeTab === 'resenias' ? 'text-black' : 'text-[#fff]'
            }`}
            onClick={() => setActiveTab('resenias')}
          >
            Reseñas
          </button>
        </div>
      </div>

      {/* CONTENIDOS DE LAS TABS */}
      {activeTab === 'productos' && (
        <ProductosSection
          perfilId={perfilId}
          onItemChange={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}
      {activeTab === 'servicios' && (
        <ServiciosSection
          perfilId={perfilId}
          onItemChange={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}
      {activeTab === 'eventos' && (
        <EventosSection
          perfilId={perfilId}
          onItemChange={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}
      {activeTab === 'resenias' && (
        <ReseniaSection
          perfilId={perfilId}
          onItemChange={() => setRefreshTrigger((prev) => prev + 1)}
        />
      )}
    </div>
  );
}
