-- Update existing records with new status values
UPDATE store_orders 
SET status = CASE
    WHEN status = 'pending' THEN 'Väntar'
    WHEN status = 'in-progress' THEN 'Under utveckling'
    WHEN status = 'review' THEN 'Granska'
    WHEN status = 'delivered' THEN 'Levererad'
    ELSE 'Väntar'
END;

-- Change default value and check constraint
ALTER TABLE store_orders 
    ALTER COLUMN status SET DEFAULT 'Väntar';

-- Drop and recreate the check constraint
ALTER TABLE store_orders 
    DROP CONSTRAINT IF EXISTS store_orders_status_check;

ALTER TABLE store_orders 
    ADD CONSTRAINT store_orders_status_check CHECK (status IN ('Väntar', 'Under utveckling', 'Granska', 'Levererad')); 