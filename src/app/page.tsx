
'use client';
import { redirect } from 'next/navigation';
import React from 'react';

// This is a temporary client-side redirect component to handle the redirect
// from the root path to the dashboard. In a real application, this redirect
// would ideally be configured on the server.
function RedirectToDashboard() {
  try {
    redirect('/dashboard');
  } catch (error: any) {
    // The redirect function in Next.js can throw an error that is caught by
    // a Suspense boundary. This is expected behavior during the render process.
    // We re-throw the error to allow the Suspense boundary to handle it.
    if (typeof error.then === 'function') {
      throw error;
    }
    // If it's a different kind of error, we log it.
    console.error("Redirect failed:", error);
  }

  // This part will not be rendered if the redirect is successful.
  return null;
}

export default function HomePage() {
  return (
    // The Suspense boundary is necessary to catch the error thrown by redirect()
    // and correctly handle the navigation.
    <React.Suspense fallback={<div>Redirigiendo...</div>}>
      <RedirectToDashboard />
    </React.Suspense>
  );
}
