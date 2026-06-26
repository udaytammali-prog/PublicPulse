# PublicPulse 🌐
### Civic Intelligence & Neighborhood Coordination Platform

> **Project Submission Document**  
> *This document details the problem statement, solution overview, core workflows, visual diagrams, and Google technologies utilized by PublicPulse. You can easily copy and paste the contents of this file into your Google Doc submission.*

---

## 🔗 Project Submission Details
* **Project Name:** PublicPulse
* **Project Description Google Doc Link:** [Insert Your Shared Google Doc Link Here]
* **Target Neighborhood/Area:** Jubilee Hills, Hyderabad (and adaptable to any local community)
* **Target Audience:** Civic-minded residents, community representatives, and municipal dispatchers.

---

## 📌 1. Problem Statement Selected

Traditional municipal reporting channels and complaint resolution systems are plagued by multiple systemic challenges that separate local citizens from timely public action:

1. **Vague and Inaccurate Reports:** Citizens filing reports manually often input vague titles, select incorrect categories, or fail to describe issues comprehensively. This leads to administrative confusion, misallocated labor, and slow response times.
2. **Duplicate Report Overload:** When an issue (e.g., a major water main burst or pothole on a busy road) occurs, dozens of citizens independently file identical reports. This floods the municipal dashboard, overwhelming dispatchers with duplicate entries rather than consolidating community concern into a single high-priority ticket.
3. **Subjective Priority Ranking:** Traditional systems sort issues on a first-come, first-served basis rather than analyzing risk. A dangerous open pothole on a high-speed lane can wait behind a minor aesthetic issue, leading to accidents and safety hazards.
4. **Disconnection from Local Services:** Civic platforms rarely bridge public problems with private resolution. If a citizen's driveway is blocked or a sewer pipe is leaking, they must hunt down vetted technicians or municipal helpers on external channels, delaying assistance.
5. **Authenticity & Anonymity Barriers:** Citizens lack localized identity verification. Legacy apps use generic profile avatars, limiting the accountability and trustworthiness of community-driven reporting.

---

## 💡 2. Solution Overview

**PublicPulse** is a full-stack, AI-driven civic coordination platform designed to transform community crowdsourcing into verified, structured, and prioritized action. 

By integrating **Gemini 3.5 Flash** directly into the core workflow, PublicPulse replaces manual, error-prone filing with **multimodal AI analysis**. When a resident uploads a photo or describes a civic issue, Gemini automatically suggests an accurate category, generates a professional short title, detects duplicates, and assigns an objective severity score.

Rather than fragmenting the community with repetitive reports, PublicPulse encourages **Community Co-Verification (Upvoting)**. Residents can verify existing reports with a single tap (e.g., "Still there"), instantly signaling urgency to municipal dispatchers while automatically recalculating the issue's priority score.

### Core Value Pillars:
* **Intelligence-First Reporting:** Instant, multimodal auto-classification of street issues using image-to-text semantic matching.
* **Dynamic Priority Scoring Heuristics:** Algorithmic prioritization incorporating baseline category weights, active community upvotes, open duration, and geographic cluster densities.
* **Spatial and Metrics Visibility:** High-fidelity custom map coordinates and a responsive Impact Dashboard tracking community resolution rates.
* **Neighborhood Service Directory:** Direct connections to reviewed local service providers to quickly resolve personal and neighborhood blockages.
* **Authentic Citizen Profiles:** Upgraded profile editing with support for custom base64 image uploading to encourage authentic neighbor interactions.

---

## 🛠️ 3. Technologies Used

### Frontend Architecture
* **React 18 (Vite, TypeScript):** Formulates a robust, type-safe, componentized single-page application (SPA).
* **Tailwind CSS:** Powers the polished, high-contrast, fully responsive mobile-first UI theme (charcoal grays, clean borders, and generous white space).
* **Framer Motion / Tailwind Animate:** Drives elegant micro-animations, slide-ins, and page transitions for a seamless, application-like feel.
* **Lucide React:** Standardizes clean, vector-based line icons across all navigation, statuses, and action controls.

### Backend Infrastructure
* **Node.js & Express:** Implements the core REST APIs, dynamic coordinate generation, state modification engines, and third-party API routing.
* **In-Memory & LocalStorage Data Sync:** Ensures responsive real-time data flow on the server with client-side session persistence.

---

## ⚡ 4. Google Technologies Utilized

PublicPulse is heavily integrated with the Google Developer Ecosystem to automate civic intelligence and robust deployment:

### 1. Google Gemini 3.5 Flash Model
The backend implements the state-of-the-art `@google/genai` TypeScript SDK. Gemini 3.5 Flash is lazy-loaded and utilized via the server-side environment `GEMINI_API_KEY` for two major workflows:

* **Multimodal Civic Classifier (`/api/suggest-category`):**
  * Parses base64 uploaded image files (mimeType: `image/jpeg`) and accompanying text descriptions.
  * Evaluates the input against a strict JSON Schema returning a structured, validated JSON output.
  * Ensures categories are mapped to standardized strings (`"Pothole"`, `"Streetlight"`, `"Garbage"`, `"Water leakage"`, `"Blocked parking"`, `"Other"`) to prevent dispatch confusion.
  * Generates an immediate AI priority score based on risk analysis (e.g., water pipe leaks or road potholes get high-risk scores 85+ due to safety/environmental hazard, while garbage dumps get 40-70).
  * Synthesizes a clear, 1-sentence explanation of why the category and score were selected.

### 2. Google Cloud Run (Containerized Ingress)
* The application runs fully containerized on **Google Cloud Run**, serving traffic securely on the required port (`3000`) through an Nginx reverse proxy layer.
* Designed with native external dependency handling and optimized bundling (using `esbuild`) to eliminate server cold-starts, ensuring that API routing is highly responsive for active community users.

---

## 📋 5. Key Features & Workflows

### A. Core Features List
1. **Dynamic Home Feed:** Sorts reported community issues by dynamic priority score. Users can search issues, update their current neighborhood location (simulated GPS/geolocation), and filter active versus resolved problems.
2. **Interactive GPS Heatmap:** Places issues as markers on an interactive local coordinate grid, using color-coded severity rings to help users quickly visualize issue densities in Jubilee Hills.
3. **Smart Report Form:** Enables citizens to write a description, take/upload a real photo, and get instant suggestions from Gemini. They can override suggestions manually, adjust blockages details, and pin custom coordinates.
4. **Impact Dashboard:** Displays community metrics, including total resolved vs. unresolved issues, a breakdown of issues by category, Average Resolution Time (ART) metrics, and a "Citizen Contribution Streak" tracker to gamify local pride.
5. **Verified Service Directory:** Curates local handymen, electricians, and maids, listing reviews, average ratings, contact numbers, and showing how many neighbors have utilized their services.
6. **Custom Profile Management:** Supports standard user profiles with fully editable names, phone numbers, email addresses, and a custom **Real Photo Upload** (saving base64 strings to local state) to replace generic placeholder avatars.

---

## 📊 6. Workflow Diagrams

### Workflow 1: Multimodal Report Submission with Gemini Auto-Classification

When a user captures an issue (e.g., a pothole) and enters a brief description, PublicPulse leverages Gemini to auto-categorize, generate titles, and calculate baseline priority.

```
 [ Citizen User ]
        │
        ▼
 1. Uploads Photo & Description (React UI)
        │
        ▼
 2. API Call POST /api/suggest-category ──► [ Express Backend ]
                                                   │
                                                   ▼ (Payload Assembly)
                                           Checks GEMINI_API_KEY
                                                   │
                                                   ▼
                                           [ Gemini 3.5 Flash ]
                                                   │
                                                   ▼ (Strict Schema Analysis)
                                           • Standardize Category
                                           • Draft Clean Title
                                           • Risk Assessment
                                           • Formulate Explanation
                                                   │
                                                   ▼
 [ React Form UI ] ◄─────────────────── Returns JSON Response
        │
        ▼ (User reviews & submits)
 [ Express State Database ] (Unshifts new prioritized issue into feed)
```

---

### Workflow 2: Dynamic Heuristic Priority Scoring Engine

PublicPulse does not rely on a stagnant reporting model. Instead, every background tick and citizen interaction dynamically recalculates the issue's priority score.

```
 [ New Issue Created ] (Baseline priority weight, e.g., Water Leakage = 60)
         │
         ├───► Upvoted / Confirmed by Neighbor? (+1.5 points per vote, max +30)
         │
         ├───► Days / Hours Left Open? (+0.5 points per hour, max +10)
         │
         └───► Cluster Density? (Search within 15m radius, +5 points per similar issue, max +10)
         │
         ▼
 [ Dynamic Heuristic Equation ]
 Score = MIN(Category Weight + Upvote Bonus + Age Bonus + Cluster Bonus, 100)
         │
         ▼
 [ Impact Dashboard & Priority-Sorted Home Feed ]
 (Ensures urgent, heavily-verified issues instantly bubble to the top)
```

---

### Workflow 3: Application Navigation & Screen State Flow

PublicPulse utilizes a clean, single-screen tab-navigation framework wrapped inside a responsive container to provide an immersive mobile-app experience.

```
                ┌──────────────────────────────────┐
                │        App Initial Entry         │
                └─────────────────┬────────────────┘
                                  │
                                  ▼
                ┌──────────────────────────────────┐
                │  Authentication / Login Screen   │
                └─────────────────┬────────────────┘
                                  │
                                  ▼
                ┌──────────────────────────────────┐
                │       Primary Navigation         │
                │        (Tab State Menu)          │
                └──────┬───┬───┬───┬───┬───────────┘
                       │   │   │   │   │
     ┌─────────────────┘   │   │   │   └──────────────────┐
     ▼                     │   │   ▼                      ▼
┌──────────┐               │   │ ┌──────────┐       ┌──────────┐
│ Home     │               │   │ │ Services │       │ Profile  │
│ Feed     │               │   │ │ Directory│       │ Section  │
└───┬──────┘               │   │ └──────────┘       └────┬─────┘
    │                      │   │                         │
    ├─► Search & Filter    │   ▼                         ├─► Edit Details
    ├─► Upvote / Confirm   │ ┌──────────┐                └─► Real Photo Upload
    └─► View Detail Screen │ │ Dashboard│                    (Base64)
            │              │ │ (Metrics)│
            ▼              │ └──────────┘
      [Issue Details]      ▼
                     ┌──────────┐
                     │ Map View │
                     │ (Heatmap)│
                     └──────────┘
```

---

## 🌟 7. Final Alignment with User Requests

* **Problem Statement Selected:** Clear, concise details about vague citizen reporting and priority bottlenecks.
* **Solution Overview:** Comprehensive breakdown of the PublicPulse ecosystem.
* **Key Features:** Full specifications of all screens (Home, Map, Report, Dashboard, Services, Profile).
* **Technologies Used:** Modern Vite/React/Tailwind & Node.js/Express full-stack layout.
* **Google Technologies Utilized:** Detailed guide on the server-side integration of **Gemini 3.5 Flash** using the modern `@google/genai` library and deployment details.
* **Workflows and Diagrams:** Embedded visual Unicode flowcharts mapping logical steps for automated classification, priority scoring, and page routing.

*You can save and share this document, paste it into your Google Doc, or print it out as a technical project specification.*
