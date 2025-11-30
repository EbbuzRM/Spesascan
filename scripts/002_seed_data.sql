-- Seed some initial stores
INSERT INTO public.stores (name, location) VALUES
('Esselunga', 'Milano'),
('Coop', 'Roma'),
('Lidl', 'Generico'),
('Carrefour', 'Torino'),
('Conad', 'Bologna');

-- Seed some initial products
INSERT INTO public.products (name, category) VALUES
('Pasta Barilla 500g', 'Alimentari'),
('Latte Granarolo 1L', 'Latticini'),
('Caffè Lavazza 250g', 'Bevande'),
('Pane Integrale 500g', 'Panetteria'),
('Mele Golden 1kg', 'Frutta');
