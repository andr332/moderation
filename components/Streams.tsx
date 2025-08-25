"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Image as ImageIcon, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import StreamCard from "@/components/StreamCard";
import CreateEditStreamDialog from "@/components/CreateEditStreamDialog";
import EmbedConfigDialog from "@/components/EmbedConfigDialog";
import { Stream, Campaign } from "@/lib/types";

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
  const [loading, setLoading] = useState({
    initial: !initialStreams.length,
    createStream: false,
    updateStream: false,
    deleteStream: false,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Config dialog
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [displayMode, setDisplayMode] = useState<"grid" | "slideshow">("grid");
  const [selectedColor, setSelectedColor] = useState("#3B82F6");
  const [generatedScript, setGeneratedScript] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [generatedQR, setGeneratedQR] = useState("");
  const [showLogo, setShowLogo] = useState(true);

  const router = useRouter();

  const fetchData = async () => {
    setLoading({ ...loading, initial: true });
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
      setLoading({ ...loading, initial: false });
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

    setLoading({ ...loading, createStream: true });
    try {
      const formData = new FormData();
      formData.append("name", newName.trim());
      formData.append("campaignIds", JSON.stringify(selectedCampaigns));

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await fetch("/api/streams", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStreams((prevStreams) => [result.data, ...prevStreams]);
          toast.success("Stream created successfully!");
          setIsOpen(false);
          resetForm();
          router.refresh();
        }
      } else {
        toast.error("Failed to create stream");
      }
    } catch (error) {
      console.error("Error creating stream:", error);
      toast.error("Error creating stream");
    } finally {
      setLoading({ ...loading, createStream: false });
    }
  };

  const handleUpdateStream = async () => {
    if (!editingStreamId || !newName.trim()) {
      toast.error("Please enter a stream name");
      return;
    }

    setLoading({ ...loading, updateStream: true });
    try {
      const formData = new FormData();
      formData.append("name", newName.trim());
      formData.append("campaignIds", JSON.stringify(selectedCampaigns));

      if (logoFile) {
        formData.append("logo", logoFile);
      }

      const response = await fetch(`/api/streams/${editingStreamId}`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setStreams((prevStreams) =>
            prevStreams.map((stream) =>
              stream.id === editingStreamId ? result.data : stream
            )
          );
          toast.success("Stream updated successfully!");
          setIsOpen(false);
          resetForm();
          router.refresh();
        }
      } else {
        toast.error("Failed to update stream");
      }
    } catch (error) {
      console.error("Error updating stream:", error);
      toast.error("Error updating stream");
    } finally {
      setLoading({ ...loading, updateStream: false });
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
          setStreams((prevStreams) =>
            prevStreams.filter((stream) => stream.id !== streamId)
          );
          toast.success("Stream deleted successfully!");
          router.refresh();
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
    setDisplayMode("grid");
    setSelectedColor("#3B82F6");
    setShowLogo(true);
    setGeneratedScript("");
    setGeneratedUrl("");
    setGeneratedQR("");
    setIsConfigOpen(true);
  };

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL as string;

  const generateEmbedCode = (
    stream: Stream,
    mode: "grid" | "slideshow",
    color: string,
    includeLogo: boolean = true
  ) => {
    const logoUrl = includeLogo && stream.logoUrl ? stream.logoUrl : "";
    const base = BASE_URL.replace(/\/$/, "");
    return `<div
      style={{ height: "100%" }}
      id="gallery-widget"
      data-display-mode="${mode}"
      data-stream-id="${stream.id}"
      data-color="${color}"
      data-logo="${logoUrl}"
      data-base-url="${base}"
    ></div>
    <script src="${base}/widget.js" defer></script>`;
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
      setGeneratedUrl("");
      setGeneratedQR("");
    }
  };

  const handleGeneratePublicUrl = () => {
    if (selectedStream) {
      const logoParam =
        showLogo && selectedStream.logoUrl
          ? `&logo=${encodeURIComponent(selectedStream.logoUrl)}`
          : "";
      const base = BASE_URL.replace(/\/$/, "");
      const url = `${base}/widget?displayMode=${displayMode}&color=${encodeURIComponent(
        selectedColor
      )}&streamId=${selectedStream.id}${logoParam}`;
      setGeneratedUrl(url);
      setGeneratedScript("");
      setGeneratedQR("");
    }
  };

  const handleGenerateQR = () => {
    if (selectedStream) {
      const logoParam =
        showLogo && selectedStream.logoUrl
          ? `&logo=${encodeURIComponent(selectedStream.logoUrl)}`
          : "";
      const base = BASE_URL.replace(/\/$/, "");
      const url = `${base}/widget?displayMode=${displayMode}&color=${encodeURIComponent(
        selectedColor
      )}&streamId=${selectedStream.id}${logoParam}`;
      setGeneratedQR(url);
      setGeneratedScript("");
      setGeneratedUrl("");
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  if (loading.initial) {
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
            <StreamCard
              key={stream.id}
              stream={stream}
              onEdit={handleEditStream}
              onDelete={handleDeleteStream}
              onEmbed={openConfigDialog}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Stream Dialog */}
      <CreateEditStreamDialog
        isOpen={isOpen}
        onClose={() => {
          if (!isOpen) {
            resetForm();
          }
          setIsOpen(false);
        }}
        isEditMode={isEditMode}
        newName={newName}
        setNewName={setNewName}
        selectedCampaigns={selectedCampaigns}
        toggleCampaign={toggleCampaign}
        campaigns={campaigns}
        logoFile={logoFile}
        setLogoFile={setLogoFile}
        onSubmit={isEditMode ? handleUpdateStream : handleCreateStream}
        loading={loading.createStream || loading.updateStream}
      />

      {/* Embed Config Dialog */}
      <EmbedConfigDialog
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        selectedStream={selectedStream}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        selectedColor={selectedColor}
        setSelectedColor={setSelectedColor}
        showLogo={showLogo}
        setShowLogo={setShowLogo}
        generatedScript={generatedScript}
        generatedUrl={generatedUrl}
        generatedQR={generatedQR}
        onGenerateScript={handleGenerateScript}
        onGeneratePublicUrl={handleGeneratePublicUrl}
        onGenerateQR={handleGenerateQR}
        onCopyToClipboard={copyToClipboard}
      />
    </div>
  );
};

export default Streams;
