'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useAutocomplete,
  Pin,
} from '@vis.gl/react-google-maps';
import { Input } from './ui/input';
import { Loader2 } from 'lucide-react';

interface LocationComboboxProps {
  apiKey: string;
  onLocationSelect: (location: { address: string; city: string; country: string, lat: number, lng: number }) => void;
  initialValue?: string;
}

const FallbackInput = ({ onLocationSelect, initialValue }: Pick<LocationComboboxProps, 'onLocationSelect' | 'initialValue'>) => (
     <Input 
        defaultValue={initialValue}
        onBlur={(e) => onLocationSelect({ address: e.target.value, city: '', country: '', lat: 0, lng: 0 })}
        placeholder="No se pudo cargar Google Maps. Ingrese la dirección manualmente."
     />
)

const LocationSearch = ({ onLocationSelect, initialValue }: Pick<LocationComboboxProps, 'onLocationSelect' | 'initialValue'>) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState(initialValue || '');
  const [selectedPlace, setSelectedPlace] = useState<google.maps.places.PlaceResult | null>(null);
  
  const { places, loading } = useAutocomplete({
    inputField: inputRef.current,
    onPlaceSelect: (place) => {
      setSelectedPlace(place);
    },
    options: {
        componentRestrictions: { country: ["co", "ec", "pa", "pe", "us"] }
    }
  });

  useEffect(() => {
    if (selectedPlace?.geometry?.location && selectedPlace.formatted_address) {
      const lat = selectedPlace.geometry.location.lat();
      const lng = selectedPlace.geometry.location.lng();
      
      let city = '';
      let country = '';

      selectedPlace.address_components?.forEach(component => {
          if (component.types.includes('locality')) {
              city = component.long_name;
          }
           if (component.types.includes('administrative_area_level_1')) {
              city = city || component.long_name;
          }
          if (component.types.includes('country')) {
              country = component.long_name;
          }
      });
      
      onLocationSelect({ address: selectedPlace.formatted_address, city, country, lat, lng });
      setInputValue(selectedPlace.formatted_address);
    }
  }, [selectedPlace, onLocationSelect]);

  return (
    <div className="w-full relative">
       <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Buscar dirección..."
      />
      {loading && <Loader2 className="animate-spin absolute right-2 top-2.5 h-5 w-5 text-muted-foreground" />}
      {places && places.length > 0 && (
         <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg">
           {places.map((p) => (
             <div
                key={p.place_id}
                onClick={() => setSelectedPlace(p)}
                className="p-2 hover:bg-muted cursor-pointer"
             >
                {p.description}
             </div>
           ))}
         </div>
      )}
    </div>
  );
};

export function LocationCombobox({ onLocationSelect, initialValue }: Omit<LocationComboboxProps, 'apiKey'>) {
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (key) {
            setApiKey(key);
            
            const originalError = console.error;
            console.error = (...args) => {
                if (typeof args[0] === 'string' && args[0].includes('Google Maps JavaScript API error: InvalidKeyMapError')) {
                    setHasError(true);
                }
                originalError(...args);
            };

            return () => {
                console.error = originalError;
            };
        } else {
             setHasError(true);
        }
    }, []);
    
    if (hasError) {
        return <FallbackInput onLocationSelect={onLocationSelect} initialValue={initialValue} />;
    }
    
    if (!apiKey) {
        return <Input placeholder="Cargando buscador de direcciones..." disabled />;
    }

    return (
        <APIProvider apiKey={apiKey} libraries={['places']}>
            <LocationSearch onLocationSelect={onLocationSelect} initialValue={initialValue} />
        </APIProvider>
    );
}

export function LocationMap({ lat, lng }: { lat: number, lng: number }) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !lat || !lng) return null;

    return (
        <div className="h-48 w-full rounded-md overflow-hidden border mt-2">
            <APIProvider apiKey={apiKey}>
                <Map
                    defaultCenter={{ lat, lng }}
                    defaultZoom={15}
                    mapId="fc3b490d1eb9b413"
                    gestureHandling={'greedy'}
                >
                    <AdvancedMarker position={{ lat, lng }}>
                       <Pin />
                    </AdvancedMarker>
                </Map>
            </APIProvider>
        </div>
    );
}
