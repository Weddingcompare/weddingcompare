let venues = [];

fetch('venues.json')
  .then(response => response.json())
  .then(data => {
    venues = data;
  });

document.querySelector('.toggle-advanced').addEventListener('click', () => {
  document.getElementById('advancedSearch').classList.toggle('hidden');
});

document.getElementById('venueSearchForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const locationInput = document.getElementById('venueLocation').value.toLowerCase();
  const dayGuests = parseInt(document.getElementById('venueDayGuests').value) || 0;
  const eveningGuests = parseInt(document.getElementById('venueEveningGuests').value) || 0;

  const results = venues
    .filter(venue => venue.location.toLowerCase().includes(locationInput))
    .map(venue => {
      const totalCost =
        venue.pricing.venueHire +
        (dayGuests * (venue.pricing.mealPerGuest + venue.pricing.drinksPerGuest)) +
        (eveningGuests * venue.pricing.eveningFoodPerGuest);

      return {
        ...venue,
        estimatedCost: totalCost.toFixed(2)
      };
    });

  const resultsDiv = document.getElementById('venueResults');
  resultsDiv.innerHTML = '';

  results.forEach(venue => {
    const div = document.createElement('div');
    div.className = 'venue-result';
    div.innerHTML = `
      <img src="${venue.image}" alt="${venue.name}" class="venue-img"/>
      <div>
        <h3>${venue.name}</h3>
        <p><strong>Location:</strong> ${venue.location}</p>
        <p><strong>Type:</strong> ${venue.type}</p>
        <p><strong>Catering:</strong> ${venue.cateringProvided ? 'Yes' : 'No'}</p>
        <p><strong>Venue Hire:</strong> £${venue.pricing.venueHire.toLocaleString()}</p>
        <p><strong>Estimated Total:</strong> £${venue.estimatedCost}</p>
        <p><a href="${venue.contact.website}" target="_blank">Visit website</a></p>
      </div>
    `;
    resultsDiv.appendChild(div);
  });
});
