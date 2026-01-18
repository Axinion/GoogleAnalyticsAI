'use client';

import { BreakdownChart } from './BreakdownChart';

interface ReferralSourcesProps {
  referrers: Array<{ referrer: string; count: number }>;
}

export function ReferralSources({ referrers }: ReferralSourcesProps) {
  // Process referrers to group by source type
  const processedData = referrers.map(referrer => {
    let source = 'Direct';
    let displayName = 'Direct';

    if (!referrer.referrer || referrer.referrer === '') {
      source = 'Direct';
      displayName = 'Direct';
    } else {
      const url = new URL(referrer.referrer);
      const hostname = url.hostname.toLowerCase();

      if (hostname.includes('google')) {
        source = 'Google';
        displayName = 'Google';
      } else if (hostname.includes('youtube')) {
        source = 'YouTube';
        displayName = 'YouTube';
      } else if (hostname.includes('facebook')) {
        source = 'Facebook';
        displayName = 'Facebook';
      } else if (hostname.includes('twitter') || hostname.includes('x.com')) {
        source = 'Twitter';
        displayName = 'Twitter';
      } else if (hostname.includes('linkedin')) {
        source = 'LinkedIn';
        displayName = 'LinkedIn';
      } else if (hostname.includes('instagram')) {
        source = 'Instagram';
        displayName = 'Instagram';
      } else if (hostname.includes('reddit')) {
        source = 'Reddit';
        displayName = 'Reddit';
      } else if (hostname.includes('bing')) {
        source = 'Bing';
        displayName = 'Bing';
      } else if (hostname.includes('yahoo')) {
        source = 'Yahoo';
        displayName = 'Yahoo';
      } else {
        source = 'Other';
        displayName = hostname;
      }
    }

    return {
      source,
      displayName,
      count: referrer.count,
    };
  });

  // Group by source
  const groupedData = processedData.reduce((acc, item) => {
    const existing = acc.find(group => group.source === item.source);
    if (existing) {
      existing.value += item.count;
    } else {
      acc.push({
        name: item.displayName,
        value: item.count,
        source: item.source,
      });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; source: string }>);

  // Sort by count
  groupedData.sort((a, b) => b.value - a.value);

  return (
    <BreakdownChart
      data={groupedData}
      title="Traffic Sources"
      colors={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']}
    />
  );
}