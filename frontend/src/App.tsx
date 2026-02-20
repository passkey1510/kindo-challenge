import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { TripsList } from './pages/TripsList';
import { TripPage } from './pages/TripPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-bg">
          <header className="bg-navy">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
              <Link to="/" className="hover:opacity-80 transition-opacity">
                <img src="/kindo-logo.png" alt="Kindo" className="h-7" />
              </Link>
            </div>
          </header>

          <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
            <Routes>
              <Route path="/" element={<TripsList />} />
              <Route path="/trips/:id" element={<TripPage />} />
            </Routes>
          </main>

          <footer className="border-t border-border mt-auto">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
              <p className="text-xs text-text-muted text-center">
                Kindo School Payments. Secure and trusted by schools across New Zealand.
              </p>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
