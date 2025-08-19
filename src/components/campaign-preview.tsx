'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from './ui/button';
import { Smartphone, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CampaignPreviewProps {
    campaignName: string;
    message: string;
}

export function CampaignPreview({ campaignName, message }: CampaignPreviewProps) {
    const [view, setView] = useState<'mobile' | 'desktop'>('mobile');

    const defaultMessage = "Escribe el contenido de tu campaña para verlo aquí...";

    return (
        <Card className="sticky top-6">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Vista Previa</CardTitle>
                    <div className="flex items-center gap-1 rounded-md bg-muted p-1">
                        <Button
                            variant={view === 'mobile' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => setView('mobile')}
                        >
                            <Smartphone className="h-4 w-4" />
                        </Button>
                        <Button
                             variant={view === 'desktop' ? 'secondary' : 'ghost'}
                             size="icon"
                             className="h-7 w-7"
                             onClick={() => setView('desktop')}
                        >
                            <Monitor className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className={cn(
                    "mx-auto rounded-lg border bg-background shadow-sm transition-all",
                    view === 'mobile' ? "w-[320px] h-[568px] p-4" : "w-full h-auto p-6"
                )}>
                    <div className="flex flex-col h-full">
                        <div className="mb-4">
                            <h3 className="font-bold text-lg">{campaignName || "Nombre de Campaña"}</h3>
                            <p className="text-xs text-muted-foreground">De: Latin Store House</p>
                        </div>
                        <div className="flex-1 overflow-y-auto text-sm whitespace-pre-wrap break-words">
                            {message || defaultMessage}
                        </div>
                         <div className="mt-4 text-center">
                            <Button size="sm" className="w-full">Ver Producto</Button>
                            <p className="text-xs text-muted-foreground mt-2">
                                Para cancelar la suscripción, haga clic <a href="#" className="underline">aquí</a>.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
