export const displayMap = (location) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWFkaHVzaGFua2FzZ3JuMjEiLCJhIjoiY2xrcWRvcGlyMnJwYzNtcnoycTVjNDI4ZSJ9.XirL5Q6eY2kpbcQa8nUkLg';

  var map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/madhushankasgrn21/clkqg9jdw00n001qy23vacsa9', // style URL
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  location.forEach((loc) => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);
    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};

//******** */
// const mapBox = document.getElementById('map');

// // VALUES

// //***display map
// if (mapBox) {
//   const locations = JSON.parse(mapBox.dataset.locations);
//   displayMap(locations);
// }
