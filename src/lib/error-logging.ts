// Simple error logging utility for production
export async function logError(error: Error, context?: any) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'server-side',
  };

  try {
    // Send to Google Sheets for error tracking
    const response = await fetch('/api/log-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorData),
    });

    if (!response.ok) {
      console.error('Failed to log error:', await response.text());
    }
  } catch (err) {
    console.error('Error logging failed:', err);
  }
}

// Error boundary component for React
export function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          We apologize for the inconvenience. Our team has been notified of this issue.
        </p>
        <details className="mb-4">
          <summary className="cursor-pointer text-sm text-gray-500">Error details</summary>
          <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
            {error.message}
          </pre>
        </details>
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}