-- =============================================================================
-- Centralized Document Management Information System (CDMIS)
-- Database Schema & Initial Seed Data
-- =============================================================================
-- Compatible with: MySQL 8.x / MariaDB 10.x / PostgreSQL 14+ (with minor syntax adjustments)
-- Description: Institutional records appraisal, inventory (NAP Form 1), and RBAC access control schema.
-- =============================================================================

CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(32) PRIMARY KEY, -- Formatted: 'EMP - XXXX'
    name VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL,  -- 'Administrator', 'Departmental Records Custodian', 'Staff'
    department VARCHAR(128) NULL,
    password_hash VARCHAR(64) NOT NULL,
    CONSTRAINT fk_users_department FOREIGN KEY (department) 
        REFERENCES departments(name) ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    department VARCHAR(128) NOT NULL,
    uploader_id VARCHAR(32) NOT NULL,
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    review_date DATE NULL,
    version INT NOT NULL DEFAULT 1,
    restriction_type VARCHAR(20) NOT NULL DEFAULT 'Public', -- 'Public', 'Confidential'
    status VARCHAR(20) NOT NULL DEFAULT 'Draft',            -- 'Draft', 'Approved', 'Archived'
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NULL,
    document_type VARCHAR(50) NOT NULL DEFAULT 'Report',    -- 'Memorandum', 'Report', 'Form', 'Policy', 'Other'
    meta_tags TEXT NULL,                                     -- JSON Array or CSV
    CONSTRAINT fk_docs_uploader FOREIGN KEY (uploader_id) 
        REFERENCES users(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS document_nap_data (
    document_id VARCHAR(64) PRIMARY KEY,
    office_name VARCHAR(128) NOT NULL,
    department VARCHAR(128) NOT NULL,
    telephone VARCHAR(64) NULL,
    section VARCHAR(64) NULL,
    email VARCHAR(128) NULL,
    address VARCHAR(255) NULL,
    person_in_charge VARCHAR(128) NOT NULL,
    date_prepared DATE NOT NULL,
    period_covered VARCHAR(64) NULL,
    volume VARCHAR(64) NULL,
    medium VARCHAR(64) NULL,
    restriction VARCHAR(64) NULL,
    location VARCHAR(128) NULL,
    frequency VARCHAR(64) NULL,
    duplication VARCHAR(128) NULL,
    time_value CHAR(1) NULL,       -- 'T' (Temporary), 'P' (Permanent)
    utility_value TEXT NULL,       -- JSON Array, e.g., '["Adm", "F"]'
    retention_active VARCHAR(16) NULL,
    retention_storage VARCHAR(16) NULL,
    retention_total VARCHAR(16) NULL,
    disposition VARCHAR(128) NULL,
    CONSTRAINT fk_nap_document FOREIGN KEY (document_id) 
        REFERENCES documents(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_versions (
    document_id VARCHAR(64) NOT NULL,
    version INT NOT NULL,
    upload_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    file_name VARCHAR(255) NOT NULL,
    file_url TEXT NULL,
    uploader_id VARCHAR(32) NOT NULL,
    description TEXT NULL,
    PRIMARY KEY (document_id, version),
    CONSTRAINT fk_version_doc FOREIGN KEY (document_id) 
        REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_version_uploader FOREIGN KEY (uploader_id) 
        REFERENCES users(id) ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS document_requests (
    id VARCHAR(64) PRIMARY KEY,
    document_id VARCHAR(64) NOT NULL,
    requester_id VARCHAR(32) NOT NULL,
    request_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'Pending', -- 'Pending', 'Approved', 'Rejected'
    purpose TEXT NOT NULL,
    id_upload_url TEXT NULL,
    approver_id VARCHAR(32) NULL,
    decision_date TIMESTAMP NULL,
    reviewer_comment TEXT NULL,
    CONSTRAINT fk_req_doc FOREIGN KEY (document_id) 
        REFERENCES documents(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_requester FOREIGN KEY (requester_id) 
        REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_req_approver FOREIGN KEY (approver_id) 
        REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL,
    action VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    details TEXT NOT NULL,
    department VARCHAR(128) NULL,
    document_id VARCHAR(64) NULL,
    CONSTRAINT fk_log_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    type VARCHAR(16) NOT NULL DEFAULT 'info', -- 'success', 'error', 'info'
    related_document_id VARCHAR(64) NULL,
    CONSTRAINT fk_notif_user FOREIGN KEY (user_id) 
        REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================================
-- SEED DATA: Departments
-- =============================================================================
INSERT INTO departments (id, name) VALUES
('dept-admin', 'Administration'),
('dept-1', 'IT'),
('dept-2', 'HR'),
('dept-3', 'Finance')
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- SEED DATA: Users (Simulated MD5 Hashes)
-- =============================================================================
INSERT INTO users (id, name, role, department, password_hash) VALUES
('EMP - 0123', 'Admin User', 'Administrator', 'Administration', '854f36c709b662f53c00ea2c11a40f7a'),
('EMP - 0234', 'Records Custodian (IT)', 'Departmental Records Custodian', 'IT', '6e0e35ada31308ce0ffc4ba6f6c2a052'),
('EMP - 0235', 'Records Custodian (HR)', 'Departmental Records Custodian', 'HR', 'b8af089be2741096c7f0430ff110eccf'),
('EMP - 0345', 'Employee 1', 'Staff', 'Administration', 'c52e465fe3929a28db538eb6f199336f'),
('EMP - 0346', 'Employee 2', 'Staff', 'Administration', '5d9d051e2cc822f3b7a3a1a4862aaeb5')
ON CONFLICT (id) DO NOTHING;
