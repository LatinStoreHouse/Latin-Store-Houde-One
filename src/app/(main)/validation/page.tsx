'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare } from 'lucide-react';

export default function ValidationPage() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <CheckSquare className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Validación de Contaduría</CardTitle>
            <CardDescription>
              Revise y apruebe las solicitudes pendientes.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p>Esta página está en construcción. Aquí se mostrarán los elementos pendientes de validación por parte de contaduría y administración.</p>
      </CardContent>
    </Card>
  );
}
