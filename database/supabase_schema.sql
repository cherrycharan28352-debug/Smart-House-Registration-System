-- ====================================================================
-- ಮನೆ ಮನೆಗೆ ಪೊಲೀಸ್ (Mane Manege Police) - Supabase PostgreSQL Production Schema
-- Designed for 200,000+ House Records, High-Performance B-Tree Indexing,
-- Row Level Security (RLS), and Audit Traceability.
-- ====================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enumerated Types
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('admin', 'staff', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE account_status_type AS ENUM ('pending', 'approved', 'rejected', 'deactivated');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE issue_status_type AS ENUM ('Pending', 'In Progress', 'Resolved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE issue_category_type AS ENUM ('Police-related', 'Other department');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Users Table (Authentication and Authorization)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role_type NOT NULL DEFAULT 'staff',
    account_status account_status_type NOT NULL DEFAULT 'pending',
    mobile_number VARCHAR(20) DEFAULT '',
    staff_id VARCHAR(50) DEFAULT '',
    assigned_beats TEXT[] DEFAULT ARRAY[]::TEXT[],
    assigned_villages TEXT[] DEFAULT ARRAY[]::TEXT[],
    rejection_reason TEXT DEFAULT '',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Beats Table (11 Police Beats)
CREATE TABLE IF NOT EXISTS beats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beat_number VARCHAR(50) UNIQUE NOT NULL,
    beat_name VARCHAR(100) NOT NULL,
    beat_name_kannada VARCHAR(100) NOT NULL,
    officer_name VARCHAR(255) DEFAULT '',
    officer_contact VARCHAR(50) DEFAULT '',
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Villages Table (Assigned under Beats)
CREATE TABLE IF NOT EXISTS villages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    village_id VARCHAR(50) UNIQUE NOT NULL,
    name_kannada VARCHAR(255) NOT NULL,
    name_english VARCHAR(255) DEFAULT '',
    beat_number VARCHAR(50) NOT NULL REFERENCES beats(beat_number) ON UPDATE CASCADE,
    taluk VARCHAR(100) DEFAULT 'ದೊಡ್ಡಬಳ್ಳಾಪುರ',
    district VARCHAR(100) DEFAULT 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
    state VARCHAR(100) DEFAULT 'Karnataka',
    pincode VARCHAR(20) DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Houses Table (Scale: 200,000+ records)
CREATE TABLE IF NOT EXISTS houses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    house_id VARCHAR(50) UNIQUE NOT NULL,
    house_number VARCHAR(100) NOT NULL,
    street_name VARCHAR(255) DEFAULT '',
    beat_number VARCHAR(50) NOT NULL REFERENCES beats(beat_number) ON UPDATE CASCADE,
    village_id UUID REFERENCES villages(id) ON DELETE SET NULL,
    village_name VARCHAR(255) NOT NULL,
    locality VARCHAR(255) DEFAULT '',
    city VARCHAR(100) DEFAULT '',
    subdistrict VARCHAR(100) DEFAULT 'ದೊಡ್ಡಬಳ್ಳಾಪುರ',
    district VARCHAR(100) DEFAULT 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
    state VARCHAR(100) DEFAULT 'Karnataka',
    pincode VARCHAR(20) DEFAULT '',
    house_type VARCHAR(100) DEFAULT 'Independent house',
    number_of_floors INT DEFAULT 1,
    number_of_rooms INT DEFAULT 1,
    ownership_type VARCHAR(50) DEFAULT 'Owned',
    
    -- GPS Coordinates (Optional)
    latitude NUMERIC(10, 7) NULL,
    longitude NUMERIC(10, 7) NULL,
    gps_accuracy NUMERIC(8, 2) NULL,
    gps_source VARCHAR(50) DEFAULT 'gps',
    
    -- Security Survey
    cctv_installed VARCHAR(20) DEFAULT 'No',
    security_guard_present VARCHAR(20) DEFAULT 'No',
    other_security_arrangements TEXT DEFAULT '',
    
    remarks TEXT DEFAULT '',
    registration_status VARCHAR(50) DEFAULT 'Registered',
    registration_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    registered_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Owners Table
CREATE TABLE IF NOT EXISTS owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id VARCHAR(50) UNIQUE NOT NULL,
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    contact_number VARCHAR(50) DEFAULT '',
    email VARCHAR(255) DEFAULT '',
    ownership_type VARCHAR(50) DEFAULT 'Owned',
    correspondence_address TEXT DEFAULT '',
    age INT NULL,
    id_reference VARCHAR(100) DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Family Members Table
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id VARCHAR(50) UNIQUE NOT NULL,
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    age INT NULL,
    gender VARCHAR(50) DEFAULT '',
    occupation VARCHAR(100) DEFAULT '',
    contact_number VARCHAR(50) DEFAULT '',
    id_reference VARCHAR(100) DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. House Issues & Suggestions Survey Table
CREATE TABLE IF NOT EXISTS house_issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issue_id VARCHAR(50) UNIQUE NOT NULL,
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    date_reported TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    category issue_category_type NOT NULL DEFAULT 'Police-related',
    description TEXT NOT NULL,
    additional_remarks TEXT DEFAULT '',
    reported_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reported_by_name VARCHAR(255) DEFAULT '',
    
    -- Action Taken (Admin Only)
    action_taken TEXT DEFAULT '',
    responsible_department VARCHAR(255) DEFAULT 'Police Department',
    action_date TIMESTAMPTZ NULL,
    status issue_status_type NOT NULL DEFAULT 'Pending',
    follow_up_remarks TEXT DEFAULT '',
    action_updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    action_updated_by_name VARCHAR(255) DEFAULT '',
    action_updated_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. House Photographs Table
CREATE TABLE IF NOT EXISTS house_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    photo_id VARCHAR(50) UNIQUE NOT NULL,
    house_id UUID NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Front view',
    storage_path TEXT NOT NULL,
    mime_type VARCHAR(100) DEFAULT 'image/jpeg',
    file_size BIGINT DEFAULT 0,
    caption TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action VARCHAR(100) NOT NULL,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    performed_by_name VARCHAR(255) NOT NULL,
    target_resource VARCHAR(255) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(100) DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Application Settings Table
CREATE TABLE IF NOT EXISTS app_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) DEFAULT '',
    contact_phone VARCHAR(50) DEFAULT '112',
    address TEXT DEFAULT '',
    pdf_disclaimer TEXT DEFAULT '',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ====================================================================
-- HIGH-PERFORMANCE B-TREE INDEXES FOR 200,000+ SCALE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_houses_house_id ON houses(house_id);
CREATE INDEX IF NOT EXISTS idx_houses_beat_number ON houses(beat_number);
CREATE INDEX IF NOT EXISTS idx_houses_village_id ON houses(village_id);
CREATE INDEX IF NOT EXISTS idx_houses_created_at ON houses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_houses_number_village ON houses(house_number, village_name);
CREATE INDEX IF NOT EXISTS idx_houses_cctv ON houses(cctv_installed);
CREATE INDEX IF NOT EXISTS idx_houses_gps ON houses(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_villages_beat ON villages(beat_number);
CREATE INDEX IF NOT EXISTS idx_villages_name_kannada ON villages(name_kannada);

CREATE INDEX IF NOT EXISTS idx_owners_house_id ON owners(house_id);
CREATE INDEX IF NOT EXISTS idx_owners_contact ON owners(contact_number);

CREATE INDEX IF NOT EXISTS idx_family_house_id ON family_members(house_id);

CREATE INDEX IF NOT EXISTS idx_issues_house_id ON house_issues(house_id);
CREATE INDEX IF NOT EXISTS idx_issues_status ON house_issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_category ON house_issues(category);
CREATE INDEX IF NOT EXISTS idx_issues_date ON house_issues(date_reported DESC);

CREATE INDEX IF NOT EXISTS idx_photos_house_id ON house_photos(house_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE houses ENABLE ROW LEVEL SECURITY;
ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;

-- Read policies for Beats and Villages
CREATE POLICY "Public Read Beats" ON beats FOR SELECT USING (true);
CREATE POLICY "Public Read Villages" ON villages FOR SELECT USING (true);

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON houses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON house_issues FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
