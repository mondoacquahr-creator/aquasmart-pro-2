import { LandingHero } from './LandingHero';
import { AppShots } from './AppShots';
import { LandingFooter } from './LandingFooter';

export function LandingPage() {
  return (
    <div className="w-full">
      <LandingHero />
      <AppShots />
      <LandingFooter />
    </div>
  );
}