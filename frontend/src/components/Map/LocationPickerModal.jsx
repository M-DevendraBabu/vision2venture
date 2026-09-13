import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaTimes, FaCheck, FaCrosshairs, FaMapMarkerAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const LocationPickerModal = ({ isOpen, onClose, onSelectLocation, initialCoords }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const [selectedCoords, setSelectedCoords] = useState(initialCoords || null);
  const [resolvedAddress, setResolvedAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);

  // Reverse geocode when coordinates change
  const reverseGeocode = async (lat, lng) => {
    setLoadingAddress(true);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&addressdetails=1`,
        { headers: { 'Accept-Language': 'en', 'User-Agent': 'Vision2Venture-StartupIntelligence/1.0' } }
      );
      if (resp.ok) {
        const data = await resp.json();
        const addr = data.address || {};
        const locality = (
          addr.village ||
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.town ||
          addr.city ||
          addr.hamlet ||
          ''
        );
        const district = addr.state_district || addr.county || addr.district || '';
        const state = addr.state || '';
        const country = addr.country || '';

        const parts = [locality, district, state].filter(Boolean);
        const name = parts.length > 0 ? parts.join(', ') : (data.display_name?.split(',').slice(0, 3).join(', ') || `${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        setResolvedAddress(name);
        return { name, country };
      }
    } catch (e) {
      console.error('Reverse geocode error:', e);
    } finally {
      setLoadingAddress(false);
    }
    const fallback = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    setResolvedAddress(fallback);
    return { name: fallback, country: '' };
  };

  // Initialize and clean up Leaflet map
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to ensure modal DOM is mounted
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      const initLat = initialCoords?.lat || 16.2341; // Default Andhra Pradesh / India vicinity
      const initLng = initialCoords?.lng || 80.5432;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [initLat, initLng],
          zoom: 13,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Click on map to place pin
        map.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          setSelectedCoords({ lat, lng });

          if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
          } else {
            markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
            markerRef.current.on('dragend', async (dragEv) => {
              const pos = dragEv.target.getLatLng();
              setSelectedCoords({ lat: pos.lat, lng: pos.lng });
              await reverseGeocode(pos.lat, pos.lng);
            });
          }

          await reverseGeocode(lat, lng);
        });

        // If initial coords provided, drop pin
        if (initialCoords?.lat && initialCoords?.lng) {
          markerRef.current = L.marker([initialCoords.lat, initialCoords.lng], { draggable: true }).addTo(map);
          markerRef.current.on('dragend', async (dragEv) => {
            const pos = dragEv.target.getLatLng();
            setSelectedCoords({ lat: pos.lat, lng: pos.lng });
            await reverseGeocode(pos.lat, pos.lng);
          });
          reverseGeocode(initialCoords.lat, initialCoords.lng);
        }

        mapInstanceRef.current = map;
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen]);

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      return toast.error('Geolocation is not supported by your browser.');
    }
    toast.info('Requesting high-accuracy GPS position...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedCoords({ lat: latitude, lng: longitude });

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            markerRef.current = L.marker([latitude, longitude], { draggable: true }).addTo(mapInstanceRef.current);
          }
        }
        await reverseGeocode(latitude, longitude);
        toast.success('Pin placed at your current GPS location!');
      },
      (err) => {
        toast.error('GPS permission denied or timed out.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleConfirm = () => {
    if (!selectedCoords) {
      return toast.warning('Please click on the map to drop a pin first.');
    }
    onSelectLocation({
      address: resolvedAddress || `${selectedCoords.lat.toFixed(4)}, ${selectedCoords.lng.toFixed(4)}`,
      lat: selectedCoords.lat,
      lng: selectedCoords.lng
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div style={{
        background: '#FFFFFF',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '780px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid #CBD5E1',
        maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#F8FAFC'
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaMapMarkerAlt style={{ color: '#0284c7' }} /> Pick Startup Location on Map
            </h3>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Click anywhere on the map or drag the pin to set your exact physical catchment coordinates.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.2rem',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Action bar */}
        <div style={{
          padding: '10px 20px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <button
            type="button"
            onClick={handleUseGPS}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#e0f2fe',
              color: '#0369a1',
              border: '1px solid #bae6fd',
              fontSize: '0.8rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FaCrosshairs /> Center to My GPS
          </button>

          <div style={{ fontSize: '0.82rem', color: '#334155' }}>
            {loadingAddress ? (
              <span style={{ color: '#0284c7' }}>Resolving address...</span>
            ) : resolvedAddress ? (
              <span><strong>Selected:</strong> {resolvedAddress}</span>
            ) : (
              <span style={{ color: '#94a3b8' }}>Click on the map to place a pin</span>
            )}
            {selectedCoords && (
              <span style={{ marginLeft: '8px', color: '#64748b', fontSize: '0.75rem' }}>
                ({selectedCoords.lat.toFixed(4)}, {selectedCoords.lng.toFixed(4)})
              </span>
            )}
          </div>
        </div>

        {/* Leaflet Map Canvas */}
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '420px',
            background: '#e2e8f0',
            position: 'relative',
            zIndex: 1
          }}
        />

        {/* Footer */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          background: '#F8FAFC'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              background: '#FFFFFF',
              color: '#475569',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedCoords}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              border: 'none',
              background: selectedCoords ? '#0284c7' : '#94a3b8',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '0.85rem',
              cursor: selectedCoords ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FaCheck /> Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
