import { Redirect, useLocalSearchParams } from 'expo-router';

export default function TourDetailIndexScreen() {
  const { tourId } = useLocalSearchParams<{ tourId: string }>();

  if (!tourId) return null;

  return <Redirect href={`/(protected)/tour-detail/${tourId}/tour-calculation`} />;
}
