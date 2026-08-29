// components/admin/grades/GradesList.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Search, Loader2, Edit, Trash2, MoreHorizontal } from 'lucide-react';
import { IGrade } from '@/interfaces/grade/grade';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface GradesListProps {
  schoolId: number;
  schoolName?: string;
  grades: IGrade[];
  loading: boolean;
  onEditGrade: (grade: IGrade) => void;
  onViewGrade: (grade: IGrade) => void;
  onDeleteGrade: (gradeId: number) => void;
  onRefresh: () => void;
}

export const GradesList: React.FC<GradesListProps> = ({
  schoolId,
  schoolName,
  grades,
  loading,
  onEditGrade,
  onViewGrade,
  onDeleteGrade,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    grade: IGrade | null;
  }>({
    isOpen: false,
    grade: null,
  });

  const filteredGrades = grades.filter(grade =>
    grade.gradeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    grade.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort grades by level
  const sortedGrades = filteredGrades.sort((a, b) => a.gradeLevel - b.gradeLevel);

  const getGradeDisplayName = (level: number) => {
    return level === 0 ? 'Grade R' : `Grade ${level}`;
  };

  const handleDeleteClick = (grade: IGrade, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogState({
      isOpen: true,
      grade,
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialogState.grade) {
      onDeleteGrade(deleteDialogState.grade.id);
      setDeleteDialogState({ isOpen: false, grade: null });
    }
  };

  const handleRowClick = (grade: IGrade) => {
    onViewGrade(grade);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">
            Grades {schoolName && `- ${schoolName}`}
          </h3>
          <p className="text-muted-foreground text-sm">
            Manage grade levels and their stationery requirements
          </p>
        </div>
        
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Grades</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{grades.length}</div>
            <p className="text-xs text-muted-foreground">
              Grade levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Badge variant="default" className="text-xs">
              Live
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {grades.filter(g => g.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Active grades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Range</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Levels
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {grades.length > 0 
                ? `${getGradeDisplayName(Math.min(...grades.map(g => g.gradeLevel)))} - ${getGradeDisplayName(Math.max(...grades.map(g => g.gradeLevel)))}`
                : 'No grades'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Grade range
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search grades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 text-sm"
            />
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading grades...</span>
          </CardContent>
        </Card>
      ) : sortedGrades.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No grades found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first grade'}
            </p>
            <Button onClick={() => onEditGrade({} as IGrade)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Grade
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grade Name</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedGrades.map((grade) => (
                  <TableRow 
                    key={grade.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(grade)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        {grade.gradeName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {getGradeDisplayName(grade.gradeLevel)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]">
                        {grade.description || 'No description'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={grade.isActive ? "default" : "destructive"}>
                        {grade.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewGrade(grade);
                            }}
                          >
                            <BookOpen className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditGrade(grade);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Grade
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(grade, e);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Grade
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogState.isOpen} onOpenChange={(open) => setDeleteDialogState({ isOpen: open, grade: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete Grade
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong className="text-foreground">"{deleteDialogState.grade?.gradeName}"</strong>? 
              This action cannot be undone. This will permanently delete the grade 
              and all associated stationery requirements.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Grade
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};