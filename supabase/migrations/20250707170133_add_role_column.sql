-- Add role column to users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'USER' CHECK (role IN ('USER', 'SALES_EXECUTIVE', 'ADMIN'));

-- Update existing users to have USER role
UPDATE users SET role = 'USER' WHERE role IS NULL;

-- Make role column NOT NULL after setting default values
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- Create index for role column for better performance
CREATE INDEX idx_users_role ON users(role);
