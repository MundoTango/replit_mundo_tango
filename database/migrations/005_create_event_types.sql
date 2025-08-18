-- Create event_types table
CREATE TABLE IF NOT EXISTS event_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Calendar',
    color VARCHAR(7) DEFAULT '#6366F1',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default event types
INSERT INTO event_types (name, description, icon, color, sort_order, is_system) VALUES
    ('milonga', 'Traditional social dance event', 'Music', '#8B5CF6', 1, true),
    ('workshop', 'Educational dance workshop', 'Book', '#3B82F6', 2, true),
    ('practica', 'Practice session for dancers', 'Users', '#10B981', 3, true),
    ('marathon', 'Extended dancing event', 'Clock', '#F59E0B', 4, true),
    ('festival', 'Multi-day tango festival', 'Star', '#EF4444', 5, true),
    ('competition', 'Dance competition event', 'Trophy', '#EC4899', 6, true)
ON CONFLICT (name) DO NOTHING;

-- Create index for sorting
CREATE INDEX idx_event_types_sort ON event_types(is_active, sort_order);