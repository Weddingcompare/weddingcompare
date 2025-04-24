import { PlaceAutocompleteElement } from 'https://unpkg.com/@googlemaps/extended-component-library/place_autocomplete_element.js';

let selectedPlaceCoords = null;
const autocompleteElement = document.getElementById("autocomplete");
autocompleteElement.addEventListener("gmpx-placechange", async (e) => {
  const place = e.detail;
  if (place && place.location) {
    selectedPlaceCoords = {
      lat: place.location.lat,
      lng: place.location.lng
    };
  }
});

document.getElementById("toggleAdvancedSearch").addEventListener("click", () => {
  const adv = document.getElementById("advancedSearch");
  adv.style.display = adv.style.display === "none" ? "block" : "none";
});

document.getElementById("venueSearchForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!selectedPlaceCoords) {
    alert("Please select a valid location.");
    return;
  }
  const radiusMiles = parseFloat(document.getElementById("searchRadius").value);
  const dayGuests = parseInt(document.getElementById("venueDayGuests").value) || 0;
  const eveningGuests = parseInt(document.getElementById("venueEveningGuests").value) || 0;
  const venues = await fetch("venues.json").then(res => res.json());
  const resultsContainer = document.getElementById("venueResults");
  const paginationContainer = document.getElementById("pagination");
  resultsContainer.innerHTML = "";
  paginationContainer.innerHTML = "";

  const filtered = venues.map(venue => {
    const distance = getDistanceFromLatLonInMiles(
      selectedPlaceCoords.lat,
      selectedPlaceCoords.lng,
      venue.latitude,
      venue.longitude
    );
    return { ...venue, distance };
  }).filter(venue => venue.distance <= radiusMiles &&
    (!dayGuests || (dayGuests >= venue.min_day_guests && dayGuests <= venue.max_day_guests)) &&
    (!eveningGuests || eveningGuests <= venue.max_evening_guests));

  const sort = document.getElementById("sortFilter").value;
  if (sort === "price-asc") filtered.sort((a, b) => (a.estimated_cost || a.average_cost) - (b.estimated_cost || b.average_cost));
  if (sort === "price-desc") filtered.sort((a, b) => (b.estimated_cost || b.average_cost) - (a.estimated_cost || a.average_cost));
  if (sort === "distance") filtered.sort((a, b) => a.distance - b.distance);

  if (filtered.length === 0) {
    resultsContainer.innerHTML = "<p>No venues found within the selected radius.</p>";
    return;
  }

  const pageSize = 10;
  let currentPage = 1;

  function renderPage(page) {
    resultsContainer.innerHTML = "";
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageItems = filtered.slice(start, end);
    pageItems.forEach(venue => {
      const totalCost = dayGuests && eveningGuests ?
        (venue.price_per_day_guest * dayGuests) + (venue.price_per_evening_guest * eveningGuests) + (parseFloat(venue.venue_hire) || 0)
        : null;
      const div = document.createElement("div");
      div.className = "venue";
      div.innerHTML = `
        <h2>${venue.name}</h2>
        <p><strong>Location:</strong> ${venue.location} (${venue.distance.toFixed(1)} miles away)</p>
        <p><strong>Type:</strong> ${venue.type}</p>
        <p><strong>Guests:</strong> Min ${venue.min_day_guests}, Max ${venue.max_day_guests} day, Max ${venue.max_evening_guests} evening</p>
        <p><strong>Price per day guest:</strong> £${venue.price_per_day_guest} (${venue.day_guest_includes})</p>
        <p><strong>Price per evening guest:</strong> £${venue.price_per_evening_guest} (${venue.evening_guest_includes})</p>
        <p><strong>Extras:</strong> ${venue.extra_costs}</p>
        <p><strong>Exclusions:</strong> ${venue.exclusions}</p>
        <p><strong>${dayGuests || eveningGuests ? "Estimated Total" : "Average Cost"}:</strong> £${dayGuests || eveningGuests ? totalCost.toFixed(2) : (venue.average_cost || "N/A")}</p>
        <p><strong>Contact:</strong> ${venue.contact}</p>
        <p><a href="${venue.website}" target="_blank">Visit Venue Website</a></p>
      `;
      resultsContainer.appendChild(div);
    });

    paginationContainer.innerHTML = "";
    const totalPages = Math.ceil(filtered.length / pageSize);
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement("button");
      btn.textContent = i;
      btn.onclick = () => renderPage(i);
      if (i === page) btn.className = "active";
      paginationContainer.appendChild(btn);
    }
  }

  renderPage(currentPage);
});

function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}