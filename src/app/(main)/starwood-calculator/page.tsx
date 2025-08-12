'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Combobox } from '@/components/ui/combobox';


export default function StarwoodCalculatorPage() {
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calculadora de Cotizaciones - Starwood</CardTitle>
        <CardDescription>
          Estime el costo de los productos de Starwood.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
         <p>Calculadora para productos Starwood en construcción.</p>
      </CardContent>
    </Card>
  )
}
