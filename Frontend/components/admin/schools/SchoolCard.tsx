// components/admin/schools/SchoolCard.tsx
'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Edit, Trash2, GraduationCap, MoreHorizontal } from 'lucide-react';
import { ISchool } from '@/interfaces/school/school';
import { SCHOOL_API } from '@/endpoints/rest-api/school';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

interface SchoolCardProps {
  school: ISchool;
  onSchoolUpdated: (school: ISchool) => void;
  onSchoolDeleted: (schoolId: number) => void;
  onViewSchool: (school: ISchool) => void;
}

export const SchoolCard: React.FC<SchoolCardProps> = ({
  school,
  onSchoolUpdated,
  onSchoolDeleted,
  onViewSchool,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const deletePromise = SCHOOL_API.DELETE_SCHOOL(school.id);
      
      toast.promise(deletePromise, {
        loading: `Deleting ${school.name}...`,
        success: () => {
          onSchoolDeleted(school.id);
          return `${school.name} has been deleted successfully`;
        },
        error: (error) => {
          console.error('Failed to delete school:', error);
          return `Failed to delete ${school.name}. Please try again.`;
        },
      });

      await deletePromise;
      setIsDeleteDialogOpen(false);
    } catch (error) {
      // Error is handled by toast.promise
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleViewGrades = (e: React.MouseEvent) => {
    e.stopPropagation();
    onViewSchool(school);
  };

  const handleCardClick = () => {
    onViewSchool(school);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-all duration-200 cursor-pointer group border hover:border-slate-200"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {school.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-mono">
                  {school.code}
                </Badge>
                {school.isActive ? (
                  <Badge variant="default" className="text-xs">
                    Active
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </CardDescription>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={(e) => handleActionClick(e, handleEdit)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit School
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => handleActionClick(e, () => setIsDeleteDialogOpen(true))}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete School
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Location */}
          {school.city && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span className="line-clamp-2">
                {school.city}{school.province && `, ${school.province}`}
                {school.address && (
                  <div className="text-xs opacity-75 mt-1 line-clamp-1">
                    {school.address}
                  </div>
                )}
              </span>
            </div>
          )}

          {/* Contact Info */}
          <div className="space-y-2">
            {school.contactEmail && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate">{school.contactEmail}</span>
              </div>
            )}
            {school.contactPhone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{school.contactPhone}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1 text-xs"
              onClick={handleViewGrades}
            >
              <GraduationCap className="h-3 w-3 mr-1" />
              Manage Grades
            </Button>
            
            {/* Quick Status Indicator */}
            <div 
              className="flex items-center justify-center px-3 py-2 border rounded-md text-xs font-medium bg-slate-50 hover:bg-slate-100 transition-colors cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {school.isActive ? '✅ Live' : '❌ Hidden'}
            </div>
          </div>

          {/* Last Updated */}
          {school.updatedAt && (
            <div className="text-xs text-muted-foreground border-t pt-2">
              Updated {new Date(school.updatedAt).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete School</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{school.name}</strong>? 
              This action cannot be undone. This will permanently delete the school 
              and all associated grades and stationery.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-r-transparent rounded-full animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete School
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      
    </>
  );
};