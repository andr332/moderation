"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Copy } from "lucide-react";
import QRCode from "react-qr-code";
import Image from "next/image";
import { Stream } from "@/lib/types";

interface EmbedConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStream: Stream | null;
  displayMode: "grid" | "slideshow";
  setDisplayMode: (mode: "grid" | "slideshow") => void;
  selectedColor: string;
  setSelectedColor: (color: string) => void;
  showLogo: boolean;
  setShowLogo: (show: boolean) => void;
  generatedScript: string;
  generatedUrl: string;
  generatedQR: string;
  onGenerateScript: () => void;
  onGeneratePublicUrl: () => void;
  onGenerateQR: () => void;
  onCopyToClipboard: (text: string) => void;
}

const EmbedConfigDialog = ({
  isOpen,
  onClose,
  selectedStream,
  displayMode,
  setDisplayMode,
  selectedColor,
  setSelectedColor,
  showLogo,
  setShowLogo,
  generatedScript,
  generatedUrl,
  generatedQR,
  onGenerateScript,
  onGeneratePublicUrl,
  onGenerateQR,
  onCopyToClipboard,
}: EmbedConfigDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Configure and Generate Embed Options</DialogTitle>
          <DialogDescription>
            Select display mode, color, and logo options, then generate your
            preferred output.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Display Mode Selection */}
          <div className="space-y-3">
            <Label>Display Mode</Label>
            <RadioGroup
              value={displayMode}
              onValueChange={(val) => setDisplayMode(val as "grid" | "slideshow")}
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

          {/* Color Selection */}
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
                  <span className="text-xs text-muted-foreground">No logo</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  Logo will be hidden in the widget
                </span>
              </div>
            )}
            {!selectedStream?.logoUrl && (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <div className="w-8 h-8 bg-muted-foreground/20 rounded flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">No logo</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  No logo uploaded for this stream
                </span>
              </div>
            )}
          </div>

          {/* Generate Buttons */}
          <div className="flex gap-3">
            <Button onClick={onGenerateScript} className="flex-1">
              Generate Script
            </Button>
            <Button onClick={onGeneratePublicUrl} className="flex-1">
              Generate Public URL
            </Button>
            <Button onClick={onGenerateQR} className="flex-1">
              Generate QR Code
            </Button>
          </div>

          {/* Script Output */}
          {generatedScript && (
            <div className="space-y-2">
              <Label htmlFor="embed-code">Embed Script</Label>
              <Textarea
                id="embed-code"
                value={generatedScript}
                readOnly
                rows={6}
                className="font-mono text-xs break-all w-full"
              />
              <Button
                onClick={() => onCopyToClipboard(generatedScript)}
                className="w-full gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Script
              </Button>
            </div>
          )}

          {/* Public URL Output */}
          {generatedUrl && (
            <div className="space-y-2">
              <Label htmlFor="public-url">Public URL</Label>
              <Textarea
                id="public-url"
                value={generatedUrl}
                readOnly
                rows={2}
                className="font-mono text-xs break-all w-full"
              />
              <Button
                onClick={() => onCopyToClipboard(generatedUrl)}
                className="w-full gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy URL
              </Button>
            </div>
          )}

          {/* QR Code Output */}
          {generatedQR && (
            <div className="space-y-2">
              <Label>QR Code</Label>
              <div className="flex flex-col items-center gap-3 p-4 bg-muted rounded-lg">
                <QRCode value={generatedQR} size={180} />
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmbedConfigDialog;