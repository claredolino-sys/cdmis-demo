# Application Flow & User Journeys (APP_FLOW)
## Centralized Document Management Information System (CDMIS)

---

## 1. Global Navigation & View Routing Flowchart

The following diagram illustrates how users navigate the application from entry to their respective role-based viewports:

```mermaid
flowchart TD
    Start([User visits CDMIS URL]) --> CheckAuth{Is Authenticated?}

    CheckAuth -- No --> LoginPage[Login Screen]
    
    subgraph LoginView [Authentication Options]
        LoginPage --> ManualLogin[Enter EMP-XXXX & Password]
        LoginPage --> QuickDemo[Click One-Click Demo Button]
        QuickDemo --> DemoAdmin[Admin: EMP-0123 / admn]
        QuickDemo --> DemoIT[IT Custodian: EMP-0234 / drc1]
        QuickDemo --> DemoHR[HR Custodian: EMP-0235 / drc2]
        QuickDemo --> DemoStaff[Staff User: EMP-0345 / stf1]
    end

    ManualLogin --> ValidateAuth{Credentials Valid?}
    DemoAdmin --> ValidateAuth
    DemoIT --> ValidateAuth
    DemoHR --> ValidateAuth
    DemoStaff --> ValidateAuth

    ValidateAuth -- No --> ShowError[Display Validation Error]
    ShowError --> LoginPage

    ValidateAuth -- Yes --> EstablishSession[Set User Session & Token]
    CheckAuth -- Yes --> EstablishSession

    EstablishSession --> RoleRouter{User Role?}

    %% Admin Path
    RoleRouter -- Role.ADMIN --> AdminShell[Admin Shell]
    AdminShell --> AdminDash[Dashboard Home]
    AdminShell --> AdminInv[Document Inventory]
    AdminShell --> AdminUsers[User Management]
    AdminShell --> AdminDepts[Manage Departments]
    AdminShell --> AdminReqs[Requests Inbox]
    AdminShell --> AdminNotifs[Notifications]
    AdminShell --> AdminLogs[Activity Log]

    %% DRC Path
    RoleRouter -- Role.DRC --> DrcShell[Custodian Shell]
    DrcShell --> DrcDash[Dashboard Home]
    DrcShell --> DrcInv[Dept Document Inventory]
    DrcShell --> DrcDir[Document Directory]
    DrcShell --> DrcReqs[Requests Inbox]
    DrcShell --> DrcMyReqs[My Requests]
    DrcShell --> DrcLogs[Dept Activity Log]

    %% Staff Path
    RoleRouter -- Role.STAFF --> StaffShell[Staff Shell]
    StaffShell --> StaffDash[Dashboard Home]
    StaffShell --> StaffDir[Document Directory]
    StaffShell --> StaffMyReqs[My Requests]
    StaffShell --> StaffLogs[My Activity Log]
```

---

## 2. Core Operational Workflows

### 2.1 Confidential Document Request & Approval Sequence

This flow illustrates the interaction between a Staff member requesting a confidential document and the Records Custodian approving it:

```mermaid
sequenceDiagram
    autonumber
    actor Staff as Staff User (Requester)
    participant Dir as Document Directory
    participant Modal as Request Document Modal
    participant Engine as DataContext & MockAPI
    actor Custodian as Records Custodian (DRC)
    participant Inbox as Requests Inbox
    participant Viewer as Document Viewer

    Staff->>Dir: Browses records list & encounters Confidential Document
    Dir->>Staff: Displays "Request" button (Preview disabled)
    Staff->>Dir: Clicks "Request"
    Dir->>Modal: Opens Request Modal
    Staff->>Modal: Fills Purpose & Attaches ID verification
    Modal->>Engine: createRequest(docId, requesterId, purpose, idFile)
    Engine->>Engine: Generate request ID (Status: PENDING)
    Engine->>Engine: Post Activity Log ("REQUEST_SUBMIT")
    Engine->>Custodian: Dispatch Real-Time Notification
    Modal-->>Staff: Closes modal; Table shows "Pending" badge

    Custodian->>Inbox: Navigates to Requests Inbox
    Inbox->>Custodian: Displays Pending Request with Requester details & purpose
    Custodian->>Inbox: Reviews justification and clicks "Approve" (with comments)
    Inbox->>Engine: processRequest(requestId, APPROVED, comments)
    Engine->>Engine: Update Request status to APPROVED
    Engine->>Engine: Post Activity Log ("REQUEST_APPROVE")
    Engine->>Staff: Dispatch "Access Approved" Notification

    Staff->>Dir: Returns to Document Directory
    Dir->>Engine: Checks access permissions
    Engine-->>Dir: Access granted (Status: APPROVED)
    Dir-->>Staff: "Request" button replaced by "View Document" eye icon
    Staff->>Viewer: Clicks View; High-resolution PDF/Image loads in viewer
```

---

### 2.2 NAP Form 1 Records Ingestion Workflow

Records Custodians and Administrators use the standardized 4-section modal to ingest documents into the institutional repository:

```mermaid
flowchart TD
    StartUpload([Click 'Add New Document']) --> OpenModal[Open Document Upload Form]

    subgraph Section1 [Section 1: Office & Ingestion Header]
        OpenModal --> S1_Inputs[Verify Office Name, Dept, Telephone, Email, Address, Person-In-Charge, Date Prepared]
    end

    subgraph Section2 [Section 2: Records Series Details]
        S1_Inputs --> S2_Inputs[Title, Description/Remarks, Period Covered, Volume, Medium, Restrictions, Location, Frequency of Use, Duplication]
    end

    subgraph Section3 [Section 3: Appraisal & Valuation]
        S2_Inputs --> S3_Inputs[Time Value: Temporary or Permanent]
        S3_Inputs --> S3_Utility[Utility Value: Administrative, Fiscal, Legal, Archival]
        S3_Utility --> S3_Retention[Input Active Years + Storage Years]
        S3_Retention --> S3_Calc[System auto-calculates Total Retention Years]
        S3_Calc --> S3_Disp[Disposition Provision: Disposal / Archival]
    end

    subgraph Section4 [Section 4: Digital Attachment & Classification]
        S3_Disp --> S4_Type[Select Document Type: Memo, Report, Form, Policy, Other]
        S4_Type --> S4_Access[Select Restriction: Public or Confidential]
        S4_Access --> S4_File[Upload PDF or TIFF file < 10MB]
        S4_File --> S4_Tags[Add Comma-Separated Meta Tags]
    end

    Section4 --> Validate{All Required Fields & File Valid?}
    Validate -- No --> ErrorFeedback[Display Validation Alert]
    ErrorFeedback --> Section4

    Validate -- Yes --> CommitDoc[Commit to DataContext & LocalStorage Engine]
    CommitDoc --> LogAction[Log Activity: DOCUMENT_UPLOAD]
    LogAction --> CloseModal[Close Modal & Auto-Refresh Inventory Table]
```

---

### 2.3 Document Version History & Metadata Management

```mermaid
flowchart TD
    User([Custodian / Admin]) --> Inv[Document Inventory]
    Inv --> ActionSelect{Select Action on Document}

    ActionSelect -- Edit Metadata --> EditModal[Open Edit Metadata Modal]
    EditModal --> UpdateFields[Update Title, Description, Restriction, Review Date]
    UpdateFields --> SaveEdit[Save Changes]
    SaveEdit --> LogEdit[Log Activity: DOCUMENT_UPDATE]
    LogEdit --> RefreshInv[Refresh Inventory]

    ActionSelect -- Version History --> HistoryModal[Open Version History Modal]
    HistoryModal --> DisplayVersions[Display Current Version + Previous Versions Timeline]
    DisplayVersions --> InspectVersion[Inspect Filename, Uploader, Date, and Version Notes]

    ActionSelect -- Delete Document --> DeleteConfirm[Open Confirmation Dialog]
    DeleteConfirm --> ConfirmDel{Are you sure?}
    ConfirmDel -- Yes --> RemoveDoc[Remove from DataContext & LocalStorage]
    RemoveDoc --> LogDelete[Log Activity: DOCUMENT_DELETE]
    LogDelete --> RefreshInv
    ConfirmDel -- No --> CancelDel[Close Dialog]
```

---

### 2.4 User & Department Provisioning Flow (Administrator Only)

```mermaid
flowchart LR
    Admin([Administrator]) --> UserMgmt[User Management View]
    
    subgraph UserLifecycle [User Account Management]
        UserMgmt --> AddUser[Click 'Add User']
        AddUser --> UserForm[Input Employee ID 'EMP-XXXX', Name, Role, Dept, Password]
        UserForm --> ValidateRegex{Regex Check: ^EMP - \\d{4}$ ?}
        ValidateRegex -- Invalid --> ShowRegexError[Display Format Error]
        ValidateRegex -- Valid --> HashPass[Generate Mock MD5 Hash]
        HashPass --> CommitUser[Add User to Directory & LocalStorage]
        CommitUser --> LogUser[Log Activity: USER_CREATE]
    end

    Admin --> DeptMgmt[Manage Departments View]
    subgraph DeptLifecycle [Department Catalog Management]
        DeptMgmt --> AddDept[Input Department Name]
        AddDept --> CommitDept[Save to Catalog & LocalStorage]
        CommitDept --> LogDept[Log Activity: DEPARTMENT_CREATE]
    end
```

---

## 3. State Transition Model

### 3.1 Document Lifecycle States

```mermaid
stateDiagram-v2
    [*] --> Draft: Uploaded via Document Inventory
    Draft --> Approved: Custodian / Admin Review & Approval
    Approved --> Archived: Retention Expiry / Archival Directives Met
    Archived --> [*]: Deletion / Physical Disposal (per NAP Form 1)
```

### 3.2 Access Request Lifecycle States

```mermaid
stateDiagram-v2
    [*] --> Pending: Staff Submits Request Form
    Pending --> Approved: Custodian Issues Favorable Decision
    Pending --> Rejected: Custodian Issues Rejection (with feedback)
    Approved --> Expired: Session or Period Closes
    Rejected --> [*]
    Expired --> [*]
```
