import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import clsx from 'clsx';
import Translate, { translate } from '@docusaurus/Translate';
import { blogPostContainerID } from '@docusaurus/utils-common';
import { useScrollController } from '@docusaurus/theme-common/internal';
import TOCItems from '@theme/TOCItems';
import type { Props } from '@theme/TOC';
import { ChevronDown, ListTree } from 'lucide-react';

import styles from './styles.module.css';

const LINK_CLASS_NAME = 'table-of-contents__link toc-highlight';
const LINK_ACTIVE_CLASS_NAME = 'table-of-contents__link--active';

function TableOfContentsItems(props: Props): ReactNode {
  return (
    <TOCItems
      {...props}
      linkClassName={LINK_CLASS_NAME}
      linkActiveClassName={LINK_ACTIVE_CLASS_NAME}
    />
  );
}

export default function TOC({ className, ...props }: Props): ReactNode {
  const scrollController = useScrollController();
  const rootRef = useRef<HTMLDivElement>(null);
  const mobileDetailsRef = useRef<HTMLDetailsElement>(null);
  const releaseTocNavigationLockRef = useRef<(() => void) | null>(null);
  const hasCelebratedRef = useRef(false);
  const progressLabelRef = useRef<HTMLSpanElement>(null);
  const mobileProgressLabelRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const mobileProgressBarRef = useRef<HTMLDivElement>(null);
  const readingProgressLabel = translate({
    id: 'article.toc.progress',
    message: 'Reading progress',
  });
  const completedLabel = translate({
    id: 'article.toc.completed',
    message: 'All read~',
  });

  useEffect(() => {
    let frame = 0;
    let cancelled = false;
    const article = document
      .getElementById(blogPostContainerID)
      ?.closest<HTMLElement>('article');

    const celebrateReadingCompletion = async () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const target = [
        mobileProgressLabelRef.current,
        progressLabelRef.current,
      ].find((element) => element && element.getClientRects().length > 0);
      const rect = target?.getBoundingClientRect();
      const origin = {
        x: rect ? (rect.left + rect.width / 2) / window.innerWidth : 0.5,
        y: rect ? rect.bottom / window.innerHeight : 0.12,
      };
      const { default: confetti } = await import('canvas-confetti');

      if (cancelled) {
        return;
      }

      const burst = {
        particleCount: 34,
        spread: 48,
        startVelocity: 24,
        gravity: 0.74,
        scalar: 0.78,
        ticks: 160,
        origin,
        colors: ['#7c878c', '#aab2b6', '#d7dbdd', '#6e9e93', '#f2f3f3'],
        disableForReducedMotion: true,
        zIndex: 2147483647,
      };

      confetti({ ...burst, angle: 235 });
      confetti({ ...burst, angle: 305 });
    };

    const updateProgress = () => {
      frame = 0;
      const readingEnd = article
        ? article.getBoundingClientRect().bottom +
          window.scrollY -
          window.innerHeight
        : document.documentElement.scrollHeight - window.innerHeight;
      const progress =
        readingEnd <= 0
          ? 100
          : Math.min(
              100,
              Math.max(0, Math.round((window.scrollY / readingEnd) * 100)),
            );
      const isComplete = progress >= 100;
      const progressText = isComplete ? completedLabel : `${progress}%`;

      rootRef.current?.style.setProperty('--reading-progress', `${progress}%`);
      if (rootRef.current) {
        rootRef.current.dataset.readingComplete = String(isComplete);
      }
      for (const label of [
        progressLabelRef.current,
        mobileProgressLabelRef.current,
      ]) {
        if (label) {
          label.textContent = progressText;
        }
      }
      for (const progressBar of [
        progressBarRef.current,
        mobileProgressBarRef.current,
      ]) {
        progressBar?.setAttribute('aria-valuenow', String(progress));
        progressBar?.setAttribute('aria-valuetext', progressText);
      }

      if (isComplete && !hasCelebratedRef.current) {
        hasCelebratedRef.current = true;
        void celebrateReadingCompletion();
      }
    };

    const scheduleProgressUpdate = () => {
      if (frame === 0) {
        frame = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    const articleResizeObserver = article
      ? new ResizeObserver(scheduleProgressUpdate)
      : undefined;
    if (article && articleResizeObserver) {
      articleResizeObserver.observe(article);
    }
    window.addEventListener('scroll', scheduleProgressUpdate, { passive: true });
    window.addEventListener('resize', scheduleProgressUpdate);

    return () => {
      cancelled = true;
      articleResizeObserver?.disconnect();
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }
      window.removeEventListener('scroll', scheduleProgressUpdate);
      window.removeEventListener('resize', scheduleProgressUpdate);
    };
  }, [completedLabel]);

  useEffect(() => {
    const closeOnOutsidePointer = (event: PointerEvent) => {
      const details = mobileDetailsRef.current;
      if (
        details?.open &&
        event.target instanceof Node &&
        !details.contains(event.target)
      ) {
        details.open = false;
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && mobileDetailsRef.current?.open) {
        mobileDetailsRef.current.open = false;
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePointer);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePointer);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const navbar = document.querySelector<HTMLElement>('.navbar');

    if (!root || !navbar) {
      return;
    }

    const syncNavigationState = () => {
      const navbarHidden = [...navbar.classList].some((className) =>
        className.startsWith('navbarHidden_'),
      );
      const sidebarOpen = navbar.classList.contains('navbar-sidebar--show');
      const mobileDetails = mobileDetailsRef.current;

      root.dataset.navbarHidden = String(navbarHidden);
      root.dataset.sidebarOpen = String(sidebarOpen);

      if (!mobileDetails) {
        return;
      }

      mobileDetails.inert = sidebarOpen;
      if (sidebarOpen) {
        mobileDetails.open = false;
        mobileDetails.setAttribute('aria-hidden', 'true');
      } else {
        mobileDetails.removeAttribute('aria-hidden');
      }
    };

    const navbarObserver = new MutationObserver(syncNavigationState);
    navbarObserver.observe(navbar, {
      attributes: true,
      attributeFilter: ['class'],
    });
    syncNavigationState();

    return () => navbarObserver.disconnect();
  }, []);

  useEffect(
    () => () => releaseTocNavigationLockRef.current?.(),
    [],
  );

  const closeMobileOutlineAfterNavigation = () => {
    if (mobileDetailsRef.current) {
      mobileDetailsRef.current.open = false;
    }
  };

  const handleTableOfContentsNavigation = (event: MouseEvent<HTMLElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      !(event.target instanceof Element) ||
      !event.target.closest('a[href^="#"]')
    ) {
      return;
    }

    releaseTocNavigationLockRef.current?.();
    scrollController.disableScrollEvents();

    let fallbackTimeout = 0;
    const releaseNavigationLock = () => {
      if (releaseTocNavigationLockRef.current !== releaseNavigationLock) {
        return;
      }

      window.removeEventListener('scrollend', releaseNavigationLock);
      window.clearTimeout(fallbackTimeout);
      releaseTocNavigationLockRef.current = null;
      scrollController.enableScrollEvents();
    };

    window.addEventListener('scrollend', releaseNavigationLock, { once: true });
    fallbackTimeout = window.setTimeout(releaseNavigationLock, 1000);
    releaseTocNavigationLockRef.current = releaseNavigationLock;

    closeMobileOutlineAfterNavigation();
  };

  return (
    <div
      ref={rootRef}
      className={clsx(styles.root, className)}
      data-navbar-hidden="false"
      data-sidebar-open="false"
    >
      <div className={clsx(styles.desktopPanel, 'liquid-glass-surface')}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>
            <ListTree size={16} aria-hidden="true" />
            <Translate id="article.toc.title">On this page</Translate>
          </span>
          <span ref={progressLabelRef} className={styles.progressLabel}>
            0%
          </span>
        </div>
        <div
          ref={progressBarRef}
          className={styles.progressTrack}
          role="progressbar"
          aria-label={readingProgressLabel}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={0}
        >
          <span className={styles.progressValue} />
        </div>
        <nav
          className={clsx(styles.tocScroll, 'thin-scrollbar')}
          onClick={handleTableOfContentsNavigation}
        >
          <TableOfContentsItems {...props} />
        </nav>
      </div>

      <details ref={mobileDetailsRef} className={styles.mobileDock}>
        <summary
          className={clsx(
            styles.mobileDockTrigger,
            'liquid-glass-surface',
          )}
        >
          <span className={styles.mobileDockTitle}>
            <ListTree size={16} aria-hidden="true" />
            <Translate id="article.toc.mobileTitle">TOC</Translate>
          </span>
          <span className={styles.mobileDockMeta}>
            <span
              ref={mobileProgressLabelRef}
              className={styles.mobileProgressLabel}
            >
              0%
            </span>
            <ChevronDown
              size={16}
              className={styles.mobileDockChevron}
              aria-hidden="true"
            />
          </span>
          <span
            ref={mobileProgressBarRef}
            className={styles.mobileDockProgressTrack}
            role="progressbar"
            aria-label={readingProgressLabel}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={0}
          >
            <span className={styles.mobileDockProgressValue} />
          </span>
        </summary>

        <div
          className={clsx(styles.mobilePopover, 'liquid-glass-surface')}
        >
          <div className={styles.mobilePopoverHeader}>
            <span>
              <ListTree size={16} aria-hidden="true" />
              <Translate id="article.toc.title">On this page</Translate>
            </span>
            <span className={styles.mobilePopoverHint}>
              <Translate id="article.toc.jumpHint">Jump to a section</Translate>
            </span>
          </div>
          <nav
            className={clsx(styles.mobilePopoverContent, 'thin-scrollbar')}
            onClick={handleTableOfContentsNavigation}
          >
            <TableOfContentsItems {...props} />
          </nav>
        </div>
      </details>
    </div>
  );
}
