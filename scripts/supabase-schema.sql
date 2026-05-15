-- roles
CREATE TABLE IF NOT EXISTS roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  role_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- users
CREATE TABLE IF NOT EXISTS users (
  user_id SERIAL PRIMARY KEY,
  vendor_id INTEGER,
  role_id INTEGER NOT NULL REFERENCES roles(role_id),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_vendor_id ON users(vendor_id);

-- roles default
INSERT INTO roles (role_name, role_description) VALUES
  ('SUPER_ADMIN', 'Super Administrator'),
  ('VENDOR_ADMIN', 'Vendor Administrator')
ON CONFLICT (role_name) DO NOTHING;