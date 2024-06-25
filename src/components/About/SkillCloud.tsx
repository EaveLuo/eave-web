import IconCloud from '@site/src/components/magicui/icon-cloud';
import { cn } from '@site/src/lib/utils';

interface SkillProps {
  className?: string;
}

const SKILLS = [
  'docusaurus',
  'typescript',
  'javascript',
  'react',
  'vuedotjs',
  'android',
  'swift',
  'html5',
  'css3',
  'tailwindcss',
  'nodedotjs',
  'nextdotjs',
  'nuxtdotjs',
  'express',
  'electron',
  'spring',
  'springboot',
  'python',
  'django',
  'flask',
  'mysql',
  'microsoftsqlserver',
  'redis',
  'nginx',
  'vercel',
  'alibabacloud',
  'linux',
  'windows',
  'macos',
  'docker',
  'git',
  'github',
  'visualstudiocode',
  'jetbrains',
  'tailscale',
  'wireguard',
  'kubernetes',
];

export default function SkillCloud({ className }: SkillProps) {
  return (
    <div
      className={cn(
        'flex aspect-square w-full items-center justify-center p-4',
        className
      )}
    >
      <IconCloud iconSlugs={SKILLS} />
    </div>
  );
}
