import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { extractMapMarkers, computeMapCenter, categoryColor, categoryIcon } from '../utils/mapHelpers.js';
import './MapWidget.css';

// Fix default marker icon paths broken by Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapWidget({ itinerary, onMarkerClick, activeMarkerId, currency }) {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedDay, setSelectedDay] = useState('all');
  const [mapReady, setMapReady] = useState(false);

  const markers = extractMapMarkers(itinerary || []);
  const days = [...new Set(markers.map((m) => m.day))].sort((a, b) => a - b);
  const filteredMarkers = selectedDay === 'all'
    ? markers
    : markers.filter((m) => m.day === Number(selectedDay));

  const currencySymbol = currency === 'INR' ? '₹' : '$';
  const currencyRate = currency === 'INR' ? 83.5 : 1;
  const formatCost = (amount) => {
    if (!amount) return null;
    const converted = Math.round(amount * currencyRate);
    return `${currencySymbol}${converted.toLocaleString(currency === 'INR' ? 'en-IN' : 'en-US')}`;
  };

  // Init map once
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const center = computeMapCenter(markers);
    const map = L.map(mapRef.current, {
      center: [center.lat || 20, center.lng || 0],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    setTimeout(() => map.invalidateSize(), 200);
    leafletMapRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update markers
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) return;

    const map = leafletMapRef.current;
    map.invalidateSize();

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (filteredMarkers.length === 0) return;

    const bounds = [];
    let activeMarkerRef = null;

    filteredMarkers.forEach((markerData, idx) => {
      const color = categoryColor(markerData.category);
      const icon = categoryIcon(markerData.category);
      const isActive = activeMarkerId === markerData.id;
      const size = isActive || markerData.isAccommodation ? 40 : 32;

      const customIcon = L.divIcon({
        className: '',
        html: `
          <div style="position:relative;width:${size}px;height:${size}px;">
            <div style="
              width:${size}px;height:${size}px;
              background:${color};
              border-radius:50% 50% 50% 0;
              transform:rotate(-45deg);
              border:${isActive ? '3px solid #fff' : '2px solid rgba(255,255,255,0.7)'};
              box-shadow:0 3px 10px rgba(0,0,0,0.35);
              display:flex;align-items:center;justify-content:center;
            ">
              <span style="transform:rotate(45deg);font-size:${Math.round(size*0.42)}px;line-height:1;">${icon}</span>
            </div>
            <div style="
              position:absolute;top:-6px;right:-6px;
              background:#1a2e42;color:#c9a96e;
              font-size:9px;font-weight:700;
              width:16px;height:16px;border-radius:50%;
              display:flex;align-items:center;justify-content:center;
              border:1px solid #c9a96e;font-family:monospace;
            ">${idx + 1}</div>
          </div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -(size + 4)],
      });

      const costStr = markerData.cost?.amount
        ? `<p style="font-size:11px;color:#888;margin:2px 0">💰 ${formatCost(markerData.cost.amount)}/${markerData.cost.per}</p>`
        : '';

      const marker = L.marker([markerData.lat, markerData.lng], { icon: customIcon, zIndexOffset: isActive ? 1000 : 0 })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:system-ui,sans-serif;min-width:190px;max-width:240px;">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
              <span style="font-size:18px">${icon}</span>
              <strong style="font-size:13px;color:${color};line-height:1.3">${markerData.name}</strong>
            </div>
            ${markerData.description ? `<p style="font-size:12px;color:#444;margin-bottom:5px;line-height:1.45">${markerData.description}</p>` : ''}
            ${markerData.time ? `<p style=\"font-size:11px;color:#888;margin:2px 0\">${markerData.time}</p>` : ''}
            ${costStr}
            ${markerData.address ? `<p style=\"font-size:10px;color:#aaa;margin-top:5px\">${markerData.address}</p>` : ''}
          </div>
        `, { maxWidth: 260 });

      marker.on('click', () => { if (onMarkerClick) onMarkerClick(markerData); });

      bounds.push([markerData.lat, markerData.lng]);
      markersRef.current.push(marker);
      if (isActive) activeMarkerRef = marker;
    });

    if (bounds.length === 1) {
      map.setView(bounds[0], 14);
    } else if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }

    if (activeMarkerRef) {
      setTimeout(() => activeMarkerRef.openPopup(), 400);
    }
  }, [filteredMarkers, mapReady, activeMarkerId, currency]);

  return (
    <div className="map-widget">
      {days.length > 1 && (
        <div className="map-day-tabs">
          <button className={`day-tab ${selectedDay === 'all' ? 'active' : ''}`} onClick={() => setSelectedDay('all')}>
            All Days
          </button>
          {days.map((d) => (
            <button
              key={d}
              className={`day-tab ${selectedDay === d ? 'active' : ''}`}
              onClick={() => setSelectedDay(selectedDay === d ? 'all' : d)}
            >
              Day {d}
            </button>
          ))}
        </div>
      )}

      <div className="map-container" ref={mapRef}>
        {!mapReady && (
          <div className="map-loading">
            <div className="map-spinner" />
            <p>Loading map…</p>
          </div>
        )}
      </div>

      <div className="map-legend">
        {[
          { cat: 'attraction', label: 'Attraction' },
          { cat: 'food', label: 'Food' },
          { cat: 'accommodation', label: 'Stay' },
          { cat: 'transport', label: 'Transport' },
          { cat: 'entertainment', label: 'Entertainment' },
        ].map(({ cat, label }) => (
          <span key={cat} className="legend-item">
            <span className="legend-dot" style={{ background: categoryColor(cat) }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}