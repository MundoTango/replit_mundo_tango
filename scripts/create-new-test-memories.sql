-- Create new test memories for the clean design
-- These will work with the CleanMemoryCard component

-- Insert new memories with various emotion tags and locations
INSERT INTO memories (id, content, user_id, created_at, emotion_tags, location) VALUES
('mem_' || to_char(now(), 'YYYYMMDDHH24MISS') || '_001', 
'Just finished teaching my first milonga class in Buenos Aires! The energy was incredible and seeing my students dance with such passion made my heart full. 🎶', 
3, 
now() - interval '2 hours',
ARRAY['joy', 'pride', 'accomplishment'],
'{"name": "La Viruta, Buenos Aires", "place_id": "ChIJN1t_tDeuEmsRUsoyG83frY4", "coordinates": {"lat": -34.5875, "lng": -58.4371}, "formatted_address": "Armenia 1366, C1414 CABA, Argentina"}'::jsonb),

('mem_' || to_char(now(), 'YYYYMMDDHH24MISS') || '_002',
'The sunset over the Rio de la Plata during tonight''s outdoor milonga was breathtaking. Dancing tango with the city lights coming alive in the background - this is why I love Buenos Aires!',
31,
now() - interval '5 hours',
ARRAY['awe', 'romantic', 'peaceful'],
'{"name": "Puerto Madero, Buenos Aires", "place_id": "ChIJv7BhcSZwPgARJKsLh0Q3Q", "coordinates": {"lat": -34.6118, "lng": -58.3629}, "formatted_address": "Puerto Madero, Buenos Aires, Argentina"}'::jsonb),

('mem_' || to_char(now(), 'YYYYMMDDHH24MISS') || '_003',
'Discovered an amazing new cortina at Café Tortoni tonight. The DJ played a mix of Pugliese and D''Arienzo that had everyone on the floor. Taking notes for my next event!',
32,
now() - interval '1 day',
ARRAY['excitement', 'inspiration', 'discovery'],
'{"name": "Café Tortoni", "place_id": "ChIJt8CqLdQqPgARaVVvp_8n8", "coordinates": {"lat": -34.6083, "lng": -58.3787}, "formatted_address": "Av. de Mayo 825, C1084 CABA, Argentina"}'::jsonb),

('mem_' || to_char(now(), 'YYYYMMDDHH24MISS') || '_004',
'After months of practice, finally nailed that complex sacada sequence! My teacher was so proud. Hard work really does pay off. Time to celebrate with some medialunas! 🥐',
33,
now() - interval '3 days',
ARRAY['achievement', 'determination', 'celebration'],
'{"name": "DNI Tango School", "place_id": "ChIJHxWMZzeuEmsRbW5Z_s3fr", "coordinates": {"lat": -34.5990, "lng": -58.4200}, "formatted_address": "Bulnes 1011, Buenos Aires, Argentina"}'::jsonb),

('mem_' || to_char(now(), 'YYYYMMDDHH24MISS') || '_005',
'The connection I felt during that last tanda was indescribable. We moved as one, completely lost in the music. These are the moments that remind me why tango is more than just a dance.',
34,
now() - interval '6 hours',
ARRAY['connection', 'transcendence', 'gratitude'],
'{"name": "Salón Canning", "place_id": "ChIJZX9jT7euEmsRdHG1PQz9", "coordinates": {"lat": -34.6246, "lng": -58.4029}, "formatted_address": "Av. Raúl Scalabrini Ortiz 1331, Buenos Aires"}'::jsonb),

('mem_' || to_char(now(), 'YYYYMMDDHH24MISS') || '_006',
'Teaching a workshop on musicality today and one of my students asked the most insightful question about phrasing. I love when teaching becomes a two-way learning experience!',
35,
now() - interval '8 hours',
ARRAY['wisdom', 'growth', 'community'],
'{"name": "Studio Dinzel", "place_id": "ChIJGZ5DheuEmsRaFf7e0Pz", "coordinates": {"lat": -34.5847, "lng": -58.4350}, "formatted_address": "Av. Juan B. Justo 1643, Buenos Aires"}'::jsonb),

('mem_' || to_char(now(), 'YYYYMMDDHH24MISS') || '_007',
'Organizing my first international tango festival! The logistics are overwhelming but seeing dancers from around the world coming together makes it all worthwhile. T-minus 30 days!',
36,
now() - interval '12 hours',
ARRAY['anticipation', 'responsibility', 'excitement'],
'{"name": "Centro Cultural Recoleta", "place_id": "ChIJ6XNXRqxQPgARlXXq8Pw9", "coordinates": {"lat": -34.5839, "lng": -58.3939}, "formatted_address": "Junín 1930, Buenos Aires"}'::jsonb),

('mem_' || to_char(now(), 'YYYYMMDDHH24MISS') || '_008',
'Just witnessed the most beautiful moment - an 80-year-old milonguero teaching a young dancer the cabeceo. The tradition lives on through these precious exchanges.',
37,
now() - interval '2 days',
ARRAY['nostalgia', 'tradition', 'hope'],
'{"name": "El Beso Milonga", "place_id": "ChIJ0fWEZeuEmsRnD5Pz9Qw", "coordinates": {"lat": -34.6089, "lng": -58.4089}, "formatted_address": "Riobamba 416, Buenos Aires"}'::jsonb);