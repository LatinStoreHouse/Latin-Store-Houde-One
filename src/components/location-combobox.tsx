
'use client';
import React, { useState, useEffect } from 'react';
import { APIProvider, useMapsLibrary, APILoadingStatus } from '@vis.gl/react-google-maps';
import { Input } from './ui/input';

interface LocationComboboxProps {
    onPlaceSelect: (place: google.maps.places.PlaceResult | null, manualInput: string | null) => void;
    initialValue?: string;
}

const Autocomplete = ({ onPlaceSelect, initialValue }: LocationComboboxProps) => {
    const places = useMapsLibrary('places');
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!places || !inputRef.current) return;

        const autocompleteInstance = new places.Autocomplete(inputRef.current, {
            fields: ['formatted_address', 'geometry', 'name'],
            types: ['(cities)', 'geocode'],
        });

        autocompleteInstance.addListener('place_changed', () => {
            const place = autocompleteInstance.getPlace();
            onPlaceSelect(place, null);
        });

        setAutocomplete(autocompleteInstance);

    }, [places, onPlaceSelect]);
    
    // Handle manual input for when a place is not selected from the dropdown
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        // A short delay to allow the place_changed event to fire first
        setTimeout(() => {
            if (!autocomplete?.getPlace()) {
                onPlaceSelect(null, e.target.value);
            }
        }, 100);
    }
    
    return <Input ref={inputRef} defaultValue={initialValue} placeholder="Buscar ciudad, país, dirección..." onBlur={handleBlur} />;
};

// Fallback component for when the API fails to load
const ManualInput = ({ onPlaceSelect, initialValue }: LocationComboboxProps) => {
    return (
        <Input 
            defaultValue={initialValue} 
            placeholder="Ciudad / País"
            onChange={(e) => onPlaceSelect(null, e.target.value)}
        />
    );
};

export function LocationCombobox(props: LocationComboboxProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
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
    }, []);

    if (!apiKey || hasError) {
        if (!apiKey) {
          console.error("Google Maps API key is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env file.");
        }
        return <ManualInput {...props} />;
    }
    
    return (
        <APIProvider apiKey={apiKey} onLoad={() => setHasError(false)}>
            <Autocomplete {...props} />
        </APIProvider>
    )
}
