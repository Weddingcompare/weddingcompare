let selectedPlaceCoords;
function initAutocomplete() {
  const input = document.getElementById('searchLocation');
  const autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    if (place.geometry) {
      selectedPlaceCoords = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };
    }
  });
}
