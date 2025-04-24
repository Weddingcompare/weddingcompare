let selectedPlaceCoords = null;

function initAutocomplete() {
  const input = document.getElementById("locationInput");
  const autocomplete = new google.maps.places.Autocomplete(input);

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();
    if (place.geometry && place.geometry.location) {
      selectedPlaceCoords = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()
      };
    }
  });
}
