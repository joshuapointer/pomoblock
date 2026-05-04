import { Redirect } from 'expo-router';
import { useSettings } from '@/state/settings';

export default function Entry() {
  const hasOnboarded = useSettings((s) => s.hasOnboarded);
  return <Redirect href={hasOnboarded ? '/(tabs)' : '/onboarding'} />;
}
