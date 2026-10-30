import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import { DatabaseProvider } from './context/DatabaseContext';

export default function App() {
  return (
    <DatabaseProvider>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </DatabaseProvider>
  );
}