"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  QrCode,
  Edit,
  Trash2,
  Plus,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

interface Campaign {
  id: string;
  name: string;
  description?: string;
}

interface Stream {
  id: string;
  name: string;
  campaigns: Campaign[];
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface StreamsProps {
  initialStreams?: Stream[];
  initialCampaigns?: Campaign[];
}

const Streams = ({
  initialStreams = [],
  initialCampaigns = [],
}: StreamsProps) => {
  const [streams, setStreams] = useState<Stream[]>(initialStreams);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [loading, setLoading] = useState(!initialStreams.length);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [qrStream, setQrStream] = useState<Stream | null>(null);

  // Config dialog
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [displayMode, setDisplayMode] = useState<"grid" | "slideshow">("grid");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [generatedScript, setGeneratedScript] = useState("");
  const [showLogo, setShowLogo] = useState(true);

  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [streamsResponse, campaignsResponse] = await Promise.all([
        fetch("/api/streams"),
        fetch("/api/campaigns"),
      ]);

      if (streamsResponse.ok && campaignsResponse.ok) {
        const streamsData = await streamsResponse.json();
        const campaignsData = await campaignsResponse.json();

        if (streamsData.success && campaignsData.success) {
          setStreams(streamsData.data);
          setCampaigns(campaignsData.data);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialStreams.length) {
      fetchData();
    }
  }, [initialStreams.length]);

  const resetForm = () => {
    setNewName("");
    setSelectedCampaigns([]);
    setLogoFile(null);
    setIsEditMode(false);
    setEditingStreamId(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleEditStream = (streamId: string) => {
    const streamToEdit = streams.find((s) => s.id === streamId);
    if (streamToEdit) {
      setNewName(streamToEdit.name);
      setSelectedCampaigns(streamToEdit.campaigns.map((c) => c.id));
      setLogoFile(null);
      setIsEditMode(true);
      setEditingStreamId(streamId);
      setIsOpen(true);
    }
  };

  const handleCreateStream = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a stream name");
      return;
    }

    if (selectedCampaigns.length === 0) {
      toast.error("Please select at least one campaign");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newName.trim());
      formData.append("campaignIds", JSON.stringify(selectedCampaigns));

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await fetch("/api/streams", {
        method: "POST",
        body: formData, // Send FormData instead of JSON
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Add the new stream to the existing streams array
          setStreams((prevStreams) => [result.data, ...prevStreams]);
          toast.success("Stream created successfully!");
          setIsOpen(false);
          resetForm();
        }
      } else {
        toast.error("Failed to create stream");
      }
    } catch (error) {
      console.error("Error creating stream:", error);
      toast.error("Error creating stream");
    }
  };

  const handleUpdateStream = async () => {
    if (!editingStreamId || !newName.trim()) {
      toast.error("Please enter a stream name");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", newName.trim());
      formData.append("campaignIds", JSON.stringify(selectedCampaigns));

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await fetch(`/api/streams/${editingStreamId}`, {
        method: "PUT",
        body: formData, // Send FormData instead of JSON
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update the stream in the existing streams array
          setStreams((prevStreams) =>
            prevStreams.map((stream) =>
              stream.id === editingStreamId ? result.data : stream
            )
          );
          toast.success("Stream updated successfully!");
          setIsOpen(false);
          resetForm();
        }
      } else {
        toast.error("Failed to update stream");
      }
    } catch (error) {
      console.error("Error updating stream:", error);
      toast.error("Error updating stream");
    }
  };

  const handleDeleteStream = async (streamId: string) => {
    if (!confirm("Are you sure you want to delete this stream?")) {
      return;
    }

    try {
      const response = await fetch(`/api/streams/${streamId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Remove the stream from the existing streams array
          setStreams((prevStreams) =>
            prevStreams.filter((stream) => stream.id !== streamId)
          );
          toast.success("Stream deleted successfully!");
        }
      } else {
        toast.error("Failed to delete stream");
      }
    } catch (error) {
      console.error("Error deleting stream:", error);
      toast.error("Error deleting stream");
    }
  };

  const toggleCampaign = (id: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const openConfigDialog = (stream: Stream) => {
    setSelectedStream(stream);
    setDisplayMode("grid"); // Default mode
    setSelectedColor("#3B82F6"); // Default color
    setShowLogo(true); // Default to showing logo
    setIsConfigOpen(true);
  };

  const generateEmbedCode = (
    stream: Stream,
    mode: "grid" | "slideshow",
    color: string,
    includeLogo: boolean = true
  ) => {
    const logoUrl = includeLogo && stream.logoUrl ? stream.logoUrl : "";
    return `<div
  class="h-full"
  id="gallery-widget"
  data-display-mode="${mode}"
  data-stream-id="${stream.id}"
  data-color="${color}"
  data-logo="${logoUrl}"
></div>
<script src="http://localhost:3001/widget.js" defer></script>`;
  };

  const handleGenerateScript = () => {
    if (selectedStream) {
      const code = generateEmbedCode(
        selectedStream,
        displayMode,
        selectedColor,
        showLogo
      );
      setGeneratedScript(code);
    }
  };

  const copyScript = async () => {
    if (generatedScript) {
      await navigator.clipboard.writeText(generatedScript);
      toast.success("Embed script copied to clipboard!");
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
            Loading streams...
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
          <h1 className="text-3xl font-bold tracking-tight">Streams</h1>
          <p className="text-muted-foreground">
            Manage and configure your content streams
          </p>
        </div>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Stream
        </Button>
      </div>

      {/* Streams Grid */}
      {streams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No streams created yet
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first stream to start organizing and displaying your
              content.
            </p>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Stream
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {streams.map((stream) => (
            <Card
              key={stream.id}
              className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
              onClick={() => router.push(`/streams/${stream.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {stream.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {stream.campaigns.length} campaign
                      {stream.campaigns.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStream(stream.id);
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Edit stream</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStream(stream.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Delete stream</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {stream.logoUrl &&
                  (console.log("stream.logoUrl", stream.logoUrl),
                  (
                    <div className="flex justify-center">
                      <Image
                        src={stream.logoUrl}
                        alt={`${stream.name} logo`}
                        width={120}
                        height={120}
                        className="rounded-xl object-cover border"
                      />
                    </div>
                  ))}

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Campaigns:{" "}
                    {stream.campaigns.length > 0
                      ? stream.campaigns.map((c) => c.name).join(", ")
                      : "None"}
                  </p>
                </div>

                <div className="flex gap-2 pt-2 border-t">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setQrStream(stream);
                          }}
                        >
                          <QrCode className="w-4 h-4" />
                          QR Code
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Generate QR code for this stream</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            openConfigDialog(stream);
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Embed
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Get embed code or public URL</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Stream Dialog */}
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetForm();
          }
          setIsOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? "Edit Stream" : "Create New Stream"}
            </DialogTitle>
            <DialogDescription>
              {isEditMode
                ? "Update stream settings, campaigns, and logo."
                : "Create a new stream to organize and display your content."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stream-name">Stream Name</Label>
              <Input
                id="stream-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter stream name"
              />
            </div>

            <div className="space-y-2">
              <Label>Assign Campaigns</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedCampaigns.length > 0
                      ? `${selectedCampaigns.length} selected`
                      : "Select campaigns"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-60 overflow-y-auto w-[var(--radix-dropdown-menu-trigger-width)]">
                  {campaigns.map((c) => (
                    <DropdownMenuCheckboxItem
                      key={c.id}
                      checked={selectedCampaigns.includes(c.id)}
                      onCheckedChange={() => toggleCampaign(c.id)}
                      onSelect={(e) => e.preventDefault()}
                    >
                      {c.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo-upload">Upload Logo</Label>
              <Input
                id="logo-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setLogoFile(file);
                  }
                }}
              />
            </div>

            <Button
              onClick={isEditMode ? handleUpdateStream : handleCreateStream}
              className="w-full"
            >
              {isEditMode ? "Update Stream" : "Create Stream"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={!!qrStream} onOpenChange={() => setQrStream(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stream QR Code</DialogTitle>
            <DialogDescription>
              Share this QR code to give access to the stream.
            </DialogDescription>
          </DialogHeader>
          {qrStream && (
            <div className="flex flex-col items-center space-y-4 py-4">
              <QRCode
                value={`http://localhost:3001/widget?streamId=${qrStream.id}`}
                size={200}
              />
              <p className="text-sm text-muted-foreground text-center">
                Scan to view stream: <strong>{qrStream.name}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Stream ID: {qrStream.id}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Config Dialog for Embed Script / Public URL */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Embed Script or Public URL</DialogTitle>
            <DialogDescription>
              Select display mode, color, and logo options for this stream.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Display Mode</Label>
              <RadioGroup
                value={displayMode}
                onValueChange={(val) =>
                  setDisplayMode(val as "grid" | "slideshow")
                }
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="grid" id="grid" />
                  <Label htmlFor="grid">Grid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="slideshow" id="slideshow" />
                  <Label htmlFor="slideshow">Slideshow</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Primary Color</Label>
              <Input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-20 h-10 p-1"
              />
            </div>

            {/* Logo Option */}
            <div className="space-y-3">
              <Label>Logo Display</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-logo"
                  checked={showLogo}
                  onCheckedChange={(checked) => setShowLogo(checked as boolean)}
                />
                <Label htmlFor="show-logo" className="text-sm font-normal">
                  Show stream logo in widget header
                </Label>
              </div>
              {selectedStream?.logoUrl && showLogo && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Image
                    src={selectedStream.logoUrl}
                    alt="Stream Logo"
                    width={32}
                    height={32}
                    className="rounded object-cover"
                  />
                  <span className="text-sm text-muted-foreground">
                    Logo will be displayed in the widget header
                  </span>
                </div>
              )}
              {selectedStream?.logoUrl && !showLogo && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-8 h-8 bg-muted-foreground/20 rounded flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      No logo
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Logo will be hidden in the widget
                  </span>
                </div>
              )}
              {!selectedStream?.logoUrl && (
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-8 h-8 bg-muted-foreground/20 rounded flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">
                      No logo
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    No logo uploaded for this stream
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={handleGenerateScript} className="flex-1">
                Generate Script
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (selectedStream) {
                    const logoParam =
                      showLogo && selectedStream.logoUrl
                        ? `&logo=${encodeURIComponent(selectedStream.logoUrl)}`
                        : "";
                    const url = `http://localhost:3001/widget?displayMode=${displayMode}&color=${encodeURIComponent(
                      selectedColor
                    )}&streamId=${selectedStream.id}${logoParam}`;
                    setGeneratedScript(url);
                  }
                }}
              >
                Generate Public URL
              </Button>
            </div>

            {generatedScript && (
              <div className="space-y-2">
                <Label htmlFor="embed-code">
                  {generatedScript.startsWith("<")
                    ? "Embed Code"
                    : "Public URL"}
                </Label>
                <Textarea
                  id="embed-code"
                  value={generatedScript}
                  readOnly
                  rows={generatedScript.startsWith("<") ? 6 : 2}
                  className="font-mono text-xs break-all w-full"
                />
                <Button onClick={copyScript} className="w-full gap-2">
                  <Copy className="w-4 h-4" />
                  Copy to Clipboard
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Streams;
