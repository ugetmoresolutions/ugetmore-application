// components/admin/grades/GradeCard.tsx
'use client';

import React, { useState } from 'react';
import { BookOpen, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { IGrade } from '@/interfaces/grade/grade';
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
import { GRADE_API } from '@/endpoints/rest-api/grade';
import { toast } from 'sonner';

interface GradeCardProps {
  grade: IGrade;
  onGradeUpdated: (grade: IGrade) => void;
  onGradeDeleted: (gradeId: number) => void;
  onViewGrade: (grade: IGrade) => void;
  onEditGrade?: (grade: IGrade) => void; // Added for consistency
}

export const GradeCard: React.FC<GradeCardProps> = ({
  grade,
  onGradeUpdated,
  onGradeDeleted,
  onViewGrade,
  onEditGrade,
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const deletePromise = GRADE_API.DELETE_GRADE(grade.id);
      
      toast.promise(deletePromise, {
        loading: `Deleting ${grade.gradeName}...`,
        success: () => {
          onGradeDeleted(grade.id);
          return `${grade.gradeName} has been deleted successfully`;
        },
        error: (error) => {
          console.error('Failed to delete grade:', error);
          return `Failed to delete ${grade.gradeName}. Please try again.`;
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

  const getGradeDisplayName = (level: number) => {
    return level === 0 ? 'Grade R' : `Grade ${level}`;
  };

  const handleCardClick = () => {
    onViewGrade(grade);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditGrade) {
      onEditGrade(grade);
    } else {
      // Fallback to view if edit handler not provided
      onViewGrade(grade);
    }
  };

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-all duration-200 cursor-pointer group border hover:border-primary/20 h-full flex flex-col"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="space-y-2 flex-1 min-w-0">
              <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
                {grade.gradeName}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs font-mono">
                  {getGradeDisplayName(grade.gradeLevel)}
                </Badge>
                {grade.isActive ? (
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
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <DropdownMenuItem onClick={(e) => handleActionClick(e, () => onViewGrade(grade))}>
                  <BookOpen className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                {onEditGrade && (
                  <DropdownMenuItem onClick={(e) => handleActionClick(e, () => onEditGrade(grade))}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Grade
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={(e) => handleActionClick(e, () => setIsDeleteDialogOpen(true))}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Grade
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 flex-grow flex flex-col">
          {/* Description */}
          {grade.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
              {grade.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic flex-grow">
              No description provided
            </p>
          )}

          {/* Quick Info */}
          <div className="flex justify-between items-center text-xs text-muted-foreground pt-2">
            <span className="font-medium">Level {grade.gradeLevel}</span>
            <span className="font-mono">ID: {grade.id}</span>
          </div>

          {/* Status Badge */}
          <div className="flex gap-2 pt-2">
            <div 
              className={`flex items-center justify-center px-3 py-1 border rounded-md text-xs font-medium cursor-default ${
                grade.isActive 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {grade.isActive ? '✅ Active' : '❌ Inactive'}
            </div>
          </div>

          {/* Last Updated */}
          {grade.updatedAt && (
            <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
              Updated {new Date(grade.updatedAt).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Grade
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong className="text-foreground">"{grade.gradeName}"</strong>? 
              This action cannot be undone. This will permanently delete the grade 
              and all associated stationery requirements.
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
                  Delete Grade
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};