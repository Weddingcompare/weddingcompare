
function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

document.getElementById('toggleAdvanced').addEventListener('click', () => {
  document.getElementById('advancedSearch').classList.toggle('hidden');
});

document.getElementById('venueSearchForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  const locationInput = document.getElementById('venueLocation').value;
  const radius = parseFloat(document.getElementById('searchRadius').value);
  const dayGuests = parseInt(document.getElementById('venueDayGuests').value) || 0;
  const eveningGuests = parseInt(document.getElementById('venueEveningGuests').value) || 0;

  const geoResponse = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(locationInput)}&key=267388b88dfa43eba539412fef6151a9`);
  const geoData = await geoResponse.json();

  if (!geoData.results.length) {
    alert("Location not found. Please enter a valid location.");
    return;
  }

  const searchCoords = geoData.results[0].geometry;

  fetch('venues.json')
    .then(res => res.json())
    .then(venues => {
      let results = venues.map(v => {
        const distance = getDistanceFromLatLonInMiles(
          searchCoords.lat, searchCoords.lng,
          v.coordinates.lat, v.coordinates.lng
        );

        const estimatedCost = (
          v.pricing.venueHire +
          dayGuests * (v.pricing.mealPerGuest + v.pricing.drinksPerGuest) +
          eveningGuests * v.pricing.eveningFoodPerGuest +
          v.pricing.extras.reduce((sum, item) => sum + item.price, 0)
        );

        return { ...v, distance: distance.toFixed(1), estimatedCost: estimatedCost.toFixed(2) };
      });

      results = results.filter(v => parseFloat(v.distance) <= radius);
      results.sort((a, b) => parseFloat(a.estimatedCost) - parseFloat(b.estimatedCost));

      const container = document.getElementById('venueResults');
      container.innerHTML = '';

      results.forEach(v => {
        const div = document.createElement('div');
        div.className = 'venue-card';
        div.innerHTML = `
          <div class="gallery-container">
            ${v.gallery.map(img => `<img src="${img}" alt="venue image">`).join('')}
          </div>
          <div class="venue-details">
            <h3>${v.name}</h3>
            <p><strong>Location:</strong> ${v.location} (${v.distance} miles)</p>
            <p><strong>Type:</strong> ${v.type}</p>
            <p><strong>Guest capacity:</strong> Min ${v.guests.minDay}, Max ${v.guests.maxDay} (Day), Max ${v.guests.maxEvening} (Evening)</p>
            <p><strong>Price per guest:</strong> £${(v.pricing.mealPerGuest + v.pricing.drinksPerGuest).toFixed(2)} (meal + drinks)</p>
            <p><strong>Evening guest cost:</strong> £${v.pricing.eveningFoodPerGuest.toFixed(2)} (food)</p>
            <p><strong>Extras:</strong> ${v.pricing.extras.map(e => e.item + ': £' + e.price.toFixed(2)).join(', ')}</p>
            <p><strong>Estimated Total:</strong> £${v.estimatedCost}</p>
            <p><a href="${v.contact.website}" target="_blank">Visit website</a></p>
          </div>`;
        container.appendChild(div);
      });
    });
});
