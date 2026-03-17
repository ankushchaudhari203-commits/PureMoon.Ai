"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

type Place = {
  name: string;
  lat: number;
  lng: number;
};

type Props = {
  restaurants: Place[];
  hotels: Place[];
};

export default function TripMap({ restaurants, hotels }: Props) {

  const places = [...restaurants, ...hotels];
  

  const center: [number, number] =
    places.length > 0
      ? [places[0].lat, places[0].lng]
      : [30.2672, -97.7431]; // Austin fallback

  return (
    <div className="mt-6 rounded-xl overflow-hidden">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {restaurants
  .filter(r => r.lat && r.lng)
  .map((r, i) => (
    <Marker key={`r-${i}`} position={[r.lat, r.lng]}>
      <Popup>{r.name}</Popup>
    </Marker>
))}

        {hotels
  .filter(h => h.lat && h.lng)
  .map((h, i) => (
    <Marker key={`h-${i}`} position={[h.lat, h.lng]}>
      <Popup>{h.name}</Popup>
    </Marker>
))}

      </MapContainer>
    </div>
  );
}