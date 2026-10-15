# Centralized Document Management Information System (CDMIS) - Portfolio Demo

> **Note:** This is a sanitized, zero-backend demonstration of an enterprise application originally built for a university Records and Archives Office. All sensitive organizational data, logos, and identities have been anonymized for public portfolio showcasing.

A fully functional frontend replica of a Document Management System. This demo showcases complex state management, multi-tier role-based workflows, and automated audit trails without requiring a live backend, utilizing a custom `localStorage` database engine to persist session data.

## ✨ Key Features
- **Role-Based Access Control (RBAC):** Distinct dashboards and permissions for System Admins, Department Records Custodians (DRC), and Staff.
- **Document Workflows:** Upload, review, approve, and archive lifecycle management.
- **Request Pipeline:** Staff can request access to restricted documents with approval routing to the respective Custodian.
- **Persistent Local Database:** All interactions (new documents, users, requests) are instantly saved to the browser's `localStorage`, simulating a real database experience across refreshes.
- **Audit Trails & Activity Logging:** Every action within the system is automatically tracked and timestamped.
- **Real-Time Notifications:** In-app notification center for pending requests and status changes.

## 📚 Project Documentation
Comprehensive architectural and engineering documentation with Mermaid diagrams:
- [📄 Product Requirements Document (PRD)](./PRD.md) - Vision, personas, functional specs, and NFRs.
- [⚙️ Technical Requirements Document](./TECHNICAL_REQUIREMENTS.md) - System architecture, persistence engine, and RBAC matrix.
- [🔀 Application Flow & User Journeys](./APP_FLOW.md) - Navigation maps, sequence diagrams, and lifecycle state machines.
- [🎨 Design Brief & UI/UX Guidelines](./DESIGN_BRIEF.md) - Design system, color tokens, and ASCII wireframes.
- [🗄️ Background Schema & Data Models](./BACKGROUND_SCHEMA.md) - Entity-Relationship diagram (ERD) and relational schemas.
- [📅 Implementation Plan & Roadmap](./IMPLEMENTATION_PLAN.md) - Gantt chart, milestones, WBS, and risk assessment.

## 🚀 Live Demo & Access

**Live Demo Link: https://cdmis-demo.netlify.app

### 🔐 Demo Credentials
The application includes a mock authentication system with seeded data. You can use the **"One-Click Login"** buttons on the portal, or log in manually with the following credentials:

| Role | Employee ID | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `EMP - 0123` | `admn` | Full system access, user management, global audit logs. |
| **IT Custodian** | `EMP - 0234` | `drc1` | Can manage and approve documents within the IT department. |
| **HR Custodian** | `EMP - 0235` | `drc2` | Can manage and approve documents within the HR department. |
| **Staff User** | `EMP - 0345` | `stf1` | Can view public documents and request access to restricted ones. |

## 🛠️ Tech Stack
- **Frontend Framework:** React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Build Tool:** Vite
- **Data Persistence:** Browser `localStorage` API (Zero-backend setup)

## 💻 Local Installation

To run this project locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cdmis-portfolio-demo.git
   ```
2. Navigate to the project directory:
   ```bash
   cd cdmis-portfolio-demo
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🔄 Resetting the Demo State
Since the application uses your browser's local storage to simulate a database, any changes you make (adding documents, users, etc.) will persist. 

To reset the application to its clean, original seeded state:
1. Open your browser's Developer Tools (F12).
2. Go to the **Application** (Chrome/Edge) or **Storage** (Firefox) tab.
3. Clear the `Local Storage` for the site.
4. Refresh the page. (Alternatively, just open the app in a new Incognito/Private window).
