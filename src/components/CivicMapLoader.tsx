import {
  useEffect,
  useState,
  type ComponentType,
} from "react";

import { Loader2 } from "lucide-react";

type CivicMapReport = {
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


export function CivicMapLoader(
  props: CivicMapProps,
) {
   
  const [MapComponent, setMapComponent] =
    useState<ComponentType<CivicMapProps> | null>(
      null,
    );

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("./CivicMapLeaflet")
      .then((module) => {
        console.log(
          "CIVIC MAP MODULE LOADED",
        );

        if (!cancelled) {
          setMapComponent(
            () => module.CivicMap,
          );
        }
      })
      .catch((err) => {
        console.error(
          "CIVIC MAP IMPORT FAILED:",
          err,
        );

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unknown map loading error",
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="grid h-full min-h-[560px] place-items-center p-6">
        <div className="max-w-md text-center">
          <p className="font-bold text-destructive">
            Map failed to load
          </p>

          <p className="mt-2 break-words text-sm text-muted-foreground">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!MapComponent) {
    return (
      <div className="grid h-full min-h-[560px] place-items-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-7 w-7 animate-spin" />

          <p className="mt-3">
            Loading civic map...
          </p>
        </div>
      </div>
    );
  }

  return <MapComponent {...props} />;
}