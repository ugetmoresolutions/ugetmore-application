"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Mail,
  User,
  Shield,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
import { AUTH_API } from "@/endpoints/rest-api/auth";

// Interfaces
interface AdminUser {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface CreateUserFormData {
  email: string;
  fullName: string;
  phone: string;
}

interface UpdateUserFormData {
  fullName: string;
  phone: string;
}

// Generate random password
const generatePassword = (): string => {
  const length = 12;
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Form states
  const [createFormData, setCreateFormData] = useState<CreateUserFormData>({
    email: "",
    fullName: "",
    phone: "",
  });

  const [updateFormData, setUpdateFormData] = useState<UpdateUserFormData>({
    fullName: "",
    phone: "",
  });

  // Load users
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const response = await AUTH_API.GET_ADMIN_USERS();

      if (response.error) {
        throw new Error(response.message);
      }

      const adminUsers = response.data as AdminUser[];
      setUsers(adminUsers);
      setFilteredUsers(adminUsers);
    } catch (error: any) {
      toast.error("Failed to load users", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users based on search
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.includes(searchTerm)
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  // Open create modal
  const handleCreate = () => {
    setCreateFormData({
      email: "",
      fullName: "",
      phone: "",
    });
    setIsCreateModalOpen(true);
  };

  // Open edit modal
  const handleEdit = (user: AdminUser) => {
    setSelectedUser(user);
    setUpdateFormData({
      fullName: user.fullName,
      phone: user.phone,
    });
    setIsEditModalOpen(true);
  };

  // Open delete dialog
  const handleDelete = (user: AdminUser) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Handle form input changes
  const handleCreateInputChange = (
    field: keyof CreateUserFormData,
    value: string
  ) => {
    setCreateFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateInputChange = (
    field: keyof UpdateUserFormData,
    value: string
  ) => {
    setUpdateFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Submit create form - CHECKING HTTP STATUS
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const password = generatePassword();
      const userData = {
        ...createFormData,
        password: password,
        role: "admin",
      };

      let response;
      try {
        response = await AUTH_API.ADMIN_SIGNUP(userData);
      } catch (apiError: any) {
        // If the API call itself fails (network error, HTTP error)
        console.log("API call failed:", apiError);
        throw new Error(apiError.message || "Network error");
      }

      console.log("API Response:", response);

      // Check both response error and HTTP status
      const hasError =
        response?.error === true ||
        response?.status >= 400 ||
        response?.message?.includes("already exists");

      if (hasError) {
        console.log("Error detected - showing error and returning");
        toast.error("Failed to create user", {
          description: response?.message || "Email Already Exist",
        });
        return; // Stop execution
      }

      // SUCCESS - Only runs if no errors
      console.log("No errors - showing success");
      setIsCreateModalOpen(false);
      toast.success("Admin user created successfully!", {
        description: `Login details have been sent to ${createFormData.email}`,
      });

      await loadUsers();
    } catch (error: any) {
      console.log("Catch block error:", error.message);
      toast.error("Failed to create user", {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit update form
  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) return;

    try {
      setIsLoading(true);

      // Call the update user endpoint
      const response = await AUTH_API.UPDATE_USER({
        ...updateFormData,
        id: selectedUser.id,
      });

      if (!response) {
        throw new Error("No response from server");
      }

      if (response.error) {
        throw new Error(response.message);
      }

      setIsEditModalOpen(false);
      setSelectedUser(null);
      toast.success("User updated successfully!", {
        description: `${updateFormData.fullName}'s information has been updated.`,
      });

      // Reload users
      await loadUsers();
    } catch (error: any) {
      toast.error("Failed to update user", {
        description: error.message || "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete confirmation - FINAL VERSION
const handleDeleteConfirm = async () => {
  if (!selectedUser) return;

  try {
    setIsLoading(true);
    
    const response = await AUTH_API.DELETE_USER(selectedUser.id);

    // Check for error in response
    if (response.error === true) {
      throw new Error(response.message);
    }

    setIsDeleteDialogOpen(false);
    setSelectedUser(null);
    toast.success("User deleted successfully!", {
      description: `${selectedUser.fullName} has been removed from the system.`,
    });
    
    // Reload users
    await loadUsers();
  } catch (error: any) {
    toast.error("Failed to delete user", {
      description: error.message,
    });
  } finally {
    setIsLoading(false);
  }
};

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading && users.length === 0) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">
            Manage admin users and their permissions
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Admin User
        </Button>
      </div>

      {/* Statistics Card - Updated to 2 columns since we removed business accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">Active admin users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Recent Activity
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                users.filter((user) => {
                  const sevenDaysAgo = new Date();
                  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                  return new Date(user.updatedAt) > sevenDaysAgo;
                }).length
              }
            </div>
            <p className="text-xs text-muted-foreground">Updated last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users</CardTitle>
          <CardDescription>
            Search and manage admin user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or phone..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table - Removed Business column */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Users List</CardTitle>
          <CardDescription>
            {filteredUsers.length} admin user
            {filteredUsers.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      <User className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p>No admin users found</p>
                      <p className="text-sm">
                        Try adjusting your search or add new users
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.fullName}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {user.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <User className="h-3 w-3" />
                            {user.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="default"
                          className="bg-blue-100 text-blue-800"
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt as string)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal - Removed business fields */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent
          className="
          w-[95vw] 
          max-w-[450px] 
          max-h-[90vh] 
          overflow-y-auto 
          sm:rounded-lg
          mx-auto
          my-4
          sm:my-8
        "
        >
          <DialogHeader className="relative pr-8">
            <DialogTitle className="text-xl sm:text-2xl">
              Create Admin User
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Add a new admin user to the system. A random password will be
              generated and sent to their email.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleCreateSubmit}
            className="space-y-4 sm:space-y-6"
          >
            <div className="grid gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address *</label>
                <Input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) =>
                    handleCreateInputChange("email", e.target.value)
                  }
                  placeholder="user@company.com"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  value={createFormData.fullName}
                  onChange={(e) =>
                    handleCreateInputChange("fullName", e.target.value)
                  }
                  placeholder="John Doe"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number *</label>
                <Input
                  value={createFormData.phone}
                  onChange={(e) =>
                    handleCreateInputChange("phone", e.target.value)
                  }
                  placeholder="+1234567890"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? "Creating..." : "Create Admin User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal - Removed business fields */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent
          className="
          w-[95vw] 
          max-w-[450px] 
          max-h-[90vh] 
          overflow-y-auto 
          sm:rounded-lg
          mx-auto
          my-4
          sm:my-8
        "
        >
          <DialogHeader className="relative pr-8">
            <DialogTitle className="text-xl sm:text-2xl">Edit User</DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Update user information for {selectedUser?.fullName}
            </DialogDescription>
            <DialogClose className="absolute right-0 top-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          <form
            onSubmit={handleUpdateSubmit}
            className="space-y-4 sm:space-y-6"
          >
            <div className="grid gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  value={selectedUser?.email || ""}
                  disabled
                  className="w-full bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email address cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <Input
                  value={updateFormData.fullName}
                  onChange={(e) =>
                    handleUpdateInputChange("fullName", e.target.value)
                  }
                  placeholder="John Doe"
                  required
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number *</label>
                <Input
                  value={updateFormData.phone}
                  onChange={(e) =>
                    handleUpdateInputChange("phone", e.target.value)
                  }
                  placeholder="+1234567890"
                  required
                  className="w-full"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent
          className="
          w-[95vw] 
          max-w-[400px] 
          sm:rounded-lg
          mx-auto
          my-4
          sm:my-8
        "
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl">
              Delete User Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base">
              This action cannot be undone. This will permanently delete the
              admin account for <strong>{selectedUser?.fullName}</strong> (
              {selectedUser?.email}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={isLoading}
              className="w-full sm:w-auto mt-2 sm:mt-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isLoading}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? "Deleting..." : "Delete User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
