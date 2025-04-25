let selectedPlaceCoords;
let currentPage = 1;
let resultsPerPage = 10;
let filteredVenues = [];

function initAutocomplete() {
  const input = document.getElementById('venueLocation');
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (!place.geometry) return;
    selectedPlaceCoords = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };
  });
}

document.getElementById("toggleAdvanced").addEventListener("click", () => {
  const adv = document.getElementById("advancedSearch");
  adv.style.display = adv.style.display === "none" ? "block" : "none";
});

document.getElementById("venueSearchForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!selectedPlaceCoords) return alert("Please select a valid location.");

  const radiusMiles = parseFloat(document.getElementById("searchRadius").value);
  const dayGuests = parseInt(document.getElementById("venueDayGuests").value) || 0;
  const eveningGuests = parseInt(document.getElementById("venueEveningGuests").value) || 0;

  const venues = await fetch("venues.json").then(res => res.json());

  filteredVenues = venues.map(venue => {
    const distance = getDistanceFromLatLonInMiles(
      selectedPlaceCoords.lat,
      selectedPlaceCoords.lng,
      venue.latitude,
      venue.longitude
    );
    return { ...venue, distance };
  }).filter(venue => {
    if (venue.distance > radiusMiles) return false;
    if (dayGuests && (dayGuests < venue.min_day_guests || dayGuests > venue.max_day_guests)) return false;
    if (eveningGuests > 0 && eveningGuests > venue.max_evening_guests) return false;
    return true;
  });

  sortResults();
  displayPage(1);
});

document.getElementById("sortFilter").addEventListener("change", () => {
  sortResults();
  displayPage(1);
});

function sortResults() {
  const sort = document.getElementById("sortFilter").value;
  filteredVenues.sort((a, b) => {
    if (sort === "price-asc") return (a.estimated_cost || a.average_cost) - (b.estimated_cost || b.average_cost);
    if (sort === "price-desc") return (b.estimated_cost || b.average_cost) - (a.estimated_cost || a.average_cost);
    if (sort === "distance") return a.distance - b.distance;
    return 0;
  });
}

function displayPage(page) {
  currentPage = page;
  const resultsContainer = document.getElementById("venueResults");
  const paginationContainer = document.getElementById("pagination");
  resultsContainer.innerHTML = "";
  paginationContainer.innerHTML = "";

  const start = (page - 1) * resultsPerPage;
  const end = start + resultsPerPage;
  const venuesToShow = filteredVenues.slice(start, end);

  if (venuesToShow.length === 0) {
    resultsContainer.innerHTML = "<p>No venues found within the selected radius.</p>";
    return;
  }

  venuesToShow.forEach(venue => {
    const useEstimate = dayGuests > 0;
    const totalCost = useEstimate ? (
  parseInt(venue.price_per_day_guest.replace('£', '').replace('pp', '').trim()) * dayGuests +
  parseInt(venue.price_per_evening_guest.replace('£', '').replace('pp', '').trim()) * eveningGuests +
  (typeof venue.venue_hire === 'number' ? venue.venue_hire : 0)
) : 0;
    const div = document.createElement("div");
    div.className = "venue";
    div.innerHTML = `
      <h2>${venue.name}</h2>
      <p><strong>Location:</strong> ${venue.location} (${venue.distance.toFixed(1)} miles)</p>
      <p><strong>Type:</strong> ${venue.type}</p>
<p><strong>Venue Hire:</strong> ${venue.venue_price}</p>
      <p><strong>Guests:</strong> ${venue.min_day_guests}-${venue.max_day_guests} day, up to ${venue.max_evening_guests} evening</p>
      <p><strong>Day Price:</strong> ${venue.price_per_day_guest} (${venue.day_guest_includes})</p>
      <p><strong>Evening Price:</strong> ${venue.price_per_evening_guest} (${venue.evening_guest_includes})</p>
      <p><strong>Extras:</strong> ${venue.extra_costs}</p>
      <p><strong>Excludes:</strong> ${venue.exclusions}</p>
      <p><strong>${useEstimate ? 'Estimated Total:' : 'Average Total:'}</strong> £${useEstimate ? totalCost.toFixed(2) : (venue.average_cost)}</p>
      <p><strong>Contact:</strong> ${venue.contact || "Not listed"}</p>
      <a href="${venue.website}" target="_blank">Visit Website</a>
    `;
    resultsContainer.appendChild(div);
  });

  const pages = Math.ceil(filteredVenues.length / resultsPerPage);
  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.onclick = () => displayPage(i);
    paginationContainer.appendChild(btn);
  }
}

function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Radius of Earth in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
function deg2rad(deg) {
  return deg * (Math.PI/180);
}
