"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "./ui/label";

interface Image {
  id: string;
  streamId?: string | null;
  img: string;
  name: string;
  date: string;
  approved: boolean;
}

export default function ModerationQueue() {
  const [data, setData] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [filter, setFilter] = useState("all");
  const [streamFilter, setStreamFilter] = useState("all");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/images");
      const images = await response.json();
      setData(images);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleModerate = async (ids: string[], approved: boolean) => {
    try {
      await Promise.all(
        ids.map((id) =>
          fetch("/api/images/moderate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id, approved }),
          })
        )
      );
      fetchData(); // Refresh the data after moderation
      setSelected([]);
    } catch (error) {
      console.error("Error moderating images:", error);
    }
  };

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selected.length === filteredData.length) {
      setSelected([]);
    } else {
      setSelected(filteredData.map((item) => item.id));
    }
  };

  const filteredData = data?.filter((item) => {
    if (filter === "all") return true;
    if (filter === "approved") return item.approved;
    if (filter === "pending") return !item.approved;
    return true;
  });

  const streamFilteredData = () =>
    data?.filter((item) => {
      if (streamFilter === "all") return true;
      if (streamFilter === "assigned") return item.streamId !== null;
      if (streamFilter === "unassigned") return item.streamId === null;
      return true;
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto py-5">
        <div className="p-4">
          <h1 className="text-3xl font-bold text-center mb-2">
            Moderation Queue
          </h1>
          <p className="text-sm text-gray-500 text-center">
            Approve or reject images.
          </p>
        </div>
        <div className="px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => handleModerate(selected, true)}
                disabled={selected.length === 0}
              >
                Approve Selected
              </Button>
              <Button
                onClick={() => handleModerate(selected, false)}
                disabled={selected.length === 0}
                variant="destructive"
              >
                Reject Selected
              </Button>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row gap-2 ">
              {/* Filter by Status */}
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="status-filter"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Status
                </Label>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger id="status-filter">
                    <SelectValue placeholder="All Images" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Images</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="pending">Pending Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter by Stream */}
              <div className="flex-1 space-y-1">
                <Label
                  htmlFor="stream-filter"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Assignment
                </Label>
                <Select
                  value={streamFilter}
                  onValueChange={setStreamFilter}
                  onOpenChange={() => streamFilteredData()}
                >
                  <SelectTrigger id="stream-filter">
                    <SelectValue placeholder="All Streams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Images</SelectItem>
                    <SelectItem value="assigned">In Streams</SelectItem>
                    <SelectItem value="unassigned">Not Assigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Optional: Reset Button */}
              <div className="flex-shrink-0 self-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilter("all");
                    setStreamFilter("all");
                  }}
                  className="text-xs h-9 px-3 text-gray-600 dark:text-gray-300"
                >
                  Reset Filters
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={
                      selected.length === filteredData.length &&
                      filteredData.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selected.includes(item.id)}
                        onCheckedChange={() => handleSelect(item.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Image
                        src={item.img}
                        alt={item.name}
                        width={100}
                        height={100}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell>
                      {item.approved ? "Approved" : "Pending"}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleModerate([item.id], true)}
                        disabled={item.approved}
                        size="sm"
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleModerate([item.id], false)}
                        disabled={!item.approved}
                        variant="destructive"
                        className="ml-2"
                        size="sm"
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No Data found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
}
