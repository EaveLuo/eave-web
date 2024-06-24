import IconCloud from '@site/src/components/magicui/icon-cloud';

const SKILLS = [
  'docusaurus',
  'typescript',
  'javascript',
  'react',
  'vue',
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

export default function SkillCloud({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden bg-background p-4">
        <IconCloud iconSlugs={SKILLS} />
      </div>
    </div>
  );
}
