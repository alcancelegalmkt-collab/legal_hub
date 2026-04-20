import React, { useEffect, useState } from 'react';
import {
  XMarkIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ZoomInIcon,
  ZoomOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import api from '../services/api';
import './DocumentViewer.css';

interface DocumentViewerProps {
  documentId: number;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentId, onClose }) => {
  const [document, setDocument] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      const doc = await api.getDocumentById(documentId);
      setDocument(doc);
      // For now, assume 1 page - in future integrate with PDF.js
      setTotalPages(1);
    } catch (err) {
      setError('Erro ao carregar documento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document || !document.filePath) return;

    try {
      const response = await fetch(document.filePath, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.fileName || `documento-${document.id}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleShare = async () => {
    if (!document) return;

    const shareData = {
      title: `${document.type} - Legal Hub`,
      text: `Documento: ${document.type}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.url);
      alert('Link copiado para a área de transferência');
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  if (loading) {
    return (
      <div className="document-viewer-overlay">
        <div className="document-viewer-loading">Carregando documento...</div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="document-viewer-overlay">
        <div className="document-viewer-error">
          <p>{error || 'Documento não encontrado'}</p>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="document-viewer-overlay">
      <div className="document-viewer-container">
        {/* Header */}
        <div className="document-viewer-header">
          <div className="document-viewer-title">
            <DocumentTextIcon className="icon" />
            <span>{document.type}</span>
          </div>

          <div className="document-viewer-controls">
            <button
              title="Aumentar zoom"
              onClick={handleZoomIn}
              className="control-button"
            >
              <ZoomInIcon className="icon" />
            </button>

            <span className="zoom-label">{zoom}%</span>

            <button
              title="Diminuir zoom"
              onClick={handleZoomOut}
              className="control-button"
            >
              <ZoomOutIcon className="icon" />
            </button>

            <button
              title="Compartilhar"
              onClick={handleShare}
              className="control-button"
            >
              <ShareIcon className="icon" />
            </button>

            <button
              title="Baixar"
              onClick={handleDownload}
              className="control-button"
            >
              <ArrowDownTrayIcon className="icon" />
            </button>

            <button
              title="Fechar"
              onClick={onClose}
              className="control-button close-button"
            >
              <XMarkIcon className="icon" />
            </button>
          </div>
        </div>

        {/* Document Preview */}
        <div className="document-viewer-content">
          <div
            className="document-preview"
            style={{
              transform: `scale(${zoom / 100})`,
            }}
          >
            {/* Placeholder for actual document content */}
            <div className="document-placeholder">
              <DocumentTextIcon className="large-icon" />
              <div className="document-info">
                <h3>{document.type}</h3>
                <p>Status: {document.status}</p>
                <p>Cliente: {document.clientName || 'Desconhecido'}</p>
                {document.signedAt && (
                  <p>
                    Assinado em: {new Date(document.signedAt).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="document-viewer-footer">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="pagination-button"
          >
            <ChevronLeftIcon className="icon" />
          </button>

          <span className="pagination-info">
            Página {currentPage} de {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="pagination-button"
          >
            <ChevronRightIcon className="icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
