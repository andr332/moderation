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

  // Create/Edit dialog state
  const [isOpen, setIsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingStreamId, setEditingStreamId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  // Widget configuration state
  const [displayMode, setDisplayMode] = useState<"grid" | "slideshow">("grid");
  const [color, setColor] = useState("#3B82F6");
  const [showLogo, setShowLogo] = useState(true);

  // Embed dialog state
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [generatedScript, setGeneratedScript] = useState("");
  const [generatedUrl, setGeneratedUrl] = useState("");
  const [generatedQR, setGeneratedQR] = useState("");

  const router = useRouter();

  const fetchData = async () => {
    setLoading((s) => ({ ...s, initial: true }));
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
      setLoading((s) => ({ ...s, initial: false }));
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
    setDisplayMode("grid");
    setColor("#3B82F6");
    setShowLogo(true);
  };

  const openCreateDialog = () => {
    setIsEditMode(false);
    setEditingStreamId(null);
    resetForm();
    setIsOpen(true);
  };

  const openEditDialog = (stream: Stream) => {
    console.log("Opening edit dialog for stream:", stream);
    console.log("Stream widgetConfig:", stream.widgetConfig);

    setIsEditMode(true);
    setEditingStreamId(stream.id);
    setNewName(stream.name);
    setSelectedCampaigns(stream.campaigns.map((c) => c.id));
    setLogoFile(null);

    // Set widget configuration from stream
    if (stream.widgetConfig) {
      console.log("Setting widget config:", stream.widgetConfig);
      setDisplayMode(stream.widgetConfig.displayMode);
      setColor(stream.widgetConfig.color);
      setShowLogo(stream.widgetConfig.showLogo);
    } else {
      console.log("No widget config found, using defaults");
      setDisplayMode("grid");
      setColor("#3B82F6");
      setShowLogo(true);
    }

    setIsOpen(true);
  };

  const handleCreateStream = async () => {
    if (!newName.trim()) return;

    setLoading((s) => ({ ...s, createStream: true }));
    try {
      const formData = new FormData();
      formData.append("name", newName);
      formData.append("campaignIds", JSON.stringify(selectedCampaigns));
      formData.append("displayMode", displayMode);
      formData.append("color", color);
      formData.append("showLogo", showLogo.toString());

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
          setStreams((prev) => [result.data, ...prev]);
          setIsOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error creating stream:", error);
    } finally {
      setLoading((s) => ({ ...s, createStream: false }));
    }
  };

  const handleUpdateStream = async () => {
    if (!editingStreamId || !newName.trim()) return;

    setLoading((s) => ({ ...s, updateStream: true }));
    try {
      const formData = new FormData();
      formData.append("name", newName);
      formData.append("campaignIds", JSON.stringify(selectedCampaigns));
      formData.append("displayMode", displayMode);
      formData.append("color", color);
      formData.append("showLogo", showLogo.toString());

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
          setStreams((prev) =>
            prev.map((stream) =>
              stream.id === editingStreamId ? result.data : stream
            )
          );
          setIsOpen(false);
          resetForm();
        }
      }
    } catch (error) {
      console.error("Error updating stream:", error);
    } finally {
      setLoading((s) => ({ ...s, updateStream: false }));
    }
  };

  const handleDeleteStream = async (streamId: string) => {
    if (!confirm("Delete this stream?")) return;
    try {
      const resp = await fetch(`/api/streams/${streamId}`, {
        method: "DELETE",
      });
      if (resp.ok) {
        const result = await resp.json();
        if (result.success) {
          setStreams((prev) => prev.filter((s) => s.id !== streamId));
          toast.success("Stream deleted");
          router.refresh();
        }
      } else {
        toast.error("Failed to delete stream");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error deleting stream");
    }
  };

  const openConfigDialog = (stream: Stream) => {
    setSelectedStream(stream);
    setGeneratedScript("");
    setGeneratedUrl("");
    setGeneratedQR("");
    setIsConfigOpen(true);
  };

  const BASE_URL = process.env.NEXT_PUBLIC_APP_URL as string;

  const generateEmbedCode = (stream: Stream) => {
    const base = BASE_URL.replace(/\/$/, "");
    return `<div
  style={{ height: "100%" }}
  id="gallery-widget"
  data-stream-id="${stream.id}"
  data-base-url="${base}"
></div>
<script src="${base}/widget.js" defer></script>`;
  };

  const handleGenerateScript = () => {
    if (!selectedStream) return;
    setGeneratedScript(generateEmbedCode(selectedStream));
    setGeneratedUrl("");
    setGeneratedQR("");
  };

  const handleGeneratePublicUrl = () => {
    if (!selectedStream) return;
    const base = BASE_URL.replace(/\/$/, "");
    const url = `${base}/widget?streamId=${selectedStream.id}`;
    setGeneratedUrl(url);
    setGeneratedScript("");
    setGeneratedQR("");
  };

  const handleGenerateQR = () => {
    if (!selectedStream) return;
    const base = BASE_URL.replace(/\/$/, "");
    const url = `${base}/widget?streamId=${selectedStream.id}`;
    setGeneratedQR(url);
    setGeneratedScript("");
    setGeneratedUrl("");
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
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
      {/* Header - minimal */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Streams</h1>
        <Button onClick={openCreateDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          New Stream
        </Button>
      </div>

      {/* Grid */}
      {streams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <ImageIcon className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No streams yet.
            </p>
            <Button onClick={openCreateDialog} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Stream
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {streams.map((stream) => (
            <StreamCard
              key={stream.id}
              stream={stream}
              onEdit={() => openEditDialog(stream)}
              onDelete={handleDeleteStream}
              onEmbed={openConfigDialog}
            />
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <CreateEditStreamDialog
        isOpen={isOpen}
        onClose={() => {
          if (!isOpen) resetForm();
          setIsOpen(false);
        }}
        isEditMode={isEditMode}
        newName={newName}
        setNewName={setNewName}
        selectedCampaigns={selectedCampaigns}
        toggleCampaign={(id) =>
          setSelectedCampaigns((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
          )
        }
        campaigns={campaigns}
        logoFile={logoFile}
        setLogoFile={setLogoFile}
        displayMode={displayMode}
        setDisplayMode={setDisplayMode}
        color={color}
        setColor={setColor}
        showLogo={showLogo}
        setShowLogo={setShowLogo}
        onSubmit={isEditMode ? handleUpdateStream : handleCreateStream}
        loading={loading.createStream || loading.updateStream}
      />

      {/* Embed Dialog */}
      <EmbedConfigDialog
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        selectedStream={selectedStream}
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
