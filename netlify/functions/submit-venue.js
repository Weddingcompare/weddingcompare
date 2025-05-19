const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  try {
    const formData = JSON.parse(event.body);

    const venuesPath = path.join(__dirname, '..', '..', 'venues.json');
    const venuesRaw = fs.readFileSync(venuesPath);
    const venues = JSON.parse(venuesRaw);

    const newVenue = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      average_cost: parseInt(formData.average_cost),
      estimated_cost: parseInt(formData.estimated_cost),
    };

    venues.push(newVenue);

    fs.writeFileSync(venuesPath, JSON.stringify(venues, null, 2));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Venue added!' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: 'Failed to process: ' + error.message,
    };
  }
};
