
"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Layers,
  Send,
} from "lucide-react";
import { toast } from "sonner";

type Platform = "twitter" | "linkedin" | "facebook" | "instagram";

type PlatformResult = {
  platform: Platform;
  status: "success" | "failed";
  error?: string;
};

const platforms: Platform[] = [
  "twitter",
  "linkedin",
  "facebook",
  "instagram",
];

const platformIcons = {
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  instagram: Instagram,
};

export default function ComposePage() {
  const [content, setContent] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([
    "twitter",
    "linkedin",
  ]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [resultsState, setResultsState] = useState<PlatformResult[]>([]);

  // Toggle platform selection
  const togglePlatform = (platform: Platform) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((item) => item !== platform)
        : [...prev, platform]
    );
  };

  // Publish to an individual platform
  const publishToPlatform = async (
    platform: Platform
  ): Promise<PlatformResult> => {
    try {
      const response = await fetch(
        `/api/v1/publishing/${platform}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      const data: { message?: string } = await response
        .json()
        .catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.message || `Failed to publish to ${platform}`
        );
      }

      return {
        platform,
        status: "success",
      };
    } catch (error: unknown) {
      return {
        platform,
        status: "failed",
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      };
    }
  };

  // Shared publishing validation
  const validateContent = () => {
    if (!content.trim()) {
      toast.error("Please enter some content to publish.");
      return false;
    }

    return true;
  };

  // Batch publishing
  const handleBatchPublish = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform.");
      return;
    }

    if (!validateContent()) return;

    setIsPublishing(true);
    setResultsState([]);

    try {
      const results = await Promise.all(
        selectedPlatforms.map((platform) =>
          publishToPlatform(platform)
        )
      );

      setResultsState(results);

      const succeeded = results.filter(
        (result) => result.status === "success"
      );

      const failed = results.filter(
        (result) => result.status === "failed"
      );

      if (failed.length === 0) {
        toast.success(
          `Successfully published to all ${succeeded.length} platforms!`
        );
      } else if (succeeded.length > 0) {
        toast.warning(
          `Partial success: Published to ${succeeded.length}, failed on ${failed.length}.`
        );
      } else {
        toast.error("Failed to publish to all selected platforms.");
      }
    } catch {
      toast.error("An unexpected publishing error occurred.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Individual platform publishing
  const handleSinglePublish = async (platform: Platform) => {
    if (!validateContent()) return;

    setIsPublishing(true);
    setResultsState([]);

    try {
      const result = await publishToPlatform(platform);

      setResultsState([result]);

      if (result.status === "success") {
        toast.success(
          `Successfully published to ${platform}!`
        );
      } else {
        toast.error(result.error || `Failed to publish to ${platform}`);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Multi-Platform Composer"
        description="Craft, preview, and dispatch tailored posts directly or cross-post to multiple channels at once."
      />

      <Card className="max-w-3xl border border-border shadow-md">
        <CardContent className="p-6">
          <Tabs defaultValue="batch">
            <TabsList className="grid w-full grid-cols-5 gap-1 rounded-xl bg-paper/80 p-1">
              <TabsTrigger
                value="batch"
                className="flex items-center gap-1.5 font-semibold"
              >
                <Layers size={15} />
                Batch
              </TabsTrigger>

              {platforms.map((platform) => {
                const Icon = platformIcons[platform];

                return (
                  <TabsTrigger
                    key={platform}
                    value={platform}
                    className="flex items-center gap-1.5 font-medium"
                  >
                    <Icon size={15} />
                    {platform === "linkedin"
                      ? "LinkedIn"
                      : platform.charAt(0).toUpperCase() +
                        platform.slice(1)}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {/* BATCH PUBLISHING */}
            <TabsContent
              value="batch"
              className="mt-4 space-y-4"
            >
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Post Content
                </label>

                <textarea
                  className="h-32 w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="What would you like to share across your networks?"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={isPublishing}
                />

                <p className="mt-1 text-xs text-muted-foreground">
                  {content.length} characters
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Select Target Platforms
                </label>

                <div className="flex flex-wrap gap-3">
                  {platforms.map((platform) => {
                    const Icon = platformIcons[platform];
                    const isSelected =
                      selectedPlatforms.includes(platform);

                    return (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => togglePlatform(platform)}
                        disabled={isPublishing}
                        aria-pressed={isSelected}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm capitalize transition-colors disabled:opacity-50 ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        <Icon size={15} />
                        {platform}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                onClick={handleBatchPublish}
                disabled={isPublishing}
                className="mt-4 flex w-full items-center justify-center gap-2"
              >
                <Send size={16} />

                {isPublishing
                  ? "Publishing to Networks..."
                  : "Publish to Selected Platforms"}
              </Button>
            </TabsContent>

            {/* INDIVIDUAL PLATFORM TABS */}
            {platforms.map((platform) => {
              const Icon = platformIcons[platform];

              return (
                <TabsContent
                  key={platform}
                  value={platform}
                  className="mt-4 space-y-4"
                >
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Post Content
                    </label>

                    <textarea
                      className="h-32 w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={`Write your ${platform} post...`}
                      value={content}
                      onChange={(e) =>
                        setContent(e.target.value)
                      }
                      disabled={isPublishing}
                    />

                    <p className="mt-1 text-xs text-muted-foreground">
                      {content.length} characters
                    </p>
                  </div>

                  <Button
                    onClick={() =>
                      handleSinglePublish(platform)
                    }
                    disabled={isPublishing}
                    className="flex w-full items-center justify-center gap-2"
                  >
                    <Icon size={16} />

                    {isPublishing
                      ? "Publishing..."
                      : `Publish to ${platform}`}
                  </Button>
                </TabsContent>
              );
            })}

            {/* PUBLISHING RESULTS */}
            {resultsState.length > 0 && (
              <div className="mt-6 space-y-2 border-t pt-4">
                <h4 className="text-sm font-semibold">
                  Publishing Results
                </h4>

                {resultsState.map((result) => (
                  <div
                    key={result.platform}
                    className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3"
                  >
                    <span className="font-medium capitalize">
                      {result.platform}
                    </span>

                    {result.status === "success" ? (
                      <Badge variant="emerald">
                        Published Successfully
                      </Badge>
                    ) : (
                      <Badge
                        variant="rose"
                        title={result.error}
                      >
                        Failed: {result.error || "Unknown error"}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
