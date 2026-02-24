-- Property Views Analytics Table
-- Tracks when users view properties on the website/app

-- Create property_views table if not exists
CREATE TABLE IF NOT EXISTS public.property_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  viewer_ip INET,
  viewer_user_agent TEXT,
  source VARCHAR(50) DEFAULT 'website', -- 'website', 'app', 'admin', 'api'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT property_views_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE,
  CONSTRAINT property_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL
);

-- Create indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_property_views_property_id ON public.property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_property_views_user_id ON public.property_views(user_id);
CREATE INDEX IF NOT EXISTS idx_property_views_created_at ON public.property_views(created_at);
CREATE INDEX IF NOT EXISTS idx_property_views_source ON public.property_views(source);

-- Enable RLS
ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Public can insert views" ON public.property_views
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can view all property views" ON public.property_views
  FOR SELECT TO public USING (public.is_admin());

CREATE POLICY "Users can view their own views" ON public.property_views
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Function to get property view counts
CREATE OR REPLACE FUNCTION public.get_property_views_count(property_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM public.property_views WHERE property_id = property_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get property views by date range
CREATE OR REPLACE FUNCTION public.get_property_views_by_date(
  property_uuid UUID,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE
)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM public.property_views 
    WHERE property_id = property_uuid 
    AND created_at BETWEEN start_date AND end_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for property analytics (daily stats)
CREATE OR REPLACE VIEW public.property_daily_views AS
SELECT 
  property_id,
  DATE(created_at) as view_date,
  COUNT(*) as view_count,
  COUNT(DISTINCT user_id) as unique_viewers,
  COUNT(DISTINCT viewer_ip) as unique_ips
FROM public.property_views
GROUP BY property_id, DATE(created_at)
ORDER BY view_date DESC;

-- Function to track a property view (can be called from frontend)
CREATE OR REPLACE FUNCTION public.track_property_view(
  p_property_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_source VARCHAR(50) DEFAULT 'website'
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.property_views (property_id, user_id, source)
  VALUES (p_property_id, p_user_id, p_source);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add view_count column to properties table if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name='properties' AND column_name='view_count') THEN
    ALTER TABLE public.properties ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- Trigger to update view_count on properties table
CREATE OR REPLACE FUNCTION public.update_property_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.properties 
  SET view_count = (SELECT COUNT(*) FROM public.property_views WHERE property_id = NEW.property_id)
  WHERE id = NEW.property_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_update_property_view_count') THEN
    CREATE TRIGGER trigger_update_property_view_count
    AFTER INSERT ON public.property_views
    FOR EACH ROW
    EXECUTE FUNCTION public.update_property_view_count();
  END IF;
END $$;

-- Add analytics columns to properties table for admin panel
DO $$
BEGIN
  -- Add weekly views if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name='properties' AND column_name='views_this_week') THEN
    ALTER TABLE public.properties ADD COLUMN views_this_week INTEGER DEFAULT 0;
  END IF;
  
  -- Add monthly views if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name='properties' AND column_name='views_this_month') THEN
    ALTER TABLE public.properties ADD COLUMN views_this_month INTEGER DEFAULT 0;
  END IF;
END $$;

-- Create materialized view for top viewed properties
CREATE MATERIALIZED VIEW IF NOT EXISTS public.top_viewed_properties AS
SELECT 
  p.id,
  p.title,
  p.location,
  p.city,
  p.price,
  p.status,
  p.images,
  COUNT(pv.id) as total_views,
  COUNT(DISTINCT pv.user_id) as unique_viewers
FROM public.properties p
LEFT JOIN public.property_views pv ON p.id = pv.property_id
WHERE p.status = 'active'
GROUP BY p.id, p.title, p.location, p.city, p.price, p.status, p.images
ORDER BY total_views DESC;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_top_viewed_properties_id ON public.top_viewed_properties(id);

-- Refresh function for materialized view
CREATE OR REPLACE FUNCTION public.refresh_top_viewed_properties()
RETURNS VOID AS $$
BEGIN
  REFRESH MATERIALIZED VIEW public.top_viewed_properties;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
