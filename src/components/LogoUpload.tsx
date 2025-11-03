'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image, Loader2 } from 'lucide-react';

interface LogoUploadProps {
  conversationId: string;
  onUploadComplete?: (analysis: any) => void;
}

export default function LogoUpload({ conversationId, onUploadComplete }: LogoUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    } else {
      setError('Por favor, selecione apenas arquivos de imagem.');
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Apenas arquivos de imagem são permitidos.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('Arquivo muito grande. Máximo 5MB.');
      return;
    }

    setSelectedFile(file);
    setError('');
    
    // Criar preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    if (!selectedFile || !conversationId) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('logo', selectedFile);
      formData.append('conversationId', conversationId);

      const response = await fetch('/api/upload-logo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        onUploadComplete?.(data.logoAnalysis);
        // Limpar estado após sucesso
        setSelectedFile(null);
        setPreviewUrl('');
      } else {
        setError(data.error || 'Erro ao fazer upload do logo');
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setError('Erro ao fazer upload. Tente novamente.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setError('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!selectedFile ? (
        <motion.div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
            isDragOver
              ? 'border-blue-400 bg-blue-400/10'
              : 'border-slate-600 hover:border-slate-500'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
            id="logo-upload"
          />
          
          <label htmlFor="logo-upload" className="cursor-pointer">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-slate-400" />
              </div>
              
              <div>
                <p className="text-white font-medium mb-2">
                  Envie seu logo
                </p>
                <p className="text-slate-400 text-sm">
                  Arraste e solte ou clique para selecionar
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  PNG, JPG até 5MB
                </p>
              </div>
            </div>
          </label>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-800 rounded-xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview do logo"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Image className="w-6 h-6 text-slate-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {selectedFile.name}
              </p>
              <p className="text-slate-400 text-sm">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            
            <button
              onClick={removeFile}
              className="text-slate-400 hover:text-white transition-colors"
              disabled={isUploading}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {error && (
            <p className="text-red-400 text-sm mt-3">{error}</p>
          )}
          
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analisando...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Analisar Logo</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
