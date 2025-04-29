
let dayGuests = 0;
let eveningGuests = 0;
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

const toggleBtn = document.getElementById("toggleAdvanced");
toggleBtn.addEventListener("click", () => {
  const adv = document.getElementById("advancedSearch");
  const isVisible = adv.style.display === "block";
  adv.style.display = isVisible ? "none" : "block";
  toggleBtn.textContent = isVisible ? "Advanced Search" : "Hide Advanced Search";
});

document.getElementById("venueSearchForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  if (!selectedPlaceCoords) return alert("Please select a valid location.");

  const radiusMiles = parseFloat(document.getElementById("searchRadius").value);
  dayGuests = parseInt(document.getElementById("venueDayGuests").value) || 0;
  eveningGuests = parseInt(document.getElementById("venueEveningGuests").value) || 0;

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
    if ((dayGuests + eveningGuests) > venue.max_evening_guests) return false;
    return true;
  });

  sortResults();
  displayPage(1);
  setTimeout(() => document.getElementById("venueResults").scrollIntoView({ behavior: 'smooth' }), 100);
});

document.getElementById("sortFilter").addEventListener("change", () => {
  sortResults();
  displayPage(1);
});

function parsePrice(str) {
  return parseFloat(str.replace(/[^\d.]/g, "")) || 0;
}

function sortResults() {
  const sort = document.getElementById("sortFilter").value;
  filteredVenues.sort((a, b) => {
    if (sort === "price-asc") return getCost(a) - getCost(b);
    if (sort === "price-desc") return getCost(b) - getCost(a);
    if (sort === "distance") return a.distance - b.distance;
    return 0;
  });
}

const getCost = v => {
  if (typeof v.estimated_cost === 'number') return v.estimated_cost;
  if (typeof v.average_cost === 'number') return v.average_cost;
  return Infinity;
};

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
    resultsContainer.innerHTML = "<p>No venues found within the selected radius. Try increasing the distance or adjusting your guest numbers.</p>";
    return;
  }

  venuesToShow.forEach(venue => {
    const useEstimate = document.getElementById("venueDayGuests").value && document.getElementById("venueEveningGuests").value;
    const totalCost = useEstimate ? (
      parsePrice(venue.price_per_day_guest) * dayGuests +
      parsePrice(venue.price_per_evening_guest) * eveningGuests +
      (typeof venue.venue_hire === 'number' ? venue.venue_hire : parseFloat(venue.venue_hire) || 0)
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
      <p><strong>${useEstimate ? 'Estimated Total:' : 'Average Total:'}</strong> £${useEstimate ? totalCost.toLocaleString() : venue.average_cost.toLocaleString()}</p>
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
  const R = 3958.8;
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

document.querySelector("h1").addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

document.getElementById("clearSearch").addEventListener("click", () => {
  document.getElementById("venueSearchForm").reset();
  document.getElementById("advancedSearch").style.display = "none";
  document.getElementById("toggleAdvanced").textContent = "Advanced Search";
  document.getElementById("venueResults").innerHTML = "";
  document.getElementById("pagination").innerHTML = "";
  selectedPlaceCoords = null;
});
