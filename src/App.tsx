import React, { useState, useEffect } from "react";
import { RouteResponse } from "./types.js";
import MapContainer from "./components/MapContainer.js";
import StopTimeline from "./components/StopTimeline.js";
import { 
  MapPin, 
  ArrowRightLeft, 
  Search, 
  Loader2, 
  AlertTriangle,
  Info,
  Route,
  Navigation,
  Fuel,
  DollarSign,
  Monitor
} from "lucide-react";

export default function App() {
  const [start, setStart] = useState("Houston, TX");
  const [finish, setFinish] = useState("Chicago, IL");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RouteResponse | null>(null);
  const [loadingStep, setLoadingStep] = useState<string>("");

  // Preset testing routes for superior UX
  const presets = [
    { start: "Houston, TX", finish: "Chicago, IL" },
    { start: "Los Angeles, CA", finish: "New York, NY" },
    { start: "Miami, FL", finish: "Seattle, WA" },
  ];

  const handleSearch = async (e?: React.FormEvent, customStart?: string, customFinish?: string) => {
    if (e) e.preventDefault();
    
    const searchStart = customStart || start;
    const searchFinish = customFinish || finish;

    if (!searchStart.trim() || !searchFinish.trim()) {
      setError("Please provide both start and end locations.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Dynamic messaging during loading sequence for excellent feedback UX
    const steps = [
      "Contacting Nominatim Geocoder...",
      "Resolving USA map coordinates...",
      "Calculating segments via OSRM...",
      "Parsing truckstop fuel price database...",
      "Optimizing costs with Gemini AI...",
      "Verifying 500-mile tank threshold...",
    ];

    let stepIndex = 0;
    setLoadingStep(steps[stepIndex]);
    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length - 1) {
        stepIndex++;
        setLoadingStep(steps[stepIndex]);
      }
    }, 1500);

    try {
      const response = await fetch("/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ start: searchStart, finish: searchFinish }),
      });

      clearInterval(stepInterval);

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to calculate optimal route.");
      }

      setResult(data);
    } catch (err: any) {
      clearInterval(stepInterval);
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Perform initial search on mount so the user has an immediate, gorgeous visualization!
  useEffect(() => {
    handleSearch(undefined, "Houston, TX", "Chicago, IL");
  }, []);

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* Sleek Navigation Bar */}
      <nav className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800">
            FuelPath<span className="text-blue-600 font-extrabold">Optimus</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6 text-sm font-medium text-slate-500">
          <span className="hidden sm:inline">Smart Core v2.4</span>
          <span className="hidden sm:inline">10 MPG Vehicle Config</span>
          <div className="h-8 w-8 bg-blue-50 border-2 border-blue-500/20 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
            FS
          </div>
        </div>
      </nav>

      {/* Main Container */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar Control Panel */}
        <aside className="w-full lg:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 p-6 flex flex-col gap-5 shrink-0 overflow-y-auto">
          {/* Geocoding Inputs */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Route Parameters
            </label>
            <div className="space-y-3 relative">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-100"></span>
                <input
                  type="text"
                  placeholder="Starting city, state"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-slate-800"
                />
              </div>

              {/* In-between Swap Button */}
              <div className="absolute right-3 top-[18px] z-10">
                <button
                  type="button"
                  onClick={() => {
                    const temp = start;
                    setStart(finish);
                    setFinish(temp);
                  }}
                  className="p-1 px-1.5 rounded-md border border-slate-200 bg-white text-slate-400 hover:text-blue-500 hover:border-blue-200 shadow-sm transition-all"
                  title="Swap Locations"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100"></span>
                <input
                  type="text"
                  placeholder="Ending city, state"
                  value={finish}
                  onChange={(e) => setFinish(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all font-medium text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Popular Routes
            </span>
            <div className="flex flex-col gap-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setStart(preset.start);
                    setFinish(preset.finish);
                    handleSearch(undefined, preset.start, preset.finish);
                  }}
                  className="flex items-center justify-between text-left text-xs px-3 py-2 border border-slate-100 rounded-lg text-slate-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/20 transition-all bg-slate-50/50"
                >
                  <span>{preset.start.split(",")[0]} ➔ {preset.finish.split(",")[0]}</span>
                  <span className="text-[10px] font-mono text-slate-400">SELECT</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vehicle Profile Section */}
          <section className="bg-blue-50/70 rounded-xl p-4 border border-blue-100/50">
            <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-2.5">
              Vehicle Profile
            </label>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100/30">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Tank Range</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">500 mi</div>
              </div>
              <div className="bg-white p-2 rounded-lg shadow-sm border border-blue-100/30">
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Efficiency</div>
                <div className="text-xs font-bold text-slate-800 mt-0.5">10 MPG</div>
              </div>
            </div>
          </section>

          {/* Cost Summary Section */}
          <section className="flex-grow flex flex-col justify-end">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Cost Summary
            </label>
            {result ? (
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-150">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-slate-500 font-medium">Trip Distance</span>
                  <span className="text-sm font-semibold text-slate-850">{result.distanceMiles.toFixed(1)} mi</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-xs text-slate-500 font-medium">Fuel Required</span>
                  <span className="text-sm font-semibold text-slate-850">{result.totalGallonsConsumed.toFixed(1)} gal</span>
                </div>
                {result.averagePricePerGallon > 0 && (
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-slate-500 font-medium">Avg Fuel Price</span>
                    <span className="text-sm font-semibold text-slate-850">${result.averagePricePerGallon.toFixed(3)}/g</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-3 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">Total Cost</span>
                  <span className="text-xl font-black text-blue-600 tracking-tight">${result.totalFuelCost.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                <p className="text-[11px] text-slate-400 font-medium">
                  Provide route locations above to optimize costs
                </p>
              </div>
            )}
          </section>

          {/* Action Trigger Button */}
          <button
            type="button"
            onClick={(e) => handleSearch(e)}
            disabled={loading}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Planning Route...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>Recalculate Route</span>
              </>
            )}
          </button>
        </aside>

        {/* Right Area Workspace (Map & Route details scroll block) */}
        <section className="flex-1 flex flex-col relative overflow-hidden bg-slate-100">
          
          {loading && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
                <div className="absolute font-display font-black text-blue-600 text-xs">GO</div>
              </div>
              <h3 className="mt-4 font-display font-semibold text-slate-800">
                Consulting Routing Engine
              </h3>
              <p className="mt-1 text-xs text-slate-500 font-mono tracking-wide bg-slate-100 px-3 py-1 rounded-md border border-slate-200/50">
                {loadingStep || "Loading..."}
              </p>
            </div>
          )}

          {error && (
            <div className="absolute inset-x-8 top-8 z-40 bg-rose-50 border border-rose-100 p-5 rounded-2xl shadow-lg flex items-start gap-3 text-rose-800 animate-fade-in">
              <span className="p-2 bg-rose-100 text-rose-700 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </span>
              <div className="flex-1 space-y-1">
                <h4 className="font-bold font-display text-sm">Optimization Warning</h4>
                <p className="text-xs font-sans text-rose-700 leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          )}

          {result ? (
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden h-full">
              {/* Map Segment (Fills left 63% on layout desktop) */}
              <div className="flex-1 min-h-[350px] md:min-h-0 relative p-4 flex flex-col border-b md:border-b-0 md:border-r border-slate-200">
                <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
                  <span>Corridor Route Canvas</span>
                  <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">US-Grid GPS</span>
                </div>
                <div className="flex-1 relative rounded-2xl overflow-hidden shadow-inner border border-slate-200/70">
                  <MapContainer data={result} />
                </div>
              </div>

              {/* Stop Chronology Segment (Right 37%) */}
              <div className="w-full md:w-96 bg-white p-6 overflow-y-auto flex flex-col gap-6 shrink-0 border-l border-slate-200/50 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                    Selected Fuel Stops
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded font-bold">
                    {result.optimalStops.length} stops
                  </span>
                </div>
                
                <StopTimeline data={result} />
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Route className="w-12 h-12 text-slate-300 animate-pulse" />
              <h3 className="mt-4 font-display font-semibold text-slate-700">Ready to Plan</h3>
              <p className="text-xs max-w-sm text-slate-500 mt-1">
                Plan a route with the sidebar controls to calculate prices and rendering map steps.
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Sleek Dark Minimalistic Footer */}
      <footer className="h-10 bg-slate-900 px-8 flex items-center justify-between text-[10px] text-slate-400 shrink-0 font-medium">
        <div>Routing Engine: Project OSRM driving v1</div>
        <div className="hidden sm:inline">Data Sources: OPIS Fuel Stops Database v2026.06</div>
        <div className="flex items-center gap-2 uppercase font-bold tracking-wider">
          <span>System Healthy</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
        </div>
      </footer>
    </div>
  );
}
