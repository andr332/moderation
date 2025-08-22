"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  Shield,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Image {
  id: string;
  img: string;
  name: string;
  description?: string;
  date: string;
  approved: boolean;
  status: "approved" | "rejected";
  campaignId: string;
  campaignName: string;
  streamId?: string | null;
  streamName?: string | null;
  source: string;
}

interface ModerationQueueProps {
  initialData?: Image[];
}

export default function ModerationQueue({
  initialData = [],
}: ModerationQueueProps) {
  const [data, setData] = useState<Image[]>(initialData);
  const [loading, setLoading] = useState(!initialData.length);
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = async (
    statusFilter?: string,
    showLoading: boolean = true
  ) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams();

      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const url = `/api/images${
        params.toString() ? `?${params.toString()}` : ""
      }`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        console.error("Error fetching images:", result.error);
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      toast.error("Failed to load data");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!initialData.length) {
      fetchData();
    }
  }, [initialData.length]);

  const handleStatusFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    fetchData(newFilter);
  };

  const handleModerate = async (ids: string[], approved: boolean) => {
    try {
      // Optimistically update the local state first
      setData((prevData) =>
        prevData.map((item) =>
          ids.includes(item.id)
            ? {
                ...item,
                approved,
                status: approved ? "approved" : "rejected",
              }
            : item
        )
      );

      // Clear selection immediately
      setSelected([]);

      // Show success toast immediately
      toast.success(
        `${approved ? "Approved" : "Rejected"} ${ids.length} image${
          ids.length > 1 ? "s" : ""
        } successfully!`,
        {
          description: "The changes have been applied to the database.",
        }
      );

      // Make the API call in the background
      await Promise.all(
        ids.map((id) =>
          fetch("/api/images/moderate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id, approved }),
          })
        )
      );

      // Refresh data silently in the background to ensure consistency
      setTimeout(() => {
        fetchData(filter, false);
      }, 1000);
    } catch (error) {
      console.error("Error moderating images:", error);

      // Revert the optimistic update on error
      fetchData(filter, false);

      toast.error("Failed to moderate images", {
        description:
          "Please try again or contact support if the issue persists.",
      });
    }
  };

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === filteredData.length) {
      setSelected([]);
    } else {
      setSelected(filteredData.map((item) => item.id));
    }
  };

  // Filter data based on search term
  const filteredData = data.filter((item) => {
    const searchMatch =
      searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.campaignName.toLowerCase().includes(searchTerm.toLowerCase());

    return searchMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 border-green-200"
          >
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 border-red-200"
          >
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-muted rounded-xl">
            <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Loading moderation queue...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Moderation Queue
          </h1>
          <p className="text-muted-foreground">
            Review and moderate images across all streams
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => fetchData(filter, true)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Moderation Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="search">Search Images</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by name, description, or campaign..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <div className="space-y-2">
                <Label htmlFor="status-filter">Status</Label>
                <Select value={filter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger id="status-filter" className="w-full sm:w-40">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                {selected.length} of {filteredData.length} selected
              </span>
            </div>
            <div className="flex gap-2 ml-auto">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleModerate(selected, true)}
                      disabled={selected.length === 0}
                      size="sm"
                      className="gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Selected
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Approve all selected images</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => handleModerate(selected, false)}
                      disabled={selected.length === 0}
                      variant="destructive"
                      size="sm"
                      className="gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Selected
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Reject all selected images</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selected.length === filteredData.length &&
                        filteredData.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(item.id)}
                          onCheckedChange={() => handleSelect(item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Image
                            src={item.img}
                            alt={item.name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover border"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-sm">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 max-w-48">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.campaignName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(item.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() =>
                                    handleModerate([item.id], true)
                                  }
                                  size="sm"
                                  variant="outline"
                                  disabled={item.approved}
                                  className="h-8 w-8 p-0"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Approve this image</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() =>
                                    handleModerate([item.id], false)
                                  }
                                  size="sm"
                                  variant="outline"
                                  disabled={!item.approved}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Reject this image</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground font-medium">
                          No images found
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {searchTerm
                            ? "Try adjusting your search criteria."
                            : "No images match the current filters."}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
