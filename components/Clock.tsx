'use client';

import { useEffect, useState } from 'react';

const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Bucharest',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

export default function Clock() {
  // Empty on the server so the markup matches before hydration.
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="absolute bottom-0 right-0 px-24 pb-10 font-mono text-[12px] tabular-nums text-muted max-[820px]:px-4 max-[820px]:pb-5">
      Timișoara · <time suppressHydrationWarning>{time || '--:--'}</time>
    </p>
  );
}
