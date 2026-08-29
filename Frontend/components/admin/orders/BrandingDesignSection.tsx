"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText,
  ImageIcon,
  Send,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Order, OrderItem, IBrandedArtwork } from '@/interfaces/order/order';

interface BrandingDesignSectionProps {
  order: Order;
  product: OrderItem;
  brandedArtworks: IBrandedArtwork[];
  loading: boolean;
  onMockupUpload: (files: File[], notes: string, product: OrderItem) => Promise<void>;
  onStatusChange: (status: string, notes?: string) => void;
}

const BrandingDesignSection: React.FC<BrandingDesignSectionProps> = ({
  order,
  product,
  brandedArtworks,
  loading,
  onMockupUpload,
  onStatusChange
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [adminNotes, setAdminNotes] = useState('');
  const [activeRevision, setActiveRevision] = useState<number>(0);

  // Check if the latest mockup is approved by customer
  const isLatestApproved = brandedArtworks.length > 0 && 
    brandedArtworks[brandedArtworks.length - 1].isApproved;

  // Check if there are any revisions after customer approval
  const hasCustomerRevisions = brandedArtworks.some((artwork, index) => 
    index < brandedArtworks.length - 1 && artwork.isApproved
  );

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    setUploadedFiles(prev => [...prev, ...imageFiles]);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    setUploadedFiles(prev => [...prev, ...imageFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return;
    
    setIsUploading(true);
    try {
      await onMockupUpload(uploadedFiles, adminNotes, product);
      
      // Reset state
      setUploadedFiles([]);
      setAdminNotes('');
      setShowUploadModal(false);
    } catch (error) {
      console.error('Failed to upload mockups:', error);
      alert('Failed to upload mockups: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (isApproved: boolean, isRevised: boolean = false) => {
    if (isRevised) {
      return <RefreshCw className="w-4 h-4 text-blue-500" />;
    }
    if (isApproved) {
      return <CheckCircle className="w-4 h-4 text-emerald-500" />;
    }
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  const getStatusText = (artwork: IBrandedArtwork, index: number, total: number) => {
    const isLatest = index === total - 1;
    
    if (artwork.isApproved) {
      // If it's approved but not the latest, it means it was revised by customer
      if (!isLatest && total > 1) {
        return 'Revised by Customer';
      }
      return 'Approved by Customer';
    }
    
    // Only show "Awaiting Customer Approval" for the latest version
    if (isLatest) {
      return 'Awaiting Customer Approval';
    }
    
    // For older versions that weren't approved, show a generic status
    return 'Previous Version';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Branding Design</h3>
              <p className="text-sm text-slate-600">
                Manage mockups and design approvals for {product.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            {brandedArtworks.length > 0 && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                isLatestApproved 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {getStatusIcon(isLatestApproved)}
                {getStatusText(brandedArtworks[brandedArtworks.length - 1], brandedArtworks.length - 1, brandedArtworks.length)}
              </div>
            )}
            
            {/* Hide upload button if latest mockup is approved */}
            {!isLatestApproved && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowUploadModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload Mockup
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {brandedArtworks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-medium text-slate-900 mb-2">No Mockups Uploaded Yet</h4>
            <p className="text-slate-600 mb-6">
              Upload mockup images to share with the customer for approval.
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload First Mockup
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Design History */}
            <div>
              <h4 className="font-medium text-slate-900 mb-4">Design History</h4>
              <div className="space-y-3">
                {brandedArtworks.map((artwork, index) => {
                  const isRevised = index < brandedArtworks.length - 1 && artwork.isApproved;
                  const statusText = getStatusText(artwork, index, brandedArtworks.length);
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        activeRevision === index
                          ? 'border-slate-900 bg-slate-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setActiveRevision(index)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-600">
                            Version {index + 1}
                          </span>
                          {getStatusIcon(artwork.isApproved, isRevised)}
                          <span className={`text-sm font-medium ${
                            isRevised ? 'text-blue-600' :
                            artwork.isApproved ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {statusText}
                          </span>
                        </div>
                        <span className="text-sm text-slate-500">
                          {/* {new Date(artwork.createdAt).toLocaleDateString()} */}
                        </span>
                      </div>
                      
                      {artwork.notes && (
                        <p className="text-sm text-slate-700 mb-3">
                          {artwork.notes}
                        </p>
                      )}
                      
                      <div className="flex gap-2">
                        <div className="w-16 h-16 bg-slate-100 rounded border border-slate-200 overflow-hidden">
                          <img
                            src={artwork.url}
                            alt={`Mockup version ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Artwork Details */}
            {brandedArtworks[activeRevision] && (
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <h4 className="font-medium text-slate-900 mb-4">
                  Version {activeRevision + 1} Details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Mockup Image */}
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-3">Mockup Image</h5>
                    <div className="relative group bg-white rounded-lg border border-slate-200 overflow-hidden">
                      <img
                        src={brandedArtworks[activeRevision].url}
                        alt={`Mockup version ${activeRevision + 1}`}
                        className="w-full h-64 object-contain"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex gap-2">
                          <a
                            href={brandedArtworks[activeRevision].url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-white rounded-full shadow-sm"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <a
                            href={brandedArtworks[activeRevision].url}
                            download={`mockup-version-${activeRevision + 1}`}
                            className="p-2 bg-white rounded-full shadow-sm"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Artwork Details */}
                  <div>
                    <h5 className="text-sm font-medium text-slate-700 mb-3">Admin Notes</h5>
                    <div className="bg-white rounded-lg p-4 border border-slate-200">
                      <p className="text-sm text-slate-700">
                        {brandedArtworks[activeRevision].notes || 'No notes provided.'}
                      </p>
                    </div>

                    <h5 className="text-sm font-medium text-slate-700 mt-4 mb-3">Status</h5>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(
                        brandedArtworks[activeRevision].isApproved,
                        activeRevision < brandedArtworks.length - 1 && brandedArtworks[activeRevision].isApproved
                      )}
                      <span className="font-medium">
                        {getStatusText(brandedArtworks[activeRevision], activeRevision, brandedArtworks.length)}
                      </span>
                    </div>

                    {/* <h5 className="text-sm font-medium text-slate-700 mt-4 mb-3">Upload Date</h5>
                    <p className="text-sm text-slate-600">
                      {new Date(brandedArtworks.createdAt).toLocaleString()}
                    </p> */}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Mockup Modal */}
      {showUploadModal && (
        <UploadMockupModal
          isOpen={showUploadModal}
          onClose={() => {
            setShowUploadModal(false);
            setUploadedFiles([]);
            setAdminNotes('');
          }}
          uploadedFiles={uploadedFiles}
          adminNotes={adminNotes}
          onFileDrop={handleFileDrop}
          onFileSelect={handleFileSelect}
          onRemoveFile={removeFile}
          onNotesChange={setAdminNotes}
          onUpload={handleUpload}
          isUploading={isUploading}
          productName={product.name}
        />
      )}
    </div>
  );
};

// Upload Mockup Modal Component (unchanged)
interface UploadMockupModalProps {
  isOpen: boolean;
  onClose: () => void;
  uploadedFiles: File[];
  adminNotes: string;
  onFileDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onNotesChange: (notes: string) => void;
  onUpload: () => void;
  isUploading: boolean;
  productName: string;
}

const UploadMockupModal: React.FC<UploadMockupModalProps> = ({
  isOpen,
  onClose,
  uploadedFiles,
  adminNotes,
  onFileDrop,
  onFileSelect,
  onRemoveFile,
  onNotesChange,
  onUpload,
  isUploading,
  productName
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-slate-900/50" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-lg border border-slate-200">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Upload Mockup</h3>
              <p className="text-sm text-slate-600">For {productName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* File Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                onFileDrop(e);
              }}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
                isDragging
                  ? 'border-slate-900 bg-slate-50'
                  : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <h4 className="font-medium text-slate-900 mb-2">Drop files here</h4>
              <p className="text-sm text-slate-600 mb-4">
                PNG, JPG, PDF files accepted. Maximum 10MB per file.
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium cursor-pointer">
                <Upload className="w-4 h-4" />
                Select Files
                <input
                  type="file"
                  multiple
                  accept="image/png,image/jpeg,image/jpg,application/pdf"
                  onChange={onFileSelect}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded Files Preview */}
            {uploadedFiles.length > 0 && (
              <div>
                <h4 className="font-medium text-slate-900 mb-3">Selected Files</h4>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{file.name}</p>
                          <p className="text-xs text-slate-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveFile(index)}
                        className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Notes for Customer
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Describe the changes you've made, placement details, or any important information for the customer..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onUpload}
              disabled={uploadedFiles.length === 0 || isUploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send to Customer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandingDesignSection;