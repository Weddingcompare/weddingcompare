let selectedPlaceCoords = null;
let currentPage = 1;
const venuesPerPage = 10;
let currentVenues = [];

function initAutocomplete() {
  const autocompleteInput = document.getElementById("autocomplete");
  const autocomplete = new google.maps.places.Autocomplete(autocompleteInput);
  autocomplete.addListener("place_changed", function () {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;
    selectedPlaceCoords = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
    };
  });
}

document.getElementById("venueSearchForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!selectedPlaceCoords) {
    alert("Please select a valid location.");
    return;
  }

  const radiusMiles = parseFloat(document.getElementById("searchRadius").value);
  const venues = await fetch("venues.json").then(res => res.json());
  const resultsWithDistance = venues.map(venue => {
    const distance = getDistanceFromLatLonInMiles(
      selectedPlaceCoords.lat,
      selectedPlaceCoords.lng,
      venue.latitude,
      venue.longitude
    );
    return { ...venue, distance };
  }).filter(venue => venue.distance <= radiusMiles);

  renderVenuesWithPagination(resultsWithDistance);
});

function renderVenuesWithPagination(venues) {
  currentVenues = venues;
  currentPage = 1;
  displayCurrentPage();
  setupPaginationControls();
}

function displayCurrentPage() {
  const start = (currentPage - 1) * venuesPerPage;
  const end = start + venuesPerPage;
  const paginatedVenues = currentVenues.slice(start, end);

  const resultsContainer = document.getElementById("venueResults");
  resultsContainer.innerHTML = "";

  if (paginatedVenues.length === 0) {
    resultsContainer.innerHTML = "<p>No venues found within the selected radius.</p>";
    return;
  }

  paginatedVenues.forEach(venue => {
    const totalCost = venue.estimated_cost;
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
      <p><strong>Estimated Total:</strong> £${totalCost}</p>
      <p><strong>Contact:</strong> ${venue.contact}</p>
      <p><a href="${venue.website}" target="_blank">Visit Venue Website</a></p>
    `;
    resultsContainer.appendChild(div);
  });
}

function setupPaginationControls() {
  const paginationContainer = document.getElementById("paginationControls");
  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(currentVenues.length / venuesPerPage);
  if (totalPages <= 1) return;
  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = "pagination-button";
    if (i === currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => {
      currentPage = i;
      displayCurrentPage();
      setupPaginationControls();
    });
    paginationContainer.appendChild(btn);
  }
}

function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}