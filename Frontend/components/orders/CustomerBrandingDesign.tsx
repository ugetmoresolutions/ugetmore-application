"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  ThumbsUp,
  RefreshCw as RequestIcon,
  X,
  User,
  ImageIcon,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Mail,
  Shield,
  UserCheck,
  Bot,
} from "lucide-react";
import { IBrandedArtwork, IDesignCommunication, Order, OrderItem } from "@/interfaces/order/order";
import { ORDER_API } from "@/endpoints/rest-api/order";

interface CustomerBrandingDesignSectionProps {
  order: Order;
  product: OrderItem;
  brandedArtworks: IBrandedArtwork[];
  loading: boolean;
  error?: string;
  onSendMessage: (message: string, files: File[]) => Promise<void>;
  onApproveMockup: (artworkId: string) => Promise<void>;
  onRequestRevision: (artworkId: string, feedback: string) => Promise<void>;
}

interface DesignRevision {
  id: string;
  version: number;
  mockupImages: {
    id: string;
    url: string;
    fileName: string;
    fileType: string;
    uploadDate: string;
  }[];
  adminNotes: string;
  customerFeedback?: string;
  status: string;
  createdAt: string;
  designer?: {
    name: string;
    avatar?: string;
  };
  files?: {
    id: string;
    url: string;
    fileName: string;
    fileType: string;
    uploadedBy: string;
  }[];
}

const CustomerBrandingDesignSection: React.FC<
  CustomerBrandingDesignSectionProps
> = ({
  product,
  brandedArtworks,
  loading,
  order,
  error,
  onApproveMockup,
  onRequestRevision,
}) => {
  const [showDesignModal, setShowDesignModal] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState("");
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [activeTab, setActiveTab] = useState<"design" | "history" | "conversation">("design");
  const [expandedRevisions, setExpandedRevisions] = useState<Set<number>>(new Set());

    const [communications, setCommunications] = useState<IDesignCommunication[]>([]);
  const [commsLoading, setCommsLoading] = useState(false);
  const [commsError, setCommsError] = useState("");

  // Fetch design communications
  useEffect(() => {
    const fetchCommunications = async () => {
      if (!order.id || !product.id) return;
      
      setCommsLoading(true);
      setCommsError("");
      
      try {
        const response = await ORDER_API.GET_DESIGN_COMMUNICATIONS(
          parseInt(order.id),
          product.id
        );
        
        if (response.error === false && response.data) {
          setCommunications(response.data);
        } else {
          setCommsError(response.message || 'Failed to fetch communications');
        }
      } catch (error) {
        setCommsError('An error occurred while fetching communications');
        console.error('Failed to fetch design communications:', error);
      } finally {
        setCommsLoading(false);
      }
    };

    if (showDesignModal) {
      fetchCommunications();
    }
  }, [order.id, product.id, showDesignModal]);





  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading design history...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <XCircle className="w-5 h-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!brandedArtworks || brandedArtworks.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
        <ImageIcon className="w-12 h-12 text-blue-400 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-blue-800 mb-2">No Designs Yet</h3>
        <p className="text-blue-600">The designer hasn't uploaded any mockups yet.</p>
      </div>
    );
  }

  const designRevisions = brandedArtworks.map((artwork, index) => ({
    id: artwork.id,
    version: index + 1,
    mockupImages: [
      {
        id: String(index),
        url: artwork.url,
        fileName: `design-v${index + 1}.png`,
        fileType: "image/png",
        uploadDate: artwork.createdAt ?? new Date().toISOString(),
      },
    ],
    adminNotes: artwork.notes || "No notes provided",
    customerFeedback: artwork.customerFeedback,
    status: artwork.isApproved ? "approved" : artwork.customerFeedback ? "revision_requested" : "pending_approval",
    createdAt: artwork.createdAt ?? new Date().toISOString(),
    designer: {
      name: "Design Team",
      avatar: "/api/placeholder/32/32",
    },
    files: artwork.attachments?.map((file, fileIndex) => ({
      id: `file-${index}-${fileIndex}`,
      url: '',
      fileName: `attachment-${fileIndex + 1}`,
      fileType:  "application/octet-stream",
      uploadedBy: "Designer",
    })),
  }));

  const latestRevision = designRevisions[designRevisions.length - 1];

 const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending_approval":
        return <Clock className="w-4 h-4 text-amber-500" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-rose-500" />;
      case "revision_requested":
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending_approval":
        return "Awaiting Your Approval";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      case "revision_requested":
        return "Revision Requested";
      default:
        return status;
    }
  };

  const getSenderIcon = (sender: string) => {
    switch (sender) {
      case "admin":
        return <Shield className="w-4 h-4 text-blue-600" />;
      case "customer":
        return <UserCheck className="w-4 h-4 text-green-600" />;
      case "system":
        return <Bot className="w-4 h-4 text-gray-600" />;
      default:
        return <User className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSenderLabel = (sender: string) => {
    switch (sender) {
      case "admin":
        return "Design Team";
      case "customer":
        return "You";
      case "system":
        return "System";
      default:
        return sender;
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "mockup_submission":
        return <ImageIcon className="w-4 h-4 text-blue-600" />;
      case "revision_request":
        return <RefreshCw className="w-4 h-4 text-amber-600" />;
      case "approval":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "general_message":
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
      default:
        return <Mail className="w-4 h-4 text-gray-600" />;
    }
  };


  const toggleRevisionExpansion = (version: number) => {
    const newExpanded = new Set(expandedRevisions);
    if (newExpanded.has(version)) {
      newExpanded.delete(version);
    } else {
      newExpanded.add(version);
    }
    setExpandedRevisions(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ConversationHistory = () => (
    <div className="space-y-4">
      {commsLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading messages...</span>
        </div>
      ) : commsError ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{commsError}</p>
          </div>
        </div>
      ) : communications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>No messages yet</p>
        </div>
      ) : (
        communications.map((comm) => (
          <div
            key={comm.id}
            className={`rounded-lg p-4 ${
              comm.sender === 'customer'
                ? 'bg-blue-50 border border-blue-200 ml-8'
                : comm.sender === 'admin'
                ? 'bg-gray-50 border border-gray-200 mr-8'
                : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  comm.sender === 'customer' ? 'bg-blue-100 text-blue-600' :
                  comm.sender === 'admin' ? 'bg-gray-100 text-gray-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {getSenderIcon(comm.sender)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-gray-900">
                      {getSenderLabel(comm.sender)}
                    </h4>
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      {getMessageTypeIcon(comm.type)}
                      {comm.type.replace('_', ' ')}
                    </span>
                  </div>
                  {/* <p className="text-sm text-gray-500">{comm.createdAt }</p> */}
                </div>
              </div>
              {!comm.isRead && comm.sender !== 'customer' && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  New
                </span>
              )}
            </div>

            <div className="bg-white rounded-lg p-3 mb-3">
              <p className="text-gray-800">{comm.message}</p>
            </div>

            {comm.attachments && comm.attachments.length > 0 && (
              <div className="mb-3">
                <h5 className="font-medium text-gray-700 mb-2 text-sm">Attachments:</h5>
                <div className="space-y-2">
                  {comm.attachments.map((file, index) => (
                    <a
                      key={index}
                      href={file.url}
                      download={file.fileName}
                      className="flex items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors text-sm"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700 truncate">{file.fileName}</span>
                      <Download className="w-4 h-4 text-gray-400 ml-auto" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const DesignHistory = () => (
    <div className="space-y-4">
      {designRevisions.map((revision) => (
        <div key={revision.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => toggleRevisionExpansion(revision.version)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${
                revision.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                revision.status === 'revision_requested' ? 'bg-blue-100 text-blue-600' :
                'bg-amber-100 text-amber-600'
              }`}>
                {getStatusIcon(revision.status)}
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-gray-900">Version {revision.version}</h4>
                <p className="text-sm text-gray-500">{formatDate(revision.createdAt)}</p>
              </div>
            </div>
            {expandedRevisions.has(revision.version) ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <AnimatePresence>
            {expandedRevisions.has(revision.version) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="p-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {revision.mockupImages.map((img) => (
                      <div key={img.id} className="bg-gray-100 rounded-lg p-3">
                        <img
                          src={img.url}
                          alt={img.fileName}
                          className="w-full h-48 object-contain rounded"
                        />
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-sm text-gray-600">{img.fileName}</span>
                          <a
                            href={img.url}
                            download={img.fileName}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-medium text-blue-800 mb-2">Designer Notes</h5>
                    <p className="text-blue-700">{revision.adminNotes}</p>
                  </div>

                  {revision.customerFeedback && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-3">
                      <h5 className="font-medium text-yellow-800 mb-2">Your Feedback</h5>
                      <p className="text-yellow-700">{revision.customerFeedback}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            latestRevision.status === "approved"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
              : latestRevision.status === "revision_requested"
              ? "bg-blue-100 text-blue-800 border border-blue-200"
              : "bg-amber-100 text-amber-800 border border-amber-200"
          }`}>
            {getStatusIcon(latestRevision.status)}
            {getStatusText(latestRevision.status)}
          </div>
          <span className="text-sm text-gray-500">
            {designRevisions.length} revision{designRevisions.length !== 1 ? 's' : ''}
          </span>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDesignModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Eye className="w-4 h-4" />
          Review Designs
        </motion.button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showDesignModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowDesignModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-2xl w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white p-6 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Design Review</h2>
                  <p className="text-slate-300 mt-1">{product.name}</p>
                </div>
                <button
                  onClick={() => setShowDesignModal(false)}
                  className="p-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-slate-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <div className="flex space-x-1 px-6">
                  {[
                    { id: "design" as const, label: "Current Design", icon: ImageIcon },
                    { id: "history" as const, label: "Design History", icon: Clock },
                    { id: "conversation" as const, label: "Conversation", icon: MessageSquare },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                        activeTab === tab.id
                          ? "text-blue-600 border-b-2 border-blue-600"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <tab.icon className="w-4 h-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === "design" && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {latestRevision.mockupImages.map((img) => (
                        <div key={img.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <img
                            src={img.url}
                            alt={img.fileName}
                            className="w-full h-64 object-contain rounded-lg"
                          />
                          <div className="mt-4 flex items-center justify-between">
                            <div>
                              <p className="text-sm text-gray-600">Version {latestRevision.version}</p>
                              <p className="text-xs text-gray-500">{formatDate(img.uploadDate)}</p>
                            </div>
                            <a
                              href={img.url}
                              download={img.fileName}
                              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                      <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Designer Notes
                      </h3>
                      <p className="text-blue-800 leading-relaxed">{latestRevision.adminNotes}</p>
                    </div>

                    {latestRevision.status === "pending_approval" && (
                      <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">What would you like to do?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              onApproveMockup(latestRevision.id as string);
                              setShowDesignModal(false);
                            }}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors"
                          >
                            <ThumbsUp className="w-5 h-5" />
                            Approve Design
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowFeedbackBox(true)}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-colors"
                          >
                            <RequestIcon className="w-5 h-5" />
                            Request Changes
                          </motion.button>
                        </div>
                      </div>
                    )}

                    {showFeedbackBox && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                      >
                        <h4 className="font-semibold text-gray-900 mb-4">Request Changes</h4>
                        <textarea
                          value={revisionFeedback}
                          onChange={(e) => setRevisionFeedback(e.target.value)}
                          placeholder="Please describe what changes you'd like to see. Be as specific as possible..."
                          className="w-full p-4 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={5}
                        />
                        <div className="flex gap-3 mt-4">
                          <button
                            onClick={() => {
                              onRequestRevision(latestRevision.id as string, revisionFeedback);
                              setRevisionFeedback("");
                              setShowFeedbackBox(false);
                            }}
                            disabled={!revisionFeedback.trim()}
                            className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                          >
                            Submit Request
                          </button>
                          <button
                            onClick={() => setShowFeedbackBox(false)}
                            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {activeTab === "history" && <DesignHistory />}
                {activeTab === "conversation" && <ConversationHistory />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerBrandingDesignSection;