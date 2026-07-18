import { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { Search, MapPin, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

/* =========================================================
   FIX LEAFLET MARKER ICONS WITH VITE
========================================================= */

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

/* =========================================================
   TYPES
========================================================= */

type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;

  onConfirm: (
    latitude: number,
    longitude: number,
    locationName: string,
  ) => void;
};

type Position = {
  lat: number;
  lng: number;
};

type LocationSuggestion = {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
};

/* =========================================================
   CLICK MAP → MOVE MARKER
========================================================= */

function ClickHandler({
  onPositionChange,
}: {
  onPositionChange: (position: Position) => void;
}) {
  useMapEvents({
    click(event) {
      onPositionChange({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

/* =========================================================
   MOVE MAP WHEN SEARCH RESULT IS SELECTED
========================================================= */

function MoveMap({ position }: { position: Position }) {
  const map = useMap();

  map.setView([position.lat, position.lng], 16);

  return null;
}

/* =========================================================
   LOCATION PICKER
========================================================= */

export function LocationPicker({
  latitude,
  longitude,
  onConfirm,
}: LocationPickerProps) {
  /*
   * Bhadravati is only the initial fallback map view.
   * If GPS coordinates exist, those coordinates are used instead.
   */
  const defaultPosition: Position = {
    lat: latitude ?? 13.8485,
    lng: longitude ?? 75.705,
  };

  const [position, setPosition] =
    useState<Position>(defaultPosition);

  const [search, setSearch] = useState("");

  const [suggestions, setSuggestions] = useState<
    LocationSuggestion[]
  >([]);

  const [locationName, setLocationName] = useState("");

  const [searching, setSearching] = useState(false);

  const [confirming, setConfirming] = useState(false);

  /* =======================================================
     SEARCH LOCATION
  ======================================================= */

  const searchLocation = async () => {
    const query = search.trim();

    if (!query) {
      toast.error("Enter a location to search");
      return;
    }

    setSearching(true);
    setSuggestions([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=in&addressdetails=1&q=${encodeURIComponent(
          query,
        )}`,
      );

      if (!response.ok) {
        throw new Error(
          `Location search failed: ${response.status}`,
        );
      }

      const results: LocationSuggestion[] =
        await response.json();

      if (!Array.isArray(results) || results.length === 0) {
        toast.error(
          "No matching locations found. Try a nearby town or landmark.",
        );

        return;
      }

      setSuggestions(results);
    } catch (error) {
      console.error("Location search failed:", error);

      toast.error(
        "Unable to search locations. Please try again.",
      );
    } finally {
      setSearching(false);
    }
  };

  /* =======================================================
     SELECT SEARCH RESULT
  ======================================================= */

  const selectSuggestion = (
    place: LocationSuggestion,
  ) => {
    const newPosition: Position = {
      lat: Number(place.lat),
      lng: Number(place.lon),
    };

    setPosition(newPosition);

    setLocationName(place.display_name);

    setSearch(place.display_name);

    // Close dropdown
    setSuggestions([]);
  };

  /* =======================================================
     CONFIRM EXACT LOCATION
  ======================================================= */

  const confirmLocation = async () => {
    setConfirming(true);

    let name = locationName;

    /*
     * If the user moved the marker manually,
     * reverse-geocode the exact coordinates.
     */
    if (!name) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${position.lat}&lon=${position.lng}`,
        );

        if (response.ok) {
          const result = await response.json();

          name =
            result.display_name ||
            "Selected map location";
        }
      } catch (error) {
        console.error(
          "Reverse geocoding failed:",
          error,
        );
      }
    }

    if (!name) {
      name = `${position.lat.toFixed(
        6,
      )}, ${position.lng.toFixed(6)}`;
    }

    onConfirm(
      position.lat,
      position.lng,
      name,
    );

    setConfirming(false);

    toast.success(
      "Exact issue location confirmed",
    );
  };

  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-3">

      {/* SEARCH BAR */}

      <div className="flex gap-2">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);

            // Remove old suggestions when typing again
            setSuggestions([]);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();

              void searchLocation();
            }
          }}
          placeholder="Search Bhadravati, street, landmark..."
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => void searchLocation()}
          disabled={searching}
        >
          {searching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* SEARCH RESULTS */}

      {suggestions.length > 0 && (
        <div className="max-h-64 overflow-y-auto rounded-xl border border-border bg-background shadow-lg">

          {suggestions.map((place) => (
            <button
              key={place.place_id}
              type="button"
              onClick={() =>
                selectSuggestion(place)
              }
              className="
                flex
                w-full
                items-start
                gap-3
                border-b
                border-border
                p-3
                text-left
                transition-colors
                last:border-b-0
                hover:bg-secondary
              "
            >
              <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10">
                <MapPin className="h-4 w-4 text-primary" />
              </div>

              <div className="min-w-0">
                <div className="text-sm font-medium leading-relaxed">
                  {place.display_name}
                </div>
              </div>
            </button>
          ))}

        </div>
      )}

      {/* MAP */}

      <div className="overflow-hidden rounded-xl border border-border">
        <MapContainer
          center={[
            position.lat,
            position.lng,
          ]}
          zoom={15}
          style={{
            height: "320px",
            width: "100%",
          }}
        >
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* DRAGGABLE MARKER */}

          <Marker
            position={[
              position.lat,
              position.lng,
            ]}
            draggable
            eventHandlers={{
              dragend(event) {
                const marker =
                  event.target;

                const newPosition =
                  marker.getLatLng();

                setPosition({
                  lat: newPosition.lat,
                  lng: newPosition.lng,
                });

                /*
                 * Clear old address because marker
                 * has moved somewhere else.
                 */
                setLocationName("");
              },
            }}
          />

          {/* CLICK MAP TO MOVE MARKER */}

          <ClickHandler
            onPositionChange={(
              newPosition,
            ) => {
              setPosition(
                newPosition,
              );

              setLocationName("");
            }}
          />

          {/* MOVE MAP AFTER SEARCH */}

          <MoveMap
            position={position}
          />

        </MapContainer>
      </div>

      {/* HELP TEXT */}

      <div className="text-xs leading-relaxed text-muted-foreground">
        Search for your area, then click the exact
        location on the map or drag the marker to where
        the civic issue is located.
      </div>

      {/* SELECTED LOCATION */}

      <div className="rounded-xl border border-border bg-secondary/40 p-3">

        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Selected location
        </div>

        {locationName && (
          <div className="mt-1 text-sm font-medium">
            {locationName}
          </div>
        )}

        <div className="mt-1 text-xs text-muted-foreground">
          {position.lat.toFixed(6)},{" "}
          {position.lng.toFixed(6)}
        </div>

      </div>

      {/* CONFIRM */}

      <Button
        type="button"
        onClick={() =>
          void confirmLocation()
        }
        disabled={confirming}
        className="w-full"
      >
        {confirming ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />

            Confirming...
          </>
        ) : (
          <>
            <MapPin className="mr-2 h-4 w-4" />

            Confirm This Location
          </>
        )}
      </Button>

    </div>
  );
}