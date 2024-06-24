import SkillCloud from './SkillCloud';
import GithubChat from './GithubChat';

export default function About() {
  return (
    <section>
      <div className="mt-4 grid grid-cols-1 justify-center gap-4 px-0 md:grid-cols-6 md:grid-rows-2 md:px-4">
        <SkillCloud className="md:col-span-2 md:row-span-2" />
        <GithubChat className="h-full md:col-span-4 md:row-span-3" />
      </div>
    </section>
  );
}
