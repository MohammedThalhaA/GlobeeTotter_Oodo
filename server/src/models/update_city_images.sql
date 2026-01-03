-- Update cities with Unsplash image URLs
-- Beautiful, high-quality landscape/cityscape images

UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80' WHERE name = 'Paris';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80' WHERE name = 'Tokyo';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80' WHERE name = 'New York';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80' WHERE name = 'Rome';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800&q=80' WHERE name = 'Barcelona';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80' WHERE name = 'Bali';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80' WHERE name = 'Dubai';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80' WHERE name = 'Sydney';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&q=80' WHERE name = 'London';
UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=800&q=80' WHERE name = 'Singapore';

-- Verify the update
SELECT name, image_url FROM cities;
