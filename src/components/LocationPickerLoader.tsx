import { lazy, Suspense, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type LocationPickerLoaderProps = {
  latitude: number | null;
  longitude: number | null;
  onConfirm: (
    latitude: number,
    longitude: number,
    locationName: string,
  ) => void;
};

const LocationPicker = lazy(() =>
  import("@/components/LocationPicker.client").then((module) => ({
    default: module.LocationPicker,
  })),
);

export function LocationPickerLoader({
  latitude,
  longitude,
  onConfirm,
}: LocationPickerLoaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="rounded-xl border p-8 text-center">
        <Loader2 className="mx-auto h-5 w-5 animate-spin" />

        <p className="mt-2 text-sm text-muted-foreground">
          Loading map...
        </p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="rounded-xl border p-8 text-center">
          <Loader2 className="mx-auto h-5 w-5 animate-spin" />

          <p className="mt-2 text-sm text-muted-foreground">
            Loading map...
          </p>
        </div>
      }
    >
      <LocationPicker
        latitude={latitude}
        longitude={longitude}
        onConfirm={onConfirm}
      />
    </Suspense>
  );
}