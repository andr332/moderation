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
