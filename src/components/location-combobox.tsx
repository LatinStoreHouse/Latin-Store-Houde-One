
'use client';
import React, { useState, useEffect } from 'react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';
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
    
    return <Input ref={inputRef} defaultValue={initialValue} placeholder="Buscar ciudad, país, dirección..." />;
};

export function LocationCombobox(props: LocationComboboxProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
        console.error("Google Maps API key is missing. Please add it to your .env file.");
        return (
             <Input 
                defaultValue={props.initialValue} 
                placeholder="Ej: Bogotá, Colombia"
                onChange={(e) => props.onPlaceSelect(null, e.target.value)}
                disabled
            />
        );
    }
    
    return (
        <APIProvider apiKey={apiKey}>
            <Autocomplete {...props} />
        </APIProvider>
    )
}
