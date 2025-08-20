"use client";

import React, { useState } from "react";
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

// --- Fake Data ---
const campaigns = [
  { id: "cmp_001", name: "Summer Sale" },
  { id: "cmp_002", name: "Winter Deals" },
  { id: "cmp_003", name: "Holiday Specials" },
];

interface Stream {
  id: string;
  name: string;
  campaigns: string[];
  logoUrl?: string;
}

// Initial fake streams
const initialStreams: Stream[] = [
  {
    id: "str_101",
    name: "Summer Campaign Gallery",
    campaigns: ["cmp_001"],
    logoUrl: "https://picsum.photos/id/23/2500/1667",
  },
  {
    id: "str_102",
    name: "Winter Promo Wall",
    campaigns: ["cmp_002"],
    logoUrl: "https://picsum.photos/id/33/2500/1667",
  },
  {
    id: "str_103",
    name: "Holiday Customer Stories",
    campaigns: ["cmp_003"],
    logoUrl: "https://picsum.photos/id/11/2500/1667",
  },
];

// --- Main Component ---
const Streams = () => {
  const [streams, setStreams] = useState<Stream[]>(initialStreams);
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

  // Create new stream
  const handleCreateStream = () => {
    if (!newName.trim()) {
      toast.error("Please enter a stream name");
      return;
    }

    const newStreamId = `str_${Date.now()}`;
    const newStream: Stream = {
      id: newStreamId,
      name: newName.trim(),
      campaigns: [...selectedCampaigns],
      logoUrl: logoFile ? URL.createObjectURL(logoFile) : undefined,
    };

    setStreams((prev) => [...prev, newStream]);
    setNewName("");
    setSelectedCampaigns([]);
    setLogoFile(null);
    setQrStream(newStream);
    setIsOpen(false);
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
              <CardHeader>
                <CardTitle>{stream.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  Campaigns:{" "}
                  {stream.campaigns.length > 0
                    ? stream.campaigns
                        .map((id) => campaigns.find((c) => c.id === id)?.name)
                        .join(", ")
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
                    Copy Script
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
                value={`https://yourapp.com/stream/${qrStream.id}`}
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

      {/* Config Dialog for Embed Script */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Generate Embed Script</DialogTitle>
            <DialogDescription>
              Select display mode and color for this stream.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
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

            <div>
              <Label>Pick Color</Label>
              <Input
                type="color"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-16 h-10 p-0"
              />
            </div>

            <Button onClick={handleGenerateScript}>Generate Script</Button>

            {generatedScript && (
              <div className="space-y-2">
                <Label htmlFor="embed-code">Embed Code</Label>
                <Textarea
                  id="embed-code"
                  value={generatedScript}
                  readOnly
                  rows={6}
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
