'use client';
import React, { useState, useEffect } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Marker,
  StandaloneSearchBox,
} from '@react-google-maps/api';
import { Input } from './ui/input';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertCircle } from 'lucide-react';

const libraries: ('places' | 'drawing' | 'geometry' | 'localContext' | 'visualization')[] = ['places'];

interface LocationComboboxProps {
  value: { lat: number; lng: number; address: string } | null;
  onChange: (location: { lat: number; lng: number; address: string } | null) => void;
  city: string;
}

const mapContainerStyle = {
  height: '200px',
  width: '100%',
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: 4.60971, // Bogota
  lng: -74.08175,
};

export function LocationCombobox({ value, onChange, city }: LocationComboboxProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
       <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuración Requerida</AlertTitle>
            <AlertDescription>
                La clave de API de Google Maps no está configurada. Por favor, añádala a su archivo .env.
            </AlertDescription>
        </Alert>
    );
  }

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [searchBox, setSearchBox] = React.useState<google.maps.places.SearchBox | null>(null);
  const [markerPosition, setMarkerPosition] = useState(value);
  const [inputValue, setInputValue] = useState(value?.address || city || '');


  useEffect(() => {
    setMarkerPosition(value);
    setInputValue(value?.address || city || '');
  }, [value, city]);

  const onMapLoad = React.useCallback(function callback(mapInstance: google.maps.Map) {
    setMap(mapInstance);
  }, []);

  const onSearchBoxLoad = (ref: google.maps.places.SearchBox) => {
    setSearchBox(ref);
  };

  const onPlacesChanged = () => {
    if (searchBox) {
      const places = searchBox.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        const location = place.geometry?.location;
        const address = place.formatted_address;
        if (location && address) {
          const newPosition = { lat: location.lat(), lng: location.lng() };
          onChange({ ...newPosition, address });
          map?.panTo(newPosition);
          setInputValue(address);
        }
      }
    }
  };
  
  if (loadError) {
    return (
        <div className="space-y-2">
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error al Cargar Google Maps</AlertTitle>
                <AlertDescription>
                    No se pudo cargar la API. Verifica que la clave sea válida y que las APIs correctas estén habilitadas. Se ha activado un campo de texto manual.
                </AlertDescription>
            </Alert>
            <Input 
              placeholder="Ingrese la dirección manualmente" 
              defaultValue={city}
              onChange={(e) => onChange({ address: e.target.value, lat: 0, lng: 0 })}
            />
        </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StandaloneSearchBox
        onLoad={onSearchBoxLoad}
        onPlacesChanged={onPlacesChanged}
      >
        <Input
          type="text"
          placeholder="Buscar dirección..."
          className="w-full"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            // If user types manually, clear lat/lng
            if (value) {
                onChange({ address: e.target.value, lat: 0, lng: 0 });
            }
          }}
        />
      </StandaloneSearchBox>

      {markerPosition && markerPosition.lat !== 0 && (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={markerPosition}
          zoom={15}
          onLoad={onMapLoad}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
          }}
        >
          <Marker position={markerPosition} />
        </GoogleMap>
      )}
    </div>
  );
}
