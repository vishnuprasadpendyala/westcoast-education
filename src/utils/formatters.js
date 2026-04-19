// Formatera pris till svenska kronor
export const formatPrice = (amount) =>
  new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK', maximumFractionDigits: 0 }).format(amount);

// Formatera datum till svenskt format
export const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });

// Beräkna genomsnittligt betyg från en lista av betyg
export const avgRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return (sum / ratings.length).toFixed(1);
};

// Generera stjärnor i HTML baserat på betyg
export const starsHtml = (ratings) => {
  const avg  = parseFloat(avgRating(ratings));
  const full = Math.floor(avg);
  const half = avg - full >= 0.5;
  let stars  = '★'.repeat(full);
  if (half) stars += '½';
  stars += '☆'.repeat(5 - full - (half ? 1 : 0));
  return `<span class="stars" aria-label="Betyg ${avg} av 5">${stars} <small>(${ratings.length})</small></span>`;
};

// Översätt kurstyp till svenska (utan ikoner)
export const typeLabel = (type) => ({
  classroom: 'Klassrum',
  distance:  'Distans',
  ondemand:  'On-demand',
}[type] || type);

// Översätt kursområde till svenska
export const areaLabel = (area) => ({
  web3:          'Web3 & Blockchain',
  ai:            'Artificiell Intelligens',
  cybersecurity: 'Cybersäkerhet',
  devops:        'DevOps & Cloud',
}[area] || area);

// Generera ett unikt ID baserat på tid och slumpmässig sträng
export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 5);