// components/admin/schools/SchoolModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ISchool, ICreateSchool, IUpdateSchool } from '@/interfaces/school/school';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, X, GraduationCap, Trash2, Plus, School, Users, Building, Upload, Image as ImageIcon, Layers } from 'lucide-react';
import { GradesList } from '../grades/GradeList';
import { GradeModal } from '../grades/GradeModal';
import { SCHOOL_API } from '@/endpoints/rest-api/school';
import { toast } from 'sonner';
import { IGrade } from '@/interfaces/grade/grade';
import { GRADE_API } from '@/endpoints/rest-api/grade';

// Import the upload function
import { PRODUCT_API } from '@/endpoints/rest-api/product';

interface SchoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  school?: ISchool; // Undefined for create, defined for view/edit
  mode: 'create' | 'view' | 'edit';
  onSchoolSaved: (school: ISchool) => void;
  onSchoolDeleted?: (schoolId: number) => void;
}

// Helper type to handle form data state - UPDATED
type SchoolFormData = {
  name: string;
  code: string;
  type: 'preschool' | 'primary' | 'high' | 'combined'; // ADDED 'combined'
  address: string;
  city: string;
  province: string;
  contactEmail: string;
  contactPhone: string;
  isActive: boolean;
  imageUrl: string;
};

// Image state type
type ImageState = {
  file: File | null;
  previewUrl: string;
  isUploading: boolean;
};

// Validation errors type
type ValidationErrors = {
  name?: string;
  code?: string;
  type?: string;
  contactEmail?: string;
};

// School type configuration - UPDATED WITH COMBINED
const SCHOOL_TYPES = [
  {
    value: 'preschool' as const,
    label: 'Preschool',
    description: 'Early childhood education (Grade RR - R)',
    icon: Users,
    color: 'bg-pink-100 text-pink-700 border-pink-200'
  },
  {
    value: 'primary' as const,
    label: 'Primary School',
    description: 'Foundation to intermediate phase (Grade R - 7)',
    icon: School,
    color: 'bg-blue-100 text-blue-700 border-blue-200'
  },
  {
    value: 'high' as const,
    label: 'High School',
    description: 'Further education and training (Grade 8 - 12)',
    icon: Building,
    color: 'bg-green-100 text-green-700 border-green-200'
  },
  {
    value: 'combined' as const, // NEW
    label: 'Combined School',
    description: 'Complete education (Grade RR - 12)',
    icon: Layers,
    color: 'bg-purple-100 text-purple-700 border-purple-200'
  }
];

export const SchoolModal: React.FC<SchoolModalProps> = ({
  isOpen,
  onClose,
  school,
  mode,
  onSchoolSaved,
  onSchoolDeleted,
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [gradeModalMode, setGradeModalMode] = useState<'create' | 'view' | 'edit'>('create');
  const [selectedGrade, setSelectedGrade] = useState<IGrade | undefined>();

  // Grade management states
  const [grades, setGrades] = useState<IGrade[]>([]);
  const [gradesLoading, setGradesLoading] = useState(false);

  // Image state
  const [imageState, setImageState] = useState<ImageState>({
    file: null,
    previewUrl: school?.imageUrl || '',
    isUploading: false
  });

  // FIX: Simplified editing state - always respect the mode prop
  const isEditing = mode === 'create' || mode === 'edit';
  
  const [formData, setFormData] = useState<SchoolFormData>({
    name: school?.name || '',
    code: school?.code || '',
    type: school?.type || 'primary', // Default to primary
    address: school?.address || '',
    city: school?.city || '',
    province: school?.province || '',
    contactEmail: school?.contactEmail || '',
    contactPhone: school?.contactPhone || '',
    isActive: school?.isActive ?? true,
    imageUrl: school?.imageUrl || '',
  });

  // Validation state
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Load grades when school changes
  const loadGrades = async () => {
    if (!school) return;
    
    setGradesLoading(true);
    try {
      const response = await GRADE_API.GET_GRADES_BY_SCHOOL(school.id);
      if (response.data) {
        setGrades(response.data);
      }
    } catch (error) {
      console.error('Failed to load grades:', error);
      toast.error('Failed to load grades');
    } finally {
      setGradesLoading(false);
    }
  };

  // Reset form when school or mode changes
  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name,
        code: school.code,
        type: school.type,
        address: school.address || '',
        city: school.city || '',
        province: school.province || '',
        contactEmail: school.contactEmail || '',
        contactPhone: school.contactPhone || '',
        isActive: school.isActive,
        imageUrl: school.imageUrl || '',
      });
      setImageState({
        file: null,
        previewUrl: school.imageUrl || '',
        isUploading: false
      });
    } else {
      setFormData({
        name: '',
        code: '',
        type: 'primary',
        address: '',
        city: '',
        province: '',
        contactEmail: '',
        contactPhone: '',
        isActive: true,
        imageUrl: '',
      });
      setImageState({
        file: null,
        previewUrl: '',
        isUploading: false
      });
    }
    setActiveTab('details');
    setErrors({}); // Clear errors when form resets
  }, [school, mode, isOpen]);

  // Load grades when school is available and modal is open
  useEffect(() => {
    if (school && isOpen && mode !== 'create') {
      loadGrades();
    }
  }, [school, isOpen, mode]);

  // Image upload handler using your existing endpoint
  const handleImageUpload = async (file: File): Promise<string> => {
    setImageState(prev => ({ ...prev, isUploading: true }));
    
    try {
      // Use the existing PRODUCT_API upload endpoint
      const response = await PRODUCT_API.UPLOAD_PRODUCT_IMAGES([file]);
      
      console.log('Upload response:', response); // Debug log
      
      // Check if the upload was successful and we have image URL
      if (!response.error && response.data && response.data.url) {
        const imageUrl = response.data.url;
        setImageState(prev => ({ ...prev, isUploading: false }));
        return imageUrl;
      } else {
        throw new Error(response.message || 'Failed to upload image: No image URL returned');
      }
    } catch (error: any) {
      setImageState(prev => ({ ...prev, isUploading: false }));
      console.error('Image upload error:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload image');
    }
  };

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setImageState({
      file,
      previewUrl,
      isUploading: false
    });
  };

  // Remove image
  const handleRemoveImage = () => {
    // Revoke the object URL to avoid memory leaks
    if (imageState.previewUrl && imageState.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imageState.previewUrl);
    }
    
    setImageState({
      file: null,
      previewUrl: '',
      isUploading: false
    });
    setFormData(prev => ({ ...prev, imageUrl: '' }));
  };

  // Validation function - UPDATED
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'School name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'School name must be at least 2 characters long';
    }

    // Code validation
    if (!formData.code.trim()) {
      newErrors.code = 'School code is required';
    } else if (formData.code.trim().length < 2) {
      newErrors.code = 'School code must be at least 2 characters long';
    }

    // Type validation - UPDATED
    if (!formData.type || !['preschool', 'primary', 'high', 'combined'].includes(formData.type)) {
      newErrors.type = 'School type is required';
    }

    // Email validation
    if (formData.contactEmail && !isValidEmail(formData.contactEmail)) {
      newErrors.contactEmail = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Email validation helper
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Real-time validation for specific fields
  const handleFieldChange = (field: keyof SchoolFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for the field being edited
    if (errors[field as keyof ValidationErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    // Validate form before submission - UPDATED validation includes 'combined'
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = formData.imageUrl;

      // Upload image if a new file is selected
      if (imageState.file) {
        try {
          finalImageUrl = await handleImageUpload(imageState.file);
          toast.success('Image uploaded successfully');
        } catch (error: any) {
          console.error('Failed to upload image:', error);
          toast.error(error.message || 'Failed to upload image. Please try again.');
          setLoading(false);
          return;
        }
      }

      if (mode === 'create') {
        const createData: ICreateSchool = {
          name: formData.name.trim(),
          code: formData.code.trim(),
          type: formData.type,
          address: formData.address.trim(),
          city: formData.city.trim(),
          province: formData.province.trim(),
          contactEmail: formData.contactEmail.trim(),
          contactPhone: formData.contactPhone.trim(),
          isActive: formData.isActive,
          imageUrl: finalImageUrl,
        };
        const response = await SCHOOL_API.CREATE_SCHOOL(createData);
        if (response.data) {
          onSchoolSaved(response.data);
          toast.success(`School "${formData.name}" created successfully`);
          onClose();
        }
      } else if (school && mode === 'edit') {
        const updateData: IUpdateSchool = {
          name: formData.name.trim(),
          code: formData.code.trim(),
          type: formData.type,
          address: formData.address.trim(),
          city: formData.city.trim(),
          province: formData.province.trim(),
          contactEmail: formData.contactEmail.trim(),
          contactPhone: formData.contactPhone.trim(),
          isActive: formData.isActive,
          imageUrl: finalImageUrl,
        };
        const response = await SCHOOL_API.UPDATE_SCHOOL(school.id, updateData);
        if (response.data) {
          onSchoolSaved(response.data);
          toast.success(`School "${formData.name}" updated successfully`);
          onClose(); // Close modal after successful edit
        }
      }
    } catch (error: any) {
      console.error('Failed to save school:', error);
      toast.error(error.response?.data?.message || 'Failed to save school. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!school || !onSchoolDeleted) return;

    setDeleteLoading(true);
    try {
      await SCHOOL_API.DELETE_SCHOOL(school.id);
      onSchoolDeleted(school.id);
      toast.success(`School "${school.name}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (error: any) {
      console.error('Failed to delete school:', error);
      toast.error(error.response?.data?.message || 'Failed to delete school');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Grade management functions
  const handleDeleteGrade = async (gradeId: number) => {
    try {
      await GRADE_API.DELETE_GRADE(gradeId);
      toast.success('Grade deleted successfully');
      loadGrades(); // Refresh the grades list
    } catch (error: any) {
      console.error('Failed to delete grade:', error);
      toast.error(error.response?.data?.message || 'Failed to delete grade');
    }
  };

  const handleGradeSaved = (grade: IGrade) => {
    setIsGradeModalOpen(false);
    toast.success(`Grade "${grade.gradeName}" saved successfully`);
    loadGrades(); // Refresh the grades list after save
  };

  const handleGradeDeleted = (gradeId: number) => {
    setIsGradeModalOpen(false);
    toast.success('Grade deleted successfully');
    loadGrades(); // Refresh the grades list after delete
  };

  const handleAddGrade = () => {
    setSelectedGrade(undefined);
    setGradeModalMode('create');
    setIsGradeModalOpen(true);
  };

  const handleEditGrade = (grade: IGrade) => {
    setSelectedGrade(grade);
    setGradeModalMode('edit');
    setIsGradeModalOpen(true);
  };

  const handleViewGrade = (grade: IGrade) => {
    setSelectedGrade(grade);
    setGradeModalMode('view');
    setIsGradeModalOpen(true);
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Add New School';
      case 'edit': return 'Edit School';
      case 'view': return school?.name || 'School Details';
      default: return 'School';
    }
  };

  // Get current school type info
  const getCurrentSchoolTypeInfo = () => {
    return SCHOOL_TYPES.find(type => type.value === formData.type) || SCHOOL_TYPES[1]; // Default to primary
  };

  const currentTypeInfo = getCurrentSchoolTypeInfo();

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imageState.previewUrl && imageState.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(imageState.previewUrl);
      }
    };
  }, [imageState.previewUrl]);

  
  // Image upload component
  const ImageUploadSection = () => (
    <div className="space-y-3">
      <Label>School Image</Label>
      <div className="flex items-start gap-4">
        {/* Image Preview */}
        <div className="flex-shrink-0">
          {imageState.previewUrl ? (
            <div className="relative">
              <img
                src={imageState.previewUrl}
                alt="School preview"
                className="w-32 h-32 rounded-lg object-cover border"
              />
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                  onClick={handleRemoveImage}
                  disabled={imageState.isUploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ) : (
            <div className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>

        {/* Upload Controls */}
        {isEditing && (
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {/* Hidden file input */}
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={imageState.isUploading}
              />
              
              {/* Upload button that triggers file input */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={imageState.isUploading}
                className="flex items-center gap-2"
                onClick={() => document.getElementById('image-upload')?.click()}
              >
                {imageState.isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {imageState.previewUrl ? 'Change Image' : 'Upload Image'}
              </Button>
              
              {imageState.previewUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  disabled={imageState.isUploading}
                >
                  Remove
                </Button>
              )}
            </div>
            
            <p className="text-xs text-gray-500">
              Recommended: Square image, max 5MB. JPG, PNG, or WebP.
            </p>
            
            {imageState.isUploading && (
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="h-3 w-3 animate-spin" />
                Uploading image...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="min-w-[90%] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                {getTitle()}
              </DialogTitle>
            </div>
            <DialogDescription>
              {mode === 'create' && 'Create a new school for the Back to School program'}
              {mode === 'edit' && 'Update school information'}
              {mode === 'view' && 'View and manage school details and grades'}
            </DialogDescription>
          </DialogHeader>

          {school && mode !== 'create' ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">School Details</TabsTrigger>
                <TabsTrigger value="grades">Grades</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {/* Image Upload Section */}
                    <ImageUploadSection />

                    {/* School Type Display/Selection - UPDATED WITH COMBINED */}
                    <div className="space-y-3">
                      <Label>School Type</Label>
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"> {/* UPDATED GRID */}
                          {SCHOOL_TYPES.map((schoolType) => {
                            const IconComponent = schoolType.icon;
                            return (
                              <div
                                key={schoolType.value}
                                className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                                  formData.type === schoolType.value
                                    ? `${schoolType.color} border-current`
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleFieldChange('type', schoolType.value)}
                              >
                                <div className="flex items-center gap-2 mb-2">
                                  <IconComponent className="h-4 w-4" />
                                  <span className="font-medium">{schoolType.label}</span>
                                </div>
                                <p className="text-xs text-gray-600">{schoolType.description}</p>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${currentTypeInfo.color} border`}>
                          <currentTypeInfo.icon className="h-4 w-4" />
                          <span className="font-medium">{currentTypeInfo.label}</span>
                          <Badge variant="secondary" className="ml-2">
                            {currentTypeInfo.description}
                          </Badge>
                        </div>
                      )}
                      {errors.type && (
                        <p className="text-red-500 text-sm">{errors.type}</p>
                      )}
                    </div>

                    {/* School Code & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{school.code}</Badge>
                        {isEditing ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="isActive"
                              checked={formData.isActive}
                              onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="isActive" className="text-sm">
                              Active School
                            </Label>
                          </div>
                        ) : (
                          <Badge variant={school.isActive ? "default" : "secondary"}>
                            {school.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">School Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleFieldChange('name', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter school name"
                          className={errors.name ? 'border-red-500' : ''}
                          required
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="code">School Code *</Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => handleFieldChange('code', e.target.value)}
                          disabled={!isEditing}
                          placeholder="e.g., SPS001"
                          className={errors.code ? 'border-red-500' : ''}
                          required
                        />
                        {errors.code && (
                          <p className="text-red-500 text-sm">{errors.code}</p>
                        )}
                      </div>
                    </div>

                    {/* Address */}
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleFieldChange('address', e.target.value)}
                        disabled={!isEditing}
                        placeholder="Enter full address"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={(e) => handleFieldChange('city', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter city"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="province">Province</Label>
                        <Input
                          id="province"
                          value={formData.province}
                          onChange={(e) => handleFieldChange('province', e.target.value)}
                          disabled={!isEditing}
                          placeholder="Enter province"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Contact Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          value={formData.contactEmail}
                          onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                          disabled={!isEditing}
                          placeholder="admin@school.co.za"
                          className={errors.contactEmail ? 'border-red-500' : ''}
                        />
                        {errors.contactEmail && (
                          <p className="text-red-500 text-sm">{errors.contactEmail}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Contact Phone</Label>
                        <Input
                          id="contactPhone"
                          value={formData.contactPhone}
                          onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
                          disabled={!isEditing}
                          placeholder="+27 11 123 4567"
                        />
                      </div>
                    </div>

                    {/* Action Buttons - Only show in edit mode */}
                    {isEditing && (
                      <DialogFooter className="gap-2 sm:gap-0 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={onClose}
                          disabled={loading}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading || imageState.isUploading}>
                          {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                          <Save className="h-4 w-4 mr-1" />
                          Save Changes
                        </Button>
                      </DialogFooter>
                    )}
                  </div>
                </form>
              </TabsContent>

              {/* Grades Tab */}
              <TabsContent value="grades" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Grades Management</span>
                      <Button onClick={handleAddGrade} size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Grade
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <GradesList 
                      schoolId={school.id}
                      schoolName={school.name}
                      grades={grades}
                      loading={gradesLoading}
                      onEditGrade={handleEditGrade}
                      onViewGrade={handleViewGrade}
                      onDeleteGrade={handleDeleteGrade}
                      onRefresh={loadGrades}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            // Create Mode Form - UPDATED WITH COMBINED
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {/* Image Upload Section for Create Mode */}
                <ImageUploadSection />

                {/* School Type Selection for Create Mode - UPDATED WITH COMBINED */}
                <div className="space-y-3">
                  <Label htmlFor="school-type">School Type *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"> {/* UPDATED GRID */}
                    {SCHOOL_TYPES.map((schoolType) => {
                      const IconComponent = schoolType.icon;
                      return (
                        <div
                          key={schoolType.value}
                          className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                            formData.type === schoolType.value
                              ? `${schoolType.color} border-current`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleFieldChange('type', schoolType.value)}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <IconComponent className="h-4 w-4" />
                            <span className="font-medium">{schoolType.label}</span>
                          </div>
                          <p className="text-xs text-gray-600">{schoolType.description}</p>
                        </div>
                      );
                    })}
                  </div>
                  {errors.type && (
                    <p className="text-red-500 text-sm">{errors.type}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-name">School Name *</Label>
                    <Input
                      id="create-name"
                      value={formData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="Enter school name"
                      className={errors.name ? 'border-red-500' : ''}
                      required
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-code">School Code *</Label>
                    <Input
                      id="create-code"
                      value={formData.code}
                      onChange={(e) => handleFieldChange('code', e.target.value)}
                      placeholder="e.g., SPS001"
                      className={errors.code ? 'border-red-500' : ''}
                      required
                    />
                    {errors.code && (
                      <p className="text-red-500 text-sm">{errors.code}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="create-address">Address</Label>
                  <Textarea
                    id="create-address"
                    value={formData.address}
                    onChange={(e) => handleFieldChange('address', e.target.value)}
                    placeholder="Enter full address"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-city">City</Label>
                    <Input
                      id="create-city"
                      value={formData.city}
                      onChange={(e) => handleFieldChange('city', e.target.value)}
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-province">Province</Label>
                    <Input
                      id="create-province"
                      value={formData.province}
                      onChange={(e) => handleFieldChange('province', e.target.value)}
                      placeholder="Enter province"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="create-email">Contact Email</Label>
                    <Input
                      id="create-email"
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => handleFieldChange('contactEmail', e.target.value)}
                      placeholder="admin@school.co.za"
                      className={errors.contactEmail ? 'border-red-500' : ''}
                    />
                    {errors.contactEmail && (
                      <p className="text-red-500 text-sm">{errors.contactEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="create-phone">Contact Phone</Label>
                    <Input
                      id="create-phone"
                      value={formData.contactPhone}
                      onChange={(e) => handleFieldChange('contactPhone', e.target.value)}
                      placeholder="+27 11 123 4567"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="create-isActive"
                    checked={formData.isActive}
                    onChange={(e) => handleFieldChange('isActive', e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="create-isActive">Active School</Label>
                </div>

                <DialogFooter className="gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={loading || imageState.isUploading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading || imageState.isUploading}>
                    {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                    Create School
                  </Button>
                </DialogFooter>
              </div>
            </form>
          )}

          {/* Delete Button for View Mode */}
          {school && mode === 'view' && onSchoolDeleted && (
            <DialogFooter>
              <Button
                variant="destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete School
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Grade Modal */}
      {school && (
        <GradeModal
          isOpen={isGradeModalOpen}
          onClose={() => setIsGradeModalOpen(false)}
          grade={selectedGrade}
          schoolId={school.id}
          mode={gradeModalMode}
          onGradeSaved={handleGradeSaved}
          onGradeDeleted={handleGradeDeleted}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete School
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>"{school?.name}"</strong>? This action cannot be undone and all associated grades and data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};