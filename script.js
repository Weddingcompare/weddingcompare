
document.getElementById("venueSearchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  if (!selectedPlaceCoords) {
    alert("Please select a valid location.");
    return;
  }
  console.log("Search submitted with location:", selectedPlaceCoords);
  // Filtering logic goes here
});
