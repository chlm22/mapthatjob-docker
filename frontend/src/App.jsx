import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import AccessibilityControls from './AccessibilityControls';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
}

// Intercepts map dragging and fetches new jobs for the new location
function MapInteraction({ setLocation, centerMapRef }) {
  useMapEvents({
    dragend: async (e) => {
      const map = e.target;
      const center = map.getCenter();
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${center.lat}&lon=${center.lng}`);
        const data = await res.json();
        
        if (data && data.address) {
          let city = data.address.city || data.address.town || data.address.village || data.address.county;
          const state = data.address.state;
          
          if (city && state) {
            // specific map terms for Adzuna 
            city = city.replace(/ Charter Township| Township/g, '');
            
            centerMapRef.current = false; 
            setLocation(`${city}, ${state}`);
          }
        }
      } catch (err) {
        console.error("Failed to reverse geocode map location:", err);
      }
    }
  });
  return null;
}

export default function App() {
  const [jobs, setJobs] = useState([]);
  const [location, setLocation] = useState('Ann Arbor, Michigan');
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [visitedJobs, setVisitedJobs] = useState(new Set());
  const [mapCenter, setMapCenter] = useState([42.28, -83.74]); 
  
  // NEW: State and Refs for syncing the list and the map
  const [activeJobId, setActiveJobId] = useState(null);
  const centerMapRef = useRef(true); // Tracks if the map should snap to center
  const jobRefs = useRef({});        // Stores references to the sidebar job cards
  const markerRefs = useRef({});     // Stores references to the map pins

  useEffect(() => {
    fetchJobs(location);
  }, [location]);

 
  useEffect(() => {
    if (activeJobId) {
      if (jobRefs.current[activeJobId]) {
        jobRefs.current[activeJobId].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      if (markerRefs.current[activeJobId]) {
        markerRefs.current[activeJobId].openPopup();
      }
    }
  }, [activeJobId]);

  useEffect(() => {
    if (searchInput.length < 3) {
      setSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchInput)}&limit=5`);
        const data = await res.json();
        setSuggestions(data);
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchInput]);

  const fetchJobs = async (loc) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs?location=${encodeURIComponent(loc)}`);
      const data = await res.json();
      setJobs(data || []);
      
      // ONLY center the map if the search came from the search bar
      if (centerMapRef.current) {
        const firstValidJob = data.find(j => j.lat && j.lng);
        if (firstValidJob) {
           setMapCenter([firstValidJob.lat, firstValidJob.lng]);
        }
      }
      // Reset the flag back to true for the next searchhh
      centerMapRef.current = true; 
      
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
    }
    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      centerMapRef.current = true; // Ensure map snaps to new searched city
      setLocation(searchInput);
      setSuggestions([]); 
    }
  };

  const handleSuggestionClick = (placeName) => {
    centerMapRef.current = true; // Ensure map snaps to new searched city
    setSearchInput(placeName);
    setLocation(placeName);
    setSuggestions([]); 
  };

  const handleJobClick = (e, jobId, url) => {
    e.stopPropagation(); // Prevents the card click from overriding the button click
    setVisitedJobs(prev => new Set(prev).add(jobId));
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="title-container">
          <img src="/apple-touch-icon.png" alt="MapThatJob Logo" className="app-logo" />
          <h1>MapThatJob</h1>
        </div>

        <AccessibilityControls />
        
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <input 
              type="text" 
              value={searchInput} 
              onChange={(e) => setSearchInput(e.target.value)} 
              placeholder="Search city (e.g., Novi, Michigan)"
            />
            <button type="submit">Search</button>
          </form>
          
          {suggestions.length > 0 && (
            <ul className="suggestions-dropdown">
              {suggestions.map(place => (
                <li 
                  key={place.place_id} 
                  tabIndex="0" 
                  onClick={() => handleSuggestionClick(place.display_name)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSuggestionClick(place.display_name);
                    }
                  }}
                >
                  {place.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
      
      <main className="main-content">
        <div className="job-list">
          {loading ? <p>Loading jobs...</p> : jobs.map(job => (
            <div 
              key={job.id} 
              ref={el => jobRefs.current[job.id] = el} // Stores this card in our React ref
              onClick={() => setActiveJobId(job.id)} // Clicking the card sets it as active
              className={`job-card 
                ${visitedJobs.has(job.id) ? 'visited-job' : ''} 
                ${activeJobId === job.id ? 'active-job' : ''}
              `}
              style={{ cursor: 'pointer' }}
            >
              <h3>{job.title}</h3>
              <p className="company">{job.company}</p>
              {job.website && (
                <button onClick={(e) => handleJobClick(e, job.id, job.website)}>
                  View Job
                </button>
              )}
            </div>
          ))}
          {!loading && jobs.length === 0 && <p>No jobs found.</p>}
        </div>

        <div className="map-container">
          <MapContainer center={mapCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
            <MapUpdater center={mapCenter} />
            
            {/* Pass the ref flag into the dragging interaction */}
            <MapInteraction setLocation={setLocation} centerMapRef={centerMapRef} />
            
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            
            {jobs.map(job => {
              if (!job.lat || !job.lng) return null;
              return (
                <Marker 
                  key={job.id} 
                  position={[job.lat, job.lng]}
                  ref={el => markerRefs.current[job.id] = el} // Stores this pin in our React ref
                  eventHandlers={{
                    click: () => setActiveJobId(job.id) // Clicking the pin sets it as active
                  }}
                  opacity={visitedJobs.has(job.id) ? 0.4 : 1.0}
                >
                  <Popup>
                    <strong>{job.title}</strong><br />
                    {job.company}
                  </Popup>
                </Marker>
              )
            })}
          </MapContainer>
        </div>
      </main>
    </div>
  );
}