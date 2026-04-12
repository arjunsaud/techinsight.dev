-- Migration: Add RPC for reordering series posts
-- Description: Provide a safe way to update series_order without sending all required fields.

CREATE OR REPLACE FUNCTION public.reorder_series_posts(p_post_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate that the user is an admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can reorder posts';
  END IF;

  -- Update the order of each post in the array
  FOR i IN 1..cardinality(p_post_ids) LOOP
    UPDATE public.series_posts
    SET series_order = i - 1
    WHERE id = p_post_ids[i];
  END LOOP;
END;
$$;

-- Grant execution permission to authenticated users (RLS is handled inside the function)
GRANT EXECUTE ON FUNCTION public.reorder_series_posts(UUID[]) TO authenticated;
