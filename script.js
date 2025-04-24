
document.getElementById("venueSearchForm").addEventListener("submit", function (e) {
  e.preventDefault();
  if (!selectedPlaceCoords) {
    alert("Please select a valid location.");
    return;
  }
  console.log("Search submitted with location:", selectedPlaceCoords);
  // This is where filtering logic would go.
});
