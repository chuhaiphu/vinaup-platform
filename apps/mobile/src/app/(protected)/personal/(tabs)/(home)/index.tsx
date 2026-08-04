import { PersonalIndexScreenContent } from '@/components/personal/screen-contents/personal-index-screen-content';
import { PersonalHomeSummaryProvider } from '@/providers/personal/personal-home-summary-provider';

export default function PersonalIndexScreen() {
  return (
    <PersonalHomeSummaryProvider>
      <PersonalIndexScreenContent />
    </PersonalHomeSummaryProvider>
  );
}
