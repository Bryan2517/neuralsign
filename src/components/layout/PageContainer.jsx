/**
 * PageContainer Component
 * Consistent page wrapper with padding and spacing
 */

import { motion } from 'framer-motion';
import { cn } from '@/utils/helpers';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: 'easeOut',
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3,
        },
    },
};

const PageContainer = ({
    children,
    className = '',
    maxWidth = 'default', // 'sm', 'md', 'lg', 'xl', '2xl', 'full', 'default'
    padded = true,
    centered = false,
    animate = true,
    as: Component = 'main',
}) => {
    const maxWidthClasses = {
        sm: 'max-w-screen-sm',
        md: 'max-w-screen-md',
        lg: 'max-w-screen-lg',
        xl: 'max-w-screen-xl',
        '2xl': 'max-w-screen-2xl',
        full: 'max-w-full',
        default: 'max-w-7xl',
    };

    const Container = animate ? motion.div : 'div';
    const animationProps = animate
        ? {
            variants: pageVariants,
            initial: 'initial',
            animate: 'animate',
            exit: 'exit',
        }
        : {};

    return (
        <Component
            className={cn(
                'min-h-screen',
                'pt-20 md:pt-24', // Account for fixed navbar
                'pb-16 md:pb-20'
            )}
        >
            <Container
                {...animationProps}
                className={cn(
                    'mx-auto w-full',
                    maxWidthClasses[maxWidth],
                    padded && 'px-4 sm:px-6 lg:px-8',
                    centered && 'flex flex-col items-center justify-center',
                    className
                )}
            >
                {children}
            </Container>
        </Component>
    );
};

export default PageContainer;
