
-- 5. Store Orders — allow users to read their own orders by user_id or email
ALTER TABLE public.store_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders" ON public.store_orders FOR SELECT TO public
USING (auth.uid() = user_id OR customer_email = auth.email());

CREATE POLICY "Admins can manage store orders" ON public.store_orders FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));
