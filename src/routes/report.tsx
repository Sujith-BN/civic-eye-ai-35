import { createFileRoute } from "@tanstack/react-router";
import { uploadCivicImage } from "@/lib/upload-civic-image";
import { useReportDraft } from "@/context/ReportDraftContext";
import { supabase } from "@/lib/supabase-client";
import {
  useState,
  useRef,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Upload,
  MapPin,
  Sparkles,
  Loader2,
  Camera,
  X,
  Copy,
  Send,
  FileText,
  AlertTriangle,
  Building2,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { SeverityBadge } from "@/components/SeverityBadge";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/mock-data";
import { analyzeCivicImage } from "@/lib/analyze-civic-image";
import { submitCivicReport } from "@/lib/submit-civic-report";
import { confirmCivicReport } from "@/lib/confirm-civic-report";
import { translateCivicReport, supportedReportLanguages } from "@/lib/translate-civic-report";
import { getMyCivicConfirmations } from "@/lib/get-my-civic-confirmations";
import { LocationPickerLoader } from "@/components/LocationPickerLoader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [
      { title: "Report an Issue — FixMyCity" },
      {
        name: "description",
        content:
          "Upload a photo of a civic issue and let AI classify, prioritize, and generate a structured report.",
      },
      { property: "og:title", content: "Report an Issue — FixMyCity" },
      {
        property: "og:description",
        content: "Turn a photo into an AI-verified civic report in under a minute.",
      },
    ],
  }),
  component: ReportPage,
});

type Analysis = {
  issue: string;
  category: string;
  severity: Severity;
  safetyRisk: string;
  department: string;
  confidence: number;
  reasoning: string;
};

type DuplicateReport = {
  reportId: number;
  detectedIssue: string;
  location: string | null;
  severity: string | null;
  status: string | null;
  confirmations: number;
  belongsToCurrentUser: boolean;
  isExactImage: boolean;
};

const severityLabels: Record<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL", Severity> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};


function ReportPage() {
  const {
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
  } = useReportDraft();

  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [duplicateReport, setDuplicateReport] = useState<DuplicateReport | null>(null);
  const [confirmingDuplicate, setConfirmingDuplicate] = useState(false);
  const [confirmedDuplicate, setConfirmedDuplicate] = useState(false);
  const [translationLanguage, setTranslationLanguage] = useState<keyof typeof supportedReportLanguages>("en");
  const [translatedReport, setTranslatedReport] = useState<Pick<Analysis, "issue" | "safetyRisk" | "reasoning" | "department"> | null>(null);
  const [translating, setTranslating] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const analyzeImage = useServerFn(analyzeCivicImage);
  const uploadImage = useServerFn(uploadCivicImage);
  const submitReport = useServerFn(submitCivicReport);
  const translateReport = useServerFn(translateCivicReport);
  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Image must be 10MB or smaller");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
    setFile(f);
    setAnalysis(null);
    setReport(false);
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const useLocation = () => {
  if (!navigator.geolocation) {
    toast.error("Location is not supported by this device.");
    return;
  }

  setGettingLocation(true);

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const accuracy = position.coords.accuracy;

      setLatitude(lat);
      setLongitude(lng);
      setLocationAccuracy(accuracy);

      void reverseGeocodeCurrentLocation(lat, lng, accuracy);

    },
    (error) => {
      setGettingLocation(false);
      console.error("Location error:", error);

      if (error.code === error.PERMISSION_DENIED) {
        toast.error("Please allow location access in your browser.");
      } else {
        toast.error("Could not determine your location. Please enter it manually.");
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    },
  );
};

  const reverseGeocodeCurrentLocation = async (
    lat: number,
    lng: number,
    accuracy: number,
  ) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&addressdetails=1&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`,
      );
      if (!response.ok) throw new Error("Reverse geocoding failed");
      const result = (await response.json()) as { display_name?: string };
      setLocation(result.display_name || "Current location");
      toast.success(`Location captured (±${Math.round(accuracy)}m)`);
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      setLocation("Current location — please add a nearby street or landmark");
      toast.warning("We found your coordinates, but could not name the address. Please add a nearby street or landmark.");
    } finally {
      setGettingLocation(false);
    }

    if (accuracy > 1000) {
      toast.warning("Your location appears inaccurate. Please verify it or choose the exact point on the map.");
    }
  };

  const analyze = async () => {
    if (!file) return toast.error("Upload a photo first");
    setAnalyzing(true);
    setAnalysis(null);
    setReport(false);
    try {
      const formData = new FormData();
      formData.set("image", file);
      const result = await analyzeImage({ data: formData });
      if (!result.hasCivicIssue) {
        toast.error(result.message);
        return;
      }
      setAnalysis({
        issue: result.detectedIssue,
        category: result.category,
        severity: severityLabels[result.severity],
        safetyRisk: result.safetyRisk,
        department: result.suggestedDepartment,
        confidence: result.confidence,
        reasoning: result.reasoning,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "AI analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };
  const handleSubmitReport = async () => {
  if (!analysis) {
    toast.error("Analyze the civic issue first");
    return;
  }

  if (!file) {
    toast.error("Evidence image is required");
    return;
  }

  const cleanLocation = location.trim();

  if (cleanLocation.length < 8) {
    toast.error(
      "Please enter proper street, area, or landmark details",
    );
    return;
  }

  if (latitude === null || longitude === null) {
    toast.error(
      "Please choose the exact issue location using GPS or the map",
    );
    return;
  }

  /*
   * Check whether the citizen is signed in.
   */
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.error("Session check failed:", sessionError);

    toast.error(
      "Unable to verify your login. Please try again.",
    );

    return;
  }

  if (!session?.access_token) {
    toast.error(
      "Please sign in with Google before submitting your report.",
    );

    return;
  }

  setSubmitting(true);

  try {
    /*
     * STEP 1:
     * Upload evidence image.
     */
    const formData = new FormData();

    formData.set("image", file);

    const uploadResult = await uploadImage({
      data: formData,
    });

    /*
     * STEP 2:
     * Submit report with the authenticated session token.
     *
     * The server verifies this token with Supabase
     * before using the user's UUID.
     */
    const result = await submitReport({
      data: {
        accessToken: session.access_token,

        imageUrl: uploadResult.imageUrl,
        imageHash: uploadResult.imageHash,

        location: cleanLocation,

        latitude,
        longitude,

        description: desc || undefined,

        detectedIssue: analysis.issue,

        category: analysis.category,

        severity: analysis.severity.toUpperCase() as
          | "LOW"
          | "MEDIUM"
          | "HIGH"
          | "CRITICAL",

        safetyRisk: analysis.safetyRisk,

        department: analysis.department,

        confidence: analysis.confidence,

        aiReasoning: analysis.reasoning,
      },
    });

    if (result.is_duplicate) {
      try {
        const existingConfirmations = await getMyCivicConfirmations({
          data: { accessToken: session.access_token },
        });
        setConfirmedDuplicate(existingConfirmations.includes(result.report_id));
      } catch (confirmationError) {
        console.error("Unable to load duplicate confirmation state:", confirmationError);
        setConfirmedDuplicate(false);
      }
      setDuplicateReport({
        reportId: result.report_id,
        detectedIssue: result.duplicate_detected_issue,
        location: result.duplicate_location,
        severity: result.duplicate_severity,
        status: result.duplicate_status,
        confirmations: result.duplicate_confirmations ?? 0,
        belongsToCurrentUser: result.duplicate_submitter_id === session.user.id,
        isExactImage: result.duplicate_match_type === "EXACT_IMAGE",
      });
      toast.warning(result.duplicate_match_type === "EXACT_IMAGE" ? "This issue appears to have already been reported." : "This issue may already have been reported nearby.");
      return;
    }

    console.log("Report submitted:", result.report_id);

    toast.success("Report submitted successfully!");

    clearDraft();
  } catch (error) {
    console.error(
      "Report submission failed:",
      error,
    );

    toast.error(
      error instanceof Error
        ? error.message
        : "Unable to submit report",
    );
  } finally {
    setSubmitting(false);
  }
};
  const confirmDuplicateReport = async () => {
    if (!duplicateReport) return;
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      toast.info("Please sign in to confirm an issue.");
      return;
    }
    try {
      setConfirmingDuplicate(true);
      const result = await confirmCivicReport({ data: { accessToken: session.access_token, reportId: duplicateReport.reportId } });
      setDuplicateReport((current) => current ? { ...current, confirmations: result.confirmations } : null);
      setConfirmedDuplicate(true);
      toast.success("Thanks! Your confirmation was added.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to confirm this issue.");
    } finally {
      setConfirmingDuplicate(false);
    }
  };
  const complaintEn = analysis
    ? `To: The Commissioner, ${analysis.department}\n\nSubject: Urgent — ${analysis.issue} at ${location || "reported location"}\n\nDear Sir/Madam,\n\nI wish to bring to your urgent attention a civic issue observed at ${location || "the reported location"}. AI-assisted analysis of photographic evidence has classified this as: ${analysis.issue} (Severity: ${analysis.severity}).\n\nSafety impact: ${analysis.safetyRisk}\n\nAI reasoning: ${analysis.reasoning}\n\n${desc ? `Citizen note: ${desc}\n\n` : ""}I request immediate inspection and corrective action by the responsible department. Please treat this as a matter of public safety.\n\nSubmitted via FixMyCity Civic Intelligence Platform.`
    : "";

  const complaintKn = analysis
    ? `ಗೆ: ಆಯುಕ್ತರು, ${analysis.department}\n\nವಿಷಯ: ತುರ್ತು — ${location || "ವರದಿ ಸ್ಥಳ"}ದಲ್ಲಿ ${analysis.issue}\n\nಮಾನ್ಯರೇ,\n\n${location || "ವರದಿ ಸ್ಥಳ"}ದಲ್ಲಿ ಗಮನಿಸಲಾದ ಒಂದು ಗಂಭೀರ ನಾಗರಿಕ ಸಮಸ್ಯೆಯನ್ನು ನಿಮ್ಮ ತುರ್ತು ಗಮನಕ್ಕೆ ತರಬಯಸುತ್ತೇನೆ. AI-ನೆರವಿನ ಚಿತ್ರ ವಿಶ್ಲೇಷಣೆಯು ಇದನ್ನು ${analysis.severity} ತೀವ್ರತೆಯ ಸಮಸ್ಯೆ ಎಂದು ವರ್ಗೀಕರಿಸಿದೆ.\n\nಸುರಕ್ಷತಾ ಪ್ರಭಾವ: ${analysis.safetyRisk}\n\n${desc ? `ನಾಗರಿಕರ ಟಿಪ್ಪಣಿ: ${desc}\n\n` : ""}ದಯವಿಟ್ಟು ತಕ್ಷಣದ ಪರಿಶೀಲನೆ ಮತ್ತು ಸರಿಪಡಿಸುವ ಕ್ರಮವನ್ನು ತೆಗೆದುಕೊಳ್ಳಿ.\n\nFixMyCity ಮೂಲಕ ಸಲ್ಲಿಸಲಾಗಿದೆ.`
    : "";

  const complaint = lang === "en" ? complaintEn : complaintKn;
  const displayAnalysis = translatedReport ? { ...analysis, ...translatedReport } : analysis;
  const displayComplaint = displayAnalysis
    ? `To: The Commissioner, ${displayAnalysis.department}\n\nSubject: Urgent — ${displayAnalysis.issue} at ${location || "reported location"}\n\nSafety impact: ${displayAnalysis.safetyRisk}\n\nAI reasoning: ${displayAnalysis.reasoning}\n\n${desc ? `Citizen note: ${desc}\n\n` : ""}Submitted via FixMyCity Civic Intelligence Platform.`
    : complaint;
  const changeTranslationLanguage = async (language: keyof typeof supportedReportLanguages) => {
    setTranslationLanguage(language);
    if (!analysis || language === "en") { setTranslatedReport(null); return; }
    setTranslating(true);
    try {
      const result = await translateReport({ data: { language, issue: analysis.issue, safetyRisk: analysis.safetyRisk, reasoning: analysis.reasoning, department: analysis.department } });
      setTranslatedReport(result);
    } catch (error) {
      setTranslatedReport(null);
      toast.error("Translation unavailable. Showing original report.");
    } finally { setTranslating(false); }
  };
  const shouldShowLegacyDuplicateBanner = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("legacyDuplicateBanner");

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-14">
      {duplicateReport && shouldShowLegacyDuplicateBanner && (
        <div className="mb-6 rounded-2xl border border-warning/30 bg-warning/10 p-4 shadow-card sm:p-5" role="alert">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold">⚠️ {duplicateReport.isExactImage ? "This issue appears to have already been reported." : "This issue may already have been reported nearby."}</h2>
              <p className="mt-1 text-sm text-muted-foreground">We did not create a duplicate report. Your draft and image are still here.</p>
              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-muted-foreground">Issue</dt><dd className="font-semibold">{duplicateReport.detectedIssue}</dd></div>
                <div><dt className="text-muted-foreground">Location</dt><dd className="font-semibold">{duplicateReport.location || "Location unavailable"}</dd></div>
                <div><dt className="text-muted-foreground">Severity / status</dt><dd className="font-semibold">{duplicateReport.severity || "Unknown"} · {(duplicateReport.status || "REPORTED").replace(/_/g, " ")}</dd></div>
                <div><dt className="text-muted-foreground">Confirmations</dt><dd className="font-semibold">{duplicateReport.confirmations}</dd></div>
              </dl>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:min-w-44">
              <Button asChild variant="outline"><a href={`/map?report=${duplicateReport.reportId}`}>View Existing Issue</a></Button>
              {duplicateReport.belongsToCurrentUser ? <p className="text-center text-xs text-muted-foreground">You already reported this issue.</p> : (
                <Button onClick={() => void confirmDuplicateReport()} disabled={confirmingDuplicate || confirmedDuplicate}>{confirmingDuplicate ? "Confirming..." : confirmedDuplicate ? "You confirmed this issue" : "Confirm Existing Issue"}</Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => setDuplicateReport(null)}>Keep editing draft</Button>
            </div>
          </div>
        </div>
      )}
      <Dialog open={duplicateReport !== null} onOpenChange={(open) => { if (!open) setDuplicateReport(null); }}>
        {duplicateReport && <DuplicateReportDialog
          duplicateReport={duplicateReport}
          confirming={confirmingDuplicate}
          alreadyConfirmed={confirmedDuplicate}
          onConfirm={() => void confirmDuplicateReport()}
          onCancel={() => setDuplicateReport(null)}
        />}
      </Dialog>
      <div className="mb-8">
        <div className="text-xs font-semibold uppercase tracking-widest text-primary">
          Report an issue
        </div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold">
          Snap it. AI does the rest.
        </h1>
        <p className="mt-3 text-muted-foreground text-lg max-w-2xl">
          Upload a photo, share the location, and let AI classify, prioritize, and generate a
          structured civic report.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-5 rounded-3xl border border-border bg-card p-6 shadow-card">
          <div>
            <Label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs">
                1
              </span>{" "}
              Photo evidence
            </Label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "relative cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
                file
                  ? "border-primary/40 bg-primary/5"
                  : "border-border hover:border-primary/50 hover:bg-secondary/50",
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onChange}
              />
              {file ? (
                <div className="relative">
                  <img
                    src={preview ?? undefined}
                    alt="Preview"
                    className="mx-auto max-h-64 rounded-xl object-contain"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                      setAnalysis(null);
                      setReport(false);
                    }}
                    className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-background/95 shadow-card hover:bg-background"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="py-8">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-hero shadow-elegant">
                    <Upload className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <div className="mt-4 font-semibold">Drag & drop a photo</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    or click to browse — JPG, PNG up to 10MB
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <Label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs">
                2
              </span>{" "}
              Location
            </Label>
            <div className="flex gap-2">
              <Input
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setLatitude(null);
                  setLongitude(null);
                  setLocationAccuracy(null);
                }}
                placeholder="Enter street, area, or landmark"
              />
              <Button type="button" variant="outline" onClick={useLocation} className="shrink-0">
                <MapPin className="h-4 w-4 mr-1.5" /> Use my location
              </Button>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full"
            onClick={() => setShowLocationPicker((value) => !value)}
          >
            <MapPin className="mr-2 h-4 w-4" />
            {showLocationPicker ? "Close Map" : "Choose Exact Location on Map"}
          </Button>
            {showLocationPicker && (
              <div className="mt-3">
                <LocationPickerLoader
                  latitude={latitude}
                  longitude={longitude}
                  onConfirm={(lat, lng, name) => {
                    setLatitude(lat);
                    setLongitude(lng);
                    setLocation(name);
                    setLocationAccuracy(null);
                    setShowLocationPicker(false);
                  }}
                />
              </div>
            )}

          <div>
            <Label className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs">
                3
              </span>{" "}
              Description{" "}
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
              placeholder="Add context — how long has it been there, who is affected…"
            />
          </div>

          <Button
            onClick={analyze}
            disabled={analyzing}
            size="lg"
            className="w-full h-12 bg-gradient-hero shadow-elegant hover:opacity-90 text-base font-semibold"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" /> Analyze with AI
              </>
            )}
          </Button>
        </div>

        {/* Analysis */}
        <div className="space-y-4">
          {analyzing && (
            <div className="rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/5 to-primary-glow/10 p-8 text-center animate-in fade-in">
              <div className="relative mx-auto h-16 w-16">
                <div className="absolute inset-0 rounded-full bg-gradient-hero opacity-30 animate-ping" />
                <div className="relative grid h-16 w-16 place-items-center rounded-full bg-gradient-hero shadow-glow">
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <div className="mt-5 font-display text-xl font-bold">
                AI is analyzing civic evidence…
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Classifying • Assessing severity • Routing to department
              </div>
            </div>
          )}

          {!analyzing && !analysis && (
            <div className="rounded-3xl border-2 border-dashed border-border bg-secondary/30 p-10 text-center h-full grid place-items-center">
              <div>
                <Camera className="mx-auto h-10 w-10 text-muted-foreground/40" />
                <div className="mt-3 font-semibold">AI analysis will appear here</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Upload a photo and click Analyze
                </div>
              </div>
            </div>
          )}

          {analysis && !report && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> AI Analysis Complete
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">
                    Confidence
                  </div>
                  <div className="font-display text-2xl font-bold text-primary">
                    {analysis.confidence}%
                  </div>
                </div>
              </div>

                  <h3 className="mt-4 font-display text-2xl font-bold">{displayAnalysis?.issue}</h3>
              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <SeverityBadge severity={analysis.severity} />
                <span className="rounded-md bg-secondary px-2.5 py-0.5 text-xs font-medium">
                  {analysis.category}
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <Row
                  icon={AlertTriangle}
                  label="Safety Risk"
                  value={analysis.safetyRisk}
                  tone="critical"
                />
                <Row icon={Building2} label="Responsible Department" value={analysis.department} />
                <Row icon={FileText} label="AI Reasoning" value={analysis.reasoning} />
              </div>

              <Button
                onClick={() => setReport(true)}
                size="lg"
                className="mt-6 w-full h-12 bg-gradient-hero shadow-elegant hover:opacity-90 font-semibold"
              >
                <FileText className="mr-2 h-5 w-5" /> Generate Civic Report
              </Button>
            </div>
          )}

          {report && analysis && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-elegant animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Report Generated
                </div>
                <div className="min-w-44">
                  <Label className="mb-1 block text-xs text-muted-foreground">Translate report to:</Label>
                  <select value={translationLanguage} onChange={(event) => void changeTranslationLanguage(event.target.value as keyof typeof supportedReportLanguages)} className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm" disabled={translating}>
                    {Object.entries(supportedReportLanguages).map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                  </select>
                </div>
                <div className="hidden flex gap-1 rounded-lg bg-secondary p-1">
                  <button
                    onClick={() => setLang("en")}
                    className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-md",
                      lang === "en" ? "bg-background shadow-card" : "text-muted-foreground",
                    )}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLang("kn")}
                    className={cn(
                      "px-2.5 py-1 text-xs font-semibold rounded-md",
                      lang === "kn" ? "bg-background shadow-card" : "text-muted-foreground",
                    )}
                  >
                    ಕನ್ನಡ
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <MetaBox label="Severity" value={analysis.severity} />
                <MetaBox label="Department" value={analysis.department} />
              </div>

              {preview && (
                <img
                  src={preview}
                  alt="Evidence"
                  className="w-full max-h-48 object-cover rounded-xl mb-4"
                />
              )}

              <div className="rounded-xl border border-border bg-secondary/40 p-4 max-h-72 overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {translating ? "Translating report…" : displayComplaint}
                </pre>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    navigator.clipboard.writeText(displayComplaint);
                    toast.success("Complaint copied");
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" /> Copy
                </Button>
              <Button
                className="flex-1 bg-gradient-hero shadow-elegant hover:opacity-90"
                onClick={handleSubmitReport}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DuplicateReportDialog({
  duplicateReport,
  confirming,
  alreadyConfirmed,
  onConfirm,
  onCancel,
}: {
  duplicateReport: DuplicateReport;
  confirming: boolean;
  alreadyConfirmed: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const isResolved = (duplicateReport.status || "REPORTED").toUpperCase() === "RESOLVED";
  const confirmationLabel = confirming
    ? "Confirming..."
    : alreadyConfirmed
      ? "Already Confirmed"
      : duplicateReport.belongsToCurrentUser
        ? "You reported this issue"
        : isResolved
          ? "Resolved issues cannot be confirmed"
          : "Confirm Existing Issue";

  return (
    <DialogContent className="max-h-[calc(100vh-2rem)] max-w-xl overflow-y-auto rounded-2xl border-warning/20 p-5 sm:p-6">
      <DialogHeader className="pr-8 text-left">
        <DialogTitle className="font-display text-xl sm:text-2xl">⚠️ Issue Already Reported</DialogTitle>
        <DialogDescription className="pt-2 leading-relaxed">
          This issue appears to have already been reported. Instead of creating a duplicate report, you can confirm the existing issue to help increase its priority.
        </DialogDescription>
      </DialogHeader>

      <div className="rounded-2xl border border-border bg-secondary/30 p-4">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Existing issue</dt><dd className="mt-1 font-display text-base font-bold">{duplicateReport.detectedIssue}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Location</dt><dd className="mt-1 font-medium">{duplicateReport.location || "Location unavailable"}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Severity</dt><dd className="mt-1 font-semibold">{duplicateReport.severity || "Unknown"}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</dt><dd className="mt-1 font-semibold">{(duplicateReport.status || "REPORTED").replace(/_/g, " ")}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Confirmations</dt><dd className="mt-1 font-semibold">{duplicateReport.confirmations}</dd></div>
        </dl>
      </div>

      <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
        <Button
          onClick={onConfirm}
          disabled={confirming || alreadyConfirmed || duplicateReport.belongsToCurrentUser || isResolved}
        >
          {confirmationLabel}
        </Button>
        <Button variant="outline" asChild><a href={`/map?report=${duplicateReport.reportId}`}>View Existing Issue</a></Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </DialogFooter>
    </DialogContent>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  tone?: "critical";
}) {
  return (
    <div className="flex gap-3">
      <div
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-lg",
          tone === "critical" ? "bg-critical/10 text-critical" : "bg-primary/10 text-primary",
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        <div className="text-sm mt-0.5 leading-relaxed">{value}</div>
      </div>
    </div>
  );
}

function MetaBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-semibold mt-0.5 truncate">{value}</div>
    </div>
  );
}
