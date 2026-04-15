const runtimeApiUrl =
  typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3000/api/v1`
    : 'http://localhost:3000/api/v1';

const runtimeCableUrl =
  typeof window !== 'undefined'
    ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:3000/cable`
    : 'ws://localhost:3000/cable';

export const API_URL = import.meta.env.VITE_API_URL || runtimeApiUrl;
export const CABLE_URL = import.meta.env.VITE_CABLE_URL || runtimeCableUrl;
export const FLUTTERWAVE_PUBLIC_KEY = import.meta.env.VITE_FLUTTERWAVE_PUBLIC_KEY || '';
