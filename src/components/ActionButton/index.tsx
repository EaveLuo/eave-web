import React, {
  type ButtonHTMLAttributes,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './styles.module.css';

type IconPosition = 'start' | 'end';

interface BaseActionButtonProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  iconPosition?: IconPosition;
  stretch?: boolean;
  ariaLabel?: string;
}

interface ActionButtonLinkProps extends BaseActionButtonProps {
  to: string;
  onClick?: never;
  type?: never;
}

interface ActionButtonButtonProps extends BaseActionButtonProps {
  to?: never;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: ButtonHTMLAttributes<HTMLButtonElement>['type'];
}

export type ActionButtonProps = ActionButtonLinkProps | ActionButtonButtonProps;

export function ActionButton({
  children,
  className,
  icon,
  iconPosition = 'end',
  stretch = false,
  ariaLabel,
  ...props
}: ActionButtonProps): ReactNode {
  const content = (
    <>
      {iconPosition === 'start' && icon}
      <span>{children}</span>
      {iconPosition === 'end' && icon}
    </>
  );
  const buttonClassName = clsx(
    styles.button,
    stretch && styles.stretch,
    className,
  );

  if ('to' in props && props.to) {
    return (
      <Link to={props.to} className={buttonClassName} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button
      type={props.type ?? 'button'}
      className={buttonClassName}
      aria-label={ariaLabel}
      onClick={props.onClick}
    >
      {content}
    </button>
  );
}
