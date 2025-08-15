-- Change users table ID to custom format
-- First, create a sequence for user IDs
CREATE SEQUENCE IF NOT EXISTS user_id_seq START 1;

-- Create a function to generate custom user IDs
CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS TEXT AS $$
BEGIN
    RETURN 'tradesetu' || LPAD(nextval('user_id_seq')::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- Create a temporary table with the new structure
CREATE TABLE users_new (
    id TEXT PRIMARY KEY DEFAULT generate_user_id(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    subscription_plan VARCHAR(20) DEFAULT 'FREE' CHECK (subscription_plan IN ('FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE')),
    subscription_expires TIMESTAMP WITH TIME ZONE,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    kyc_status VARCHAR(20) DEFAULT 'PENDING' CHECK (kyc_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    pan_card VARCHAR(10),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(10),
    role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'SALES_EXECUTIVE', 'ADMIN')),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Copy existing data with new IDs (if any data exists)
-- For existing users, we'll generate new IDs
INSERT INTO users_new (
    id,
    email,
    password_hash,
    name,
    phone,
    created_at,
    updated_at,
    is_active,
    subscription_plan,
    subscription_expires,
    balance,
    kyc_status,
    pan_card,
    address,
    city,
    state,
    pincode,
    role,
    last_login
)
SELECT 
    generate_user_id(),
    email,
    password_hash,
    name,
    phone,
    created_at,
    updated_at,
    is_active,
    subscription_plan,
    subscription_expires,
    balance,
    kyc_status,
    pan_card,
    address,
    city,
    state,
    pincode,
    COALESCE(role, 'USER'),
    last_login
FROM users;

-- Drop the old table and rename the new one
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;

-- Recreate indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
