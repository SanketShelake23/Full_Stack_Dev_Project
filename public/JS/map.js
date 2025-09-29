
const token = mapToken; // server injects env token
const map = new maplibregl.Map({
  container: 'map',
  style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${token}`,
  center: listing.geometry.coordinates, // Listing.geometry.coordinates, position(lng,lat)
  zoom: 9
});
  
// Add zoom and rotation controls
  map.addControl(new maplibregl.NavigationControl());

// Add Marker
  const marker = new maplibregl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)   //Listing.geometry.coordinates
    
    .setPopup( new maplibregl.Popup({offset:25})
         .setHTML(`<h6 style="color:#fe424d;">${listing.title}</h6><p style="color:black;">Exact Location will be provided after booking!<p>`)
     )

    .addTo(map);

// ---- Add red circular zone around marker ----
map.on('load', () => {
  map.addSource('marker-circle', {
    type: 'geojson',
    data: {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: listing.geometry.coordinates,
      },
    },
  });

  map.addLayer({
    id: 'marker-circle-layer',
    type: 'circle',
    source: 'marker-circle',
    paint: {
      'circle-radius': 40,           // size in pixels (increase or decrease as needed)
      'circle-color': '#fe424d',     // red fill color
      'circle-opacity': 0.4,         // soft transparency
      'circle-stroke-color': '#fe424d',
      'circle-stroke-width': 1,
    },
  });
});
