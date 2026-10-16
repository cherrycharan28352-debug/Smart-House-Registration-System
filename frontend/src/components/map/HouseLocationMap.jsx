import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { ExternalLink, Home, User, MapPin } from 'lucide-react';

const createHousePin = (color = '#1e40af') => {
  return L.divIcon({
    className: 'custom-house-pin',
    html: `
      <div style="transform: translate(-50%, -100%);">
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 40 16 40C16 40 32 28 32 16C32 7.16 24.84 0 16 0Z" fill="${color}"/>
          <circle cx="16" cy="16" r="6" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40]
  });
};

const HouseLocationMap = ({
  houses = [],
  singleHouse,
  center,
  zoom = 13,
  height = 'h-96'
}) => {
  // Normalize items
  const items = singleHouse ? [singleHouse] : houses;
  const validHouses = items.filter(
    (h) =>
      h?.gps?.latitude !== undefined &&
      h?.gps?.latitude !== null &&
      h?.gps?.latitude !== '' &&
      !isNaN(Number(h?.gps?.latitude)) &&
      h?.gps?.longitude !== undefined &&
      h?.gps?.longitude !== null &&
      h?.gps?.longitude !== '' &&
      !isNaN(Number(h?.gps?.longitude))
  );

  const defaultCenter = center || (validHouses.length > 0
    ? [Number(validHouses[0].gps.latitude), Number(validHouses[0].gps.longitude)]
    : [12.9716, 77.5946]); // Karnataka reference center

  const mapZoom = validHouses.length > 0 ? (singleHouse ? 15 : zoom) : 10;

  return (
    <div className={`w-full ${height} rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0`}>
      {singleHouse && validHouses.length === 0 && (
        <div className="absolute inset-0 bg-slate-100/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-4 text-center">
          <MapPin className="w-8 h-8 text-slate-400 mb-2 stroke-[1.5]" />
          <p className="text-xs font-bold text-slate-700">
            GPS ಲೊಕೇಶನ್ ದಾಖಲಿಸಿಲ್ಲ (ಐಚ್ಛಿಕ)
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            GPS Coordinates were not captured for this house (Optional).
          </p>
        </div>
      )}
      <MapContainer
        center={defaultCenter}
        zoom={mapZoom}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validHouses.map((h) => {
          const lat = h.gps.latitude;
          const lng = h.gps.longitude;
          const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

          return (
            <Marker
              key={h._id || h.houseId}
              position={[lat, lng]}
              icon={createHousePin(h.houseType === 'Apartment' ? '#0284c7' : '#1e3a8a')}
            >
              <Popup>
                <div className="p-1 min-w-[200px]">
                  <div className="flex items-center justify-between border-b pb-1 mb-1.5">
                    <span className="font-extrabold text-xs text-blue-700">{h.houseId}</span>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                      {h.houseType}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-800">
                    {h.houseNumber}, {h.streetName}
                  </p>
                  <p className="text-[11px] text-slate-500">{h.locality}, {h.city}</p>

                  {h.owner && (
                    <p className="text-[11px] text-slate-600 mt-1 flex items-center">
                      <User className="w-3 h-3 mr-1 text-slate-400" />
                      Owner: {h.owner.fullName || 'Recorded'}
                    </p>
                  )}

                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      to={`/houses/${h.houseId || h._id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800"
                    >
                      View House &rarr;
                    </Link>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-slate-500 hover:text-slate-800 inline-flex items-center"
                    >
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default HouseLocationMap;
