\# 🏙️ FixMyCity — AI-Powered Civic Intelligence Platform



FixMyCity is an AI-powered civic issue reporting and tracking platform that helps citizens report real-world infrastructure problems, uses AI to intelligently analyze and prioritize them, enables community verification, and provides a transparent workflow from \*\*reported issue to resolution\*\*.



\### 🚀 Live Demo



👉 \*\*\[Open FixMyCity Live](https://sujith-bn-civic-eye-ai-35.sujith-bn.workers.dev/)\*\*



\---



\## 🎯 The Problem



Civic problems such as potholes, damaged roads, garbage accumulation, broken streetlights, water leaks, and other public infrastructure issues are often difficult to report and track effectively.



Traditional complaint systems can suffer from:



\- Unstructured or incomplete complaints

\- Duplicate reports for the same issue

\- Lack of accurate location information

\- Difficulty identifying high-priority issues

\- Limited transparency about issue status

\- No easy way for citizens to verify that others are experiencing the same problem



FixMyCity aims to turn a simple citizen report into \*\*structured, actionable civic intelligence\*\*.



\---



\## 💡 The Solution



FixMyCity provides a complete civic reporting workflow:



```text

Citizen spots a civic issue

&#x20;       ↓

📸 Uploads an image

&#x20;       ↓

📍 Adds GPS or manual location

&#x20;       ↓

🤖 AI analyzes the issue

&#x20;       ↓

Category • Severity • Safety Risk • Department

&#x20;       ↓

📋 Structured civic report generated

&#x20;       ↓

🗺️ Report appears on Civic Map and Dashboard

&#x20;       ↓

👥 Other authenticated citizens can confirm the issue

&#x20;       ↓

🚨 Authorities get prioritized civic intelligence

&#x20;       ↓

🏛️ Status tracking

REPORTED → IN\_PROGRESS → RESOLVED

```



\---



\## ✨ Key Features



\### 🤖 AI-Powered Civic Issue Analysis



Citizens can upload an image of a civic problem and FixMyCity uses AI to analyze it.



The AI generates structured information including:



\- Detected issue

\- Category

\- Severity

\- Safety risk

\- Responsible department

\- Confidence score

\- AI reasoning



This transforms an ordinary complaint into structured civic data.



\### 📍 Smart Location Reporting



Users can:



\- Use their current GPS location

\- Select a location using the map

\- Enter an address manually



GPS coordinates are preserved internally for accurate map positioning while the user is shown a more readable location/address.



\### 🗺️ Civic Map



Reported civic issues are visualized geographically so citizens and authorities can understand where problems are occurring.



Reports include information such as:



\- Issue type

\- Severity

\- Status

\- Location

\- Community confirmations



\### 👥 Community Issue Confirmation



FixMyCity uses civic verification instead of simple social-media-style voting.



Other authenticated citizens can \*\*Confirm Issue\*\* when they have also observed the same problem.



The system prevents:



\- Users from confirming their own reports

\- The same user from confirming the same report multiple times



Confirmations are stored in the database and linked to authenticated users.



\### 📊 Civic Intelligence Dashboard



The dashboard provides an overview of reported civic issues including:



\- Active reports

\- Critical issues

\- Resolved issues

\- Community confirmations



This helps transform individual complaints into useful civic intelligence.



\### 🔄 Issue Resolution Lifecycle



FixMyCity supports a simple civic issue lifecycle:



```text

REPORTED

&#x20;  ↓

IN\_PROGRESS

&#x20;  ↓

RESOLVED

```



Authorized civic administrators can update issue status.



Normal citizens cannot arbitrarily mark issues as resolved.



\### 🔐 Google Authentication



FixMyCity supports authentication using Google through Supabase Auth.



Authentication enables:



\- Secure report ownership

\- Authenticated civic reports

\- Community confirmations

\- Prevention of self-confirmation

\- Admin-protected status updates



\### 💾 Report Draft Persistence



Report progress is preserved when navigating between pages.



Draft information such as location, description, analysis, and image state can be retained so users do not accidentally lose their work.



\### 📱 Responsive Design



FixMyCity is designed to work across:



\- Desktop

\- Tablet

\- Mobile



\---



\## 🧠 How AI Is Used



AI is used to assist civic issue triage.



Instead of simply storing:



> "There is a pothole here."



FixMyCity can transform the report into structured information such as:



```text

Detected Issue: Road Pothole

Category: Road Infrastructure

Severity: HIGH

Safety Risk: Vehicle damage and accident risk

Department: Roads / Public Works

Confidence: 94%

```



This can help authorities understand and prioritize reports more efficiently.



AI assists with \*\*classification and prioritization\*\*.



It does not automatically claim that a physical civic issue has been resolved.



\---



\## 🏗️ Architecture



```text

&#x20;                   ┌─────────────────────┐

&#x20;                   │      Citizen        │

&#x20;                   └──────────┬──────────┘

&#x20;                              │

&#x20;                              ▼

&#x20;                ┌───────────────────────────┐

&#x20;                │   React + TanStack Start  │

&#x20;                │      FixMyCity UI         │

&#x20;                └─────────────┬─────────────┘

&#x20;                              │

&#x20;            ┌─────────────────┼─────────────────┐

&#x20;            │                 │                 │

&#x20;            ▼                 ▼                 ▼

&#x20;    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐

&#x20;    │ Google OAuth │   │  AI Analysis │   │ Location/Map │

&#x20;    │ Supabase Auth│   │ Gemini / AI  │   │ Leaflet/OSM  │

&#x20;    └──────┬───────┘   └──────────────┘   └──────────────┘

&#x20;           │

&#x20;           ▼

&#x20;    ┌─────────────────────┐

&#x20;    │      Supabase       │

&#x20;    │ PostgreSQL + Auth   │

&#x20;    └──────────┬──────────┘

&#x20;               │

&#x20;       ┌───────┴────────┐

&#x20;       ▼                ▼

&#x20; ┌───────────┐    ┌──────────────┐

&#x20; │ Civic Map │    │  Dashboard   │

&#x20; └───────────┘    └──────┬───────┘

&#x20;                         │

&#x20;                         ▼

&#x20;             REPORTED → IN\_PROGRESS → RESOLVED

```



\---



\## 🛠️ Tech Stack



\### Frontend / Full Stack



\- React

\- TypeScript

\- TanStack Start

\- Vite



\### Backend \& Database



\- Supabase

\- PostgreSQL

\- Supabase Authentication

\- Row Level Security / authenticated database operations



\### Artificial Intelligence



\- Google Gemini

\- AI provider fallback architecture where configured



\### Maps \& Location



\- Leaflet

\- OpenStreetMap

\- Browser Geolocation

\- Reverse geocoding



\### Authentication



\- Google OAuth

\- Supabase Auth



\### Deployment



\- Cloudflare Workers



\---



\## 🚀 Running FixMyCity Locally



\### 1. Clone the Repository



```bash

git clone https://github.com/Sujith-BN/civic-eye-ai-35.git

cd civic-eye-ai-35

```



\### 2. Install Dependencies



```bash

npm install

```



\### 3. Configure Environment Variables



The repository contains example environment files.



Copy:



```text

.env.example

```



to:



```text

.env

```



And copy:



```text

.dev.vars.example

```



to:



```text

.dev.vars

```



Fill in your own credentials.



\### Client-Side Environment Variables



Example `.env`:



```env

VITE\_SUPABASE\_URL=your\_supabase\_project\_url

VITE\_SUPABASE\_PUBLISHABLE\_KEY=your\_supabase\_publishable\_key

```



\### Server-Side Environment Variables



Example `.dev.vars`:



```env

SUPABASE\_URL=your\_supabase\_project\_url

SUPABASE\_PUBLISHABLE\_KEY=your\_supabase\_publishable\_key



GEMINI\_API\_KEY=your\_gemini\_api\_key

OPENROUTER\_API\_KEY=your\_openrouter\_api\_key

```



Never commit real `.env` or `.dev.vars` files.



\### 4. Start Development Server



```bash

npm run dev

```



Open the local URL displayed by Vite.



\---



\## 🗄️ Supabase Setup



FixMyCity uses Supabase for:



\- PostgreSQL database

\- Google authentication

\- Report storage

\- Authenticated report ownership

\- Community confirmations

\- Secure status updates



A database migration is included at:



```text

supabase/migrations/20260719\_civic\_confirmations\_and\_status.sql

```



It adds the community confirmation system and secure status-management functions required by the application.



Run the required SQL migration against your own Supabase project before testing those features.



\---



\## 🔑 Google OAuth Setup



To use Google authentication locally or in your own deployment:



1\. Create/configure a Google OAuth application.

2\. Enable the Google provider in Supabase Authentication.

3\. Configure the required Supabase callback URL in Google OAuth.

4\. Configure your allowed application redirect URLs in Supabase.



OAuth credentials and secrets should never be committed to the repository.



\---



\## 🛡️ Security



FixMyCity includes several security-focused design decisions:



\- Secret AI API keys remain server-side

\- Supabase authentication identifies report owners

\- The browser cannot arbitrarily choose another user's `submitter\_id`

\- Users cannot confirm their own civic reports

\- Duplicate confirmations from the same authenticated user are prevented

\- Civic status updates are protected by authenticated admin authorization

\- Real environment files are excluded from Git



The Supabase publishable key used by client applications is not treated as a secret. Database security should be enforced through authentication, authorization, RLS, and protected server/database operations.



\---



\## 🎬 Hackathon Demo Flow



A simple end-to-end demonstration:



```text

1\. Login using Google



2\. Open "Report Issue"



3\. Upload an image of a civic problem



4\. Add location using GPS, map, or manual address



5\. Run AI analysis



6\. Review:

&#x20;  • Issue

&#x20;  • Category

&#x20;  • Severity

&#x20;  • Safety Risk

&#x20;  • Department

&#x20;  • Confidence



7\. Generate and submit the civic report



8\. View the issue on Civic Map / Dashboard



9\. Another authenticated citizen confirms the issue



10\. Authorized civic administrator updates:



&#x20;   REPORTED

&#x20;      ↓

&#x20;   IN\_PROGRESS

&#x20;      ↓

&#x20;   RESOLVED



11\. Dashboard statistics reflect the updated civic data

```



\---



\## 📸 Screenshots



Screenshots of the following can be added here:



\- Home Page

\- AI Issue Analysis

\- Civic Report Generation

\- Civic Map

\- Civic Intelligence Dashboard



\---



\## 🔮 Future Scope



FixMyCity can be extended with:



\- Direct integration with municipal complaint systems

\- Automatic department routing

\- Duplicate issue detection using image/location similarity

\- Issue clustering and civic heatmaps

\- Authority notifications

\- Resolution evidence / before-and-after images

\- Citizen notifications when an issue status changes

\- SLA tracking for civic departments

\- Advanced analytics for city planning

\- Multi-city and multilingual expansion



\---



\## 🌐 Live Application



\*\*FixMyCity — AI-Powered Civic Intelligence Platform\*\*



👉 https://sujith-bn-civic-eye-ai-35.sujith-bn.workers.dev/



\---



\## 👨‍💻 Author



\*\*Sujith B N\*\*



Built as a hackathon project focused on using AI and modern web technologies to improve civic issue reporting, community verification, prioritization, and resolution transparency.



\---



\## ⭐ Project Vision



> Turn every civic complaint into structured, verifiable, and actionable civic intelligence.



\*\*Report. Verify. Prioritize. Resolve.\*\*

