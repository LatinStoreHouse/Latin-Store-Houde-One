'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getAdvisorSuggestion } from '@/app/actions';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserCheck, Sparkles, Loader2, AlertCircle } from 'lucide-react';

const initialState = {
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analizando...
        </>
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Obtener Sugerencia
        </>
      )}
    </Button>
  );
}

export function AdvisorForm() {
  const [state, formAction] = useFormState(getAdvisorSuggestion, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-4">
      <Textarea
        name="messageContent"
        placeholder="ej., 'Hola, vi su nueva laptop en Instagram y tengo algunas preguntas sobre envíos internacionales y descuentos por volumen...'"
        rows={6}
        required
        className="w-full"
      />
      
      <SubmitButton />

      {state.result && (
        <Card className="mt-6 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-3">
              <UserCheck className="h-6 w-6 text-primary" />
              <CardTitle>Sugerencia de Asesor</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <h3 className="text-lg font-semibold">{state.result.suggestedAdvisor}</h3>
            <p className="text-sm text-muted-foreground">{state.result.reason}</p>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
