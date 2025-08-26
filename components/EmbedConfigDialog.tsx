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
import { Textarea } from "@/components/ui/textarea";
import { Copy } from "lucide-react";
import QRCode from "react-qr-code";
import Image from "next/image";
import { Stream } from "@/lib/types";

interface EmbedConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStream: Stream | null;
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
          <DialogTitle>Share and Embed</DialogTitle>
          <DialogDescription>
            Generate an embed script, shareable URL, or QR code for your stream.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Stream Info */}
          {selectedStream && (
            <div className="space-y-3 p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {selectedStream.logoUrl &&
                  selectedStream.widgetConfig?.showLogo && (
                    <Image
                      src={selectedStream.logoUrl}
                      alt="Stream Logo"
                      width={40}
                      height={40}
                      className="rounded object-cover"
                    />
                  )}
                <div>
                  <h3 className="font-medium">{selectedStream.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedStream.widgetConfig?.displayMode === "slideshow"
                      ? "Slideshow"
                      : "Grid"}{" "}
                    view •
                    {selectedStream.widgetConfig?.showLogo
                      ? " Logo visible"
                      : " No logo"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Generate Options */}
          <div className="flex gap-3">
            <Button onClick={onGenerateScript} className="flex-1">
              Get Embed Script
            </Button>
            <Button onClick={onGeneratePublicUrl} className="flex-1">
              Get Shareable URL
            </Button>
            <Button onClick={onGenerateQR} className="flex-1">
              Get QR Code
            </Button>
          </div>

          {/* Script */}
          {generatedScript && (
            <div className="space-y-2">
              <Label htmlFor="embed-code">Embed script</Label>
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
                Copy script
              </Button>
            </div>
          )}

          {/* URL */}
          {generatedUrl && (
            <div className="space-y-2">
              <Label htmlFor="public-url">Shareable URL</Label>
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

          {/* QR */}
          {generatedQR && (
            <div className="space-y-2">
              <Label>QR code</Label>
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
