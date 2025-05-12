-- Create store_orders table
CREATE TABLE store_orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    store_name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'review', 'delivered')),
    price DECIMAL(10,2) NOT NULL,
    niche TEXT NOT NULL,
    description TEXT,
    requirements TEXT[],
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX store_orders_user_id_idx ON store_orders(user_id);
CREATE INDEX store_orders_status_idx ON store_orders(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_store_orders_updated_at
    BEFORE UPDATE ON store_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE store_orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Admins can view all orders" ON store_orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON store_orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON store_orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON store_orders;
DROP POLICY IF EXISTS "Users can delete their own orders" ON store_orders;

-- Create policies
CREATE POLICY "Admins can view all orders"
    ON store_orders FOR SELECT
    USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own orders"
    ON store_orders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
    ON store_orders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
    ON store_orders FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own orders"
    ON store_orders FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to get user ID by email
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_id UUID;
BEGIN
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = user_email;
    
    RETURN user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_by_email(TEXT) TO authenticated; 