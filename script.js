let venues = [];

fetch('venues.json')
  .then(res => res.json())
  .then(data => venues = data);

document.querySelector('.toggle-advanced').addEventListener('click', () => {
  document.getElementById('advancedSearch').classList.toggle('hidden');
});

document.getElementById('venueSearchForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const locationInput = document.getElementById('venueLocation').value.toLowerCase();
  const dayGuests = parseInt(document.getElementById('venueDayGuests').value) || 0;
  const eveningGuests = parseInt(document.getElementById('venueEveningGuests').value) || 0;

  const resultsDiv = document.getElementById('venueResults');
  resultsDiv.innerHTML = '';

  venues
    .filter(v => v.location.toLowerCase().includes(locationInput))
    .forEach(v => {
      const estimatedCost = (
        v.pricing.venueHire +
        dayGuests * (v.pricing.mealPerGuest + v.pricing.drinksPerGuest) +
        eveningGuests * v.pricing.eveningFoodPerGuest
      ).toFixed(2);

      const div = document.createElement('div');
      div.className = 'venue-result';

      const gallery = `
        <div class="gallery-container">
          ${v.gallery.map(img => `<img src="${img}" alt="Venue photo">`).join('')}
        </div>`;

      const details = `
        <div class="venue-info">
          <h3>${v.name}</h3>
          <p><strong>Location:</strong> ${v.location}</p>
          <p><strong>Type:</strong> ${v.type}</p>
          <p><strong>Catering:</strong> ${v.cateringProvided ? 'Yes' : 'No'}</p>
          <p><strong>Venue Hire:</strong> £${v.pricing.venueHire}</p>
          <p><strong>Estimated Cost:</strong> £${estimatedCost}</p>
          <p><a href="${v.contact.website}" target="_blank">Visit Website</a></p>
        </div>`;

      div.innerHTML = gallery + details;
      resultsDiv.appendChild(div);
    });
});
