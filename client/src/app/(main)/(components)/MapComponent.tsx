

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";

const MapComponent = ({ origin, destination }:any) => {
  const mapStyles = {
    height: "400px",
    width: "100%",
  };

  const positions = [
    [origin.lat, origin.lng],
    [destination.lat, destination.lng],
  ];

  return (
    <MapContainer center={positions[0]} zoom={7} style={mapStyles}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />

      {/* Origin Marker */}
      <Marker position={positions[0]}>
        <Popup>Origin: {origin.address}</Popup>
      </Marker>

      {/* Destination Marker */}
      <Marker position={positions[1]}>
        <Popup>Destination: {destination.address}</Popup>
      </Marker>

      {/* Draw Route Line */}
      <Polyline positions={positions} color="blue" />
    </MapContainer>
  );
};

export default MapComponent;
