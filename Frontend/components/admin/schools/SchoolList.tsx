// components/admin/schools/SchoolsList.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  School,
  Search,
  Loader2,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { ISchool } from "@/interfaces/school/school";
import { SchoolModal } from "./SchoolModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { SCHOOL_API } from "@/endpoints/rest-api/school";
import { toast } from "sonner";
import Image from "next/image";

export const SchoolsList: React.FC = () => {
  const [schools, setSchools] = useState<ISchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: "create" | "view" | "edit";
    school?: ISchool;
  }>({
    isOpen: false,
    mode: "create",
  });
  const [deleteDialogState, setDeleteDialogState] = useState<{
    isOpen: boolean;
    school: ISchool | null;
  }>({
    isOpen: false,
    school: null,
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadSchools = async () => {
    try {
      setLoading(true);
      const response = await SCHOOL_API.GET_ALL_SCHOOLS();
      if (response.data) {
        setSchools(response.data);
      }
    } catch (error) {
      console.error("Failed to load schools:", error);
      toast.error("Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchools();
  }, []);

  const filteredSchools = schools.filter(
    (school) =>
      school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.contactEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (
    mode: "create" | "view" | "edit",
    school?: ISchool
  ) => {
    console.log("Opening modal with mode:", mode, "school:", school);
    setModalState({
      isOpen: true,
      mode,
      school,
    });
  };

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSchoolSaved = (savedSchool: ISchool) => {
    if (modalState.mode === "create") {
      setSchools((prev) => [savedSchool, ...prev]);
    } else {
      setSchools((prev) =>
        prev.map((school) =>
          school.id === savedSchool.id ? savedSchool : school
        )
      );
    }
    handleCloseModal();
  };

  const handleDeleteClick = (school: ISchool, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogState({
      isOpen: true,
      school,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialogState.school) return;

    setDeleteLoading(true);
    try {
      await SCHOOL_API.DELETE_SCHOOL(deleteDialogState.school.id);
      setSchools((prev) =>
        prev.filter((school) => school.id !== deleteDialogState.school!.id)
      );
      toast.success(
        `School "${deleteDialogState.school.name}" deleted successfully`
      );
      setDeleteDialogState({ isOpen: false, school: null });
    } catch (error: any) {
      console.error("Failed to delete school:", error);
      toast.error(error.response?.data?.message || "Failed to delete school");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRowClick = (school: ISchool) => {
    handleOpenModal("view", school);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Schools Management
          </h1>
          <p className="text-muted-foreground">
            Manage schools and their grades for Back to School
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal("create")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add School
        </Button>
      </div>

      {/* Stats & Search */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Schools</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schools.length}</div>
            <p className="text-xs text-muted-foreground">All schools</p>
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
              {schools.filter((s) => s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Active schools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <Badge variant="secondary" className="text-xs">
              Paused
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {schools.filter((s) => !s.isActive).length}
            </div>
            <p className="text-xs text-muted-foreground">Inactive schools</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search schools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-8 text-sm"
            />
          </CardContent>
        </Card>
      </div>

      {/* Schools Table */}
      {loading ? (
        <Card>
          <CardContent className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span className="text-muted-foreground">Loading schools...</span>
          </CardContent>
        </Card>
      ) : filteredSchools.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <School className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No schools found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Try adjusting your search terms"
                : "Get started by adding your first school"}
            </p>
            <Button onClick={() => handleOpenModal("create")}>
              <Plus className="h-4 w-4 mr-2" />
              Add School
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.map((school) => (
                  <TableRow
                    key={school.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(school)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {school.imageUrl ? (
                          <div className="relative w-8 h-8 rounded-full overflow-hidden">
                            <Image
                              src={school.imageUrl}
                              alt={school.name}
                              fill
                              className="object-cover"
                              sizes="32px"
                            />
                          </div>
                        ) : (
                          <School className="h-4 w-4 text-muted-foreground" />
                        )}
                        {school.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {school.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {school.city && (
                          <div className="text-sm">
                            {school.city}
                            {school.province && `, ${school.province}`}
                          </div>
                        )}
                        {school.address && (
                          <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                            {school.address}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {school.contactEmail && (
                          <div className="text-sm">{school.contactEmail}</div>
                        )}
                        {school.contactPhone && (
                          <div className="text-xs text-muted-foreground">
                            {school.contactPhone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={school.isActive ? "default" : "destructive"}
                      >
                        {school.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation(); // This prevents the row click
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal("view", school);
                            }}
                          >
                            <School className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenModal("edit", school);
                            }}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit School
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(school, e);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete School
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

      {/* School Modal */}
      <SchoolModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        school={modalState.school}
        mode={modalState.mode}
        onSchoolSaved={handleSchoolSaved}
        onSchoolDeleted={(schoolId) => {
          setSchools((prev) => prev.filter((school) => school.id !== schoolId));
          handleCloseModal();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogState.isOpen}
        onOpenChange={(open) =>
          setDeleteDialogState({ isOpen: open, school: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Delete School
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-foreground">
                "{deleteDialogState.school?.name}"
              </strong>
              ? This action cannot be undone. This will permanently delete the
              school and all associated grades and data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? (
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
    </div>
  );
};
