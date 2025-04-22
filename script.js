fetch('venues.json')
  .then(response => response.json())
  .then(venues => {
    document.querySelector('#venueSearchForm').addEventListener('submit', function (e) {
      e.preventDefault();
      const locationInput = document.querySelector('#venueLocation').value.toLowerCase();
      const dayGuests = parseInt(document.querySelector('#venueDayGuests').value);
      const eveningGuests = parseInt(document.querySelector('#venueEveningGuests').value);

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
  });
