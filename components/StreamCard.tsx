"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Edit, Trash2, ExternalLink } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Stream } from "@/lib/types";

interface StreamCardProps {
  stream: Stream;
  onEdit: (streamId: string) => void;
  onDelete: (streamId: string) => void;
  onEmbed: (stream: Stream) => void;
}

const StreamCard = ({ stream, onEdit, onDelete, onEmbed }: StreamCardProps) => {
  const router = useRouter();

  return (
    <Card
      className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
      onClick={() => router.push(`/streams/${stream.id}`)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{stream.name}</CardTitle>
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
                      onEdit(stream.id);
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
                      onDelete(stream.id);
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
      </CardHeader>{" "}
      p
      <CardContent className="space-y-4">
        {stream.logoUrl && (
          <div className="flex justify-center">
            <Image
              src={stream.logoUrl}
              alt={`${stream.name} logo`}
              width={120}
              height={100}
              className="rounded-xl object-cover border"
            />
          </div>
        )}

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
                    onEmbed(stream);
                  }}
                >
                  <ExternalLink className="w-4 h-4" />
                  Embed
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Configure and generate embed options</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};

export default StreamCard;
