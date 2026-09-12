import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default leaflet marker icon asset paths if needed
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CompetitorMap = ({
  startupLocation,
  radiusKm = 10,
  competitors = [],
  selectedCompetitorId,
  onSelectCompetitor,
  onToggleSelect
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const circleRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const defaultLat = startupLocation?.lat || 17.385;
      const defaultLng = startupLocation?.lng || 78.486;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: false, // Prevent page scroll trapping on mobile
      });

      // OpenStreetMap Free Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Radius whenever props change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !layerGroupRef.current) return;

    // Clear previous markers
    layerGroupRef.current.clearLayers();
    if (circleRef.current) {
      map.removeLayer(circleRef.current);
      circleRef.current = null;
    }

    const lat = startupLocation?.lat;
    const lng = startupLocation?.lng;

    if (lat === undefined || lng === undefined || (lat === 0 && lng === 0)) {
      return;
    }

    const bounds = L.latLngBounds([[lat, lng]]);

    // 1. Startup Marker (Pulsing Rocket Emblem)
    const startupIcon = L.divIcon({
      className: 'custom-startup-map-pin',
      html: `
        <div style="
          position: relative;
          width: 38px;
          height: 38px;
          background: #0284c7;
          border: 3px solid #ffffff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(2, 132, 199, 0.6);
          cursor: pointer;
        ">
          <span style="font-size: 16px;">🚀</span>
          <div style="
            position: absolute;
            inset: -6px;
            border-radius: 50%;
            border: 2px solid rgba(2, 132, 199, 0.4);
            animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19],
    });

    const startupMarker = L.marker([lat, lng], { icon: startupIcon })
      .addTo(layerGroupRef.current)
      .bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 4px;">
          <strong style="color: #0284c7; font-size: 14px;">📍 Your Startup Location</strong>
          <p style="margin: 4px 0 0; color: #475569;">${startupLocation?.display_name || 'Designated Base'}</p>
          <span style="display: inline-block; margin-top: 6px; font-size: 11px; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 999px; font-weight: 600;">
            Search Radius: ${radiusKm} km
          </span>
        </div>
      `);

    // 2. Search Radius Circle Overlay
    const radiusMeters = (radiusKm || 10) * 1000;
    circleRef.current = L.circle([lat, lng], {
      radius: radiusMeters,
      color: '#0ea5e9',
      weight: 1.5,
      opacity: 0.8,
      dashArray: '5, 5',
      fillColor: '#0ea5e9',
      fillOpacity: 0.06,
    }).addTo(map);

    // 3. Competitor Markers
    const validCompetitors = (competitors || []).filter(
      c => c.latitude !== null && c.latitude !== undefined && c.longitude !== null && c.longitude !== undefined
    );

    validCompetitors.forEach(comp => {
      const cLat = parseFloat(comp.latitude);
      const cLng = parseFloat(comp.longitude);
      bounds.extend([cLat, cLng]);

      const isSelected = comp.is_selected !== false;
      const isDirect = (comp.competitor_type || 'direct').toLowerCase() === 'direct';
      const isHighlighted = selectedCompetitorId === comp.id;

      // Color coding: Green for Direct, Amber for Indirect/Substitute
      const pinColor = isDirect ? '#10b981' : '#f59e0b';
      const borderColor = isHighlighted ? '#0284c7' : '#ffffff';
      const borderWidth = isHighlighted ? '3px' : '2px';
      const scale = isHighlighted ? '1.15' : '1';

      const compIcon = L.divIcon({
        className: `custom-comp-map-pin comp-${comp.id}`,
        html: `
          <div style="
            transform: scale(${scale});
            transition: transform 0.2s ease;
            position: relative;
            width: 32px;
            height: 32px;
            background: ${pinColor};
            border: ${borderWidth} solid ${borderColor};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            opacity: ${isSelected ? '1' : '0.5'};
          ">
            <span style="font-size: 14px;">🏪</span>
            ${comp.distance_km ? `
              <div style="
                position: absolute;
                bottom: -18px;
                left: 50%;
                transform: translateX(-50%);
                background: #0f172a;
                color: #ffffff;
                font-size: 10px;
                font-weight: 700;
                padding: 1px 5px;
                border-radius: 4px;
                white-space: nowrap;
              ">
                ${comp.distance_km} km
              </div>
            ` : ''}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([cLat, cLng], { icon: compIcon })
        .addTo(layerGroupRef.current)
        .on('click', () => {
          if (onSelectCompetitor) onSelectCompetitor(comp.id);
        });

      // Popup with selection action
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 13px; line-height: 1.4; padding: 4px; min-width: 180px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <strong style="color: #0f172a; font-size: 14px;">${comp.name}</strong>
            <span style="font-size: 10px; background: ${isDirect ? '#ecfdf5' : '#fffbeb'}; color: ${isDirect ? '#065f46' : '#92400e'}; padding: 2px 6px; border-radius: 4px; font-weight: 700; text-transform: uppercase;">
              ${comp.competitor_type || 'Direct'}
            </span>
          </div>
          <p style="margin: 2px 0; color: #64748b; font-size: 12px;">${comp.location || 'Local vicinity'}</p>
          <div style="display: flex; gap: 8px; align-items: center; margin-top: 6px; font-size: 12px;">
            <span style="font-weight: 600; color: #0284c7;">📏 ${comp.distance_km || 0} km away</span>
            <span style="color: #64748b;">• Match: ${comp.relevance_score || 75}%</span>
          </div>
          ${comp.phone && comp.phone !== 'Not available' ? `
            <p style="margin: 4px 0 0; font-size: 11px; color: #475569;">📞 ${comp.phone}</p>
          ` : ''}
          ${comp.website_url ? `
            <a href="${comp.website_url}" target="_blank" rel="noreferrer" style="display: inline-block; margin-top: 4px; font-size: 11px; color: #0284c7; text-decoration: underline;">
              🌐 Official Website
            </a>
          ` : ''}
        </div>
      `);
    });

    // Fit map bounds smoothly
    if (validCompetitors.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView([lat, lng], 13);
    }
  }, [startupLocation, radiusKm, competitors, selectedCompetitorId]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '340px' }}>
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '340px',
          borderRadius: '16px',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          zIndex: 1
        }}
      />
      
      {/* Map Legend Overlay */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(8px)',
        padding: '6px 12px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: '600',
        color: '#1e293b',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#0284c7' }}></span>
          <span>You</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }}></span>
          <span>Direct ({radiusKm}km)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }}></span>
          <span>Indirect</span>
        </div>
      </div>
    </div>
  );
};

export default CompetitorMap;
