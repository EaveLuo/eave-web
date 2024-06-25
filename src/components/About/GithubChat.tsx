import GitHubCalendar from 'react-github-calendar';
import { useColorMode } from '@docusaurus/theme-common';
import ThemedImage from '@theme/ThemedImage';
import { cn } from '@site/src/lib/utils';

interface GithubProps {
  className?: string;
}

export default function Github({ className }: GithubProps) {
  const githubStatsUrl = (type: 'overview' | 'languages', isDark: boolean) =>
    `https://raw.githubusercontent.com/EaveLuo/github-stats/master/generated/${type}.svg#gh-${
      isDark ? 'dark' : 'light'
    }-mode-only`;

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-center justify-center',
        className
      )}
    >
      <div className="mb-4 flex flex-wrap w-full justify-center gap-4 px-4 md:flex-nowrap xl:justify-between">
        <ThemedImage
          alt="GitHub Overview Stats"
          sources={{
            light: githubStatsUrl('overview', false),
            dark: githubStatsUrl('overview', true),
          }}
        />
        <ThemedImage
          alt="GitHub Languages Stats"
          sources={{
            light: githubStatsUrl('languages', false),
            dark: githubStatsUrl('languages', true),
          }}
        />
      </div>
      <GitHubCalendar
        username="EaveLuo"
        blockSize={14}
        colorScheme={useColorMode().colorMode === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
}
