Begin Transaction;

--CREATE SCHEMA IF NOT EXISTS inv;
-- Create tables
CREATE TABLE IF NOT EXISTS inv.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    website VARCHAR(255),
    tax_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inv.clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES inv.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inv.invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES inv.users(id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES inv.clients(id) ON DELETE CASCADE,
    issue_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
    tax_rate DECIMAL(5,2) DEFAULT 0.0,
    discount DECIMAL(10,2) DEFAULT 0.0,
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inv.invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES inv.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON inv.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON inv.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON inv.invoices(status);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON inv.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON inv.invoice_items(invoice_id);

-- Insert default user
INSERT INTO inv.users (email, hashed_password, company_name, address, phone, website, tax_id) VALUES
('demo@example.com', 'demo123', 'Demo Company Inc.', '123 Business Ave, Suite 100\nNew York, NY 10001', '+1 (555) 123-4567', 'www.democompany.com', 'TAX-123-456-789');

-- Insert sample clients
INSERT INTO inv.clients (user_id, name, email, phone, address, tax_id) VALUES
(1, 'ABC Corporation', 'billing@abccorp.com', '+1 (555) 987-6543', '456 Corporate Blvd\nSan Francisco, CA 94102', 'CORP-987-654-321'),
(1, 'XYZ Enterprises', 'accounts@xyzenterprises.com', '+1 (555) 456-7890', '789 Enterprise St\nChicago, IL 60601', 'ENT-456-789-012'),
(1, 'Smith & Sons LLC', 'info@smithsons.com', '+1 (555) 234-5678', '321 Family Business Rd\nAustin, TX 73301', 'LLC-234-567-890'),
(1, 'Tech Solutions Ltd.', 'finance@techsolutions.com', '+1 (555) 876-5432', '654 Innovation Dr\nSeattle, WA 98101', 'TECH-876-543-210');

-- Insert sample invoices
INSERT INTO inv.invoices (invoice_number, user_id, client_id, issue_date, due_date, status, tax_rate, discount, notes, terms) VALUES
('INV-2023-0001', 1, 1, '2023-10-01', '2023-10-15', 'paid', 8.5, 50.00, 'Thank you for your business!', 'Net 15 days. Late fees apply after due date.'),
('INV-2023-0002', 1, 2, '2023-10-05', '2023-10-20', 'sent', 8.5, 0.00, 'Please include invoice number with payment.', 'Net 15 days. 1.5% monthly interest on overdue balances.'),
('INV-2023-0003', 1, 3, '2023-10-10', '2023-10-25', 'draft', 7.5, 100.00, 'Volume discount applied.', 'Net 15 days. Payment via bank transfer preferred.'),
('INV-2023-0004', 1, 4, '2023-10-15', '2023-10-30', 'overdue', 9.0, 0.00, 'Urgent: Payment overdue. Please settle immediately.', 'Net 15 days. Accounts over 30 days will be sent to collections.');

-- Insert sample invoice items
-- Invoice 1 items 
INSERT INTO inv.invoice_items (invoice_id, description, quantity, unit_price, tax_rate) VALUES
(1, 'Web Development Services', 40, 85.00, 8.5),
(1, 'UI/UX Design', 20, 120.00, 8.5),
(1, 'Project Management', 10, 95.00, 8.5);

-- Invoice 2 items
INSERT INTO inv.invoice_items (invoice_id, description, quantity, unit_price, tax_rate) VALUES
(2, 'Cloud Hosting - Premium Plan', 3, 299.00, 8.5),
(2, 'Database Management', 15, 75.00, 8.5),
(2, 'Technical Support', 8, 65.00, 8.5);

-- Invoice 3 items
INSERT INTO inv.invoice_items (invoice_id, description, quantity, unit_price, tax_rate) VALUES
(3, 'Mobile App Development', 60, 110.00, 7.5),
(3, 'API Integration', 25, 85.00, 7.5),
(3, 'Quality Assurance Testing', 35, 70.00, 7.5);

-- Invoice 4 items
INSERT INTO inv.invoice_items (invoice_id, description, quantity, unit_price, tax_rate) VALUES
(4, 'E-commerce Platform Development', 80, 125.00, 9.0),
(4, 'Payment Gateway Integration', 15, 150.00, 9.0),
(4, 'Security Audit', 10, 200.00, 9.0);

-- Create views for common queries 
DROP VIEW IF EXISTS inv.invoice_summary;
CREATE VIEW inv.invoice_summary AS
SELECT 
    i.id,
    i.invoice_number,
    c.name AS client_name,
    i.issue_date,
    i.due_date,
    i.status,
    SUM(ii.quantity * ii.unit_price) * (1 + COALESCE(i.tax_rate, 0) / 100) - COALESCE(i.discount, 0) AS total_amount
FROM inv.invoices i
JOIN inv.clients c ON i.client_id = c.id
JOIN inv.invoice_items ii ON i.id = ii.invoice_id
GROUP BY i.id, i.invoice_number, c.name, i.issue_date, i.due_date, i.status;

-- Create function to generate next invoice number
CREATE OR REPLACE FUNCTION inv.generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    last_number INT;
    year_part TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT; 
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '^INV-\d{4}-(\d+)$') AS INTEGER)), 0)
    INTO last_number
    FROM inv.invoices
    WHERE invoice_number LIKE 'INV-' || year_part || '-%';
    
    NEW.invoice_number := 'INV-' || year_part || '-' || LPAD((last_number + 1)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate invoice numbers
DROP TRIGGER IF EXISTS trg_generate_invoice_number ON inv.invoices;
CREATE TRIGGER trg_generate_invoice_number
    BEFORE INSERT ON inv.invoices
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '') 
    EXECUTE FUNCTION inv.generate_invoice_number();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION inv.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update timestamps
DROP TRIGGER IF EXISTS trg_users_updated ON inv.users;
CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON inv.users
    FOR EACH ROW
    EXECUTE FUNCTION inv.update_modified_column();

DROP TRIGGER IF EXISTS trg_clients_updated ON inv.clients;
CREATE TRIGGER trg_clients_updated
    BEFORE UPDATE ON inv.clients
    FOR EACH ROW
    EXECUTE FUNCTION inv.update_modified_column();

DROP TRIGGER IF EXISTS trg_invoices_updated ON inv.invoices;
CREATE TRIGGER trg_invoices_updated
    BEFORE UPDATE ON inv.invoices
    FOR EACH ROW
    EXECUTE FUNCTION inv.update_modified_column();

DROP TRIGGER IF EXISTS trg_invoice_items_updated ON inv.invoice_items;
CREATE TRIGGER trg_invoice_items_updated
    BEFORE UPDATE ON inv.invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION inv.update_modified_column();

-- Create function to check invoice status based on due date
CREATE OR REPLACE FUNCTION inv.check_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.due_date < CURRENT_DATE AND NEW.status = 'sent' THEN
        NEW.status := 'overdue';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update status based on due date
DROP TRIGGER IF EXISTS trg_check_invoice_status ON inv.invoices;
CREATE TRIGGER trg_check_invoice_status
    BEFORE INSERT OR UPDATE ON inv.invoices
    FOR EACH ROW
    EXECUTE FUNCTION inv.check_invoice_status();

-- Create function to calculate invoice totals (FIXED: ambiguous column reference)
CREATE OR REPLACE FUNCTION inv.get_invoice_total(p_invoice_id INT)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_subtotal DECIMAL(10,2);
    v_tax_amount DECIMAL(10,2);
    v_total DECIMAL(10,2);
    v_invoice_tax_rate DECIMAL(5,2);
    v_invoice_discount DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    INTO v_subtotal
    FROM inv.invoice_items
    WHERE invoice_id = p_invoice_id;
    
    SELECT tax_rate, discount
    INTO v_invoice_tax_rate, v_invoice_discount
    FROM inv.invoices
    WHERE id = p_invoice_id;
    
    v_tax_amount := (v_subtotal - COALESCE(v_invoice_discount, 0)) * COALESCE(v_invoice_tax_rate, 0) / 100;
    v_total := v_subtotal - COALESCE(v_invoice_discount, 0) + v_tax_amount;
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
GRANT ALL PRIVILEGES ON DATABASE invoice_db TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA inv TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA inv TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA inv TO postgres;

-- Display sample data
SELECT '=== Users ===' AS info;
SELECT * FROM inv.users;

SELECT '=== Clients ===' AS info;
SELECT * FROM inv.clients;

SELECT '=== Invoices ===' AS info;
SELECT * FROM inv.invoices;

SELECT '=== Invoice Items ===' AS info;
SELECT * FROM inv.invoice_items;

SELECT '=== Invoice Summary ===' AS info;
SELECT * FROM inv.invoice_summary;

SELECT '=== Sample Invoice Total Calculation ===' AS info;
SELECT id, invoice_number, inv.get_invoice_total(id) AS total FROM inv.invoices WHERE id = 1;
CREATE SCHEMA IF NOT EXISTS inv;
-- Create tables
CREATE TABLE IF NOT EXISTS inv.users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    website VARCHAR(255),
    tax_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inv.clients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES inv.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tax_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inv.invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES inv.users(id) ON DELETE CASCADE,
    client_id INTEGER NOT NULL REFERENCES inv.clients(id) ON DELETE CASCADE,
    issue_date TIMESTAMP NOT NULL,
    due_date TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
    tax_rate DECIMAL(5,2) DEFAULT 0.0,
    discount DECIMAL(10,2) DEFAULT 0.0,
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inv.invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id INTEGER NOT NULL REFERENCES inv.invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON inv.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON inv.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON inv.invoices(status);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON inv.clients(user_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON inv.invoice_items(invoice_id);

-- Insert default user
-- INSERT INTO inv.users (email, hashed_password, company_name, address, phone, website, tax_id) VALUES
-- ('demo@example.com', 'demo123', 'Demo Company Inc.', '123 Business Ave, Suite 100\nNew York, NY 10001', '+1 (555) 123-4567', 'www.democompany.com', 'TAX-123-456-789');

-- -- Insert sample clients
-- INSERT INTO inv.clients (user_id, name, email, phone, address, tax_id) VALUES
-- (1, 'ABC Corporation', 'billing@abccorp.com', '+1 (555) 987-6543', '456 Corporate Blvd\nSan Francisco, CA 94102', 'CORP-987-654-321'),
-- (1, 'XYZ Enterprises', 'accounts@xyzenterprises.com', '+1 (555) 456-7890', '789 Enterprise St\nChicago, IL 60601', 'ENT-456-789-012'),
-- (1, 'Smith & Sons LLC', 'info@smithsons.com', '+1 (555) 234-5678', '321 Family Business Rd\nAustin, TX 73301', 'LLC-234-567-890'),
-- (1, 'Tech Solutions Ltd.', 'finance@techsolutions.com', '+1 (555) 876-5432', '654 Innovation Dr\nSeattle, WA 98101', 'TECH-876-543-210');

-- -- Insert sample invoices
-- INSERT INTO inv.invoices (invoice_number, user_id, client_id, issue_date, due_date, status, tax_rate, discount, notes, terms) VALUES
-- ('INV-2023-0001', 1, 1, '2023-10-01', '2023-10-15', 'paid', 8.5, 50.00, 'Thank you for your business!', 'Net 15 days. Late fees apply after due date.'),
-- ('INV-2023-0002', 1, 2, '2023-10-05', '2023-10-20', 'sent', 8.5, 0.00, 'Please include invoice number with payment.', 'Net 15 days. 1.5% monthly interest on overdue balances.'),
-- ('INV-2023-0003', 1, 3, '2023-10-10', '2023-10-25', 'draft', 7.5, 100.00, 'Volume discount applied.', 'Net 15 days. Payment via bank transfer preferred.'),
-- ('INV-2023-0004', 1, 4, '2023-10-15', '2023-10-30', 'overdue', 9.0, 0.00, 'Urgent: Payment overdue. Please settle immediately.', 'Net 15 days. Accounts over 30 days will be sent to collections.');

-- -- Insert sample invoice items
-- -- Invoice 1 items
-- INSERT INTO inv.invoice_items (invoice_id, description, quantity, unit_price, tax_rate) VALUES
-- (1, 'Web Development Services', 40, 85.00, 8.5),
-- (1, 'UI/UX Design', 20, 120.00, 8.5),
-- (1, 'Project Management', 10, 95.00, 8.5);

-- -- Invoice 2 items
-- INSERT INTO inv.invoice_items (invoice_id, description, quantity, unit_price, tax_rate) VALUES
-- (2, 'Cloud Hosting - Premium Plan', 3, 299.00, 8.5),
-- (2, 'Database Management', 15, 75.00, 8.5),
-- (2, 'Technical Support', 8, 65.00, 8.5);

-- -- Invoice 3 items
-- INSERT INTO inv.invoice_items (invoice_id, description, quantity, unit_price, tax_rate) VALUES
-- (3, 'Mobile App Development', 60, 110.00, 7.5),
-- (3, 'API Integration', 25, 85.00, 7.5),
-- (3, 'Quality Assurance Testing', 35, 70.00, 7.5);

-- -- Invoice 4 items
-- INSERT INTO inv.invoice_items (invoice_id, description, quantity, unit_price, tax_rate) VALUES
-- (4, 'E-commerce Platform Development', 80, 125.00, 9.0),
-- (4, 'Payment Gateway Integration', 15, 150.00, 9.0),
-- (4, 'Security Audit', 10, 200.00, 9.0);

-- Create views for common queries
DROP VIEW IF EXISTS inv.invoice_summary;
CREATE VIEW inv.invoice_summary AS
SELECT 
    i.id,
    i.invoice_number,
    c.name AS client_name,
    i.issue_date,
    i.due_date,
    i.status,
    SUM(ii.quantity * ii.unit_price) * (1 + COALESCE(i.tax_rate, 0) / 100) - COALESCE(i.discount, 0) AS total_amount
FROM inv.invoices i
JOIN inv.clients c ON i.client_id = c.id
JOIN inv.invoice_items ii ON i.id = ii.invoice_id
GROUP BY i.id, i.invoice_number, c.name, i.issue_date, i.due_date, i.status;

-- Create function to generate next invoice number
CREATE OR REPLACE FUNCTION inv.generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
    last_number INT;
    year_part TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '^INV-\d{4}-(\d+)$') AS INTEGER)), 0)
    INTO last_number
    FROM inv.invoices
    WHERE invoice_number LIKE 'INV-' || year_part || '-%';
    
    NEW.invoice_number := 'INV-' || year_part || '-' || LPAD((last_number + 1)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate invoice numbers
DROP TRIGGER IF EXISTS trg_generate_invoice_number ON inv.invoices;
CREATE TRIGGER trg_generate_invoice_number
    BEFORE INSERT ON inv.invoices
    FOR EACH ROW
    WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
    EXECUTE FUNCTION inv.generate_invoice_number();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION inv.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update timestamps
DROP TRIGGER IF EXISTS trg_users_updated ON inv.users;
CREATE TRIGGER trg_users_updated
    BEFORE UPDATE ON inv.users
    FOR EACH ROW
    EXECUTE FUNCTION inv.update_modified_column();

DROP TRIGGER IF EXISTS trg_clients_updated ON inv.clients;
CREATE TRIGGER trg_clients_updated
    BEFORE UPDATE ON inv.clients
    FOR EACH ROW
    EXECUTE FUNCTION inv.update_modified_column();

DROP TRIGGER IF EXISTS trg_invoices_updated ON inv.invoices;
CREATE TRIGGER trg_invoices_updated
    BEFORE UPDATE ON inv.invoices
    FOR EACH ROW
    EXECUTE FUNCTION inv.update_modified_column();

DROP TRIGGER IF EXISTS trg_invoice_items_updated ON inv.invoice_items;
CREATE TRIGGER trg_invoice_items_updated
    BEFORE UPDATE ON inv.invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION inv.update_modified_column();

-- Create function to check invoice status based on due date
CREATE OR REPLACE FUNCTION inv.check_invoice_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.due_date < CURRENT_DATE AND NEW.status = 'sent' THEN
        NEW.status := 'overdue';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update status based on due date
DROP TRIGGER IF EXISTS trg_check_invoice_status ON inv.invoices;
CREATE TRIGGER trg_check_invoice_status
    BEFORE INSERT OR UPDATE ON inv.invoices
    FOR EACH ROW
    EXECUTE FUNCTION inv.check_invoice_status();

-- Create function to calculate invoice totals (FIXED: ambiguous column reference)
CREATE OR REPLACE FUNCTION inv.get_invoice_total(p_invoice_id INT)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    v_subtotal DECIMAL(10,2);
    v_tax_amount DECIMAL(10,2);
    v_total DECIMAL(10,2);
    v_invoice_tax_rate DECIMAL(5,2);
    v_invoice_discount DECIMAL(10,2);
BEGIN
    SELECT COALESCE(SUM(quantity * unit_price), 0)
    INTO v_subtotal
    FROM inv.invoice_items
    WHERE invoice_id = p_invoice_id;
    
    SELECT tax_rate, discount
    INTO v_invoice_tax_rate, v_invoice_discount
    FROM inv.invoices
    WHERE id = p_invoice_id;
    
    v_tax_amount := (v_subtotal - COALESCE(v_invoice_discount, 0)) * COALESCE(v_invoice_tax_rate, 0) / 100;
    v_total := v_subtotal - COALESCE(v_invoice_discount, 0) + v_tax_amount;
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust as needed for your setup)
GRANT ALL PRIVILEGES ON DATABASE invoice_db TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA inv TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA inv TO postgres;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA inv TO postgres;

-- Display sample data
SELECT '=== Users ===' AS info;
SELECT * FROM inv.users;

SELECT '=== Clients ===' AS info;
SELECT * FROM inv.clients;

SELECT '=== Invoices ===' AS info;
SELECT * FROM inv.invoices;

SELECT '=== Invoice Items ===' AS info;
SELECT * FROM inv.invoice_items;

SELECT '=== Invoice Summary ===' AS info;
SELECT * FROM inv.invoice_summary;

SELECT '=== Sample Invoice Total Calculation ===' AS info;
SELECT id, invoice_number, inv.get_invoice_total(id) AS total FROM inv.invoices WHERE id = 1;