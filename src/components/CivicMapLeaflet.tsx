import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import L from "leaflet";

import "leaflet/dist/leaflet.css";

delete (
  L.Icon.Default.prototype as unknown as {
    _getIconUrl?: unknown;
  }
)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export type CivicMapReport = {
  id: number;
  detected_issue: string;
  category: string;
  severity: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  status: string | null;
  confirmations: number | null;
};

type CivicMapProps = {
  reports: CivicMapReport[];
  selectedId: number | null;
  onSelect: (id: number) => void;
};

function FitReports({
  reports,
}: {
  reports: CivicMapReport[];
}) {
  const map = useMap();

  useEffect(() => {
    const valid = reports.filter(
      (report) =>
        report.latitude != null &&
        report.longitude != null,
    );

    if (valid.length === 0) {
      return;
    }

    if (valid.length === 1) {
      map.setView(
        [
          valid[0].latitude!,
          valid[0].longitude!,
        ],
        16,
      );

      return;
    }

    const bounds = L.latLngBounds(
      valid.map((report) => [
        report.latitude!,
        report.longitude!,
      ]),
    );

    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 16,
    });
  }, [reports, map]);

  return null;
}

export function CivicMap({
  reports,
  selectedId,
  onSelect,
}: CivicMapProps) {
  const validReports = reports.filter(
    (report) =>
      report.latitude != null &&
      report.longitude != null,
  );

  // Fallback center only until real report coordinates load.
  const center: [number, number] =
    validReports.length > 0
      ? [
          validReports[0].latitude!,
          validReports[0].longitude!,
        ]
      : [13.8485, 75.705];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitReports reports={validReports} />

      {validReports.map((report) => (
        <Marker
          key={report.id}
          position={[
            report.latitude!,
            report.longitude!,
          ]}
          eventHandlers={{
            click: () => {
              onSelect(report.id);
            },
          }}
          opacity={
            selectedId === report.id ? 1 : 0.85
          }
        >
          <Popup>
            <div style={{ minWidth: 180 }}>
              <strong>
                {report.detected_issue}
              </strong>

              <div style={{ marginTop: 6 }}>
                {report.category}
              </div>

              <div>
                Severity:{" "}
                <strong>
                  {report.severity}
                </strong>
              </div>

              <div>
                Status:{" "}
                {formatStatus(report.status)}
              </div>

              {report.location && (
                <div style={{ marginTop: 6 }}>
                  {report.location}
                </div>
              )}

              <div style={{ marginTop: 6 }}>
                {report.confirmations ?? 0}{" "}
                confirmations
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

function formatStatus(status: string | null) {
  return (status || "REPORTED").replace(/_/g, " ");
}
