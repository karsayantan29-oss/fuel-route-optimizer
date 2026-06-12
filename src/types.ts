/**
 * Shared Type Definitions for Fuel Route Optimizer API.
 */

export interface FuelStop {
  truckstopId: number;
  name: string;
  address: string;
  city: string;
  state: string;
  retailPrice: number;
}

export interface OptimalStop {
  truckstopId: number;
  name: string;
  address: string;
  city: string;
  state: string;
  retailPrice: number;
  milesFromStart: number;
  gallonsAdded: number;
  cost: number;
  latitude: number;
  longitude: number;
}

export interface RouteResponse {
  startLocation: string;
  finishLocation: string;
  startCoords: [number, number];
  finishCoords: [number, number];
  distanceMiles: number;
  durationMinutes: number;
  totalFuelCost: number;
  totalGallonsConsumed: number;
  averagePricePerGallon: number;
  optimalStops: OptimalStop[];
  explanation: string;
  routeGeometry: any; // GeoJSON geometry for polyline
}
