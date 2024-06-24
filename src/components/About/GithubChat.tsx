import GitHubCalendar from 'react-github-calendar';
import { useColorMode } from '@docusaurus/theme-common';

interface GithubProps {
  className?: string;
}

export default function Github({ className }: GithubProps) {
  const { isDarkTheme } = useColorMode();

  const githubStatsUrl = (type: 'overview' | 'languages') =>
    `https://raw.githubusercontent.com/EaveLuo/github-stats/master/generated/${type}.svg#gh-${
      isDarkTheme ? 'dark' : 'light'
    }-mode-only`;

  return (
    <div className={className}>
      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-background">
        <div className="mb-4 flex w-full justify-between gap-4 px-4">
          <img src={githubStatsUrl('overview')} alt="GitHub Overview Stats" />
          <img src={githubStatsUrl('languages')} alt="GitHub Languages Stats" />
        </div>
        <GitHubCalendar
          username="EaveLuo"
          blockSize={14}
          colorScheme={isDarkTheme ? 'dark' : 'light'}
        />
      </div>
    </div>
  );
}
