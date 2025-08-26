export interface Campaign {
  id: string;
  name: string;
  description?: string;
}

export interface Stream {
  id: string;
  name: string;
  campaigns: Campaign[];
  logoUrl?: string;
  widgetConfig?: {
    displayMode: "grid" | "slideshow";
    color: string;
    showLogo: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StreamsProps {
  initialStreams?: Stream[];
  initialCampaigns?: Campaign[];
}
