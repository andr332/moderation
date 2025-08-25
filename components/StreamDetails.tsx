"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Image as ImageIcon,
  FolderOpen,
  BarChart3,
  Shield,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Image {
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
  images: Image[];
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
  images: Image[];
}

const StreamDetail = ({ stream, campaigns, images }: StreamDetailProps) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("moderation");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const approvedImages = images.filter((img) => img.approved);
  const rejectedImages = images.filter((img) => !img.approved);

  // Filter images based on current filters
  const filteredImages = images.filter((image) => {
    const statusMatch =
      statusFilter === "all" ||
      (statusFilter === "approved" && image.approved) ||
      (statusFilter === "rejected" && !image.approved);

    const searchMatch =
      image.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.campaignName.toLowerCase().includes(searchTerm.toLowerCase());

    return statusMatch && searchMatch;
  });

  const handleModerate = async (imageIds: string[], approved: boolean) => {
    try {
      await Promise.all(
        imageIds.map((id) =>
          fetch("/api/images/moderate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id, approved }),
          })
        )
      );

      toast.success(
        `${approved ? "Approved" : "Rejected"} ${
          imageIds.length
        } image(s) successfully!`
      );
      setSelectedImages([]);
      // Refresh the page to get updated data
      router.refresh();
    } catch (error) {
      console.error("Error moderating images:", error);
      toast.error("Error moderating images");
    }
  };

  const handleSelect = (id: string) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedImages.length === filteredImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(filteredImages.map((item) => item.id));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-2">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {stream.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg p-1">
            <TabsTrigger
              value="moderation"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-colors"
            >
              <Shield className="w-4 h-4" />
              Moderation
            </TabsTrigger>
            <TabsTrigger
              value="campaigns"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-colors"
            >
              <FolderOpen className="w-4 h-4" />
              Campaigns
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          {/* Moderation Tab */}
          <TabsContent value="moderation" className="space-y-6">
            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Image Moderation
                </CardTitle>
                <p className="text-sm text-gray-600">
                  Review and moderate images in this stream
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters and Actions */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search images..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-full sm:w-64"
                      />
                    </div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleModerate(selectedImages, true)}
                      disabled={selectedImages.length === 0}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve Selected ({selectedImages.length})
                    </Button>
                    <Button
                      onClick={() => handleModerate(selectedImages, false)}
                      disabled={selectedImages.length === 0}
                      variant="destructive"
                      className="flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Selected ({selectedImages.length})
                    </Button>
                  </div>
                </div>

                {/* Images Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={
                              selectedImages.length === filteredImages.length &&
                              filteredImages.length > 0
                            }
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredImages.length > 0 ? (
                        filteredImages.map((image) => (
                          <TableRow key={image.id}>
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
                                className="rounded object-cover border"
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-sm">
                                  {image.name}
                                </p>
                                {image.description && (
                                  <p className="text-xs text-gray-500 truncate max-w-48">
                                    {image.description}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {image.campaignName}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {new Date(image.date).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(image.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  onClick={() =>
                                    handleModerate([image.id], true)
                                  }
                                  size="sm"
                                  variant="outline"
                                  disabled={image.approved}
                                  className="h-8 px-2"
                                >
                                  <CheckCircle className="w-3 h-3" />
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleModerate([image.id], false)
                                  }
                                  size="sm"
                                  variant="outline"
                                  disabled={!image.approved}
                                  className="h-8 px-2 text-red-600 hover:text-red-700"
                                >
                                  <XCircle className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8">
                            <div className="flex flex-col items-center gap-2">
                              <ImageIcon className="w-8 h-8 text-gray-400" />
                              <p className="text-gray-500">
                                No images found matching the current filters.
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
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <Card className="shadow-sm border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Campaigns ({campaigns.length})
                </CardTitle>
                <p className="text-sm text-gray-600">
                  All campaigns in this stream
                </p>
              </CardHeader>
              <CardContent>
                {campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No campaigns found in this stream.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((campaign) => (
                      <Card
                        key={campaign.id}
                        className="shadow-sm border hover:shadow-md transition-shadow"
                      >
                        <CardHeader>
                          <CardTitle className="text-lg">
                            {campaign.name}
                          </CardTitle>
                          {campaign.description && (
                            <p className="text-sm text-gray-600">
                              {campaign.description}
                            </p>
                          )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Total Images
                            </span>
                            <Badge variant="outline">
                              {campaign.images.length}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Approved
                            </span>
                            <Badge className="bg-green-100 text-green-800">
                              {
                                campaign.images.filter((img) => img.approved)
                                  .length
                              }
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Rejected
                            </span>
                            <Badge className="bg-red-100 text-red-800">
                              {
                                campaign.images.filter((img) => !img.approved)
                                  .length
                              }
                            </Badge>
                          </div>
                          {campaign.images.length > 0 && (
                            <div className="grid grid-cols-4 gap-2">
                              {campaign.images.slice(0, 4).map((image) => (
                                <Image
                                  key={image.id}
                                  src={image.img}
                                  alt={image.name}
                                  width={80}
                                  height={80}
                                  className="rounded object-cover border"
                                />
                              ))}
                              {campaign.images.length > 4 && (
                                <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded border text-xs text-gray-500">
                                  +{campaign.images.length - 4}
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-sm border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Images
                      </p>
                      <p className="text-3xl font-bold text-gray-900">
                        {images.length}
                      </p>
                    </div>
                    <ImageIcon className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Approved Images
                      </p>
                      <p className="text-3xl font-bold text-green-600">
                        {approvedImages.length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Rejected Images
                      </p>
                      <p className="text-3xl font-bold text-red-600">
                        {rejectedImages.length}
                      </p>
                    </div>
                    <XCircle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Campaigns
                      </p>
                      <p className="text-3xl font-bold text-purple-600">
                        {campaigns.length}
                      </p>
                    </div>
                    <FolderOpen className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* <div className="grid md:grid-cols-2 gap-6">
              <Card className="shadow-sm border">
                <CardHeader>
                  <CardTitle>Stream Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Display Mode
                    </span>
                    <Badge variant="outline" className="capitalize">
                      {stream.displaySettings.mode}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Auto Play
                    </span>
                    <Badge
                      variant={
                        stream.displaySettings.autoPlay
                          ? "default"
                          : "secondary"
                      }
                    >
                      {stream.displaySettings.autoPlay ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Slide Interval
                    </span>
                    <span className="text-sm font-medium">
                      {stream.displaySettings.slideInterval}s
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Show Metadata
                    </span>
                    <Badge
                      variant={
                        stream.displaySettings.showMetadata
                          ? "default"
                          : "secondary"
                      }
                    >
                      {stream.displaySettings.showMetadata ? "Yes" : "No"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border">
                <CardHeader>
                  <CardTitle>Campaign Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex justify-between items-center"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {campaign.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {campaign.images.length} images
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          {campaign.images.filter((img) => img.approved).length}{" "}
                          approved
                        </Badge>
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          {
                            campaign.images.filter((img) => !img.approved)
                              .length
                          }{" "}
                          rejected
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div> */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StreamDetail;
