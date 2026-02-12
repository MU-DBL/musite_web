import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import style from './analytics.module.css';

//definitely need to cycle out barebones token just in the code itself once we are in production. 
//for now im keeping it here for qol and ease of access
const MATOMO_BASE: string = 'https://fatplants.net/matomo/';
const MATOMO_SITE_ID: string = '2';
const MATOMO_TOKEN: string = 'b692903b1cb149d0c36302c1db938db6';

//marker is for leaflet map to show visitor location
interface Marker 
{
  lat: number;      
  lng: number;      
  title: string;    
}

//used by the graph
interface VisitData 
{
  label: string;      
  nb_visits: number;  
}

//metric data from matomo's VisitsSummary API
interface MetricData 
{
  visits24h: number;      
  totalVisits: number;    
  uniqueVisitors: number; 
  actions: number;        
  bounceCount: number;    
}

const Dashboard: React.FC = () => {
  //using direct DOM access for map and chart canvas, using ref instead of states skips rerendering 
  const mapRef = useRef<HTMLDivElement>(null);
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  
  //metric state updated once after component mounts
  const [metrics, setMetrics] = useState<MetricData>({
    visits24h: 0,
    totalVisits: 0,
    uniqueVisitors: 0,
    actions: 0,
    bounceCount: 0
  });
  
  const [chartData, setChartData] = useState<VisitData[]>([]);
  const [mapMessage, setMapMessage] = useState<string>('');

  //fetch data 
  useEffect(() => {
    async function fetchMetrics() {
      try {
        const url = `${MATOMO_BASE}index.php`;
        
        //past 24 hr visitor count
        const params24h = new URLSearchParams({
          module: 'API',
          method: 'VisitsSummary.getVisits',
          idSite: MATOMO_SITE_ID,
          period: 'day',
          date: 'today',
          format: 'json',
          token_auth: MATOMO_TOKEN
        });
        
        const res24h = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params24h.toString()
        });
        
        const data24h = await res24h.json();
        
        //past year stuff
        const paramsTotal = new URLSearchParams({
          module: 'API',
          method: 'VisitsSummary.get',
          idSite: MATOMO_SITE_ID,
          period: 'range',
          date: 'previous365',
          format: 'json',
          token_auth: MATOMO_TOKEN
        });
        
        const resTotal = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: paramsTotal.toString()
        });
        
        const dataTotal = await resTotal.json();
        
        //no ?. optional chaining but this is still null safe since the fall back is the value itself or 0
        //BUT! im working on the assumption that matomo does not return {value: 0}, since if that is retuned in the case we get the 
        //actual object itself and not 0
        setMetrics({
          visits24h: (data24h && data24h.value) || data24h || 0,
          totalVisits: (dataTotal && dataTotal.nb_visits) || 0,
          uniqueVisitors: (dataTotal && dataTotal.nb_uniq_visitors) || 0,
          actions: (dataTotal && dataTotal.nb_actions) || 0,
          bounceCount: (dataTotal && dataTotal.bounce_count) || 0
        });
        
      } catch (err) {
        console.error('error fetching metrics:', err);
      }
    }
    
    fetchMetrics();
  }, []);

  //data for the chart
  useEffect(() => {
    async function fetchChartData() {
      try {
        const url = `${MATOMO_BASE}index.php`;
        const params = new URLSearchParams({
          module: 'API',
          method: 'VisitsSummary.getVisits',
          idSite: MATOMO_SITE_ID,
          period: 'month',
          date: 'last12',
          format: 'json',
          token_auth: MATOMO_TOKEN
        });
        
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString()
        });
        
        const data = await res.json();
        
        //for simplicity sake we can convert object into array for the chart
        const chartArray: VisitData[] = [];
        if (typeof data === 'object' && !Array.isArray(data)) {
          Object.keys(data).forEach(key => {
            chartArray.push({
              label: key,
              nb_visits: data[key] || 0
            });
          });
        }
        
        setChartData(chartArray);
        drawChart(chartArray);
        
      } catch (err) {
        console.error('error fetching chart data:', err);
      }
    }
    
    fetchChartData();
  }, []);

  
  //chart draw func for dispalyng the past 12 month data
  function drawChart(data: VisitData[]) {
    if (!chartCanvasRef.current || data.length === 0) return;
    
    const canvas = chartCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    //setting dimensions, with differing native screen in mind, only tested common sizes
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    
    const padding = 50;
    const width = canvas.width - padding * 2;
    const height = canvas.height - padding * 2;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    //calc sacles
    const maxVisits = Math.max(...data.map(d => d.nb_visits));
    const yScale = height / maxVisits;
    const xScale = width / (data.length - 1);
    
    //for the grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + width, y);
      ctx.stroke();
    }
    
    //this is the line for the visitor trend
    ctx.strokeStyle = '#7cb342';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((point, index) => {
      const x = padding + index * xScale;
      const y = padding + height - (point.nb_visits * yScale);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    //marking data points
    ctx.fillStyle = '#7cb342';
    data.forEach((point, index) => {
      const x = padding + index * xScale;
      const y = padding + height - (point.nb_visits * yScale);
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
    });
    
    //this is x axis for months
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    data.forEach((point, index) => {
      if (index % 2 === 0) {
        const x = padding + index * xScale;
        const label = point.label.substring(5); 
        ctx.fillText(label, x, canvas.height - 20);
      }
    });
    
    //visit countr for y
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = Math.round((maxVisits / 5) * (5 - i));
      const y = padding + (height / 5) * i;
      ctx.fillText(value.toString(), padding - 10, y + 5);
    }
  }


  
  //leafelet map
  useEffect(() => {
    let mounted = true;

    async function initMap(): Promise<void> {
      try {
        if (!mapRef.current) return;
        
        //since we are in the actual analyrics dashboard im enabling zoom again
        mapInstance.current = L.map(mapRef.current, { 
          zoomControl: true,
          attributionControl: false,
          minZoom: 2,
          maxBounds: [[-90, -180], [90, 180]],
          maxBoundsViscosity: 1.0,
          worldCopyJump: false
        }).setView([20, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap'
        }).addTo(mapInstance.current);

        //fetchinbg visitor geo data 
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
            setMapMessage('No recent visit details found.');
            setLoading(false);
          }
          return;
        }

        //this might need an update if matomo version gets updated but so far i think this should suffice for identifying strings from matomo
        const latFields: string[] = ['location_lat', 'location_latitude', 'lat', 'latitude'];
        const lngFields: string[] = ['location_lng', 'location_long', 'lng', 'longitude'];

        //only grab valid coords from visitor data
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

        //marking the markers on the map, i beleive this is licenced to be free to use
        if (markers.length > 0 && mapInstance.current) {
          const group = L.featureGroup();
          
          markers.forEach((m: Marker) => {
            const marker = L.marker([m.lat, m.lng], {
              icon: L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
              })
            });
            
            if (m.title) marker.bindPopup(String(m.title));
            marker.addTo(group);
          });
          
          group.addTo(mapInstance.current);
          
          //autofitted, when I didn;t have bounds set the map actually repeats infinitely 
          const bounds = group.getBounds();
          mapInstance.current.fitBounds(bounds, { 
            padding: [30, 30],
            maxZoom: 5
          });
          
          if (mounted) {
            setMapMessage(`${markers.length} locations`);
            setLoading(false);
          }
        }
        
      } catch (err) {
        console.error('Map error:', err);
        if (mounted) {
          setMapMessage('Error loading map');
          setLoading(false);
        }
      }
    }

    initMap();

    //cleanup after mount. No memory leak from this guy
    return () => {
      mounted = false;
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, []);

  return (
    <div className={style.dashboard}>
      <div className={style.header}>
        <h1 className={style.title}>Analytics Dashboard</h1>
      </div>

      {/* metrics */}
      <div className={style.widgetsRow}>
        <div className={style.card}>
          <p className={style.metricLabel}>Visits in the Past 24 Hours</p>
          <p className={style.metricValue}>{metrics.visits24h}</p>
        </div>
        
        <div className={style.card}>
          <p className={style.metricLabel}>Total Visits</p>
          <p className={style.metricValue}>{metrics.totalVisits.toLocaleString()}</p>
        </div>
        
        <div className={style.card}>
          <p className={style.metricLabel}>Unique Visitors</p>
          <p className={style.metricValue}>{metrics.uniqueVisitors.toLocaleString()}</p>
        </div>
      </div>

      {/* the chart */}
      <div className={style.content}>
        <div className={`${style.card} ${style.cardWide}`}>
          <p className={style.metricLabel}>Visits for Last 12 Months</p>
          <canvas 
            ref={chartCanvasRef}
            style={{ width: '100%', height: '300px' }}
          />
        </div>
      </div>

      {/* the map */}
      <div className={style.content}>
        <div className={`${style.card} ${style.cardWide}`}>
          <p className={style.metricLabel}>Visitor Map</p>
          
          <div 
            style={{ height: 400, width: '100%', marginTop: 8 }} 
            ref={mapRef} 
          />
          
          {loading && <p className={style.loading}>Loading map...</p>}
          {!loading && mapMessage && <p className={style.note}>{mapMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;