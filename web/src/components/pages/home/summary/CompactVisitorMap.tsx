import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import style from './summary.module.css';

const MATOMO_BASE: string = 'https://fatplants.net/matomo/';
const MATOMO_SITE_ID: string = '2';
const MATOMO_TOKEN: string = 'b692903b1cb149d0c36302c1db938db6';

interface CompactVisitorMapProps {
  height?: number;
  initialZoom?: number; // Add zoom level control
}

interface Marker {
  lat: number;
  lng: number;
  title: string;
}

const CompactVisitorMap: React.FC<CompactVisitorMapProps> = ({ height = 250, initialZoom = 0.5 }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function initMap(): Promise<void> {
      try {
        if (!mapRef.current) return;
        
        //init map with all interactions disabled since we agreed the widget can just be static instead
        mapInstance.current = L.map(mapRef.current, { 
          zoomControl: false,
          attributionControl: false,
          dragging: false,
          touchZoom: false,
          scrollWheelZoom: false,
          doubleClickZoom: false,
          boxZoom: false,
          keyboard: false,
          minZoom: 0,
          maxBounds: [[-90, -180], [90, 180]],
          maxBoundsViscosity: 1.0,
          worldCopyJump: false
        }).setView([20, 0], initialZoom);

        //tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(mapInstance.current);

        //fetch data
        const url = `${MATOMO_BASE}index.php`;
        const params = new URLSearchParams();
        params.append('module', 'API');
        params.append('method', 'Live.getLastVisitsDetails');
        params.append('idSite', MATOMO_SITE_ID);
        params.append('format', 'json');
        params.append('filter_limit', '2000');
        params.append('token_auth', MATOMO_TOKEN);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });
        
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: any[] = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        //same deal as the variations from dashboard implementation, might need an update if matomo is updated and the 
        //identified is somehow vastly different which I hardly doubt
        const latFields: string[] = ['location_lat', 'location_latitude', 'lat', 'latitude'];
        const lngFields: string[] = ['location_lng', 'location_long', 'lng', 'longitude'];

        const markers: Marker[] = [];
        for (const visit of data) {
          let lat: number | null = null;
          let lng: number | null = null;
          
          for (const field of latFields) {
            if (visit[field] !== undefined && visit[field] !== null) {
              lat = Number(visit[field]);
              break;
            }
          }
          
          for (const field of lngFields) {
            if (visit[field] !== undefined && visit[field] !== null) {
              lng = Number(visit[field]);
              break;
            }
          }

          if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
            markers.push({
              lat,
              lng,
              title: visit.location_country || visit.country || visit.country_code || ''
            });
          }
        }

        //markers on map, same implementation from dashboard just smaller window and no popups enabled
        if (markers.length > 0 && mapInstance.current) {
          const group = L.featureGroup();
          
          markers.forEach((m: Marker) => {
            const marker = L.marker([m.lat, m.lng], {
              icon: L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [15, 24],      
                iconAnchor: [7, 24],     
                popupAnchor: [1, -20],   
                shadowSize: [24, 24]     
              })
            });
            marker.addTo(group);
          });
          
          group.addTo(mapInstance.current);
          
          //cant use auto fit so we just force a zoom level instead, this needs tweaking since its too zoomed in but this is very minor
          //edit 0.5 seems like the perfect place to leave it just remeber that this can be edited in map instances init
          //since zoom control is disabled 
          mapInstance.current.setView([20, 0], initialZoom);
          
          if (mounted) {
            setLoading(false);
          }
        } else {
          if (mounted) {
            setLoading(false);
          }
        }
        
      } catch (err) {
        console.error('CompactVisitorMap error', err);
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initMap();

    return () => {
      mounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, []);

  return (
    <div style={{ height, width: '100%' }} ref={mapRef} />
  );
};

export default CompactVisitorMap;