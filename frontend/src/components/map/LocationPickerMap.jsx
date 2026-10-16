import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import {
  MapPin,
  Crosshair,
  ExternalLink,
  AlertCircle,
  Navigation,
  XCircle,
  CheckCircle2
} from 'lucide-react';

// Custom sharp SVG pin icon for Leaflet
const createPinIcon = (color = '#2563eb') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="transform: translate(-50%, -100%);">
        <svg width="34" height="42" viewBox="0 0 34 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M17 0C7.61 0 0 7.61 0 17C0 29.75 17 42 17 42C17 42 34 29.75 34 17C34 7.61 26.39 0 17 0Z" fill="${color}"/>
          <circle cx="17" cy="17" r="7" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [34, 42],
    iconAnchor: [17, 42],
    popupAnchor: [0, -42]
  });
};

// Component to handle user clicks on map
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng, 'map_click');
    }
  });
  return null;
};

// Component to recenter map when coordinates change
const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], map.getZoom(), { animate: true });
    }
  }, [lat, lng, map]);
  return null;
};

const LocationPickerMap = ({
  latitude,
  longitude,
  accuracy,
  source = 'gps',
  onChange
}) => {
  const [gpsError, setGpsError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [manualLat, setManualLat] = useState(latitude !== undefined && latitude !== null ? latitude.toString() : '');
  const [manualLng, setManualLng] = useState(longitude !== undefined && longitude !== null ? longitude.toString() : '');

  // Default coordinate for map view centering when none provided (Karnataka central center)
  const defaultCenterLat = 12.9716;
  const defaultCenterLng = 77.5946;

  const hasLocation =
    latitude !== undefined &&
    latitude !== null &&
    latitude !== '' &&
    !isNaN(parseFloat(latitude)) &&
    longitude !== undefined &&
    longitude !== null &&
    longitude !== '' &&
    !isNaN(parseFloat(longitude));

  const currentLat = hasLocation ? parseFloat(latitude) : defaultCenterLat;
  const currentLng = hasLocation ? parseFloat(longitude) : defaultCenterLng;

  // Sync internal manual input state when prop changes
  useEffect(() => {
    setManualLat(latitude !== undefined && latitude !== null && latitude !== '' ? latitude.toString() : '');
    setManualLng(longitude !== undefined && longitude !== null && longitude !== '' ? longitude.toString() : '');
  }, [latitude, longitude]);

  // Handle Browser Geolocation capture (Optional)
  const handleCaptureCurrentLocation = () => {
    setGpsError(null);
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser. You can still register without GPS.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy: acc } = position.coords;
        setIsLocating(false);
        onChange({
          latitude: parseFloat(lat.toFixed(6)),
          longitude: parseFloat(lng.toFixed(6)),
          accuracy: Math.round(acc),
          timestamp: new Date().toISOString(),
          source: 'gps'
        });
      },
      (error) => {
        setIsLocating(false);
        // Non-blocking friendly notices
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('Location permission denied. GPS is optional—you can continue without it.');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('GPS signal unavailable. You can continue without GPS or pick a point on the map.');
            break;
          case error.TIMEOUT:
            setGpsError('GPS request timed out. You can continue without GPS or try again.');
            break;
          default:
            setGpsError('Unable to capture GPS. You can proceed without location coordinates.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Clear captured coordinates
  const handleClearLocation = () => {
    setGpsError(null);
    setManualLat('');
    setManualLng('');
    onChange({
      latitude: '',
      longitude: '',
      accuracy: 0,
      timestamp: null,
      source: 'none'
    });
  };

  // Marker drag event
  const markerEventHandlers = useMemo(
    () => ({
      dragend(e) {
        const marker = e.target;
        const position = marker.getLatLng();
        onChange({
          latitude: parseFloat(position.lat.toFixed(6)),
          longitude: parseFloat(position.lng.toFixed(6)),
          accuracy: accuracy || 0,
          timestamp: new Date().toISOString(),
          source: 'map_click'
        });
      }
    }),
    [onChange, accuracy]
  );

  const handleMapClick = (lat, lng, src) => {
    setGpsError(null);
    onChange({
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
      accuracy: accuracy || 0,
      timestamp: new Date().toISOString(),
      source: src
    });
  };

  const handleApplyManualCoords = () => {
    if (!manualLat && !manualLng) {
      handleClearLocation();
      return;
    }

    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || lat < -90 || lat > 90) {
      setGpsError('Please enter a valid latitude between -90 and 90, or leave empty.');
      return;
    }
    if (isNaN(lng) || lng < -180 || lng > 180) {
      setGpsError('Please enter a valid longitude between -180 and 180, or leave empty.');
      return;
    }
    setGpsError(null);
    onChange({
      latitude: parseFloat(lat.toFixed(6)),
      longitude: parseFloat(lng.toFixed(6)),
      accuracy: accuracy || 0,
      timestamp: new Date().toISOString(),
      source: 'manual'
    });
  };

  const googleMapsUrl = hasLocation ? `https://www.google.com/maps?q=${currentLat},${currentLng}` : null;

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCaptureCurrentLocation}
            disabled={isLocating}
            className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-sm transition disabled:opacity-50"
          >
            {isLocating ? (
              <Crosshair className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4 mr-2" />
            )}
            {isLocating ? 'Capturing Location...' : 'Capture GPS Location (Optional)'}
          </button>

          {hasLocation && (
            <button
              type="button"
              onClick={handleClearLocation}
              className="inline-flex items-center px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition"
              title="Remove captured GPS coordinates"
            >
              <XCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
              Clear GPS / ತೆರವುಗೊಳಿಸಿ
            </button>
          )}

          {googleMapsUrl && (
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Open in Google Maps
            </a>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
          {hasLocation ? (
            <>
              <span className="flex items-center text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                GPS Captured ({source})
              </span>
              {accuracy > 0 && (
                <span className="text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full font-bold text-[10px]">
                  ±{accuracy}m
                </span>
              )}
            </>
          ) : (
            <span className="text-slate-500 bg-slate-200/80 px-2.5 py-1 rounded-full text-xs font-semibold">
              No GPS recorded (Optional)
            </span>
          )}
        </div>
      </div>

      {/* GPS Non-blocking informational notice */}
      {gpsError && (
        <div className="flex items-start p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 text-amber-600 mt-0.5" />
          <span>{gpsError}</span>
        </div>
      )}

      {/* Interactive Leaflet Map */}
      <div className="h-72 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative z-0">
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={hasLocation ? 15 : 12}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {hasLocation && (
            <Marker
              position={[currentLat, currentLng]}
              icon={createPinIcon('#2563eb')}
              draggable={true}
              eventHandlers={markerEventHandlers}
            >
              <Popup>
                <div className="text-xs p-1">
                  <p className="font-bold text-slate-900">House Location Pin</p>
                  <p className="text-slate-600 mt-1">
                    Lat: {currentLat.toFixed(6)}
                    <br />
                    Lng: {currentLng.toFixed(6)}
                  </p>
                  <p className="text-[10px] text-blue-600 mt-1 italic">
                    Drag pin or click map to reposition
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          <MapClickHandler onLocationSelect={handleMapClick} />
          {hasLocation && <RecenterMap lat={currentLat} lng={currentLng} />}
        </MapContainer>
      </div>

      <p className="text-[11px] text-slate-500 italic">
        * GPS ಸೆರೆಹಿಡಿಯುವುದು ಐಚ್ಛಿಕವಾಗಿರುತ್ತದೆ. ನಕ್ಷೆಯ ಮೇಲೆ ಕ್ಲಿಕ್ ಮಾಡಿ ಸ್ಥಳವನ್ನು ಗುರುತಿಸಬಹುದು ಅಥವಾ ಜಿಪಿಎಸ್ ಇಲ್ಲದೆಯೂ ನೋಂದಣಿಯನ್ನು ಉಳಿಸಬಹುದು.
      </p>

      {/* Manual Coordinate Inputs (Optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Latitude <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="number"
            step="any"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            onBlur={handleApplyManualCoords}
            placeholder="Latitude (e.g. 12.9716)"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Longitude <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="number"
            step="any"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            onBlur={handleApplyManualCoords}
            placeholder="Longitude (e.g. 77.5946)"
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-end space-x-2">
          <button
            type="button"
            onClick={handleApplyManualCoords}
            className="w-full py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Apply Coordinates
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerMap;
