let venues = [];
const resultsContainer = document.getElementById('results');
const searchForm = document.getElementById('searchForm');
const sortSelect = document.getElementById('sortPrice');

document.getElementById('toggleAdvanced').addEventListener('click', () => {
  document.getElementById('advancedSearch').classList.toggle('hidden');
});

fetch('venues.json')
  .then(response => response.json())
  .then(data => {
    venues = data;
    renderResults(venues);
  });

searchForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const location = document.getElementById('locationInput').value.toLowerCase();
  const guests = parseInt(document.getElementById('guestsInput').value) || 0;
  const eveningGuests = parseInt(document.getElementById('eveningGuestsInput').value) || 0;
  const catering = document.getElementById('cateringInput').value;
  const venueType = document.getElementById('venueTypeInput').value;

  let filtered = venues.filter(v => {
    return (
      v.location.toLowerCase().includes(location) &&
      v.guests >= guests &&
      v.eveningGuests >= eveningGuests &&
      (catering === '' || v.catering === catering) &&
      (venueType === '' || v.type === venueType)
    );
  });

  renderResults(filtered);
});

sortSelect.addEventListener('change', () => {
  const selected = sortSelect.value;
  let current = [...document.querySelectorAll('.venue-card')].map(card => JSON.parse(card.dataset.raw));
  
  if (selected === 'asc') current.sort((a, b) => a.price - b.price);
  else if (selected === 'desc') current.sort((a, b) => b.price - a.price);

  renderResults(current);
});

function renderResults(data) {
  resultsContainer.innerHTML = '';
  data.forEach(v => {
    const card = document.createElement('div');
    card.className = 'venue-card';
    card.dataset.raw = JSON.stringify(v);

    card.innerHTML = `
      <h3>${v.name}</h3>
      <p><strong>Location:</strong> ${v.location}</p>
      <p><strong>Price:</strong> £${v.price.toLocaleString()}</p>
      <p><strong>Guests:</strong> ${v.guests} | Evening: ${v.eveningGuests}</p>
      <p><strong>Catering:</strong> ${v.catering === 'yes' ? 'Provided' : 'Not Provided'}</p>
      <p><strong>Type:</strong> ${capitalize(v.type)}</p>
    `;

    resultsContainer.appendChild(card);
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
