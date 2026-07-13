CREATE POLICY "Users can insert their own history"
ON public.requests_history
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());
