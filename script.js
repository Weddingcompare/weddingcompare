
let selectedPlaceCoords = null;
let venuesData = [];

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

  // Geocode each venue and store lat/lng
  const geocodedVenues = await Promise.all(
    venues.map(async (venue) => {
      const coords = await geocodeAddress(venue.location);
      return { ...venue, latitude: coords.lat, longitude: coords.lng };
    })
  );

  const resultsContainer = document.getElementById("venueResults");
  resultsContainer.innerHTML = "";

  const filtered = geocodedVenues.map(venue => {
    const distance = getDistanceFromLatLonInMiles(
      selectedPlaceCoords.lat,
      selectedPlaceCoords.lng,
      venue.latitude,
      venue.longitude
    );
    return { ...venue, distance };
  }).filter(venue => venue.distance <= radiusMiles);

  filtered.sort((a, b) => {
    const sort = document.getElementById("sortFilter").value;
    if (sort === "price-asc") return a.estimated_cost - b.estimated_cost;
    if (sort === "price-desc") return b.estimated_cost - a.estimated_cost;
    if (sort === "distance") return a.distance - b.distance;
    return 0;
  });

  if (filtered.length === 0) {
    resultsContainer.innerHTML = "<p>No venues found within the selected radius.</p>";
    return;
  }

  filtered.forEach(venue => {
    const totalCost = (venue.price_per_day_guest * dayGuests) + (venue.price_per_evening_guest * eveningGuests) + (venue.venue_hire === 'n/a' ? 0 : parseFloat(venue.venue_hire)) || 0;
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
      <p><strong>Estimated Total:</strong> £${totalCost.toFixed(2)}</p>
      <p><strong>Contact:</strong> ${venue.contact}</p>
      <p><a href="${venue.website}" target="_blank">Visit Venue Website</a></p>
    `;
    resultsContainer.appendChild(div);
  });
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

async function geocodeAddress(address) {
  const apiKey = "AIzaSyAJXeRrxloBHXxMbsEQK9otj3JuTe5eGAE";
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
  const data = await response.json();
  if (data.status === "OK") {
    return data.results[0].geometry.location;
  } else {
    console.error("Geocoding failed for:", address);
    return { lat: 0, lng: 0 };
  }
}

document.getElementById("sortFilter").addEventListener("change", () => {
  document.getElementById("venueSearchForm").dispatchEvent(new Event("submit"));
});
