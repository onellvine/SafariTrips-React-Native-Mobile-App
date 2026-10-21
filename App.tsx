import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/auth/AuthContext';
import Navigation from './src/navigation';
import { applyTheme } from './src/theme';

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } });

export default function App() {
  const scheme = useColorScheme();

  useEffect(() => {
    applyTheme(scheme);
  }, [scheme]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Navigation />
          <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
