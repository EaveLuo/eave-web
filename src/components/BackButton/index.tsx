import React, { type ReactNode } from 'react';
import Translate, { translate } from '@docusaurus/Translate';
import { useHistory } from '@docusaurus/router';
import clsx from 'clsx';
import { ArrowLeft } from 'lucide-react';
import { ActionButton } from '@site/src/components/ActionButton';
import styles from './styles.module.css';

interface BackButtonProps {
  className?: string;
  fallbackTo?: string;
  label?: ReactNode;
}

export function BackButton({
  className,
  fallbackTo = '/',
  label,
}: BackButtonProps): ReactNode {
  const history = useHistory();

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      history.goBack();
      return;
    }

    history.push(fallbackTo);
  };

  return (
    <div className={clsx(styles.wrapper, className)}>
      <ActionButton
        ariaLabel={translate({
          id: 'theme.common.back',
          message: '返回',
        })}
        icon={<ArrowLeft size={16} aria-hidden="true" />}
        iconPosition="start"
        onClick={handleClick}
      >
        {label ?? (
          <Translate id="theme.common.back">
            返回
          </Translate>
        )}
      </ActionButton>
    </div>
  );
}
