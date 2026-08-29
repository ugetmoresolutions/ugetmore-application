// components/admin/grades/GradeModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { GRADE_API } from '@/endpoints/rest-api/grade';
import { IGrade, ICreateGrade, IUpdateGrade } from '@/interfaces/grade/grade';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Edit, Save, X, Trash2, BookOpen, Package, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { StationeryManager } from './StationeryManager';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  grade?: IGrade;
  schoolId: number;
  mode: 'create' | 'view' | 'edit';
  onGradeSaved: (grade: IGrade) => void;
  onGradeDeleted?: (gradeId: number) => void;
}

export const GradeModal: React.FC<GradeModalProps> = ({
  isOpen,
  onClose,
  grade,
  schoolId,
  mode,
  onGradeSaved,
  onGradeDeleted,
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(mode === 'create' || mode === 'edit');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [formData, setFormData] = useState<ICreateGrade | IUpdateGrade>({
    schoolId: schoolId,
    gradeName: grade?.gradeName || '',
    gradeLevel: grade?.gradeLevel ?? 0,
    description: grade?.description || '',
    isActive: grade?.isActive ?? true,
  });

  // South African grade levels
  const gradeLevels = Array.from({ length: 13 }, (_, i) => i); // Grade R (0) to Grade 12 (12)

  useEffect(() => {
    if (grade) {
      setFormData({
        schoolId: grade.schoolId,
        gradeName: grade.gradeName,
        gradeLevel: grade.gradeLevel,
        description: grade.description || '',
        isActive: grade.isActive,
      });
    } else {
      setFormData({
        schoolId: schoolId,
        gradeName: '',
        gradeLevel: 0,
        description: '',
        isActive: true,
      });
    }
    setIsEditing(mode === 'create' || mode === 'edit');
    setActiveTab('details');
  }, [grade, schoolId, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return;

    setLoading(true);

    try {
      if (mode === 'create') {
        const response = await GRADE_API.CREATE_GRADE(formData as ICreateGrade);
        if (response.data) {
          onGradeSaved(response.data);
          toast.success(`Grade "${formData.gradeName}" created successfully`);
          onClose();
        }
      } else if (grade && mode === 'edit') {
        const response = await GRADE_API.UPDATE_GRADE(grade.id, formData as IUpdateGrade);
        if (response.data) {
          onGradeSaved(response.data);
          toast.success(`Grade "${formData.gradeName}" updated successfully`);
          setIsEditing(false);
        }
      }
    } catch (error: any) {
      console.error('Failed to save grade:', error);
      toast.error(error.response?.data?.message || 'Failed to save grade. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!grade || !onGradeDeleted) return;

    setDeleteLoading(true);
    try {
      await GRADE_API.DELETE_GRADE(grade.id);
      onGradeDeleted(grade.id);
      toast.success(`Grade "${grade.gradeName}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (error: any) {
      console.error('Failed to delete grade:', error);
      toast.error(error.response?.data?.message || 'Failed to delete grade');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleChange = (field: keyof typeof formData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Add New Grade';
      case 'edit': return 'Edit Grade';
      case 'view': return grade?.gradeName || 'Grade Details';
      default: return 'Grade';
    }
  };

  const getGradeDisplayName = (level: number) => {
    return level === 0 ? 'Grade R (Reception)' : `Grade ${level}`;
  };

  // Render the grade details form
  const renderGradeDetails = () => (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* Grade Level */}
        <div className="space-y-2">
          <Label htmlFor="gradeLevel">Grade Level *</Label>
          {isEditing ? (
            <Select
              value={formData.gradeLevel?.toString()}
              onValueChange={(value) => handleChange('gradeLevel', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select grade level" />
              </SelectTrigger>
              <SelectContent>
                {gradeLevels.map(level => (
                  <SelectItem key={level} value={level.toString()}>
                    {getGradeDisplayName(level)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/50">
              <Badge variant="secondary" className="text-sm">
                {getGradeDisplayName(grade?.gradeLevel || 0)}
              </Badge>
            </div>
          )}
        </div>

        {/* Grade Name */}
        <div className="space-y-2">
          <Label htmlFor="gradeName">Grade Name *</Label>
          <Input
            id="gradeName"
            value={formData.gradeName}
            onChange={(e) => handleChange('gradeName', e.target.value)}
            disabled={!isEditing}
            placeholder="e.g., Grade 1, Foundation Phase"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={!isEditing}
            placeholder="Optional description for this grade level"
            rows={3}
          />
        </div>

        {/* Status */}
        {isEditing && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive as boolean}
              onChange={(e) => handleChange('isActive', e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="text-sm">
              Active Grade
            </Label>
          </div>
        )}

        {/* Action Buttons for Create/Edit Mode */}
        {isEditing && (
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (mode === 'edit') {
                  setIsEditing(false);
                  // Reset form data
                  if (grade) {
                    setFormData({
                      schoolId: grade.schoolId,
                      gradeName: grade.gradeName,
                      gradeLevel: grade.gradeLevel,
                      description: grade.description || '',
                      isActive: grade.isActive,
                    });
                  }
                } else {
                  onClose();
                }
              }}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              <Save className="h-4 w-4 mr-1" />
              {mode === 'create' ? 'Create Grade' : 'Save Changes'}
            </Button>
          </DialogFooter>
        )}
      </div>
    </form>
  );

  // Render view mode with tabs
  const renderViewMode = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="details" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Grade Details
        </TabsTrigger>
        <TabsTrigger value="stationery" className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          Stationery
        </TabsTrigger>
        <TabsTrigger value="advanced" className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4" />
          Advanced
        </TabsTrigger>
      </TabsList>

      {/* Details Tab */}
      <TabsContent value="details" className="space-y-4 mt-4">
        {renderGradeDetails()}
      </TabsContent>

      {/* Stationery Tab */}
      <TabsContent value="stationery" className="space-y-4 mt-4">
        {grade && (
          <StationeryManager 
            gradeId={grade.id} 
            gradeName={grade.gradeName} 
          />
        )}
      </TabsContent>

      {/* Advanced Tab */}
      <TabsContent value="advanced" className="space-y-4 mt-4">
        <div className="p-6 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-semibold mb-2">Advanced Settings</h3>
          <p className="text-muted-foreground mb-4">
            Additional configuration options for this grade level.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Grade ID</h4>
                <p className="text-sm text-muted-foreground">System identifier</p>
              </div>
              <Badge variant="outline">{grade?.id}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">School ID</h4>
                <p className="text-sm text-muted-foreground">Parent school identifier</p>
              </div>
              <Badge variant="outline">{grade?.schoolId}</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">Status</h4>
                <p className="text-sm text-muted-foreground">Current grade status</p>
              </div>
              <Badge variant={grade?.isActive ? "default" : "secondary"}>
                {grade?.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            {grade?.createdAt && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Created</h4>
                  <p className="text-sm text-muted-foreground">Date created</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(grade.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {grade?.updatedAt && (
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">Last Updated</h4>
                  <p className="text-sm text-muted-foreground">Date last modified</p>
                </div>
                <span className="text-sm text-muted-foreground">
                  {new Date(grade.updatedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="min-w-[90%] min-h-[90vh] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {getTitle()}
              </DialogTitle>
              
              
            </div>
            <DialogDescription>
              {mode === 'create' && 'Add a new grade level to this school'}
              {mode === 'edit' && 'Update grade information'}
              {mode === 'view' && `Manage ${grade?.gradeName} details and stationery requirements`}
            </DialogDescription>
          </DialogHeader>

          {/* Render content based on mode */}
          {mode === 'view' && grade ? (
            renderViewMode()
          ) : (
            // Create/Edit mode - only show details form
            renderGradeDetails()
          )}

         
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Grade
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>"{grade?.gradeName}"</strong>? This action cannot be undone and all associated student data and stationery requirements will be permanently removed.
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
              Delete Grade
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};