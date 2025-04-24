
let selectedPlaceCoords = null;
let currentPage = 1;
let filteredVenues = [];

function initAutocomplete() {
  const input = document.getElementById("locationInput");
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener("place_changed", function () {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;
    selectedPlaceCoords = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
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
  const dayGuests = parseInt(document.getElementById("venueDayGuests").value) || null;
  const eveningGuests = parseInt(document.getElementById("venueEveningGuests").value) || null;

  const venues = await fetch("venues.json").then(res => res.json());

  filteredVenues = venues.map(venue => {
    const distance = getDistanceFromLatLonInMiles(
      selectedPlaceCoords.lat,
      selectedPlaceCoords.lng,
      venue.latitude,
      venue.longitude
    );
    return { ...venue, distance };
  }).filter(venue => venue.distance <= radiusMiles &&
    (!dayGuests || (venue.min_day_guests <= dayGuests && dayGuests <= venue.max_day_guests)) &&
    (!eveningGuests || eveningGuests <= venue.max_evening_guests)
  );

  const sort = document.getElementById("sortFilter").value;
  filteredVenues.sort((a, b) => {
    if (sort === "price-asc") return a.estimated_cost - b.estimated_cost;
    if (sort === "price-desc") return b.estimated_cost - a.estimated_cost;
    if (sort === "distance") return a.distance - b.distance;
    return 0;
  });

  currentPage = 1;
  displayPaginatedResults();
});

function displayPaginatedResults() {
  const resultsContainer = document.getElementById("venueResults");
  const paginationContainer = document.getElementById("pagination");
  resultsContainer.innerHTML = "";
  paginationContainer.innerHTML = "";

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredVenues.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const venuesToShow = filteredVenues.slice(start, end);

  if (venuesToShow.length === 0) {
    resultsContainer.innerHTML = "<p>No venues found within the selected radius.</p>";
    return;
  }

  venuesToShow.forEach(venue => {
    const totalCost = venue.estimated_cost;
    const div = document.createElement("div");
    div.className = "venue";
    div.innerHTML = `
      <h2>${venue.name}</h2>
      <p><strong>Location:</strong> ${venue.location} (${venue.distance.toFixed(1)} miles)</p>
      <p><strong>Type:</strong> ${venue.type}</p>
      <p><strong>Guests:</strong> Min ${venue.min_day_guests}, Max ${venue.max_day_guests} day, Max ${venue.max_evening_guests} evening</p>
      <p><strong>Price per day guest:</strong> £${venue.price_per_day_guest} (${venue.day_guest_includes})</p>
      <p><strong>Price per evening guest:</strong> £${venue.price_per_evening_guest} (${venue.evening_guest_includes})</p>
      <p><strong>Extras:</strong> ${venue.extra_costs}</p>
      <p><strong>Exclusions:</strong> ${venue.exclusions}</p>
      <p><strong>Estimated Total:</strong> £${totalCost.toFixed(2)}</p>
      <p><strong>Contact:</strong> ${venue.contact}</p>
      <p><a href="${venue.website}" target="_blank">Visit Venue Website</a></p>
    `;
    resultsContainer.appendChild(div);
  });

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      displayPaginatedResults();
    };
    if (i === currentPage) btn.disabled = true;
    paginationContainer.appendChild(btn);
  }
}

document.getElementById("sortFilter").addEventListener("change", () => {
  displayPaginatedResults();
});

function toggleAdvancedSearch() {
  const adv = document.getElementById("advancedSearch");
  adv.style.display = adv.style.display === "none" ? "block" : "none";
}

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
