# Design Brief & UI/UX Guidelines (DESIGN_BRIEF)
## Centralized Document Management Information System (CDMIS)

---

## 1. Design Philosophy & Aesthetic Identity

The visual design of CDMIS adheres to an **Institutional-Grade Enterprise Aesthetic**. The user interface balances high-density information architecture required by university archivists with the clarity, responsiveness, and polished micro-interactions expected of modern software.

### Core Visual Principles
1. **Clarity Over Clutter:** High-density tabular views utilize subtle row dividers, muted table headers, and truncated cells with full tooltip inspection.
2. **Contextual Color Coding:** Strong semantic color discipline ensures users can instantly parse document restrictions (Green for Public, Red for Confidential) and request statuses (Orange for Pending, Green for Approved, Red for Rejected).
3. **Accessibility & Contrast:** High-contrast text labels (`#1F2937` on `#FFFFFF`, `#F3F4F6` containers) and WCAG 2.1 AA compliant badges.
4. **Responsive Fluidity:** Adapts from mobile phone viewports up to 4K displays without breaking layout integrity or truncating vital buttons.

---

## 2. Color Palette & Semantic Token Architecture

```
+---------------------------------------------------------------------------------------+
|                                    COLOR PALETTE                                      |
|                                                                                       |
|  [ PRIMARY BRAND ]     [ SIDEBAR & CANVAS ]   [ SUCCESS ]     [ ALERT & WARNING ]     |
|  Indigo-600: #4F46E5   Slate-800: #1E293B     Emerald-500:    Amber-500: #F59E0B      |
|  Indigo-700: #4338CA   Slate-900: #0F172A     #10B981         Orange-500: #F97316     |
|                                                                                       |
|  [ SURFACE / BASE ]    [ DANGER / LOCKED ]    [ BADGE BG ]    [ DISCLOSURE NOTICE ]   |
|  White: #FFFFFF        Rose-600: #E11D48      Green-50:       Gray-200/60:            |
|  Gray-50: #F9FAFB      Red-100:  #FEE2E2      #ECFDF5         Subtle backdrop tint    |
+---------------------------------------------------------------------------------------+
```

| Semantic Token | Tailwind Class | Hex Value | Primary Usage |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | `bg-indigo-600`, `text-indigo-600` | `#4F46E5` | Primary buttons, active tabs, focus borders, key CTAs |
| **Navigation Canvas** | `bg-[#323c4f]` | `#323C4F` | Sidebar navigation background |
| **App Surface** | `bg-gray-100`, `bg-white` | `#F3F4F6` / `#FFFFFF` | Global app background and primary card surfaces |
| **Public Status Badge** | `bg-green-100 text-green-800` | `#DCFCE7` / `#166534` | "Public" document restriction indicators |
| **Confidential Badge** | `bg-red-100 text-red-800` | `#FEE2E2` / `#991B1B` | "Confidential" document restriction indicators |
| **Pending Status Badge**| `bg-orange-100 text-orange-800` | `#FFEDD5` / `#9A3412` | Pending access requests awaiting review |
| **Approved Status Badge**| `bg-green-100 text-green-800` | `#DCFCE7` / `#166534` | Approved requests, valid permissions |
| **Form Input Background**| `bg-gray-800 text-white` | `#1F2937` / `#FFFFFF` | High-contrast input boxes in modal dialogs |

---

## 3. Typography & Hierarchy

The application employs standard system sans-serif typography (`font-sans`), ensuring native rendering speed across platforms:

- **Display Titles (Page / View Headers):** `text-2xl font-bold text-gray-800`
- **Section Headers (Cards & Groups):** `text-lg font-bold text-gray-800`
- **Table Column Headers:** `text-xs font-semibold text-gray-700 uppercase tracking-wider`
- **Body / Primary Cell Content:** `text-sm text-gray-900 font-medium`
- **Secondary Metadata / Timestamps:** `text-xs text-gray-500`
- **Code / Filenames:** `text-xs font-mono bg-gray-50 text-gray-600`

---

## 4. Visual Wireframes & UI Specifications

### 4.1 Responsive Login Screen Wireframe

```
+------------------------------------------+------------------------------------------+
|                                          |         Global Organization Inc.         |
|                                          |       123 Business Rd, Metropolis        |
|                                          |                                          |
|                                          |  Centralized Document Management System  |
|                                          |                                          |
|                                          |  +------------------------------------+  |
|                                          |  | Login to your account              |  |
|                                          |  |                                    |  |
|                                          |  | Employee ID:                       |  |
|               HERO IMAGE                 |  | [ EMP - 0123                     ] |  |
|       (Enterprise Architecture)          |  |                                    |  |
|                                          |  | Password:                          |  |
|         [ Hidden on Mobile ]             |  | [ • • • •                        ] |  |
|                                          |  |                                    |  |
|                                          |  | [         SIGN IN BUTTON         ] |  |
|                                          |  |                                    |  |
|                                          |  | ----- DEMO ACCESS (ONE-CLICK) ---- |  |
|                                          |  | [ Admin ]  [ IT Custodian ]        |  |
|                                          |  | [ HR Custodian ]  [ Staff User ]   |  |
|                                          |  +------------------------------------+  |
|                                          |                                          |
|                                          |  (c) 2026 Global Organization Inc.       |
|                                          |  [ Note: Sanitized university demo... ]  |
+------------------------------------------+------------------------------------------+
```

---

### 4.2 Application Shell & Dashboard Layout

```
+----------------+--------------------------------------------------------------------+
| CDMIS - DEMO   | [=] Toggle   Search archives...         (3) [Bell]   [Admin User v] |
+----------------+--------------------------------------------------------------------+
|                |                                                                    |
| [o] Dashboard  |  +--------------------------------------------------------------+  |
|                |  | Good Morning, Admin User!                                    |  |
| [*] Documents  |  | Welcome to your dashboard. Thursday, October 15, 2026        |  |
|                |  +--------------------------------------------------------------+  |
| [u] Users      |                                                                    |
|                |  +-------------+  +-------------+  +-------------+  +-----------+  |
| [d] Depts      |  | Total Docs  |  | Total Users |  | Pending Req |  | Depts     |  |
|                |  | 142         |  | 28          |  | 4           |  | 12        |  |
| [i] Requests   |  +-------------+  +-------------+  +-------------+  +-----------+  |
|                |                                                                    |
| [n] Notifs     |  +------------------------------------+  +----------------------+  |
|                |  | System Statistics                  |  | Recent System Logs   |  |
| [a] Audit Log  |  | [ Pie Chart: Docs by Dept ]        |  | * Upload: Q1 Fin Rep |  |
|                |  | [ Bar Chart: Volume Distribution ] |  | * Request: EMP-0345  |  |
|                |  +------------------------------------+  +----------------------+  |
+----------------+--------------------------------------------------------------------+
```

---

### 4.3 In-App Document Viewer & Zoom Modal

```
+-------------------------------------------------------------------------------------+
| [Doc Title: Q1 Financial Report 2023]  (q1_report.pdf)     [-] 100% [+] [Reset] [X]|
+----------------------------------------------------------+--------------------------+
|                                                          | DOCUMENT DETAILS         |
|                                                          |                          |
|                                                          | Title:                   |
|                   PDF EMBED / IMAGE                      | Q1 Financial Report 2023 |
|                     VIEWING CANVAS                       |                          |
|                                                          | Uploader:                |
|               (Smooth Zoom 50% - 300%)                   | Admin User               |
|                                                          |                          |
|             [ Interactive Scroll & Pan ]                 | Upload Date:             |
|                                                          | 2026-01-15 10:00 AM      |
|                                                          |                          |
|                                                          | Classification:          |
|                                                          | [ Confidential ]         |
|                                                          |                          |
|                                                          | Department:              |
|                                                          | Administration           |
|                                                          |                          |
|                                                          | Filename:                |
|                                                          | q1_financial_report.pdf  |
+----------------------------------------------------------+--------------------------+
```

---

### 4.4 NAP Form 1 Records Inventory Ingestion Modal

```
+-------------------------------------------------------------------------------------+
| Document Inventory Form (NAP Form 1 Standard)                                   [X] |
+-------------------------------------------------------------------------------------+
| [1] OFFICE INFORMATION                                                              |
| Office: [ GLOBAL ORGANIZATION INC. ]    Dept: [ IT Department           ]           |
| Phone:  [ 053-500-9045             ]    Email:[ records@organization.com ]          |
| Person-in-Charge: [ Current Custodian ] Prepared Date: [ 2026-10-15     ]           |
+-------------------------------------------------------------------------------------+
| [2] RECORD SERIES DETAILS                                                           |
| Series Title: [ Enterprise Security Audit 2026                     *REQUIRED ]      |
| Description:  [ Comprehensive annual IT network and data audit logs          ]      |
| Period: [ 2025-2026 ]  Volume: [ 2 Binders ]  Medium: [ Digital/Paper        ]      |
| Restrictions: [ Open Access v ]  Location: [ Server Room Vault B             ]      |
| Frequency of Use: [ Once a month v ]  Duplication: [ Backup on Cloud Storage ]      |
+-------------------------------------------------------------------------------------+
| [3] APPRAISAL & VALUATION                                                           |
| Time Value:    (o) Temporary   ( ) Permanent                                        |
| Utility Value: [x] Administrative  [ ] Fiscal  [x] Legal  [ ] Archival              |
| Retention:     Active: [ 2 ] yrs   Storage: [ 3 ] yrs   Total: [ 5 ] yrs (Auto)     |
| Disposition:   [ Archival Transfer after 5 Years                             ]      |
+-------------------------------------------------------------------------------------+
| [4] DIGITAL ATTACHMENT & CLASSIFICATION                                             |
| Category: [ Report v ]  Restriction: [ Confidential v ]  Tags: [ it, security, log ]|
| +---------------------------------------------------------------------------------+ |
| |                    Drag & Drop File Here (PDF, TIFF < 10MB)                     | |
| +---------------------------------------------------------------------------------+ |
|                                                                                     |
|                                                [  Cancel  ]  [  Save Record CTA  ]  |
+-------------------------------------------------------------------------------------+
```

---

## 5. Responsive Design Breakpoints

| Breakpoint | Window Width | Layout Adaptations |
| :--- | :--- | :--- |
| **Mobile (`<640px`)** | 360px &ndash; 639px | Sidebar collapses into off-canvas drawer; Login hero image hidden; Form inputs stack vertically into single column; Document viewer zoom controls simplified. |
| **Tablet (`640px - 1023px`)** | 640px &ndash; 1023px | Dual-column form grids; Sidebar toggleable with backdrop overlay; Top navigation icons visible. |
| **Desktop (`1024px+`)** | 1024px &ndash; 1440px | Split 50/50 login screen; Persistent 256px sidebar; Full multi-column NAP Form 1 layout; Side-by-side metadata drawer in viewer. |
| **Ultrawide (`>1440px`)** | 1440px+ | Max-width content boundaries (`max-w-7xl` / `max-w-6xl`) to avoid excessive horizontal line lengths. |
