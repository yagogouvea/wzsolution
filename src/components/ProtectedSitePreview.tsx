'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Smartphone, Tablet, Monitor, Lock, Eye, Shield } from 'lucide-react';

interface ProtectedSitePreviewProps {
  siteCodeId: string; // ✅ Agora usa ID protegido
  conversationId: string;
  watermarkText?: string;
  height?: string;
  width?: string;
  version?: number;
}

export default function ProtectedSitePreview({ 
  siteCodeId, 
  conversationId, 
  watermarkText = "PREVIEW • WZ SOLUTION",
  height = "600px",
  width = "100%",
  version = 1 
}: ProtectedSitePreviewProps) {
  const [device, setDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [previewReady, setPreviewReady] = useState(false);

  // ✅ URL protegida para preview (usando API)
  const protectedPreview = useMemo(() => {
    if (!siteCodeId) return '';
    
    // ✅ Usar API protegida em vez de blob local
    return `/api/site-preview/${siteCodeId}`;
  }, [siteCodeId]);

  const devices = {
    mobile: { 
      width: '375px', 
      height: height, 
      icon: Smartphone,
      label: 'Mobile'
    },
    tablet: { 
      width: '768px', 
      height: height, 
      icon: Tablet,
      label: 'Tablet'
    },
    desktop: { 
      width: width, 
      height: height, 
      icon: Monitor,
      label: 'Desktop'
    }
  };

  useEffect(() => {
    // Simular carregamento do preview
    const timer = setTimeout(() => setPreviewReady(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!siteCodeId) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-6 text-center">
        <p className="text-slate-400">Preview não disponível</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 relative overflow-hidden"
    >
      {/* Proteção visual de fundo */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 transform -rotate-45 text-6xl font-bold text-white select-none">
          {watermarkText.split(' • ')[0] || 'WZ SOLUTION'}
        </div>
        <div className="absolute bottom-1/4 right-1/4 transform -rotate-45 text-6xl font-bold text-white select-none">
          {watermarkText.split(' • ')[1] || 'PREVIEW'}
        </div>
      </div>

      {/* Header com proteções */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <span className="text-slate-300 font-medium">
              Preview Protegido - V{version}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Device Toggle */}
          {Object.entries(devices).map(([key, deviceInfo]) => {
            const Icon = deviceInfo.icon;
            return (
              <button
                key={key}
                onClick={() => setDevice(key as 'desktop' | 'tablet' | 'mobile')}
                className={`p-2 rounded-lg transition-colors ${
                  device === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-400 hover:text-white'
                }`}
                title={deviceInfo.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview Frame Protegido */}
      <div className="mb-4 relative">
        <div 
          className="mx-auto border border-slate-600 rounded-lg overflow-hidden bg-white relative"
          style={{ 
            width: devices[device].width,
            height: devices[device].height,
            maxWidth: '100%'
          }}
        >
          {/* Watermark overlay */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45">
              <div className="text-4xl md:text-6xl font-bold text-black/10 select-none whitespace-nowrap">
                {watermarkText}
              </div>
            </div>
            
            {/* Proteção adicional nos cantos */}
            <div className="absolute top-4 left-4 bg-blue-600/90 text-white px-2 py-1 rounded text-xs font-medium">
              🔒 PROTEGIDO
            </div>
            <div className="absolute top-4 right-4 bg-orange-600/90 text-white px-2 py-1 rounded text-xs font-medium">
              PREVIEW
            </div>
          </div>
          
          {/* Iframe protegido */}
          {previewReady ? (
            <iframe
              src={protectedPreview}
              className="w-full h-full border-0 relative z-10"
              title="Preview Protegido do Site"
              sandbox="allow-scripts allow-forms allow-modals allow-same-origin"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Eye className="w-6 h-6 text-white animate-pulse" />
                </div>
                <p className="text-slate-600 font-medium">Gerando preview protegido...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions Limitadas */}
      <div className="flex flex-wrap items-center justify-center gap-3 relative z-10">
        <button
          onClick={() => window.open(protectedPreview, '_blank')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span>Ver Preview Completo</span>
        </button>

        <button
          onClick={() => {
            alert('🔒 Código fonte disponível após aprovação do projeto!\n\nEste preview é protegido para demonstração. O site final será entregue sem marca d\'água e com código fonte completo.');
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
        >
          <Lock className="w-4 h-4" />
          <span>Código Fonte</span>
        </button>
      </div>

      {/* Informações de Proteção */}
      <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700 relative z-10">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-slate-300 font-medium mb-1">
              Preview Protegido
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Este é um preview demonstrativo com marca d&apos;água de proteção. 
              O site final será entregue sem marca d&apos;água, com código fonte completo 
              e todas funcionalidades após aprovação do projeto.
            </p>
          </div>
        </div>
        
        {version > 1 && (
          <div className="mt-2 pt-2 border-t border-slate-700">
            <p className="text-xs text-slate-500">
              📝 Versão {version} - Modificações aplicadas no preview
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ✅ Proteções agora são aplicadas pela API `/api/site-preview/[siteId]`
// Código mais limpo e seguro com proteções server-side
