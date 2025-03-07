import { twc } from "react-twc";
import type { ReactNode, ComponentProps, ElementType } from "react";
import { Link } from "@remix-run/react";

// Helper types for polymorphic components
type AsProp<C extends ElementType> = {
  as?: C;
};

type PropsToOmit<C extends ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProp<
  C extends ElementType,
  Props = {}
> = Props & AsProp<C> & Omit<ComponentProps<C>, PropsToOmit<C, Props>>;

export const PageHeader = twc.header`
  sticky top-0 z-10 h-16 
  bg-white dark:bg-gray-900 
  border-b border-gray-200 dark:border-gray-800 
  flex items-center justify-between px-4
`;

export const PageTitle = twc.h1`
  text-xl font-semibold 
  text-gray-900 dark:text-white 
  ml-12 lg:ml-0
`;

export const PageContent = twc.div`
  flex-1 overflow-auto p-4 md:p-6
`;

export const Container = twc.div`
  max-w-5xl mx-auto
`;

export const Card = twc.div`
  bg-white dark:bg-gray-800 
  rounded-xl p-6
`;

export const IconWrapper = twc.div`
  p-2 rounded-full
`;

// Make Text components polymorphic
type TextProps<C extends ElementType> = PolymorphicComponentProp<
  C,
  { className?: string }
>;

const TextBase = <C extends ElementType = "p">({
  as,
  className,
  ...props
}: TextProps<C>) => {
  const Component = as || "p";
  return <Component className={className} {...props} />;
};

export const Text = {
  Title: twc(TextBase)`text-lg font-semibold text-gray-900 dark:text-white`,
  Subtitle: twc(TextBase)`text-sm text-gray-500 dark:text-gray-400`,
  Label: twc(TextBase)`text-sm text-gray-500 dark:text-gray-400`,
};

export const Badge = twc.span`
  px-2 py-0.5 text-xs font-medium rounded-full
`;

export const RedBadge = twc(Badge)`
  bg-red-100 text-red-600 
  dark:bg-red-900/30 dark:text-red-400
`;

export const GreenBadge = twc(Badge)`
  bg-green-100 text-green-600 
  dark:bg-green-900/30 dark:text-green-400
`;

// Button component
type ButtonProps<C extends ElementType> = PolymorphicComponentProp<
  C,
  {
    variant?: 'primary' | 'secondary';
    active?: boolean;
    className?: string;
  }
>;

export const Button = <C extends ElementType = "button">({ 
  as,
  variant = 'secondary',
  active,
  className,
  ...props 
}: ButtonProps<C>) => {
  const Component = as || 'button';
  
  const baseStyles = `
    px-4 py-2 rounded-lg 
    transition-colors text-sm font-medium
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: `
      bg-white dark:bg-gray-800 
      border border-gray-200 dark:border-gray-700 
      text-gray-600 dark:text-gray-300 
      hover:bg-gray-50 dark:hover:bg-gray-700/50
    `,
  };

  const activeStyles = active
    ? '!bg-indigo-600 !text-white hover:!bg-indigo-700'
    : '';

  return (
    <Component
      className={`${baseStyles} ${variantStyles[variant]} ${activeStyles} ${className || ''}`}
      {...props}
    />
  );
};

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}

export const PageLayout = ({ title, children, actions }: PageLayoutProps) => {
  return (
    <>
      <PageHeader>
        <PageTitle>{title}</PageTitle>
        {actions}
      </PageHeader>
      <PageContent>
        <Container>{children}</Container>
      </PageContent>
    </>
  );
};