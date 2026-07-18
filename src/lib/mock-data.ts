export type Severity = "Low" | "Medium" | "High" | "Critical";
export type IssueCategory = "Pothole" | "Garbage" | "Streetlight" | "Water" | "Road" | "Tree" | "Other";
export type IssueStatus = "Reported" | "Verified" | "In Progress" | "Resolved";

export interface CivicIssue {
  id: string;
  title: string;
  category: IssueCategory;
  severity: Severity;
  status: IssueStatus;
  location: string;
  lat: number;
  lng: number;
  photo: string;
  confirmations: number;
  reportedAt: string;
  department: string;
  description: string;
}

const photo = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=800&q=70`;

export const mockIssues: CivicIssue[] = [
  {
    id: "FMC-1042",
    title: "Large pothole on MG Road",
    category: "Pothole",
    severity: "Critical",
    status: "Verified",
    location: "MG Road, near Metro Station",
    lat: 42, lng: 55,
    photo: photo("photo-1601584115197-04ecc0da31d7"),
    confirmations: 27,
    reportedAt: "2h ago",
    department: "Public Works Department",
    description: "Deep pothole roughly 60cm wide causing vehicles to swerve into oncoming traffic.",
  },
  {
    id: "FMC-1041",
    title: "Overflowing garbage bin",
    category: "Garbage",
    severity: "High",
    status: "Reported",
    location: "Sector 12 Market",
    lat: 30, lng: 40,
    photo: photo("photo-1532996122724-e3c354a0b15b"),
    confirmations: 14,
    reportedAt: "5h ago",
    department: "Sanitation Department",
    description: "Bin has not been collected in 4 days, attracting stray animals and pests.",
  },
  {
    id: "FMC-1040",
    title: "Broken streetlight",
    category: "Streetlight",
    severity: "Medium",
    status: "In Progress",
    location: "Park Avenue, Block C",
    lat: 65, lng: 30,
    photo: photo("photo-1519575417172-24f2e2f269f6"),
    confirmations: 8,
    reportedAt: "1d ago",
    department: "Electrical Maintenance",
    description: "Streetlight has been out for a week, making the pedestrian walkway unsafe.",
  },
  {
    id: "FMC-1039",
    title: "Water main leak",
    category: "Water",
    severity: "Critical",
    status: "Verified",
    location: "Green Valley Road",
    lat: 75, lng: 65,
    photo: photo("photo-1583912267550-d6c2ac3196c0"),
    confirmations: 32,
    reportedAt: "3h ago",
    department: "Water Board",
    description: "Continuous water leak causing flooding and road erosion.",
  },
  {
    id: "FMC-1038",
    title: "Fallen tree blocking lane",
    category: "Tree",
    severity: "High",
    status: "In Progress",
    location: "Lakeview Drive",
    lat: 20, lng: 70,
    photo: photo("photo-1516214104703-d870798883c5"),
    confirmations: 11,
    reportedAt: "8h ago",
    department: "Parks & Forestry",
    description: "Large tree fell after storm, partially blocking one lane.",
  },
  {
    id: "FMC-1037",
    title: "Damaged road surface",
    category: "Road",
    severity: "Medium",
    status: "Reported",
    location: "Industrial Area Phase 2",
    lat: 55, lng: 78,
    photo: photo("photo-1545158535-c3f7168c28b6"),
    confirmations: 6,
    reportedAt: "2d ago",
    department: "Public Works Department",
    description: "Multiple cracks and small potholes across a 20m stretch.",
  },
  {
    id: "FMC-1036",
    title: "Streetlight flickering",
    category: "Streetlight",
    severity: "Low",
    status: "Resolved",
    location: "Rose Garden Colony",
    lat: 48, lng: 20,
    photo: photo("photo-1519681393784-d120267933ba"),
    confirmations: 3,
    reportedAt: "3d ago",
    department: "Electrical Maintenance",
    description: "Streetlight flickers intermittently after 9pm.",
  },
  {
    id: "FMC-1035",
    title: "Illegal dumping site",
    category: "Garbage",
    severity: "High",
    status: "Verified",
    location: "Old Highway Bypass",
    lat: 82, lng: 45,
    photo: photo("photo-1611284446314-60a58ac0deb9"),
    confirmations: 19,
    reportedAt: "1d ago",
    department: "Sanitation Department",
    description: "Construction debris being dumped in vacant lot.",
  },
];

export const severityColor = (s: Severity) => {
  switch (s) {
    case "Low": return "success";
    case "Medium": return "warning";
    case "High": return "accent";
    case "Critical": return "critical";
  }
};

export const priorityScore = (issue: CivicIssue) => {
  const sev = { Low: 25, Medium: 50, High: 75, Critical: 92 }[issue.severity];
  const boost = Math.min(15, issue.confirmations / 3);
  return Math.min(100, Math.round(sev + boost));
};

export const stats = {
  active: 342,
  critical: 47,
  resolved: 1289,
  confirmations: 8734,
};

export const categoryBreakdown = [
  { category: "Potholes", count: 89, color: "oklch(0.6 0.22 25)" },
  { category: "Garbage", count: 76, color: "oklch(0.72 0.16 55)" },
  { category: "Streetlights", count: 54, color: "oklch(0.78 0.16 75)" },
  { category: "Water", count: 61, color: "oklch(0.55 0.14 200)" },
  { category: "Roads", count: 42, color: "oklch(0.45 0.13 235)" },
  { category: "Other", count: 20, color: "oklch(0.5 0.03 240)" },
];
