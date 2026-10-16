import React, { useState, useEffect } from 'react';
import { MapPin, Filter, Home, ExternalLink, RefreshCw, Layers } from 'lucide-react';
import { getHouses, getLocalitiesMeta } from '../services/houseService';
import HouseLocationMap from '../components/map/HouseLocationMap';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';

const GpsMapViewPage = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locality, setLocality] = useState('');
  const [houseType, setHouseType] = useState('');
  const [meta, setMeta] = useState({ localities: [], houseTypes: [] });
  const toast = useToast();

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const res = await getHouses({
        limit: 100, // retrieve larger batch for master map view
        locality,
        houseType
      });
      setHouses(res.data);
    } catch (err) {
      toast.error('Failed to load GPS map markers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const m = await getLocalitiesMeta();
        setMeta(m);
      } catch (err) {
        console.warn('Meta load error:', err);
      }
    };
    loadMeta();
  }, []);

  useEffect(() => {
    fetchMapData();
  }, [locality, houseType]);

  const housesWithCoordinates = houses.filter(
    (h) => h.gps && h.gps.latitude !== undefined && h.gps.longitude !== undefined
  );

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Geographic GPS & Census Map
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Spatial distribution of registered houses plotted on interactive OpenStreetMap with cluster markers.
          </p>
        </div>

        <button
          onClick={fetchMapData}
          className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Map Filters:</span>
          </div>

          <select
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="">All Localities</option>
            {meta.localities.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <select
            value={houseType}
            onChange={(e) => setHouseType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-medium"
          >
            <option value="">All House Types</option>
            <option value="Independent house">Independent house</option>
            <option value="Apartment">Apartment</option>
            <option value="Rental house">Rental house</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Showing <span className="font-bold text-blue-700">{housesWithCoordinates.length}</span> active
          geo-pins
        </div>
      </div>

      {/* Master Interactive Map Container */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm">
        {loading ? (
          <LoadingSpinner message="Plotting geodetic markers on OpenStreetMap..." size="large" />
        ) : (
          <HouseLocationMap houses={housesWithCoordinates} height="h-[600px]" zoom={12} />
        )}
      </div>

      {/* Geodetic Disclaimer Notice */}
      <div className="p-4 bg-slate-100/80 rounded-2xl border border-slate-200 text-xs text-slate-500 flex items-start space-x-2">
        <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700">Geodetic Mapping Notice:</span>
          <span className="ml-1">
            Browser GPS coordinates provide approximate reference pinpoints for census enumeration. Leaflet map tiles are powered by OpenStreetMap contributors. Coordinate data does not constitute cadastral boundary certification or legal land titles.
          </span>
        </div>
      </div>
    </div>
  );
};

export default GpsMapViewPage;
