import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Incident {
  id: string;
  location: { lat: number; lng: number };
  vesselName: string;
  type: string;
  severity: string;
  date: string;
  vesselType: string;
  authority: string;
  narrative: string;
}

interface MapWrapperProps {
  incidents: Incident[];
  showHeatmap: boolean;
}

export function MapWrapper({ incidents, showHeatmap }: MapWrapperProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      const map = L.map("map").setView([12.8797, 121.774], 6);
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapRef.current = map;
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    const getSeverityColor = (severity: string) => {
      switch (severity) {
        case "Very Serious": return "#ef4444";
        case "Serious": return "#f97316";
        case "Less Serious": return "#eab308";
        default: return "#3b82f6";
      }
    };

    // Add markers for each incident
    incidents.forEach((incident) => {
      const marker = L.marker([incident.location.lat, incident.location.lng])
        .bindPopup(`
          <div style="min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
            <div style="margin-bottom: 8px;">
              <span style="background: ${getSeverityColor(incident.severity)}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 4px;">
                ${incident.severity}
              </span>
              <span style="border: 1px solid #e2e8f0; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
                ${incident.type}
              </span>
            </div>
            <h3 style="font-size: 14px; margin-bottom: 4px; color: #1e293b;">${incident.vesselName}</h3>
            <p style="font-size: 12px; color: #64748b; margin-bottom: 8px;">${incident.id}</p>
            <div style="font-size: 12px; color: #64748b; line-height: 1.5;">
              <div><strong>Date:</strong> ${new Date(incident.date).toLocaleDateString()}</div>
              <div><strong>Vessel Type:</strong> ${incident.vesselType}</div>
              <div><strong>Authority:</strong> ${incident.authority}</div>
            </div>
            <p style="font-size: 12px; color: #475569; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e2e8f0;">
              ${incident.narrative}
            </p>
          </div>
        `)
        .addTo(mapRef.current!);

      markersRef.current.push(marker);

      // Add heatmap circles if enabled
      if (showHeatmap) {
        const circle = L.circle([incident.location.lat, incident.location.lng], {
          radius: 30000,
          fillColor: getSeverityColor(incident.severity),
          fillOpacity: 0.15,
          color: getSeverityColor(incident.severity),
          weight: 1,
          opacity: 0.3,
        }).addTo(mapRef.current!);
        
        markersRef.current.push(circle as any);
      }
    });
  }, [incidents, showHeatmap]);

  return <div id="map" className="h-full w-full rounded-lg" />;
}
