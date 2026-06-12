import React, { useEffect, useRef } from "react";
import { RouteResponse } from "../types.js";

interface MapContainerProps {
  data: RouteResponse;
}

export default function MapContainer({ data }: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const myMap = useRef<any>(null);

  useEffect(() => {
    const L = (window as any).L;
    if (!L || !mapRef.current) return;

    // Destroy existing map instance to cleanly re-create on coordinates change
    if (myMap.current) {
      try {
        myMap.current.remove();
      } catch (e) {
        console.warn("Error removing map instance:", e);
      }
      myMap.current = null;
    }

    if (mapRef.current) {
      // Clear the inner HTML of the container to wipe out any residual Leaflet attributes, internal state, and markers
      mapRef.current.innerHTML = "";
    }

    try {
      const { startCoords, finishCoords, routeGeometry, optimalStops, startLocation, finishLocation } = data;

      // Create new Leaflet instance centered at route start
      myMap.current = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView(startCoords, 5);

      // OpenStreetMap gorgeous minimal tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        attribution: "© OpenStreetMap contributors © CARTO",
        subdomains: "abcd",
        maxZoom: 20,
      }).addTo(myMap.current);

      // Custom SVG Marker Icon for Start (Blue Pin)
      const startIcon = L.divIcon({
        className: "custom-div-icon",
        html: `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Custom SVG Marker Icon for Destination (Red Pin)
      const endIcon = L.divIcon({
        className: "custom-div-icon",
        html: `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 border-2 border-white shadow-lg text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      // Add Start Marker
      L.marker(startCoords, { icon: startIcon })
        .addTo(myMap.current)
        .bindPopup(`<div class="font-sans"><strong>Route Start</strong><br/><span class="text-xs text-slate-500">${startLocation}</span></div>`);

      // Add Destination Marker
      L.marker(finishCoords, { icon: endIcon })
        .addTo(myMap.current)
        .bindPopup(`<div class="font-sans"><strong>Route Destination</strong><br/><span class="text-xs text-slate-500">${finishLocation}</span></div>`);

      // Draw Route Polyline from OSRM GeoJSON coords
      if (routeGeometry && routeGeometry.coordinates) {
        const pathCoordinates = routeGeometry.coordinates.map((point: [number, number]) => [point[1], point[0]]);
        const polyline = L.polyline(pathCoordinates, {
          color: "#4f46e5", // indigo-600
          weight: 4.5,
          opacity: 0.85,
          lineJoin: "round",
        }).addTo(myMap.current);

        // Fit map bounds to encompass the entire driving route
        myMap.current.fitBounds(polyline.getBounds(), { padding: [40, 40] });
      }

      // Add Optimal Fuel Up Station Markers
      optimalStops.forEach((stop, index) => {
        const fuelIcon = L.divIcon({
          className: "custom-div-icon",
          html: `
            <div class="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-lg text-white font-display font-bold text-xs ring-4 ring-emerald-500/20">
              F${index + 1}
            </div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const popupContent = `
          <div class="font-sans p-1">
            <h4 class="text-emerald-700 font-bold m-0 text-sm font-display">${stop.name}</h4>
            <p class="text-xs text-slate-500 my-1">${stop.address}, ${stop.city}, ${stop.state}</p>
            <div class="mt-2 border-t border-slate-100 pt-1 text-xs text-slate-700">
              <div><strong>Retail Price:</strong> <span class="font-mono text-slate-900 font-semibold">$${stop.retailPrice.toFixed(3)}/gal</span></div>
              <div><strong>Fuel Added:</strong> <span class="font-semibold text-slate-900">${stop.gallonsAdded.toFixed(1)} gallons</span></div>
              <div><strong>Fills Up at:</strong> <span class="font-semibold text-slate-900">${stop.milesFromStart.toFixed(0)} mi mark</span></div>
              <div class="mt-1 font-bold text-emerald-600">Total Stop Cost: $${stop.cost.toFixed(2)}</div>
            </div>
          </div>
        `;

        L.marker([stop.latitude, stop.longitude], { icon: fuelIcon })
          .addTo(myMap.current)
          .bindPopup(popupContent);
      });

    } catch (err) {
      console.error("Leaflet initialization failed", err);
    }

    return () => {
      if (myMap.current) {
        myMap.current.remove();
        myMap.current = null;
      }
    };
  }, [data]);

  return (
    <div className="relative w-full h-[500px] md:h-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-100 group">
      <div id="map-container" ref={mapRef} className="w-full h-full" />
      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-sm text-xs font-medium text-slate-600 pointer-events-none">
        Interactive Leaflet Route Map
      </div>
    </div>
  );
}
