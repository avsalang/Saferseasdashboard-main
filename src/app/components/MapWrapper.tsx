import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import type { EnrichedIncident } from "../data/incidentInsights";
import { buildIncidentExplorerPath } from "../analytics/drilldown";

const PHILIPPINE_WATERS_BOUNDS = L.latLngBounds(
  L.latLng(4.1, 116.0),
  L.latLng(21.8, 127.6),
);

const DEFAULT_VIEW: L.LatLngTuple = [12.25, 122.85];
const DENSITY_ZOOM_THRESHOLD = 8;
const RECORD_ZOOM_THRESHOLD = 10;

interface MapWrapperProps {
  incidents: EnrichedIncident[];
  showDensity: boolean;
}

function getRecordColor(incident: EnrichedIncident) {
  if (incident.severity === "Very Serious") {
    return "#991b1b";
  }
  if (incident.severity === "Serious") {
    return "#dc2626";
  }
  if (incident.severity === "Less Serious") {
    return "#f97316";
  }
  return "#f59e0b";
}

function getMarkerRadius(incident: EnrichedIncident) {
  const severityRadius =
    incident.severity === "Very Serious" ? 9 :
    incident.severity === "Serious" ? 8 :
    incident.severity === "Less Serious" ? 7 :
    6;

  return severityRadius + Math.min(incident.casualtyCount, 4);
}

function getHeatWeight(incident: EnrichedIncident) {
  return Math.min(1, 0.2 + incident.riskIndex / 24);
}

function buildRecordIcon(incident: EnrichedIncident) {
  const color = getRecordColor(incident);
  const size = getMarkerRadius(incident) * 2;

  return L.divIcon({
    className: "saferseas-record-icon",
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:${color};
        border:2px solid rgba(255,255,255,0.96);
        box-shadow:0 8px 18px rgba(15,23,42,0.22);
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

function buildClusterIcon(cluster: any) {
  const childCount = cluster.getChildCount();
  const size =
    childCount >= 8 ? 52 :
    childCount >= 5 ? 46 :
    40;

  return L.divIcon({
    className: "saferseas-cluster-icon",
    html: `
      <div style="
        width:${size}px;
        height:${size}px;
        border-radius:999px;
        background:radial-gradient(circle at 30% 30%, #fca5a5 0%, #ef4444 55%, #991b1b 100%);
        border:3px solid rgba(255,255,255,0.95);
        box-shadow:0 12px 24px rgba(127,29,29,0.28);
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        font-weight:700;
        font-size:13px;
      ">${childCount}</div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function buildPopup(incident: EnrichedIncident) {
  const explorerPath = buildIncidentExplorerPath([incident], {
    context: `GIS Map · ${incident.id}`,
    search: incident.id,
    type: incident.type,
    severity: incident.severity,
    authority: incident.authority,
    status: incident.status,
    province: incident.location.province,
  });

  return `
    <div style="min-width: 280px; font-family: system-ui, -apple-system, sans-serif; color: #0f172a;">
      <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px;">
        <span style="background: ${getRecordColor(incident)}; color: white; padding: 3px 8px; border-radius: 999px; font-size: 11px;">
          ${incident.severity}
        </span>
        <span style="border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 999px; font-size: 11px;">
          ${incident.type}
        </span>
        <span style="border: 1px solid #cbd5e1; padding: 3px 8px; border-radius: 999px; font-size: 11px;">
          ${incident.status}
        </span>
      </div>
      <div style="font-size: 15px; font-weight: 600; margin-bottom: 2px;">${incident.vesselName}</div>
      <div style="font-size: 12px; color: #64748b; margin-bottom: 12px;">${incident.id}</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; line-height: 1.55;">
        <div>
          <div style="color: #64748b;">Reference Port</div>
          <div>${incident.location.port}, ${incident.location.province}</div>
        </div>
        <div>
          <div style="color: #64748b;">Route / Voyage</div>
          <div>${incident.routeLabel}</div>
        </div>
        <div>
          <div style="color: #64748b;">Authority</div>
          <div>${incident.authority}</div>
        </div>
        <div>
          <div style="color: #64748b;">Primary Cause</div>
          <div>${incident.primaryCauseResolved}</div>
        </div>
        <div>
          <div style="color: #64748b;">Fatalities and Injuries</div>
          <div>${incident.fatalities} fatalities / ${incident.injuries} injuries</div>
        </div>
        <div>
          <div style="color: #64748b;">Weather</div>
          <div>${incident.weather.visibility}, Beaufort ${incident.weather.windForce}</div>
        </div>
        <div>
          <div style="color: #64748b;">Date</div>
          <div>${new Date(incident.date).toLocaleString()}</div>
        </div>
      </div>
      <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #334155; line-height: 1.55;">
        ${incident.findingsOfCause ?? incident.narrative}
      </div>
      <a
        href="#${explorerPath}"
        style="
          display:inline-flex;
          margin-top:12px;
          align-items:center;
          justify-content:center;
          padding:8px 12px;
          border-radius:8px;
          background:#0f172a;
          color:white;
          font-size:12px;
          font-weight:600;
          text-decoration:none;
        "
      >
        Open in Incident Explorer
      </a>
    </div>
  `;
}

export function MapWrapper({ incidents, showDensity }: MapWrapperProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return;
    }

    const map = L.map(containerRef.current, {
      center: DEFAULT_VIEW,
      zoom: 6,
      minZoom: 5,
      maxZoom: 12,
      zoomControl: true,
      maxBounds: PHILIPPINE_WATERS_BOUNDS,
      maxBoundsViscosity: 0.8,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const recordLayer = L.layerGroup();
    const clusterLayer = (L as any).markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: false,
      disableClusteringAtZoom: RECORD_ZOOM_THRESHOLD,
      maxClusterRadius: 44,
      iconCreateFunction: buildClusterIcon,
    });
    const bounds = L.latLngBounds([]);

    incidents.forEach((incident) => {
      const recordMarker = L.marker([incident.location.lat, incident.location.lng], {
        icon: buildRecordIcon(incident),
        keyboard: false,
      }).bindPopup(buildPopup(incident));

      const clusterMarker = L.marker([incident.location.lat, incident.location.lng], {
        icon: buildRecordIcon(incident),
        keyboard: false,
      }).bindPopup(buildPopup(incident));

      recordMarker.addTo(recordLayer);
      clusterLayer.addLayer(clusterMarker);
      bounds.extend([incident.location.lat, incident.location.lng]);
    });

    const heatPoints = incidents.map((incident) => [
      incident.location.lat,
      incident.location.lng,
      getHeatWeight(incident),
    ]);

    const heatLayer = (L as any).heatLayer(heatPoints, {
      radius: 34,
      blur: 28,
      maxZoom: 9,
      minOpacity: 0.28,
      gradient: {
        0.15: "#fee2e2",
        0.35: "#fca5a5",
        0.55: "#fb7185",
        0.75: "#ef4444",
        1.0: "#7f1d1d",
      },
    });

    const syncVisibleLayers = () => {
      const showRecordLayer = map.getZoom() >= RECORD_ZOOM_THRESHOLD;
      const showClusterLayer = map.getZoom() >= DENSITY_ZOOM_THRESHOLD && map.getZoom() < RECORD_ZOOM_THRESHOLD;
      const showHeatLayer = showDensity && map.getZoom() < DENSITY_ZOOM_THRESHOLD;

      if (showRecordLayer && !map.hasLayer(recordLayer)) {
        recordLayer.addTo(map);
      }
      if (!showRecordLayer && map.hasLayer(recordLayer)) {
        map.removeLayer(recordLayer);
      }

      if (showClusterLayer && !map.hasLayer(clusterLayer)) {
        clusterLayer.addTo(map);
      }
      if (!showClusterLayer && map.hasLayer(clusterLayer)) {
        map.removeLayer(clusterLayer);
      }

      if (showHeatLayer && !map.hasLayer(heatLayer)) {
        heatLayer.addTo(map);
      }
      if (!showHeatLayer && map.hasLayer(heatLayer)) {
        map.removeLayer(heatLayer);
      }
    };

    if (!incidents.length) {
      map.setView(DEFAULT_VIEW, 6);
    } else {
      map.fitBounds(bounds.pad(0.2));
    }

    syncVisibleLayers();
    map.on("zoomend", syncVisibleLayers);

    return () => {
      map.off("zoomend", syncVisibleLayers);
      if (map.hasLayer(recordLayer)) {
        map.removeLayer(recordLayer);
      }
      if (map.hasLayer(clusterLayer)) {
        map.removeLayer(clusterLayer);
      }
      if (map.hasLayer(heatLayer)) {
        map.removeLayer(heatLayer);
      }
    };
  }, [incidents, showDensity]);

  return <div ref={containerRef} className="h-full w-full rounded-lg" />;
}
