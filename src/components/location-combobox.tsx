
'use client';
import React, { useState } from 'react';
import { APIProvider, Map, useMapsLibrary, useMap } from '@vis.gl/react-google-maps';
import { Input } from './ui/input';

interface LocationComboboxProps {
    onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
    initialValue?: string;
}

const Autocomplete = ({ onPlaceSelect, initialValue }: LocationComboboxProps) => {
    const places = useMapsLibrary('places');
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
        if (!places || !inputRef.current) return;

        const autocompleteInstance = new places.Autocomplete(inputRef.current, {
            fields: ['formatted_address', 'geometry', 'name'],
            types: ['(cities)', 'geocode'],
        });

        autocompleteInstance.addListener('place_changed', () => {
            const place = autocompleteInstance.getPlace();
            onPlaceSelect(place);
        });

        setAutocomplete(autocompleteInstance);

    }, [places, onPlaceSelect]);
    
    return <Input ref={inputRef} defaultValue={initialValue} placeholder="Buscar ciudad, país, dirección..." />;
};

export function LocationCombobox(props: LocationComboboxProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
        return (
            <div className="p-2 text-sm text-destructive border border-destructive/50 rounded-md">
                La clave de API de Google Maps no está configurada. Agregue NEXT_PUBLIC_GOOGLE_MAPS_API_KEY a su archivo .env.local.
            </div>
        );
    }
    
    return (
        <APIProvider apiKey={apiKey}>
            <Autocomplete {...props} />
        </APIProvider>
    )
}
