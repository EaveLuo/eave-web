import SkillCloud from './SkillCloud';
import GithubChat from './GithubChat';

export default function About() {
  return (
    <section>
      <div className="mt-4 flex flex-col items-center justify-center gap-4 px-0 xl:flex-row">
        <SkillCloud className="w-full sm:w-4/5 md:w-2/3 lg:w-1/2" />
        <GithubChat className="lg:w-3/4 xl:w-2/3" />
      </div>
    </section>
  );
}
