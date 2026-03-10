import { memo } from 'react';
import Translate, { translate } from '@docusaurus/Translate';
import ShimmerButton from '@site/src/components/magicui/shimmer-button';
import ThemedImage from '@theme/ThemedImage';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useHistory } from '@docusaurus/router';

import styles from './styles.module.css';

// 纯 SSG 渲染的 Hero 组件
// 无客户端状态，无 useEffect，首屏立即显示
function Hero() {
  const history = useHistory();
  const heroText = translate({ id: 'homepage.hero.text' });

  return (
    <div className={styles.hero}>
      <div className={styles.intro}>
        {/* 问候语 - CSS 淡入动画 */}
        <div className={styles.hero_text}>
          <Translate id="homepage.hero.greet" />
          {/* CSS 鼠标光效 */}
          <span className={styles.name}>
            <Translate id="homepage.hero.name" />
          </span>
          <span className={styles.wave}>👋</span>
        </div>

        {/* CSS 打字机效果 - 使用 CSS Modules 确保样式正确 */}
        <div className={styles.typing_container}>
          <p className={styles.intro_text}>
            {heroText}
          </p>
        </div>

        {/* 按钮 */}
        <div className={styles.button_wrapper}>
          <ShimmerButton
            className="shadow-md"
            onClick={() => history.push('about')}
          >
            <span className={styles.button_text}>
              <Translate id="homepage.hero.button.text" />
            </span>
          </ShimmerButton>
        </div>
      </div>

      {/* 背景图 */}
      <div className={styles.background}>
        <ThemedImage
          className={styles.background_svg}
          alt="Homepage Hero"
          sources={{
            light: useBaseUrl('/img/Homepage/undraw_hero.svg'),
            dark: useBaseUrl('/img/Homepage/undraw_hero_dark.svg'),
          }}
        />
        <div className={styles.circle} />
      </div>
    </div>
  );
}

export default memo(Hero);
