
let venues = [];

fetch('venues.json')
  .then(response => response.json())
  .then(data => {
    venues = data;
    const locationInput = document.getElementById('venueLocation');
    const autocompleteList = document.getElementById('autocomplete-list');

    locationInput.addEventListener('input', function() {
      const val = this.value.toLowerCase();
      autocompleteList.innerHTML = '';

      if (!val) return;

      const matched = venues
        .map(v => v.location)
        .filter((loc, i, arr) => loc.toLowerCase().includes(val) && arr.indexOf(loc) === i);

      matched.forEach(loc => {
        const div = document.createElement('div');
        div.className = 'autocomplete-item';
        div.innerText = loc;
        div.addEventListener('click', function () {
          locationInput.value = loc;
          autocompleteList.innerHTML = '';
        });
        autocompleteList.appendChild(div);
      });
    });
  });

document.querySelector('#venueSearchForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const locationInput = document.querySelector('#venueLocation').value.toLowerCase();
  const dayGuests = parseInt(document.querySelector('#venueDayGuests').value) || 0;
  const eveningGuests = parseInt(document.querySelector('#venueEveningGuests').value) || 0;

  const results = venues
    .filter(venue => !locationInput || venue.location.toLowerCase().includes(locationInput))
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

  const resultsDiv = document.querySelector('#venueResults');
  resultsDiv.innerHTML = '';

  results.forEach(venue => {
    const div = document.createElement('div');
    div.className = 'venue-result';
    div.innerHTML = `
      <h3>${venue.name}</h3>
      <p><strong>Location:</strong> ${venue.location}</p>
      <p><strong>Type:</strong> ${venue.type}</p>
      <p><strong>Venue Hire:</strong> £${venue.pricing.venueHire.toLocaleString()}</p>
      <p><strong>Catering Provided:</strong> ${venue.cateringProvided ? 'Yes' : 'No'}</p>
      <p><strong>Contact:</strong> <a href="${venue.contact.website}" target="_blank">${venue.contact.website}</a></p>
      <p><strong>Estimated Total Cost:</strong> <span style="font-weight:bold">£${venue.estimatedCost}</span></p>
    `;
    resultsDiv.appendChild(div);
  });
});
