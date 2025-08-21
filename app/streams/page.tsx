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
import { Copy, QrCode } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  isActive: boolean;
  displaySettings: {
    mode: "grid" | "slideshow";
    autoPlay: boolean;
    slideInterval: number;
    showMetadata: boolean;
    theme: {
      primaryColor: string;
      backgroundColor: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

const Streams = () => {
  const [streams, setStreams] = useState<Stream[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [qrStream, setQrStream] = useState<Stream | null>(null);

  // Config dialog
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [displayMode, setDisplayMode] = useState<"grid" | "slideshow">("grid");
  const [selectedColor, setSelectedColor] = useState("#ff0000");
  const [generatedScript, setGeneratedScript] = useState("");

  const router = useRouter();

  // Fetch data from MongoDB
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
    fetchData();
  }, []);

  // Create new stream
  const handleCreateStream = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a stream name");
      return;
    }

    try {
      const response = await fetch("/api/streams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          campaignIds: selectedCampaigns,
          logoUrl: logoFile ? URL.createObjectURL(logoFile) : undefined,
          displaySettings: {
            mode: "grid",
            autoPlay: false,
            slideInterval: 5,
            showMetadata: true,
            theme: {
              primaryColor: "#3B82F6",
              backgroundColor: "#F8FAFC",
            },
          },
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          toast.success("Stream created successfully!");
          setNewName("");
          setSelectedCampaigns([]);
          setLogoFile(null);
          setIsOpen(false);
          fetchData(); // Refresh the list
        }
      } else {
        toast.error("Failed to create stream");
      }
    } catch (error) {
      console.error("Error creating stream:", error);
      toast.error("Error creating stream");
    }
  };

  const handleEditStream = (streamId: string) => {
    const streamToEdit = streams.find((s) => s.id === streamId);
    if (streamToEdit) {
      setNewName(streamToEdit.name);
      setSelectedCampaigns(streamToEdit.campaigns.map((c) => c.id));
      setLogoFile(null);
      setIsOpen(true);
    }
  };

  const toggleCampaign = (id: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  // Open embed config dialog
  const openConfigDialog = (stream: Stream) => {
    setSelectedStream(stream);
    setDisplayMode("grid");
    setSelectedColor("#ff0000");
    setGeneratedScript("");
    setIsConfigOpen(true);
  };

  const generateEmbedCode = (
    stream: Stream,
    mode: "grid" | "slideshow",
    color: string
  ) => {
    return `<div
  class="h-full"
  id="gallery-widget"
  data-display-mode="${mode}"
  data-stream-id="${stream.id}"
  data-color="${color}"
  data-logo="${stream.logoUrl || ""}"
></div>
<script src="http://localhost:3001/widget.js" defer></script>`;
  };

  const handleGenerateScript = () => {
    if (selectedStream) {
      const code = generateEmbedCode(
        selectedStream,
        displayMode,
        selectedColor
      );
      setGeneratedScript(code);
    }
  };

  const copyScript = async () => {
    if (generatedScript) {
      await navigator.clipboard.writeText(generatedScript);
      toast.success("Embed script copied!");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-slate-600">
            Loading streams...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Streams</h1>
        <Button onClick={() => setIsOpen(true)}>+ Create Stream</Button>
      </div>

      {/* Streams List */}
      {streams.length === 0 ? (
        <p className="text-muted-foreground">No streams created yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {streams.map((stream) => (
            <Card
              key={stream.id}
              onClick={() => router.push(`/streams/${stream.id}`)}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardHeader className="flex items-center justify-between">
                <CardTitle>{stream.name}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditStream(stream.id);
                  }}
                >
                  Edit
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Campaigns:{" "}
                  {stream.campaigns.length > 0
                    ? stream.campaigns.map((c) => c.name).join(", ")
                    : "None"}
                </p>
                {stream.logoUrl && (
                  <Image
                    src={stream.logoUrl}
                    alt={`${stream.name} logo`}
                    width={150}
                    height={150}
                    className="rounded object-cover border"
                  />
                )}
                <div
                  className="flex gap-2 mt-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrStream(stream);
                    }}
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    QR Code
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      openConfigDialog(stream);
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Script or Public Url
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Stream Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Stream</DialogTitle>
            <DialogDescription>
              Assign campaigns, upload logo, and generate a QR code.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Stream Name</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Enter stream name"
              />
            </div>

            <div>
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

            <div>
              <Label>Upload Logo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setLogoFile(e.target.files ? e.target.files[0] : null)
                }
              />
            </div>

            <Button onClick={handleCreateStream}>Create Stream</Button>
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
              <p className="text-sm text-muted-foreground">
                Scan to view stream: <strong>{qrStream.name}</strong>
              </p>
              <p className="text-xs text-gray-500">Stream ID: {qrStream.id}</p>
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
              Select display mode and color for this stream.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Display Mode Selector */}
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

            {/* Color Picker */}
            <div>
              <Label>Pick Color</Label>
              <Input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-16 h-10 p-0"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleGenerateScript} className="flex-1">
                Generate Script
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  if (selectedStream) {
                    const url = `http://localhost:3001/widget?displayMode=${displayMode}&color=${encodeURIComponent(
                      selectedColor
                    )}&streamId=${selectedStream.id}`;
                    setGeneratedScript(url);
                  }
                }}
              >
                Generate Public URL
              </Button>
            </div>

            {/* Output Section */}
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
                  className="font-mono text-xs"
                />
                <Button
                  onClick={copyScript}
                  className="mt-2 flex gap-2 w-full justify-center"
                >
                  <Copy className="w-4 h-4" /> Copy to Clipboard
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
