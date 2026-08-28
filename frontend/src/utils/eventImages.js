const CATEGORY_IMAGES = {
  music:
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=800&q=70',
  sports:
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=70',
  technology:
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=70',
  'food & drink':
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=70',
  'art & culture':
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262?auto=format&fit=crop&w=800&q=70',
  business:
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=70',
  'health & wellness':
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=70',
  education:
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=800&q=70',
};

export const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=70';

export const getCategoryImage = (categoryName) => {
  if (!categoryName) return null;
  const name = String(categoryName).toLowerCase().trim();
  if (CATEGORY_IMAGES[name]) return CATEGORY_IMAGES[name];
  const match = Object.keys(CATEGORY_IMAGES).find(
    (key) => name.includes(key) || key.includes(name)
  );
  return match ? CATEGORY_IMAGES[match] : null;
};

export const getEventImage = (event) => {
  if (!event) return DEFAULT_EVENT_IMAGE;
  const categoryImage = getCategoryImage(event.category_name);
  if (categoryImage) return categoryImage;
  if (event.banner) return event.banner;
  const images = event.gallery || event.images || [];
  if (images.length > 0 && images[0].image) return images[0].image;
  return DEFAULT_EVENT_IMAGE;
};
