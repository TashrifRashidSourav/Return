// app/index.tsx (Simplified)
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function Index() {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Set a timeout to ensure the root layout is mounted
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady) {
      router.replace('/authentication/login'); // Redirect to login
    }
  }, [isReady, router]);

  return <></>; // Simple return, no UI
}
