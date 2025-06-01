export const generateLeafletHTML = ({
  center,
  markers = [],
  zoom = 15,
  enableClick = true,
  fitBounds = true
}: {
  center: { lat: number; lng: number };
  markers?: Array<{
    id: string;
    lat: number;
    lng: number;
    title?: string;
    description?: string;
    icon?: string;
  }>;
  zoom?: number;
  enableClick?: boolean;
  fitBounds?: boolean;
}) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Leaflet Map</title>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        body { margin: 0; padding: 0; }
        #map { height: 100vh; width: 100vw; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        // Initialize map
        var map = L.map('map').setView([${center.lat}, ${center.lng}], ${zoom});
        
        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Add markers
        ${markers.map(marker => `
          var marker_${marker.id} = L.marker([${marker.lat}, ${marker.lng}])
            .addTo(map)
            ${marker.title || marker.description ? 
              `.bindPopup('<b>${marker.title || ''}</b><br>${marker.description || ''}')` : 
              ''};
        `).join('')}

        ${enableClick ? `
        // Handle map clicks
        var clickMarker;
        map.on('click', function(e) {
          // Remove existing click marker if any
          if (clickMarker) {
            map.removeLayer(clickMarker);
          }
          
          // Add new marker
          clickMarker = L.marker([e.latlng.lat, e.latlng.lng]).addTo(map);
          
          // Send coordinates to React Native
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'mapPress',
            lat: e.latlng.lat,
            lng: e.latlng.lng
          }));
        });
        ` : ''}

        ${fitBounds && markers.length > 1 ? `
        // Fit map to show all markers
        var group = new L.featureGroup([${markers.map(m => `marker_${m.id}`).join(', ')}]);
        map.fitBounds(group.getBounds().pad(0.1));
        ` : ''}
      </script>
    </body>
    </html>
  `;
}; 