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
              <CardTitle>AI-Powered Advisor Suggestions</CardTitle>
              <CardDescription>
                Paste a customer inquiry to get an intelligent recommendation for the best sales advisor.
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
