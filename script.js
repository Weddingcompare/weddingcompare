document.getElementById('toggleAdvanced').addEventListener('click', () => {
  document.getElementById('advancedSearch').classList.toggle('hidden');
});

document.getElementById('venueSearchForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const location = document.getElementById('venueLocation').value.toLowerCase();
  const dayGuests = parseInt(document.getElementById('venueDayGuests').value) || 0;
  const eveningGuests = parseInt(document.getElementById('venueEveningGuests').value) || 0;

  fetch('venues.json')
    .then(res => res.json())
    .then(venues => {
      const results = venues.filter(v => v.location.toLowerCase().includes(location));
      const container = document.getElementById('venueResults');
      container.innerHTML = '';

      results.forEach(v => {
        const estimatedCost = (
          v.pricing.venueHire +
          dayGuests * (v.pricing.mealPerGuest + v.pricing.drinksPerGuest) +
          eveningGuests * v.pricing.eveningFoodPerGuest +
          v.pricing.extras.reduce((sum, item) => sum + item.price, 0)
        ).toFixed(2);

        const div = document.createElement('div');
        div.className = 'venue-card';
        div.innerHTML = `
          <div class="gallery-container">
            ${v.gallery.map(img => `<img src="${img}" alt="venue image">`).join('')}
          </div>
          <div class="venue-details">
            <h3>${v.name}</h3>
            <p><strong>Location:</strong> ${v.location}</p>
            <p><strong>Type:</strong> ${v.type}</p>
            <p><strong>Guest capacity:</strong> Min ${v.guests.minDay}, Max ${v.guests.maxDay} (Day), Max ${v.guests.maxEvening} (Evening)</p>
            <p><strong>Price per guest:</strong> £${(v.pricing.mealPerGuest + v.pricing.drinksPerGuest).toFixed(2)} (meal + drinks)</p>
            <p><strong>Evening guest cost:</strong> £${v.pricing.eveningFoodPerGuest.toFixed(2)} (food)</p>
            <p><strong>Extras:</strong> ${v.pricing.extras.map(e => e.item + ': £' + e.price.toFixed(2)).join(', ')}</p>
            <p><strong>Estimated Total:</strong> £${estimatedCost}</p>
            <p><a href="${v.contact.website}" target="_blank">Visit website</a></p>
          </div>`;
        container.appendChild(div);
      });
    });
});
