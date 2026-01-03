import pool from '../config/database';

// Update city images with HD quality parameters
const hdImages = [
    { id: 1, name: 'Paris', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&h=800&fit=crop&q=90' },
    { id: 2, name: 'Tokyo', url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&h=800&fit=crop&q=90' },
    { id: 3, name: 'New York', url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1200&h=800&fit=crop&q=90' },
    { id: 4, name: 'Rome', url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&h=800&fit=crop&q=90' },
    { id: 5, name: 'Barcelona', url: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&h=800&fit=crop&q=90' },
    { id: 6, name: 'Bali', url: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&h=800&fit=crop&q=90' },
    { id: 7, name: 'Dubai', url: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&h=800&fit=crop&q=90' },
    { id: 8, name: 'Sydney', url: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1200&h=800&fit=crop&q=90' },
    { id: 9, name: 'London', url: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&h=800&fit=crop&q=90' },
    { id: 10, name: 'Singapore', url: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&h=800&fit=crop&q=90' },
];

async function updateImages() {
    try {
        console.log('Updating city images to HD quality...\n');

        for (const city of hdImages) {
            await pool.query(
                'UPDATE cities SET image_url = $1 WHERE id = $2',
                [city.url, city.id]
            );
            console.log(`✓ Updated ${city.name} with HD image`);
        }

        console.log('\n========================================');
        console.log('All city images updated to HD quality!');
        console.log('Parameters: w=1200&h=800&fit=crop&q=90');
        console.log('========================================\n');

        process.exit(0);
    } catch (error) {
        console.error('Error updating images:', error);
        process.exit(1);
    }
}

updateImages();
