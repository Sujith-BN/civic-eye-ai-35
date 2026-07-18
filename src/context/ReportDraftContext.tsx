import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Severity } from "@/lib/mock-data";

import {
  saveDraftImage,
  getDraftImage,
  deleteDraftImage,
} from "@/lib/report-draft-db";

const STORAGE_KEY = "fixmycity-report-draft";

export type DraftAnalysis = {
  issue: string;
  category: string;
  severity: Severity;
  safetyRisk: string;
  department: string;
  confidence: number;
  reasoning: string;
};

type SavedDraft = {
  location: string;
  latitude: number | null;
  longitude: number | null;
  locationAccuracy: number | null;
  desc: string;
  analysis: DraftAnalysis | null;
  report: boolean;
  lang: "en" | "kn";
};

type ReportDraftContextType = {
  file: File | null;
  setFile: (file: File | null) => void;

  preview: string | null;
  setPreview: (preview: string | null) => void;

  location: string;
  setLocation: (location: string) => void;

  latitude: number | null;
  setLatitude: (latitude: number | null) => void;

  longitude: number | null;
  setLongitude: (longitude: number | null) => void;

  locationAccuracy: number | null;
  setLocationAccuracy: (accuracy: number | null) => void;

  desc: string;
  setDesc: (desc: string) => void;

  analysis: DraftAnalysis | null;
  setAnalysis: (analysis: DraftAnalysis | null) => void;

  report: boolean;
  setReport: (report: boolean) => void;

  lang: "en" | "kn";
  setLang: (lang: "en" | "kn") => void;

  clearDraft: () => void;
};

const ReportDraftContext =
  createContext<ReportDraftContextType | null>(null);

export function ReportDraftProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [file, setFileState] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationAccuracy, setLocationAccuracy] =
    useState<number | null>(null);

  const [desc, setDesc] = useState("");

  const [analysis, setAnalysis] =
    useState<DraftAnalysis | null>(null);

  const [report, setReport] = useState(false);
  const [lang, setLang] = useState<"en" | "kn">("en");

  const [restored, setRestored] = useState(false);

  // Restore form fields + AI result from sessionStorage.
  // Restore actual image File from IndexedDB.
  useEffect(() => {
    let cancelled = false;

    async function restoreDraft() {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY);

        if (saved) {
          const draft: SavedDraft = JSON.parse(saved);

          if (!cancelled) {
            setLocation(draft.location ?? "");
            setLatitude(draft.latitude ?? null);
            setLongitude(draft.longitude ?? null);
            setLocationAccuracy(
              draft.locationAccuracy ?? null,
            );

            setDesc(draft.desc ?? "");
            setAnalysis(draft.analysis ?? null);
            setReport(draft.report ?? false);
            setLang(draft.lang ?? "en");
          }
        }

        const savedImage = await getDraftImage();

        if (savedImage && !cancelled) {
          setFileState(savedImage);

          const imagePreview =
            URL.createObjectURL(savedImage);

          setPreview(imagePreview);
        }
      } catch (error) {
        console.error(
          "Failed to restore report draft:",
          error,
        );
      } finally {
        if (!cancelled) {
          setRestored(true);
        }
      }
    }

    restoreDraft();

    return () => {
      cancelled = true;
    };
  }, []);

  // Save small draft data.
  useEffect(() => {
    if (!restored) {
      return;
    }

    const draft: SavedDraft = {
      location,
      latitude,
      longitude,
      locationAccuracy,
      desc,
      analysis,
      report,
      lang,
    };

    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(draft),
      );
    } catch (error) {
      console.error(
        "Failed to save report draft:",
        error,
      );
    }
  }, [
    restored,
    location,
    latitude,
    longitude,
    locationAccuracy,
    desc,
    analysis,
    report,
    lang,
  ]);

  /*
   * report.tsx can continue calling setFile normally.
   * We automatically sync the File to IndexedDB.
   */
  const setFile = (newFile: File | null) => {
    setFileState(newFile);

    if (newFile) {
      saveDraftImage(newFile).catch((error) => {
        console.error(
          "Failed to save draft image:",
          error,
        );
      });
    } else {
      deleteDraftImage().catch((error) => {
        console.error(
          "Failed to delete draft image:",
          error,
        );
      });
    }
  };

  const clearDraft = () => {
    setFileState(null);
    setPreview(null);

    setLocation("");
    setLatitude(null);
    setLongitude(null);
    setLocationAccuracy(null);

    setDesc("");
    setAnalysis(null);

    setReport(false);
    setLang("en");

    sessionStorage.removeItem(STORAGE_KEY);

    // Remove the temporary test key we added earlier too.
    sessionStorage.removeItem("fixmycity-location");

    deleteDraftImage().catch((error) => {
      console.error(
        "Failed to delete draft image:",
        error,
      );
    });
  };

  return (
    <ReportDraftContext.Provider
      value={{
        file,
        setFile,

        preview,
        setPreview,

        location,
        setLocation,

        latitude,
        setLatitude,

        longitude,
        setLongitude,

        locationAccuracy,
        setLocationAccuracy,

        desc,
        setDesc,

        analysis,
        setAnalysis,

        report,
        setReport,

        lang,
        setLang,

        clearDraft,
      }}
    >
      {children}
    </ReportDraftContext.Provider>
  );
}

export function useReportDraft() {
  const context = useContext(ReportDraftContext);

  if (!context) {
    throw new Error(
      "useReportDraft must be used inside ReportDraftProvider",
    );
  }

  return context;
}