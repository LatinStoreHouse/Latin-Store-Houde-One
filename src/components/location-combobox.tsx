'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap,
} from '@vis.gl/react-google-maps';
import { Input } from './ui/input';
import { Loader2 } from 'lucide-react';


function usePlacesAutocompleteService(
  options?: google.maps.places.AutocompletionRequest
) {
  const [places, setPlaces] =
    useState<google.maps.places.AutocompletePrediction[]>([]);
  const [autocompleteService, setAutocompleteService] =
    useState<google.maps.places.AutocompleteService | null>(null);
  const [sessionToken, setSessionToken] =
    useState<google.maps.places.AutocompleteSessionToken>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      return;
    }
    setAutocompleteService(new google.maps.places.AutocompleteService());
    setSessionToken(new google.maps.places.AutocompleteSessionToken());
  }, []);

  const fetchPredictions = (inputValue: string) => {
    if (!autocompleteService || !inputValue) {
      setPlaces([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    autocompleteService.getPlacePredictions(
      { ...options, input: inputValue, sessionToken },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          setPlaces(predictions || []);
        } else {
          setPlaces([]);
        }
        setLoading(false);
      }
    );
  };

  return { places, fetchPredictions, loading, setPlaces };
}


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
  const [inputValue, setInputValue] = useState(initialValue || '');
  const [placesService, setPlacesService] =
    useState<google.maps.places.PlacesService | null>(null);
  const map = useMap();
  
  useEffect(() => {
    if (!map) return;
    setPlacesService(new google.maps.places.PlacesService(map));
  }, [map]);


  const { places, fetchPredictions, loading, setPlaces } = usePlacesAutocompleteService({
     componentRestrictions: { country: ["co", "ec", "pa", "pe", "us"] }
  });

  useEffect(() => {
    if (inputValue) {
        fetchPredictions(inputValue);
    } else {
        setPlaces([]);
    }
  }, [inputValue]);

  const handlePlaceSelect = (place: google.maps.places.AutocompletePrediction) => {
    setInputValue(place.description);
    setPlaces([]);

    if (!placesService) return;

    placesService.getDetails({ placeId: place.place_id, fields: ['geometry.location', 'address_components', 'formatted_address'] }, (placeResult, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && placeResult) {
            const lat = placeResult.geometry?.location?.lat() || 0;
            const lng = placeResult.geometry?.location?.lng() || 0;
            
            let city = '';
            let country = '';

            placeResult.address_components?.forEach(component => {
                if (component.types.includes('locality')) {
                    city = component.long_name;
                }
                 if (component.types.includes('administrative_area_level_1') && !city) {
                    city = component.long_name;
                }
                if (component.types.includes('country')) {
                    country = component.long_name;
                }
            });

            onLocationSelect({ address: placeResult.formatted_address || place.description, city, country, lat, lng });
        }
    });
  }

  return (
    <div className="w-full relative">
       <Input
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
                onClick={() => handlePlaceSelect(p)}
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
            const errorKeywords = ['Google Maps JavaScript API error', 'InvalidKeyMapError', 'ApiNotActivatedMapError'];
            
            console.error = (...args) => {
                const errorMessage = args[0];
                if (typeof errorMessage === 'string' && errorKeywords.some(keyword => errorMessage.includes(keyword))) {
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
