import { ClientOnly } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { LocationPicker } from "./LocationPicker";

type LocationPickerLoaderProps = {
  latitude: number | null;
  longitude: number | null;

  onConfirm: (
    latitude: number,
    longitude: number,
    locationName: string,
  ) => void;
};

function LoadingMap() {
  return (
    <div className="rounded-xl border p-8 text-center">
      <Loader2 className="mx-auto h-5 w-5 animate-spin" />

      <p className="mt-2 text-sm text-muted-foreground">
        Loading map...
      </p>
    </div>
  );
}

export function LocationPickerLoader({
  latitude,
  longitude,
  onConfirm,
}: LocationPickerLoaderProps) {
  return (
    <ClientOnly fallback={<LoadingMap />}>
      <LocationPicker
        latitude={latitude}
        longitude={longitude}
        onConfirm={onConfirm}
      />
    </ClientOnly>
  );
}