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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RefreshCw } from "lucide-react";
import { Campaign } from "@/lib/types";

interface CreateEditStreamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isEditMode: boolean;
  newName: string;
  setNewName: (name: string) => void;
  selectedCampaigns: string[];
  toggleCampaign: (id: string) => void;
  campaigns: Campaign[];
  logoFile: File | null;
  setLogoFile: (file: File | null) => void;
  displayMode: "grid" | "slideshow";
  setDisplayMode: (mode: "grid" | "slideshow") => void;
  color: string;
  setColor: (color: string) => void;
  showLogo: boolean;
  setShowLogo: (show: boolean) => void;
  onSubmit: () => void;
  loading: boolean;
}

const CreateEditStreamDialog = ({
  isOpen,
  onClose,
  isEditMode,
  newName,
  setNewName,
  selectedCampaigns,
  toggleCampaign,
  campaigns,
  setLogoFile,
  displayMode,
  setDisplayMode,
  color,
  setColor,
  showLogo,
  setShowLogo,
  onSubmit,
  loading,
}: CreateEditStreamDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Stream" : "Create New Stream"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update stream settings, campaigns, and widget configuration."
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

          {/* Widget Configuration Section */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium">Widget Configuration</h3>

            <div className="space-y-2">
              <Label htmlFor="display-mode">Display Mode</Label>
              <Select
                value={displayMode}
                onValueChange={(value: "grid" | "slideshow") =>
                  setDisplayMode(value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select display mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="slideshow">Slideshow</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Primary Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-logo"
                  checked={showLogo}
                  onCheckedChange={(checked) => setShowLogo(checked as boolean)}
                />
                <Label htmlFor="show-logo" className="text-sm font-normal">
                  Show logo in widget header
                </Label>
              </div>
            </div>
          </div>

          <Button onClick={onSubmit} className="w-full" disabled={loading}>
            {loading ? (
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                {isEditMode ? "Updating..." : "Creating..."}
              </div>
            ) : isEditMode ? (
              "Update Stream"
            ) : (
              "Create Stream"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEditStreamDialog;
