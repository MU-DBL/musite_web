import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface CompactVisitorMapProps {
  height?: number;
  initialZoom?: number;
}

const FAKE_PINS = [
  { lat: 37.8,  lng: -96.9  }, // USA (center)
  { lat: 40.7,  lng: -74.0  }, // New York
  { lat: 34.0,  lng: -118.2 }, // Los Angeles
  { lat: 41.8,  lng: -87.6  }, // Chicago
  { lat: 45.4,  lng: -75.7  }, // Canada
  { lat: 49.2,  lng: -123.1 }, // Vancouver
  { lat: 19.4,  lng: -99.1  }, // Mexico City
  { lat: -23.5, lng: -46.6  }, // Brazil
  { lat: 4.7,   lng: -74.0  }, // Colombia
  { lat: -34.6, lng: -58.4  }, // Argentina
  { lat: -12.0, lng: -77.0  }, // Peru
  { lat: 51.5,  lng: -0.1   }, // UK
  { lat: 48.8,  lng: 2.3    }, // France
  { lat: 52.5,  lng: 13.4   }, // Germany
  { lat: 41.9,  lng: 12.5   }, // Italy
  { lat: 40.4,  lng: -3.7   }, // Spain
  { lat: 59.9,  lng: 10.7   }, // Norway
  { lat: 59.3,  lng: 18.1   }, // Sweden
  { lat: 50.4,  lng: 30.5   }, // Ukraine
  { lat: 55.7,  lng: 37.6   }, // Russia (Moscow)
  { lat: 56.8,  lng: 60.6   }, // Russia (Yekaterinburg)
  { lat: 39.9,  lng: 32.8   }, // Turkey
  { lat: 31.8,  lng: 35.2   }, // Israel
  { lat: 24.7,  lng: 46.7   }, // Saudi Arabia
  { lat: 25.2,  lng: 55.3   }, // UAE
  { lat: 28.6,  lng: 77.2   }, // India (Delhi)
  { lat: 12.9,  lng: 77.6   }, // India (Bangalore)
  { lat: 39.9,  lng: 116.4  }, // China (Beijing)
  { lat: 31.2,  lng: 121.5  }, // China (Shanghai)
  { lat: 22.3,  lng: 114.2  }, // Hong Kong
  { lat: 35.7,  lng: 139.7  }, // Japan (Tokyo)
  { lat: 34.7,  lng: 135.5  }, // Japan (Osaka)
  { lat: 37.6,  lng: 127.0  }, // South Korea
  { lat: 1.3,   lng: 103.8  }, // Singapore
  { lat: 13.7,  lng: 100.5  }, // Thailand
  { lat: 21.0,  lng: 105.8  }, // Vietnam
  { lat: -6.2,  lng: 106.8  }, // Indonesia
  { lat: -33.9, lng: 151.2  }, // Australia (Sydney)
  { lat: -37.8, lng: 145.0  }, // Australia (Melbourne)
  { lat: -36.9, lng: 174.8  }, // New Zealand
  { lat: 6.5,   lng: 3.4    }, // Nigeria
  { lat: -1.3,  lng: 36.8   }, // Kenya
  { lat: -26.2, lng: 28.0   }, // South Africa
  { lat: 30.0,  lng: 31.2   }, // Egypt
  { lat: 14.7,  lng: -17.4  }, // Senegal
];

function makeCircleIcon() {
  return L.divIcon({
    className: '',
    html: '<div style="width:10px;height:10px;background:#2563eb;border-radius:50%;border:1px solid #fff;box-shadow:0 0 3px rgba(0,0,0,0.4);"></div>',
    iconSize: [10, 10],
    iconAnchor: [5, 5],
    popupAnchor: [0, -8],
  });
}

const CompactVisitorMap: React.FC<CompactVisitorMapProps> = ({ height = 170, initialZoom = 1 }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current) return;

    mapInstance.current = L.map(mapRef.current, {
      zoomControl: false,
      attributionControl: false,
      dragging: false,
      touchZoom: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
    }).setView([20, 0], initialZoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapInstance.current);

    FAKE_PINS.forEach(({ lat, lng }) => {
      if (mapInstance.current) L.marker([lat, lng], { icon: makeCircleIcon() }).addTo(mapInstance.current);
    });

    return () => {
      if (mapInstance.current) mapInstance.current.remove();
    };
  }, []);

  return (
    <div onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer', height, width: '100%' }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%', pointerEvents: 'none' }} />
    </div>
  );
};

export default CompactVisitorMap;
