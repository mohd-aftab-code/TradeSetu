-- Create broker_connections table
CREATE TABLE IF NOT EXISTS broker_connections (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(20) NOT NULL,
    broker_name VARCHAR(100) NOT NULL,
    broker_id VARCHAR(100) NOT NULL,
    api_key VARCHAR(255),
    api_secret VARCHAR(255),
    access_token VARCHAR(500),
    refresh_token VARCHAR(500),
    token_expires_at TIMESTAMP,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_sync TIMESTAMP,
    account_balance DECIMAL(15,2) DEFAULT 0.00,
    margin_used DECIMAL(15,2) DEFAULT 0.00,
    available_margin DECIMAL(15,2) DEFAULT 0.00,
    
    -- Indexes for better performance
    INDEX idx_user_id (user_id),
    INDEX idx_broker_id (broker_id),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

-- Add foreign key constraint to users table
ALTER TABLE broker_connections 
ADD CONSTRAINT fk_broker_connections_user_id 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create trigger to update updated_at timestamp
DELIMITER //
CREATE TRIGGER update_broker_connections_updated_at
BEFORE UPDATE ON broker_connections
FOR EACH ROW
BEGIN
    SET NEW.updated_at = CURRENT_TIMESTAMP;
END//
DELIMITER ;
