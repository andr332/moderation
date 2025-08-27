"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Image from "next/image";
import {
  FolderOpen,
  CheckCircle,
  XCircle,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface ImageItem {
  id: string;
  img: string;
  name: string;
  description?: string;
  approved: boolean;
  status: "approved" | "rejected";
  date: string;
  campaignId: string;
  campaignName: string;
}

interface Campaign {
  id: string;
  name: string;
  description?: string;
  images: ImageItem[];
}

interface Stream {
  id: string;
  name: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface StreamDetailProps {
  stream: Stream;
  campaigns: Campaign[];
  images: ImageItem[];
}

const StreamDetail = ({ stream, campaigns, images }: StreamDetailProps) => {
  const [activeTab, setActiveTab] = useState("moderation");

  // Simplified: local list state, no search, no status filter
  const [list, setList] = useState<ImageItem[]>(images);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const handleModerate = async (imageIds: string[], approved: boolean) => {
    try {
      // Optimistic update
      setList((prev) =>
        prev.map((img) =>
          imageIds.includes(img.id)
            ? { ...img, approved, status: approved ? "approved" : "rejected" }
            : img
        )
      );
      setSelectedImages([]);

      toast.success(
        `${approved ? "Approved" : "Rejected"} ${imageIds.length} image${
          imageIds.length > 1 ? "s" : ""
        }`,
        { description: "Changes applied." }
      );

      await Promise.all(
        imageIds.map((id) =>
          fetch("/api/images/moderate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, approved }),
          })
        )
      );
    } catch (error) {
      console.error("Error moderating images:", error);
      toast.error("Failed to moderate images");
    }
  };

  const handleSelect = (id: string) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedImages.length === list.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(list.map((item) => item.id));
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }
    if (status === "rejected") {
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header with tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{stream.name}</h1>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="moderation">Moderation</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Moderation Tab - minimal UI */}
        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-10">
                        <Checkbox
                          checked={selectedImages.length === list.length && list.length > 0}
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
                    {list.length > 0 ? (
                      list.map((image) => (
                        <TableRow key={image.id} className="group hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedImages.includes(image.id)}
                              onCheckedChange={() => handleSelect(image.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Image
                              src={image.img}
                              alt={image.name}
                              width={60}
                              height={60}
                              className="rounded-lg object-cover border"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 min-w-[14rem]">
                              <span className="font-medium text-sm">{image.name}</span>
                              {image.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {image.description}
                                </p>
                              )}
                              <span className="text-[11px] text-muted-foreground">
                                {image.campaignName} • {new Date(image.date).toLocaleDateString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(image.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center gap-1">
                              <Button
                                onClick={() => handleModerate([image.id], true)}
                                size="icon"
                                variant="outline"
                                disabled={image.approved}
                                className="h-8 w-8"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                onClick={() => handleModerate([image.id], false)}
                                size="icon"
                                variant="outline"
                                disabled={!image.approved}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                            <p className="text-muted-foreground font-medium">No images</p>
                            <p className="text-sm text-muted-foreground">Nothing to review right now.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab - light overview */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No campaigns</p>
                  <p className="text-sm text-muted-foreground">No campaigns in this stream.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {campaigns.map((campaign) => (
                    <Card key={campaign.id} className="border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{campaign.name}</CardTitle>
                        {campaign.description && (
                          <p className="text-sm text-muted-foreground">{campaign.description}</p>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Total</span>
                          <Badge variant="outline">{campaign.images.length}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Approved</span>
                          <Badge className="bg-green-50 text-green-700 border-green-200">
                            {campaign.images.filter((img) => img.approved).length}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Rejected</span>
                          <Badge className="bg-red-50 text-red-700 border-red-200">
                            {campaign.images.filter((img) => !img.approved).length}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sticky bulk action bar - only show when items selected */}
      {selectedImages.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
          <div className="bg-background border shadow-lg rounded-full px-3 py-2 flex items-center gap-2">
            <span className="px-2 text-sm text-muted-foreground">
              {selectedImages.length} selected
            </span>
            <Button
              onClick={() => handleModerate(selectedImages, true)}
              size="sm"
              className="gap-2 rounded-full"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </Button>
            <Button
              onClick={() => handleModerate(selectedImages, false)}
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
    </div>
  );
};

export default StreamDetail;