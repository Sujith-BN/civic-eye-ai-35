<div align="center">

# 🏙️ FixMyCity

### From a photo on the street to an issue that can actually be acted on.

**AI-Powered Civic Issue Reporting • Community Verification • Transparent Resolution**

<br>

**See it → Report it → Verify it → Prioritize it → Resolve it**

<br>

[🌐 Live Application](https://sujith-bn-civic-eye-ai-35.sujith-bn.workers.dev/) ·
[🎥 Watch Demo](https://youtu.be/CJ9JKH-F_kE) ·
[💻 Source Code](https://github.com/Sujith-BN/civic-eye-ai-35)

</div>

---

## 🌍 What if reporting a broken city was as easy as taking a photo?

A pothole.

An overflowing garbage pile.

A broken streetlight.

A dangerous public-space issue.

Citizens see these problems every day.

But reporting them often means figuring out **where to complain, how to describe the issue, which department it belongs to, whether someone already reported it, and whether anything ever happened afterward.**

**FixMyCity rethinks that entire journey.**

A citizen provides evidence.

AI helps understand the issue.

Location gives it geographic context.

The community helps verify its importance.

Duplicate reports are consolidated instead of creating noise.

Authorities move the issue through a transparent resolution lifecycle.

```text
📸 SEE IT
    ↓
🤖 UNDERSTAND IT
    ↓
📍 LOCATE IT
    ↓
🔍 CHECK IT
    ↓
👍 VERIFY IT
    ↓
🏛️ ACT ON IT
    ↓
✅ RESOLVE IT
```

> **FixMyCity is not just a complaint form.**
>
> It is an attempt to turn scattered civic complaints into structured, verifiable and actionable civic intelligence.

---

# 🎥 See FixMyCity in Action

### ▶️ Full Project Demo

[**Watch the FixMyCity Hackathon Demo on YouTube →**](https://youtu.be/CJ9JKH-F_kE)

The demo walks through the complete journey:

```text
Guest explores reporting
        ↓
Authentication required for submission
        ↓
Citizen signs in
        ↓
Uploads civic issue evidence
        ↓
AI analyzes the issue
        ↓
Location is attached
        ↓
Report can be viewed in another language
        ↓
Duplicate issue is detected
        ↓
Citizen confirms existing issue
        ↓
Admin reviews the issue
        ↓
REPORTED → IN_PROGRESS → RESOLVED
```

### 🌐 Try the Live Application

**https://sujith-bn-civic-eye-ai-35.sujith-bn.workers.dev/**

---

# 🚨 The Problem Is Bigger Than “Submit a Complaint”

Most civic reporting systems treat every submission as an isolated complaint.

But real cities do not work that way.

Imagine a dangerous pothole on a busy road.

Five citizens notice it.

### A basic complaint system may create:

```text
Citizen A ──→ Complaint #101
Citizen B ──→ Complaint #147
Citizen C ──→ Complaint #208
Citizen D ──→ Complaint #319
Citizen E ──→ Complaint #422
```

Five database records.

But there is still only:

```text
ONE REAL-WORLD POTHOLE
```

Now imagine those complaints use different words:

```text
"Big pothole"

"Road damaged"

"Dangerous hole near junction"

"Broken road"

"Pothole causing traffic problem"
```

The authority sees **noise**.

What they actually need is **signal**:

```text
Issue:       Dangerous Pothole
Location:    Known
Severity:    High
Status:      REPORTED
Confirmed:   5 citizens
Department:  Relevant civic authority
```

That difference inspired **FixMyCity**.

---

# 💡 The FixMyCity Approach

Instead of treating civic reporting as:

```text
FORM → DATABASE
```

FixMyCity treats it as a lifecycle:

```text
EVIDENCE
   ↓
UNDERSTANDING
   ↓
LOCATION
   ↓
VALIDATION
   ↓
COMMUNITY SIGNAL
   ↓
PRIORITIZATION
   ↓
AUTHORITY ACTION
   ↓
RESOLUTION
```

Every major feature supports one part of that lifecycle.

---

# ✨ Core Experience

## 📸 01 — Start With Evidence

Citizens begin with what they already have:

**a photo of the problem.**

Instead of forcing users to understand complex civic categories first, FixMyCity starts with visual evidence and builds the report around it.

Examples include:

- 🕳️ Potholes and damaged roads
- 🗑️ Garbage and waste accumulation
- 💡 Broken public infrastructure
- 🚰 Water-related civic issues
- ⚠️ Public safety hazards
- 🚧 Other visible civic problems

---

## 🤖 02 — Let AI Help Understand the Issue

Uploading an image is only the beginning.

FixMyCity uses AI-assisted analysis to help transform visual evidence into structured civic information.

Depending on the detected issue, the generated analysis can help identify information such as:

- Issue type
- Civic category
- Severity
- Safety risk
- Relevant department
- Confidence
- Human-readable reasoning

Instead of asking every citizen to manually understand government classifications, AI helps create a more structured starting point.

### The principle

```text
Citizen provides evidence
          +
AI provides structure
          =
Better civic report
```

AI assists the reporting process.

It does not replace the citizen, database security, or authority workflow.

---

# 📍 03 — Give Every Issue Geographic Context

A civic problem is useful only if people know **where it exists**.

FixMyCity supports location-aware reporting using geographic coordinates and human-readable location information.

The reporting experience can work with:

- Browser geolocation
- Latitude and longitude
- Readable location/address information
- Map-based geographic context

This allows the system to reason about something extremely important:

> **Are two reports describing the same kind of problem in the same area?**

That becomes the foundation for smarter duplicate detection.

---

# 🌐 04 — Civic Reporting Without a Language Barrier

A citizen should not be excluded because the generated report is written in a language they are less comfortable reading.

FixMyCity includes multilingual accessibility for AI-generated civic report content.

Supported language options include:

| Language | Display |
|---|---|
| English | English |
| Kannada | ಕನ್ನಡ |
| Hindi | हिन्दी |
| Tamil | தமிழ் |
| Telugu | తెలుగు |
| Malayalam | മലയാളം |
| Marathi | मराठी |
| Bengali | বাংলা |

The important design decision is that **translation is primarily an accessibility layer**.

```text
Canonical Report Data
        │
        ├──→ English display
        ├──→ ಕನ್ನಡ display
        ├──→ हिन्दी display
        ├──→ தமிழ் display
        ├──→ తెలుగు display
        └──→ Other supported languages
```

Core values used by application logic remain stable.

That means changing the display language should not corrupt:

- Duplicate detection
- Categories
- Status values
- Coordinates
- Administrative workflow
- Dashboard logic

### Accessibility without sacrificing data integrity.

---

# 🔐 05 — Explore Freely. Authenticate Before Reporting.

FixMyCity allows users to experience the reporting flow, but actual report submission requires authentication.

This creates a useful balance:

```text
Explore the experience
        ↓
Prepare the report
        ↓
Attempt submission
        ↓
Authentication required
        ↓
Verified session
        ↓
Submit
```

Authentication is handled through **Supabase authentication**, including Google sign-in in the application flow.

This helps associate civic submissions with authenticated users rather than anonymous database writes.

---

# 🔍 06 — The Feature That Changes the Model: Duplicate Intelligence

This is one of the central ideas behind FixMyCity.

### The wrong question:

> “Has this exact file been uploaded before?”

### The better question:

> **“Does this submission appear to represent a civic issue that is already active nearby?”**

Those are very different problems.

Two people can photograph the **same pothole from different angles**.

The images are different.

The real-world issue is the same.

At the same time, a pothole and garbage pile can exist near each other.

The locations are similar.

The real-world issues are different.

So duplicate detection must consider the **incident**, not just one simplistic signal.

---

## 🧠 Duplicate Detection Model

FixMyCity combines multiple signals when identifying potential duplicate active reports.

### 📍 Signal 1 — Geographic Proximity

Nearby reports can become potential duplicate candidates.

A configured geographic radius helps determine whether two submissions may refer to the same physical incident.

Conceptually:

```text
New Report
    │
    ▼
Are active reports nearby?
    │
 ┌──┴──┐
 NO   YES
 │      │
 ▼      ▼
New   Compare
Issue  Issue Context
```

---

### 🏷️ Signal 2 — Issue / Category Similarity

Location alone is not enough.

Consider:

```text
Same street
├── Pothole
├── Garbage pile
└── Broken streetlight
```

These are **three different civic issues** even if they are geographically close.

FixMyCity therefore also considers issue/category context when evaluating nearby reports.

---

### 🖼️ Signal 3 — Image Fingerprinting

Image fingerprinting can provide an additional duplicate signal.

A SHA-256 fingerprint can identify identical image evidence even when uploaded separately.

But identical images alone should not blindly define a physical civic incident.

Geographic and issue context still matter when deciding how reports should relate to each other.

---

### 🔄 Signal 4 — Issue Lifecycle

Duplicate detection focuses on **active issues**.

```text
REPORTED       → Active
IN_PROGRESS    → Active
RESOLVED       → Historical/closed
```

Why?

Imagine:

```text
January
Pothole reported
      ↓
Road repaired
      ↓
RESOLVED

Three months later
      ↓
Road breaks again
      ↓
Citizen must be able to report the NEW problem
```

A resolved historical issue should not permanently prevent legitimate future reporting.

---

# ⚠️ 07 — Don’t Silently Block the Citizen

When FixMyCity identifies a likely existing issue, it does not simply throw an error saying:

> “Duplicate rejected.”

Instead, it turns duplication into a useful community action.

The user is shown an **Issue Already Reported** experience with information about the existing issue.

Conceptually:

```text
┌──────────────────────────────────────┐
│  ⚠️ Issue Already Reported           │
│                                      │
│  Existing Issue                      │
│  Location                            │
│  Severity                            │
│  Status                              │
│  Current Confirmations               │
│                                      │
│  [ Confirm Existing Issue ]          │
│  [ View Existing Issue ]             │
│  [ Cancel ]                          │
└──────────────────────────────────────┘
```

The user decides what to do.

FixMyCity does **not automatically upvote on their behalf**.

That distinction matters.

---

# 👍 08 — Turn Duplicate Complaints Into Community Signal

Now imagine five people encounter the same pothole.

### Traditional model

```text
Citizen A → New complaint
Citizen B → New complaint
Citizen C → New complaint
Citizen D → New complaint
Citizen E → New complaint

Result:
5 complaints
1 actual issue
Lots of duplication
```

### FixMyCity model

```text
Citizen A
    │
    └──→ Creates Issue #101
              │
       ┌──────┼──────┬──────┐
       ▼      ▼      ▼      ▼
 Citizen B Citizen C Citizen D Citizen E
 Confirm   Confirm   Confirm   Confirm

              ↓

       ONE STRUCTURED ISSUE
              +
       COMMUNITY CONFIRMATIONS
              ↓
       STRONGER PRIORITY SIGNAL
```

This changes the meaning of repeated citizen activity.

Instead of:

> **“We received the same complaint five times.”**

The system can understand:

> **“One issue has been independently confirmed by multiple citizens.”**

That is much more useful.

---

# 🛡️ Community Confirmation Safeguards

A confirmation system is only useful if it cannot be trivially manipulated.

FixMyCity protects the confirmation flow with rules such as:

```text
❌ You cannot confirm your own report

❌ You cannot repeatedly confirm the same issue

❌ Resolved issues cannot receive new confirmations

✅ Another authenticated citizen can confirm an active issue
```

Important rules are enforced beyond simply hiding UI buttons.

Database/server-side logic helps preserve confirmation integrity.

---

# 🗺️ 09 — Turn Reports Into a Civic Map

Individual complaints become more useful when viewed geographically.

FixMyCity provides a map-based view of civic issues.

Instead of thinking only in rows:

```text
Issue #101
Issue #102
Issue #103
Issue #104
```

Citizens and administrators can think spatially:

```text
              🗑️ Garbage

     🕳️ Pothole       💡 Streetlight


              🚰 Water Issue
```

A civic map helps answer:

- Where are issues concentrated?
- Which areas have active reports?
- What kind of problems are appearing?
- What is the current issue status?
- Which issues have stronger community confirmation?

This moves FixMyCity from a simple form toward a **civic intelligence interface**.

---

# 📊 10 — Make Civic Problems Visible

FixMyCity includes dashboard-style visibility into the issue lifecycle.

The dashboard helps surface civic information such as:

- Reported issues
- Active issues
- Critical issues
- Confirmation activity
- Resolution progress
- Issue status distribution

The goal is not just to collect reports.

The goal is to make them **understandable and actionable**.

---

# 🏛️ 11 — Reporting Is Only the Beginning

A complaint platform fails if everything ends at:

```text
"Submitted Successfully"
```

FixMyCity models what happens afterward.

```text
┌──────────────┐
│   REPORTED   │
└──────┬───────┘
       │
       │ Authority acknowledges / begins work
       ▼
┌──────────────┐
│ IN_PROGRESS  │
└──────┬───────┘
       │
       │ Issue addressed
       ▼
┌──────────────┐
│   RESOLVED   │
└──────────────┘
```

---

## 🔴 REPORTED

The civic issue has been submitted and exists as an active report.

---

## 🟡 IN_PROGRESS

An authorized administrative workflow indicates that the issue is being addressed.

This communicates:

> **“The issue has been seen and action is underway.”**

---

## 🟢 RESOLVED

The issue has been addressed and moved to the resolved state.

This completes the civic lifecycle.

---

# 🔐 Why Status Control Matters

Imagine if every citizen could mark any issue:

```text
RESOLVED ✅
```

Then dashboard statistics would become meaningless.

A citizen could:

```text
Report pothole
     ↓
Get tired of seeing it
     ↓
Click "Resolved"
     ↓
Dashboard says problem fixed
```

But the road is still broken.

FixMyCity separates citizen participation from authorized status management.

---

# 👥 Citizen vs Admin Responsibilities

| Capability | Citizen | Authorized Admin |
|---|:---:|:---:|
| Explore civic reports | ✅ | ✅ |
| Use AI-assisted reporting | ✅ | ✅ |
| Submit authenticated report | ✅ | ✅ |
| View reports on map | ✅ | ✅ |
| Use multilingual report display | ✅ | ✅ |
| Confirm another citizen's active issue | ✅ | ✅ |
| Confirm own issue | ❌ | ❌ |
| Repeatedly confirm same issue | ❌ | ❌ |
| Confirm resolved issue | ❌ | ❌ |
| Change civic issue status | ❌ | ✅ |
| Move issue to `IN_PROGRESS` | ❌ | ✅ |
| Mark issue `RESOLVED` | ❌ | ✅ |

This separation makes the workflow more trustworthy.

---

# 🔄 The Complete FixMyCity Journey

```text
                         ┌────────────────────┐
                         │  CIVIC PROBLEM     │
                         │  EXISTS IN CITY    │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │ CITIZEN TAKES PHOTO│
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │   AI ANALYSIS      │
                         │                    │
                         │ Issue              │
                         │ Category           │
                         │ Severity           │
                         │ Risk               │
                         │ Department         │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │ LOCATION CONTEXT   │
                         │ GPS / Coordinates  │
                         │ Readable Location  │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │ AUTHENTICATION     │
                         │ Verified Session   │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │ DUPLICATE CHECK    │
                         └─────────┬──────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
             NO MATCH FOUND                MATCH FOUND
                    │                             │
                    ▼                             ▼
             CREATE REPORT              SHOW EXISTING ISSUE
                    │                             │
                    │                             ▼
                    │                    CITIZEN CONFIRMS
                    │                             │
                    └──────────────┬──────────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │ CIVIC ECOSYSTEM    │
                         │ Dashboard + Map    │
                         └─────────┬──────────┘
                                   │
                                   ▼
                         ┌────────────────────┐
                         │ AUTHORITY WORKFLOW │
                         └─────────┬──────────┘
                                   │
                                   ▼
              REPORTED → IN_PROGRESS → RESOLVED
```

---

# 🧠 AI With a Purpose

“AI-powered” should mean more than adding a chatbot.

FixMyCity uses AI where it can reduce friction in a civic workflow.

### AI helps with:

```text
Visual Evidence
      ↓
Issue Understanding
      ↓
Structured Civic Information
      ↓
Citizen-Friendly Report
```

It also supports multilingual accessibility for generated report information.

### AI does NOT decide everything.

Critical application rules remain deterministic:

```text
Authentication        → Application/Auth rules

Confirmations         → Database/server rules

Issue status          → Authorized workflow

Duplicate geography   → Geographic/business logic

Canonical values      → Stable application data
```

This separation is intentional.

> **Use AI for understanding.**
>
> **Use deterministic systems for integrity.**

---

# 🏗️ System Architecture

```text
┌───────────────────────────────────────────────────────────────┐
│                         USER / CITIZEN                        │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                    REACT / TANSTACK UI                        │
│                                                               │
│  Report  •  Map  •  Dashboard  •  Auth  •  Translation      │
└──────────┬────────────────────┬────────────────────┬──────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌─────────────────┐   ┌─────────────────┐   ┌──────────────────┐
│ AUTHENTICATION  │   │  AI SERVICES    │   │ LOCATION / MAP   │
│                 │   │                 │   │                  │
│ Supabase Auth   │   │ Image Analysis  │   │ Geolocation      │
│ Google Sign-In  │   │ Translation     │   │ Leaflet          │
└────────┬────────┘   └────────┬────────┘   └─────────┬────────┘
         │                     │                      │
         └─────────────────────┼──────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                     SERVER-SIDE LOGIC                         │
│                                                               │
│  AI requests • Secure operations • Report processing         │
└──────────────────────────────┬────────────────────────────────┘
                               │
                               ▼
┌───────────────────────────────────────────────────────────────┐
│                           SUPABASE                            │
│                                                               │
│ PostgreSQL  •  Authentication  •  Storage  •  RPC Functions  │
└──────────────┬───────────────────────┬────────────────────────┘
               │                       │
               ▼                       ▼
┌────────────────────────┐   ┌──────────────────────────────────┐
│ DUPLICATE INTELLIGENCE │   │     CIVIC WORKFLOW              │
│                        │   │                                  │
│ Geographic proximity   │   │ Confirmations                    │
│ Issue similarity       │   │ Status authorization             │
│ Image fingerprint      │   │ REPORTED → PROGRESS → RESOLVED  │
└────────────┬───────────┘   └────────────────┬─────────────────┘
             │                                │
             └────────────────┬───────────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │  DASHBOARD + CIVIC MAP │
                 └────────────┬───────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │  AUTHORIZED ADMIN      │
                 │  ACTION & RESOLUTION   │
                 └────────────────────────┘
```

---

# 🛠️ Technology Stack

## Frontend & Application

```text
React
TypeScript
TanStack Router / TanStack Start
Vite
Responsive component-based UI
```

## Backend & Data

```text
Supabase
PostgreSQL
Supabase Authentication
Supabase Storage
PostgreSQL RPC Functions
```

## AI

```text
AI-assisted civic image analysis
Structured report generation
Multilingual report translation
Server-side AI integration
```

## Maps & Geography

```text
Leaflet
Browser Geolocation
Geographic coordinates
Reverse-geocoded readable locations
Distance-based duplicate matching
```

## Infrastructure

```text
Cloudflare Workers
Nitro
GitHub
```

---

# 🛡️ Security & Data Integrity

FixMyCity treats security as more than hiding buttons.

---

## 🔑 API Secrets Stay Server-Side

Sensitive credentials such as AI provider keys should never be intentionally exposed in public browser code.

The project uses server-side environment configuration for sensitive operations.

Example environment concepts:

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
GEMINI_API_KEY
OPENROUTER_API_KEY
```

Real secret values must never be committed to GitHub.

---

## 🔐 Authenticated Reporting

Report submission is tied to authenticated user sessions.

This creates a stronger foundation than anonymous unrestricted writes.

---

## 👍 Protected Confirmations

Confirmation integrity includes protections against:

```text
Self-confirmation              ❌

Repeated confirmation          ❌

Confirming resolved issues     ❌

Unauthorized confirmation      ❌
```

---

## 🏛️ Protected Status Workflow

Citizens cannot simply declare civic problems resolved.

Administrative status changes are authorization-controlled.

---

# 💾 Smart Draft Persistence

FixMyCity also handles an often-overlooked UX/security problem.

Imagine:

```text
User A logs in
      ↓
Uploads civic image
      ↓
AI analyzes it
      ↓
User navigates away
```

The unfinished draft should not disappear unnecessarily.

So useful draft persistence is supported.

But now imagine:

```text
User A creates draft
      ↓
User A logs out
      ↓
User B logs in on SAME browser
```

User B must **never inherit User A's unfinished report**.

The logout flow therefore clears/isolates temporary report state while preserving useful same-session draft behavior.

```text
Same user + normal navigation
            ↓
        Draft stays ✅


Logout / account change
            ↓
Previous authenticated draft cleared/isolated ✅
```

---

# 🎯 What Makes FixMyCity Different?

There are many complaint forms.

FixMyCity focuses on what happens **around and after the form**.

| Typical Complaint Form | FixMyCity |
|---|---|
| User manually describes everything | AI assists report understanding |
| Free-text location | Geographic context |
| Same issue submitted repeatedly | Duplicate intelligence |
| Duplicate = another database row | Duplicate can become confirmation |
| No community signal | Community verification |
| One-language experience | Multilingual report accessibility |
| Submit and forget | Visible issue lifecycle |
| Anyone-facing UI may imply control | Citizen/Admin responsibilities separated |
| Status is just text | Controlled resolution workflow |
| Reports viewed individually | Map + dashboard context |

---

# 🧩 Engineering Challenges We Solved

## Challenge 1 — “Same Image” Does Not Always Mean “Same Issue”

A simplistic duplicate system could say:

```text
Same image hash?
YES → Duplicate
```

But imagine the same image being associated with completely different claimed locations.

Image equality alone cannot safely define a real-world incident.

The system therefore evolved toward using **geographic and issue context**, with image fingerprinting as an additional signal.

---

## Challenge 2 — Different Images Can Represent the Same Problem

Two citizens photograph the same pothole:

```text
Citizen A 📷 → Front angle

Citizen B 📷 → Side angle
```

Different files.

Same civic issue.

That is why nearby location and issue similarity matter.

---

## Challenge 3 — Nearby Does Not Automatically Mean Duplicate

```text
Location: Same street

Issue A → Pothole

Issue B → Garbage

Issue C → Broken streetlight
```

All nearby.

All different.

Geographic proximity must be combined with issue context.

---

## Challenge 4 — Duplicate Prevention Should Not Destroy User Trust

Simply displaying:

```text
ERROR: DUPLICATE
```

is poor UX.

The citizen has taken time to report something important.

FixMyCity instead explains that an issue may already exist and gives the citizen useful choices:

```text
Confirm Existing Issue

View Existing Issue

Cancel
```

---

## Challenge 5 — Upvotes Must Mean Something

If users could:

- Upvote themselves
- Click repeatedly
- Confirm resolved issues

then confirmation counts would become meaningless.

The system therefore enforces confirmation rules beyond the visual interface.

---

## Challenge 6 — Translation Must Not Break Business Logic

If every translated version overwrote the original report:

```text
English
   ↓
Kannada
   ↓
Hindi
   ↓
Tamil
```

meaning could drift and internal categories could become unstable.

FixMyCity preserves canonical report values and treats translation primarily as a user-facing accessibility feature.

---

## Challenge 7 — Draft Convenience vs User Privacy

Draft persistence is useful.

Cross-account draft leakage is not.

FixMyCity preserves drafts during normal same-user navigation while cleaning/isolating temporary state during logout/account changes.

---

# 🗃️ Conceptual Data Model

At a high level:

```text
AUTHENTICATED USER
        │
        │ submits
        ▼
┌──────────────────────┐
│    CIVIC REPORT      │
│                      │
│ Evidence             │
│ Location             │
│ Coordinates          │
│ Issue                │
│ Category             │
│ Severity             │
│ Status               │
│ Confirmation Count   │
│ AI Context           │
└──────────┬───────────┘
           │
           │ has
           ▼
┌──────────────────────┐
│   CONFIRMATIONS      │
│                      │
│ Report               │
│ Confirming User      │
└──────────────────────┘
```

This separation allows one real-world report to accumulate community validation without requiring multiple duplicate civic report rows.

---

# 📈 From Raw Complaints to Civic Intelligence

FixMyCity attempts to transform:

```text
"I saw something broken."
```

into:

```text
WHAT happened?

WHERE did it happen?

HOW serious might it be?

HAS someone already reported it?

HOW many citizens confirm it?

WHAT is its current status?

HAS action started?

WAS it resolved?
```

That is the difference between **collecting complaints** and **building civic intelligence**.

---

# 🚀 Run FixMyCity Locally

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/Sujith-BN/civic-eye-ai-35.git
cd civic-eye-ai-35
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

---

## 3️⃣ Configure Environment Variables

Use the example environment files included in the repository.

Typical server-side configuration includes values for:

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
GEMINI_API_KEY
OPENROUTER_API_KEY
```

Use your own valid credentials.

> ⚠️ Never commit real API keys or secrets.

---

## 4️⃣ Start Development

```bash
npm run dev
```

Open the local URL shown by the development server.

---

## 5️⃣ Type Check

```bash
npx tsc --noEmit
```

---

## 6️⃣ Production Build

```bash
npm run build
```

---

# 🗄️ Database Setup

The repository contains Supabase migration files used to establish or evolve database functionality.

These include logic related to features such as:

- Civic reports
- Confirmations
- Status workflow
- Duplicate detection
- Image fingerprint-based duplicate support

When setting up a fresh Supabase project, migrations should be applied in the correct chronological/dependency order.

Do not expose service credentials in source control.

---

# ☁️ Deployment

FixMyCity is deployed using Cloudflare-compatible server infrastructure.

### Production Application

🌐 **https://sujith-bn-civic-eye-ai-35.sujith-bn.workers.dev/**

The application uses a production build generated through the project's Vite/Nitro setup.

Sensitive environment variables must be configured securely in the deployment environment.

---

# 🎬 Demo Story

The project demo is intentionally structured as a story.

### 1 — Can anyone submit?

A logged-out citizen explores the reporting flow.

At submission, authentication is required.

---

### 2 — Verified reporting

The citizen signs in and submits a civic issue.

---

### 3 — AI assistance

The uploaded evidence is analyzed and transformed into structured civic information.

---

### 4 — Language accessibility

The generated report is displayed in another supported language.

---

### 5 — What if the issue already exists?

The system detects a potential existing nearby issue.

Instead of blindly creating another complaint, the citizen can confirm the existing issue.

---

### 6 — Who actually resolves it?

An authorized administrative workflow moves the issue:

```text
REPORTED
    ↓
IN_PROGRESS
    ↓
RESOLVED
```

That completes the story.

### 🎥 Watch the Demo

**https://youtu.be/CJ9JKH-F_kE**

---

# 🧪 Important Scenarios Covered

```text
✅ Authenticated report submission

✅ AI-assisted civic issue analysis

✅ Geographic report context

✅ Multilingual generated-report display

✅ Nearby duplicate detection

✅ Existing issue confirmation

✅ Self-confirmation prevention

✅ Repeated-confirmation prevention

✅ Resolved-confirmation prevention

✅ New reports after historical resolution where appropriate

✅ Citizen/Admin workflow separation

✅ Report lifecycle management

✅ Draft persistence during normal navigation

✅ Draft cleanup/isolation on logout

✅ Responsive reporting experience

✅ Production TypeScript build validation
```

---

# 🔮 Where FixMyCity Can Go Next

The current project demonstrates the core civic reporting lifecycle.

A real municipal-scale version could expand much further.

---

## 🏛️ Government / Municipal Integration

Automatically route verified reports to:

```text
Road Department

Waste Management

Water Board

Electrical Department

Public Works

Other jurisdiction-specific authorities
```

---

## 🔔 Citizen Notifications

Citizens could receive updates such as:

```text
Your report was received.

Your issue is now IN_PROGRESS.

A civic team has been assigned.

Your issue has been RESOLVED.
```

---

## 📊 Ward-Level Analytics

Authorities could analyze:

- Issue density by ward
- Average response time
- Recurring infrastructure failures
- Most-confirmed issue categories
- Resolution performance
- Geographic hotspots

---

## 🔥 Civic Heatmaps

Community confirmations and severity could help visualize areas requiring urgent attention.

---

## 🧠 Smarter Visual Similarity

Future duplicate detection could combine:

```text
Geographic Distance
        +
Issue Classification
        +
Image Embeddings
        +
Visual Similarity
        +
Temporal Context
```

This could identify the same physical issue even across very different photographs.

---

## 📱 Native Mobile Experience

A dedicated mobile app could support:

```text
Take photo
    ↓
Auto-location
    ↓
AI analysis
    ↓
One-tap reporting
```

---

## 📡 Real-Time Authority Operations

Municipal teams could use operational dashboards for:

- Assignment
- Escalation
- SLA tracking
- Field-team updates
- Before/after evidence
- Resolution verification

---

## 🔔 Smart Citizen Alerts

Citizens near an existing issue could potentially be informed:

> “A civic issue has already been reported nearby. Can you verify whether it still exists?”

This could turn passive citizens into a distributed civic verification network.

---

# 🌍 Potential Real-World Impact

Imagine FixMyCity operating across a city.

Thousands of citizens submit reports.

But instead of creating thousands of disconnected complaints:

```text
Raw Citizen Reports
        ↓
AI Structuring
        ↓
Geographic Clustering
        ↓
Duplicate Reduction
        ↓
Community Verification
        ↓
Priority Signals
        ↓
Authority Workflow
        ↓
Resolution Data
```

The result is not merely a complaint database.

It becomes a living map of:

- What is broken
- Where it is broken
- How serious it may be
- How many people are affected
- Whether authorities are acting
- Whether the problem was resolved

That is the larger vision behind FixMyCity.

---

# 💭 The Idea in One Example

### Without FixMyCity

```text
10 citizens
      ↓
10 pothole complaints
      ↓
Different descriptions
      ↓
Duplicate records
      ↓
No shared priority signal
      ↓
Unclear progress
```

### With FixMyCity

```text
10 citizens
      ↓
1 citizen creates structured report
      ↓
AI helps understand the issue
      ↓
Location identifies geographic context
      ↓
9 citizens encounter existing issue
      ↓
Community confirmations increase
      ↓
Issue becomes stronger civic signal
      ↓
Authority moves it to IN_PROGRESS
      ↓
Problem fixed
      ↓
RESOLVED
```

### One issue.

### One source of truth.

### Many citizen voices.

---

# 🏆 Why We Built FixMyCity

Smart cities do not begin with futuristic hardware.

They begin with something simpler:

> **Knowing what citizens are experiencing.**

The challenge is turning those experiences into information that can actually drive action.

FixMyCity explores a future where:

```text
AI makes reporting easier.

Geolocation makes reports precise.

Duplicate intelligence reduces noise.

Community verification creates signal.

Multilingual access increases inclusion.

Transparent status builds accountability.

Authorities turn reports into action.
```

---

<div align="center">

<br>

# 🏙️ FixMyCity

## **See it. Report it. Fix it.**

### AI-Powered • Community-Verified • Action-Driven

<br>

**REPORT**

↓

**VERIFY**

↓

**PRIORITIZE**

↓

**RESOLVE**

<br>

### 🌐 [Launch FixMyCity](https://sujith-bn-civic-eye-ai-35.sujith-bn.workers.dev/)

### 🎥 [Watch the Demo](https://youtu.be/CJ9JKH-F_kE)

### 💻 [Explore the Source](https://github.com/Sujith-BN/civic-eye-ai-35)

<br>

**Built for Hackathon 2026**

*Smarter civic reporting. Stronger communities. Better cities.*

</div>
