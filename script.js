let venues = [];

fetch('venues.json')
  .then(response => response.json())
  .then(data => { venues = data; });

document.querySelector('.toggle-advanced').addEventListener('click', () => {
  document.getElementById('advancedSearch').classList.toggle('hidden');
});

document.getElementById('venueSearchForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const locationInput = document.getElementById('venueLocation').value.toLowerCase();
  const dayGuests = parseInt(document.getElementById('venueDayGuests').value) || 0;
  const eveningGuests = parseInt(document.getElementById('venueEveningGuests').value) || 0;

  const results = venues
    .filter(v => v.location.toLowerCase().includes(locationInput))
    .map(v => ({
      ...v,
      estimatedCost: (
        v.pricing.venueHire +
        dayGuests * (v.pricing.mealPerGuest + v.pricing.drinksPerGuest) +
        eveningGuests * v.pricing.eveningFoodPerGuest
      ).toFixed(2)
    }));

  const resultsDiv = document.getElementById('venueResults');
  resultsDiv.innerHTML = '';
  results.forEach(v => {
    const div = document.createElement('div');
    div.className = 'venue-result';
    div.innerHTML = `
      <div class="gallery-container">
        ${v.gallery.map(img => `<img src="${img}" class="slider-img" alt="gallery image">`).join('')}
      </div>
      <div>
        <h3>${v.name}</h3>
        <p><strong>Location:</strong> ${v.location}</p>
        <p><strong>Venue Hire:</strong> £${v.pricing.venueHire.toLocaleString()}</p>
        <p><strong>Estimated Cost:</strong> £${v.estimatedCost}</p>
        <a href="${v.contact.website}" target="_blank">Visit website</a>
      </div>`;
    resultsDiv.appendChild(div);
  });
});
