'use client'

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Download, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  CheckCircle,
  Clock,
  Archive,
  Users,
  BarChart3,
  RefreshCw,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  MessageSquare
} from 'lucide-react';
import { SOFTWARE_INQUIRY_API } from '@/endpoints/rest-api/softwareInquiry';
import { ISoftwareInquiry } from '@/interfaces/softwareInquiry/softwareInquiry';

interface InquiryStats {
  total: number;
  byStatus: Record<string, number>;
  byServiceType: Record<string, number>;
}

const SoftwareInquiriesDashboard: React.FC = () => {
  const [inquiries, setInquiries] = useState<ISoftwareInquiry[]>([]);
  const [filteredInquiries, setFilteredInquiries] = useState<ISoftwareInquiry[]>([]);
  const [stats, setStats] = useState<InquiryStats | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<ISoftwareInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');
  const [expandedInquiry, setExpandedInquiry] = useState<number | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Filter inquiries when search or filters change
  useEffect(() => {
    filterInquiries();
  }, [inquiries, searchTerm, statusFilter, serviceTypeFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inquiriesResponse, statsResponse] = await Promise.all([
        SOFTWARE_INQUIRY_API.GET_ALL_INQUIRIES(),
        SOFTWARE_INQUIRY_API.GET_INQUIRY_STATS()
      ]);

      if (!inquiriesResponse.error) {
        setInquiries(inquiriesResponse.data || []);
      }

      if (!statsResponse.error) {
        setStats(statsResponse.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterInquiries = () => {
    let filtered = inquiries;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(inquiry =>
        inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.projectDetails.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter);
    }

    // Apply service type filter
    if (serviceTypeFilter !== 'all') {
      filtered = filtered.filter(inquiry => inquiry.serviceType === serviceTypeFilter);
    }

    setFilteredInquiries(filtered);
  };

  const updateInquiryStatus = async (id: number, status: string) => {
    try {
      const response = await SOFTWARE_INQUIRY_API.UPDATE_INQUIRY_STATUS(id, status, 'admin');
      if (!response.error) {
        // Update local state
        setInquiries(prev => prev.map(inquiry => 
          inquiry.id === id ? response.data : inquiry
        ));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const deleteInquiry = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this inquiry?')) {
      try {
        const response = await SOFTWARE_INQUIRY_API.DELETE_INQUIRY(id);
        if (!response.error) {
          setInquiries(prev => prev.filter(inquiry => inquiry.id !== id));
        }
      } catch (error) {
        console.error('Error deleting inquiry:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500 text-white';
      case 'in-review': return 'bg-yellow-500 text-gray-800';
      case 'contacted': return 'bg-green-500 text-white';
      case 'archived': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <Clock className="w-4 h-4" />;
      case 'in-review': return <Eye className="w-4 h-4" />;
      case 'contacted': return <CheckCircle className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading inquiries...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Software Inquiries</h1>
        <p className="text-gray-600">Manage and track all software development inquiries</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Inquiries</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="bg-gray-800 p-3 rounded-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">New</p>
                <p className="text-2xl font-bold text-gray-800">{stats.byStatus.new || 0}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Review</p>
                <p className="text-2xl font-bold text-gray-800">{stats.byStatus['in-review'] || 0}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Eye className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Contacted</p>
                <p className="text-2xl font-bold text-gray-800">{stats.byStatus.contacted || 0}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search inquiries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="in-review">In Review</option>
              <option value="contacted">Contacted</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Service Type Filter */}
          <div>
            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent"
            >
              <option value="all">All Services</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-development">Mobile Development</option>
              <option value="backend-development">Backend Development</option>
              <option value="custom-software">Custom Software</option>
              <option value="consultation">Consultation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-500 mb-2">No inquiries found</p>
                      <p className="text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inquiry) => (
                  <React.Fragment key={inquiry.id}>
                    <tr 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedInquiry(expandedInquiry === inquiry.id ? null : inquiry.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {inquiry.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                            <div className="text-sm text-gray-500 flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span>{inquiry.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 capitalize">
                          {inquiry.serviceType.replace('-', ' ')}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center space-x-1">
                          <Building className="w-3 h-3" />
                          <span>{inquiry.company}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.status)}`}>
                          {getStatusIcon(inquiry.status)}
                          <span className="ml-1 capitalize">
                            {inquiry.status.replace('-', ' ')}
                          </span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(inquiry.submittedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {expandedInquiry === inquiry.id ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedInquiry(inquiry);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Details */}
                    {expandedInquiry === inquiry.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={5} className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-3">Project Details</h4>
                              <p className="text-sm text-gray-700 bg-gray-100 rounded-lg p-4 whitespace-pre-wrap">
                                {inquiry.projectDetails}
                              </p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  onClick={() => updateInquiryStatus(inquiry.id, 'in-review')}
                                  className="px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 text-sm rounded-md transition-colors border border-yellow-200"
                                >
                                  Mark Review
                                </button>
                                <button
                                  onClick={() => updateInquiryStatus(inquiry.id, 'contacted')}
                                  className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 text-sm rounded-md transition-colors border border-green-200"
                                >
                                  Mark Contacted
                                </button>
                                <button
                                  onClick={() => updateInquiryStatus(inquiry.id, 'archived')}
                                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm rounded-md transition-colors border border-gray-200"
                                >
                                  Archive
                                </button>
                                <button
                                  onClick={() => deleteInquiry(inquiry.id)}
                                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 text-sm rounded-md transition-colors border border-red-200"
                                >
                                  Delete
                                </button>
                              </div>
                              
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Contact Info</h4>
                                <div className="space-y-2 text-sm text-gray-700">
                                  <div className="flex items-center space-x-2">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span>{inquiry.phone}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span>{inquiry.email}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Inquiry Details</h3>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Client Information</h4>
                  <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Name:</span>
                      <p className="text-gray-900 font-medium">{selectedInquiry.name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Email:</span>
                      <p className="text-gray-900 font-medium">{selectedInquiry.email}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Phone:</span>
                      <p className="text-gray-900 font-medium">{selectedInquiry.phone}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Company:</span>
                      <p className="text-gray-900 font-medium">{selectedInquiry.company}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Project Information</h4>
                  <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Service Type:</span>
                      <p className="text-gray-900 font-medium capitalize">{selectedInquiry.serviceType.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Status:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedInquiry.status)}`}>
                        {getStatusIcon(selectedInquiry.status)}
                        <span className="ml-1 capitalize">{selectedInquiry.status.replace('-', ' ')}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600 block mb-1">Submitted:</span>
                      <p className="text-gray-900 font-medium">{formatDate(selectedInquiry.submittedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Details */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Project Details</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedInquiry.projectDetails}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    updateInquiryStatus(selectedInquiry.id, 'in-review');
                    setSelectedInquiry(null);
                  }}
                  className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-md transition-colors flex items-center space-x-2 border border-yellow-200"
                >
                  <Eye className="w-4 h-4" />
                  <span>Mark as In Review</span>
                </button>
                <button
                  onClick={() => {
                    updateInquiryStatus(selectedInquiry.id, 'contacted');
                    setSelectedInquiry(null);
                  }}
                  className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-md transition-colors flex items-center space-x-2 border border-green-200"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark as Contacted</span>
                </button>
                <button
                  onClick={() => {
                    updateInquiryStatus(selectedInquiry.id, 'archived');
                    setSelectedInquiry(null);
                  }}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors flex items-center space-x-2 border border-gray-200"
                >
                  <Archive className="w-4 h-4" />
                  <span>Archive</span>
                </button>
                <button
                  onClick={() => deleteInquiry(selectedInquiry.id)}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors flex items-center space-x-2 border border-red-200"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SoftwareInquiriesDashboard;