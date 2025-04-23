
function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

document.getElementById('venueSearchForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const location = document.getElementById('venueLocation').value;
  const radius = parseFloat(document.getElementById('searchRadius').value);
  const dayGuests = parseInt(document.getElementById('venueDayGuests').value) || 0;
  const eveningGuests = parseInt(document.getElementById('venueEveningGuests').value) || 0;

  console.log("Searching for location:", location);

  fetch(`https://gleaming-selkie-1a0c21.netlify.app/.netlify/functions/get-coordinates?q=${encodeURIComponent(location)}`)
    .then(response => response.json())
    .then(searchCoords => {
      console.log("Received coords:", searchCoords);

      if (!searchCoords.lat || !searchCoords.lng) {
        alert('Could not find location.');
        return;
      }

      fetch('venues.json')
        .then(res => res.json())
        .then(venues => {
          console.log("Loaded venues.json:", venues);

          let results = venues.map(v => {
            const distance = getDistanceFromLatLonInMiles(
              searchCoords.lat, searchCoords.lng,
              v.coordinates.lat, v.coordinates.lng
            );

            const estimatedCost =
              v.pricing.venueHire +
              dayGuests * (v.pricing.mealPerGuest + v.pricing.drinksPerGuest) +
              eveningGuests * v.pricing.eveningFoodPerGuest +
              v.pricing.extras.reduce((sum, item) => sum + item.price, 0);

            return {
              ...v,
              distance: distance.toFixed(1),
              estimatedCost: estimatedCost.toFixed(2)
            };
          });

          results = results.filter(v => parseFloat(v.distance) <= radius);
          console.log("Filtered venues within radius:", results);

          displayVenues(results);

          document.getElementById('sortFilter').addEventListener('change', function() {
            const sortBy = this.value;
            if (sortBy === 'price-asc') {
              results.sort((a, b) => parseFloat(a.estimatedCost) - parseFloat(b.estimatedCost));
            } else if (sortBy === 'price-desc') {
              results.sort((a, b) => parseFloat(b.estimatedCost) - parseFloat(a.estimatedCost));
            } else if (sortBy === 'distance') {
              results.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
            }
            displayVenues(results);
          });
        })
        .catch(err => console.error("Error loading venues.json:", err));
    })
    .catch(err => {
      console.error("Error fetching coordinates:", err);
    });
});

function displayVenues(venues) {
  const container = document.getElementById('venueResults');
  container.innerHTML = '';
  if (venues.length === 0) {
    container.innerHTML = '<p>No venues found within the selected distance.</p>';
    return;
  }

  venues.forEach(v => {
    const div = document.createElement('div');
    div.className = 'venue-card';
    div.innerHTML = `
      <div class="venue-details">
        <h3>${v.name}</h3>
        <p><strong>Location:</strong> ${v.location}</p>
        <p><strong>Distance:</strong> ${v.distance} miles from search location</p>
        <p><strong>Type:</strong> ${v.type}</p>
        <p><strong>Guest Capacity:</strong> Min ${v.guests.minDay}, Max ${v.guests.maxDay} (Day), Max ${v.guests.maxEvening} (Evening)</p>
        <p><strong>Includes:</strong> ${(v.pricing.inclusions || '2 canapés, 1/2 bottle wine, welcome drinks')}</p>
        <p><strong>Price per guest:</strong> £${(v.pricing.mealPerGuest + v.pricing.drinksPerGuest).toFixed(2)} (meal + drinks)</p>
        <p><strong>Evening guest cost:</strong> £${v.pricing.eveningFoodPerGuest.toFixed(2)}</p>
        <p><strong>Extras:</strong> ${v.pricing.extras.map(e => e.item + ': £' + e.price.toFixed(2)).join(', ')}</p>
        <p><strong>Estimated Total:</strong> £${v.estimatedCost}</p>
        <p><strong>Website:</strong> <a href="${v.contact.website}" target="_blank">${v.contact.website}</a></p>
      </div>`;
    container.appendChild(div);
  });
}
