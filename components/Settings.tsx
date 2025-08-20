"use client";

import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

const Settings = () => {
  const [settings, setSettings] = useState({
    autoApprove: false,
    displayMode: "grid",
    photosPerPage: 20,
    showCaptions: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save settings.");
    }
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="flex flex-1 justify-center py-5">
      <div className="flex flex-col w-full max-w-7xl py-5">
        <div className="flex flex-wrap justify-between gap-3 p-4">
          <div className="flex min-w-72 flex-col gap-3">
            <p className="text-[32px] font-bold leading-tight">
              Gallery Settings
            </p>
            <p className="text-[#60758a] text-sm">
              Configure your gallery&apos;s moderation and display settings.
            </p>
          </div>
        </div>
        <h3 className="text-lg font-bold px-4 pb-2 pt-4">Moderation</h3>
        <SettingItem
          title="Enable Auto-Approval"
          description="Automatically approve new photos, but allow manual revocation."
        >
          <Switch
            checked={settings.autoApprove}
            onCheckedChange={(checked) =>
              handleSettingChange("autoApprove", checked)
            }
          />
        </SettingItem>

        {/* Save Button */}
        <div className="flex px-4 py-3 justify-end">
          <Button
            onClick={handleSave}
            className="bg-[#0d80f2] text-white font-bold"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;

// Helper funtion
function SettingItem({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 bg-white px-4 min-h-[72px] py-2 justify-between">
      <div className="flex flex-col justify-center">
        <p className="text-base font-medium">{title}</p>
        <p className="text-[#60758a] text-sm">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}
