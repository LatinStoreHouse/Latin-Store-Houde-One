import { AdvisorForm } from '@/components/advisor-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb } from 'lucide-react';

export default function AdvisorPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lightbulb className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Sugerencias de Asesor con IA</CardTitle>
              <CardDescription>
                Pegue la consulta de un cliente para obtener una recomendación inteligente del mejor asesor de ventas.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AdvisorForm />
        </CardContent>
      </Card>
    </div>
  );
}
