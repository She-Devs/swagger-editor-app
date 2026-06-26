CREATE TABLE public.schemas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    format VARCHAR(10) NOT NULL CHECK (format IN ('json', 'yaml')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE public.requests_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER CHECK (status_code >= 100 AND status_code <= 599),
    duration_ms INTEGER NOT NULL CHECK (duration_ms >= 0),
    request_size INTEGER DEFAULT 0 CHECK (request_size >= 0),
    response_size INTEGER DEFAULT 0 CHECK (response_size >= 0),
    error_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE POLICY "Users can look at their own schemas"
ON public.schemas
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own schemas"
ON public.schemas
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own schemas"
ON public.schemas
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can see their own history"
ON public.requests_history
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.schemas
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();