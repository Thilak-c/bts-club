'use client';
import { useState } from 'react';

// Restaurant location - BTS DISC CAFE & RESTAURANT, Patna
const RESTAURANT = {
  name: "BTS DISC CAFE & RESTAURANT PVT.LTD",
  lat: 25.6256923,
  lng: 85.1139469,
  radius: 100,   // meters - how close user must be
};

// Calculate distance between two points using Haversine formula
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

export default function Home() {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error, denied
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const checkLocation = () => {
    setStatus('loading');
    setErrorMsg('');

    if (!navigator.geolocation) {
      setStatus('error');
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude, accuracy });

        const dist = getDistance(
          latitude, longitude,
          RESTAURANT.lat, RESTAURANT.lng
        );
        setDistance(Math.round(dist));

        if (dist <= RESTAURANT.radius) {
          setStatus('success');
        } else {
          setStatus('error');
          setErrorMsg(`You are ${Math.round(dist)}m away. Must be within ${RESTAURANT.radius}m to order.`);
        }
      },
      (error) => {
        setStatus('denied');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setErrorMsg('Location permission denied. Please allow location access to place orders.');
            break;
          case error.POSITION_UNAVAILABLE:
            setErrorMsg('Location information unavailable.');
            break;
          case error.TIMEOUT:
            setErrorMsg('Location request timed out.');
            break;
          default:
            setErrorMsg('An unknown error occurred.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className="container" style={{ paddingTop: 60 }}>
      <h1>📍 Location Verification</h1>
      <h2>Test if user is at the restaurant</h2>

      {/* Restaurant Info */}
      <div className="card">
        <div className="label">Restaurant Location</div>
        <p style={{ fontSize: 14, marginBottom: 8 }}>{RESTAURANT.name}</p>
        <div className="coords">
          Lat: {RESTAURANT.lat}<br />
          Lng: {RESTAURANT.lng}<br />
          Allowed radius: {RESTAURANT.radius}m
        </div>
      </div>

      {/* Check Button */}
      <button 
        className="btn btn-primary" 
        onClick={checkLocation}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Checking location...' : 'Verify My Location'}
      </button>

      {/* Results */}
      {userLocation && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="label">Your Location</div>
          <div className="coords">
            Lat: {userLocation.lat.toFixed(6)}<br />
            Lng: {userLocation.lng.toFixed(6)}<br />
            Accuracy: ±{Math.round(userLocation.accuracy)}m
          </div>
          
          {distance !== null && (
            <>
              <div className="label" style={{ marginTop: 16 }}>Distance from Restaurant</div>
              <div className="distance" style={{ color: status === 'success' ? '#10b981' : '#ef4444' }}>
                {distance}m
              </div>
            </>
          )}
        </div>
      )}

      {/* Status Messages */}
      {status === 'success' && (
        <div className="status success">
          ✓ Location verified! You can place your order.
        </div>
      )}

      {status === 'error' && (
        <div className="status error">
          ✗ {errorMsg}
        </div>
      )}

      {status === 'denied' && (
        <div className="status warning">
          ⚠ {errorMsg}
        </div>
      )}

      {/* Info */}
      <p className="info" style={{ marginTop: 24, textAlign: 'center' }}>
        Change RESTAURANT coordinates in the code to test with your actual location.
      </p>
    </div>
  );
}
