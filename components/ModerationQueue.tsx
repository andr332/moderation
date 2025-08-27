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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const applyFilter = (items: Image[], filter: string) => {
    if (filter === "approved")
      return items.filter((i) => i.status === "approved");
    if (filter === "rejected")
      return items.filter((i) => i.status === "rejected");
    return items;
  };

  const [allData, setAllData] = useState<Image[]>(initialData);
  const [data, setData] = useState<Image[]>(applyFilter(initialData, "all"));
  const [loading, setLoading] = useState(!initialData.length);
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");

  // Preview dialog
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState<Image | null>(null);

  const fetchData = async (
    statusFilter?: string,
    showLoading: boolean = true
  ) => {
    if (showLoading) setLoading(true);
    try {
      const response = await fetch("/api/images");
      const result = await response.json();
      if (result.success) {
        setAllData(result.data);
        const nextFilter = statusFilter ?? filter;
        setData(applyFilter(result.data, nextFilter));
      } else {
        setAllData([]);
        setData([]);
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData.length) {
      setAllData(initialData);
      setData(applyFilter(initialData, filter));
      setLoading(false);
    } else {
      fetchData(undefined, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    setSelected([]);
    setData(applyFilter(allData, newFilter));
  };

  const handleModerate = async (ids: string[], approved: boolean) => {
    try {
      // update allData first
      setAllData((prev) =>
        prev.map((item) =>
          ids.includes(item.id)
            ? { ...item, approved, status: approved ? "approved" : "rejected" }
            : item
        )
      );
      // then update the visible data based on current filter
      setData((prev) =>
        applyFilter(
          prev.map((item) =>
            ids.includes(item.id)
              ? {
                  ...item,
                  approved,
                  status: approved
                    ? ("approved" as const)
                    : ("rejected" as const),
                }
              : item
          ),
          filter
        )
      );
      setSelected([]);
      toast.success(
        `${approved ? "Approved" : "Rejected"} ${ids.length} image${
          ids.length > 1 ? "s" : ""
        } successfully!`,
        {
          description: "The changes have been applied to the database.",
        }
      );

      await Promise.all(
        ids.map((id) =>
          fetch("/api/images/moderate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, approved }),
          })
        )
      );

      // optional: silent background refresh without spinner
      // fetchData(undefined, false);
    } catch {
      // fallback: silent refresh to restore from server if needed
      // fetchData(undefined, false);
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
    if (selected.length === data.length) setSelected([]);
    else setSelected(data.map((i) => i.id));
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }
    if (status === "rejected") {
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    }
    return null;
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
      {/* Header with simple tabs and refresh */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Moderation</h1>
          <Tabs value={filter} onValueChange={handleStatusFilterChange}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Table: minimal columns */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        selected.length === data.length && data.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-20">Image</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead className="w-40">Status</TableHead>
                  <TableHead className="w-28 text-right"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((item) => (
                    <TableRow
                      onClick={() => {
                        setPreviewItem(item);
                        setPreviewOpen(true);
                      }}
                      key={item.id}
                      className="group hover:bg-muted/50 cursor-pointer"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selected.includes(item.id)}
                          onCheckedChange={() => handleSelect(item.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Image
                          src={item.img}
                          alt={item.name}
                          width={60}
                          height={60}
                          className="rounded-lg object-cover border"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 min-w-[14rem]">
                          <span className="font-medium text-sm">
                            {item.name}
                          </span>
                          {item.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <span className="text-[11px] text-muted-foreground">
                            {item.campaignName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleModerate([item.id], true);
                                  }}
                                  size="icon"
                                  variant="outline"
                                  disabled={item.approved}
                                  className="h-8 w-8"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Approve</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleModerate([item.id], false);
                                  }}
                                  size="icon"
                                  variant="outline"
                                  disabled={!item.approved}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Reject</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12">
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground font-medium">
                          No images
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Nothing to review right now.
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

      {/* Sticky bulk action bar */}
      {selected.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <div className="bg-background border shadow-lg rounded-full px-3 py-2 flex items-center gap-2">
            <span className="px-2 text-sm text-muted-foreground">
              {selected.length} selected
            </span>
            <Button
              onClick={() => handleModerate(selected, true)}
              size="sm"
              className="gap-2 rounded-full"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
            <Button
              onClick={() => handleModerate(selected, false)}
              size="sm"
              variant="destructive"
              className="gap-2 rounded-full"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </Button>
          </div>
        </div>
      )}

      {/* Preview dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="truncate">
              {previewItem?.name ?? "Image preview"}
            </DialogTitle>
            {previewItem?.campaignName && (
              <DialogDescription className="flex gap-2">
                <Badge variant="outline">{previewItem.campaignName}</Badge>
                <span className="text-xs text-muted-foreground">
                  {previewItem?.date
                    ? new Date(previewItem.date).toLocaleString()
                    : ""}
                </span>
              </DialogDescription>
            )}
          </DialogHeader>
          {previewItem && (
            <div className="space-y-4">
              <div className="relative w-full aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                <Image
                  src={previewItem.img}
                  alt={previewItem.name}
                  fill
                  className="object-contain"
                />
              </div>
              {previewItem.description && (
                <p className="text-sm text-muted-foreground">
                  {previewItem.description}
                </p>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Close
                </Button>
                <Button
                  onClick={async () => {
                    await handleModerate([previewItem.id], true);
                    setPreviewOpen(false);
                  }}
                  className="gap-2"
                  disabled={previewItem.approved}
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await handleModerate([previewItem.id], false);
                    setPreviewOpen(false);
                  }}
                  className="gap-2"
                  disabled={!previewItem.approved}
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
