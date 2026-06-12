import React from "react";
import { RouteResponse } from "../types.js";
import { MapPin, Milestone, DollarSign, Sparkles } from "lucide-react";

interface StopTimelineProps {
  data: RouteResponse;
}

export default function StopTimeline({ data }: StopTimelineProps) {
  const { optimalStops, explanation, startLocation, finishLocation } = data;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Optimization explanation info */}
      <div className="p-4 bg-blue-50/50 border border-blue-100/60 rounded-xl">
        <h4 className="font-semibold text-blue-900 text-xs flex items-center gap-1.5 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
          Plan Explanation
        </h4>
        <p className="mt-2 text-slate-600 leading-relaxed text-xs">
          {explanation}
        </p>
      </div>

      {/* Itinerary Chronology Timeline */}
      <div className="flex flex-col gap-4">
        {/* Timeline Node: Depart */}
        <div className="bg-white border border-slate-200/65 rounded-xl p-4 flex gap-4 items-center shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-extrabold shrink-0 text-sm">
            ★
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">DEPART</div>
            <div className="text-sm font-bold text-slate-800 truncate">{startLocation.split(",")[0]}</div>
            <div className="text-[10px] text-slate-400 font-medium font-sans mt-0.5 truncate">{startLocation}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Start</div>
            <div className="text-xs font-bold text-slate-600 font-mono">0.0 mi</div>
          </div>
        </div>

        {/* Selected Optimal stops */}
        {optimalStops.map((stop, index) => (
          <div
            key={stop.truckstopId + "-" + index}
            className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4 items-center shadow-md hover:shadow-lg transition-all"
          >
            {/* Round badge indicator */}
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-extrabold shrink-0 text-sm">
              {index + 1}
            </div>
            
            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                Stop @ {stop.milesFromStart.toFixed(0)} mi
              </div>
              <div className="text-sm font-bold text-slate-800 truncate">{stop.name}</div>
              <div className="text-[10px] text-slate-500 font-semibold truncate flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-300 shrink-0" />
                {stop.city}, {stop.state}
              </div>
              <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                Refuel load: <span className="font-bold text-slate-700">+{stop.gallonsAdded.toFixed(1)} gal</span>
              </div>
            </div>

            {/* Price stamps */}
            <div className="text-right shrink-0 pl-1">
              <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Price</div>
              <div className="text-sm font-black text-emerald-600 font-mono">
                ${stop.retailPrice.toFixed(3)}
              </div>
              <div className="text-[10px] text-rose-500 font-bold mt-1 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100/20">
                ${stop.cost.toFixed(2)}
              </div>
            </div>
          </div>
        ))}

        {/* Timeline Node: Arrive */}
        <div className="bg-white border border-slate-200/65 rounded-xl p-4 flex gap-4 items-center shadow-sm hover:shadow-md transition-all">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-extrabold shrink-0 text-sm">
            ✓
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">ARRIVE</div>
            <div className="text-sm font-bold text-slate-800 truncate">{finishLocation.split(",")[0]}</div>
            <div className="text-[10px] text-slate-400 font-medium font-sans mt-0.5 truncate">{finishLocation}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Arrive</div>
            <div className="text-xs font-bold text-slate-600 font-mono">Destination</div>
          </div>
        </div>

      </div>
    </div>
  );
}
