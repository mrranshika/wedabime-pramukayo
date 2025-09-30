'use client';

import { useEffect, useState } from 'react';
import { useMobilePerformance } from '@/hooks/use-mobile-performance';

interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
  simplified?: boolean;
  lazy?: boolean;
}

export default function MobileOptimized({ 
  children, 
  className = '', 
  simplified = false, 
  lazy = false 
}: MobileOptimizedProps) {
  const { 
    isMobile, 
    isSmallMobile, 
    recommendations,
    useLazyLoading: useLazyLoadingHook 
  } = useMobilePerformance();
  
  const [isVisible, setIsVisible] = useState(!lazy);

  // Set up lazy loading if enabled
  useEffect(() => {
    if (!lazy) return;
    
    const observerCallback = () => {
      setIsVisible(true);
    };

    // For demo purposes, we'll just set a timeout
    // In a real app, you'd use the Intersection Observer
    const timeout = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => {
      clearTimeout(timeout);
    };
  }, [lazy]);

  // Mobile-optimized classes
  const mobileClasses = [
    'touch-manipulation', // Better touch handling
    isMobile && 'select-none', // Prevent text selection on mobile
    isSmallMobile && 'text-sm', // Smaller text on very small screens
    simplified && 'simplified-ui', // Simplified UI class
    recommendations.reduceAnimations && 'reduce-motion', // Reduced animations
  ].filter(Boolean).join(' ');

  if (lazy && !isVisible) {
    return (
      <div className={`mobile-optimized-placeholder ${className} ${mobileClasses}`}>
        <div className="animate-pulse bg-gray-200 rounded-lg h-20"></div>
      </div>
    );
  }

  return (
    <div className={`mobile-optimized ${className} ${mobileClasses}`}>
      {children}
    </div>
  );
}

// Mobile-optimized image component
interface MobileOptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  onClick?: () => void;
}

export function MobileOptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  loading = 'lazy',
  onClick
}: MobileOptimizedImageProps) {
  const { loadOptimizedImage, isMobile, isSlowNetwork } = useMobilePerformance();

  const optimizedSrc = loadOptimizedImage(src, {
    width,
    height,
    quality: isSlowNetwork ? 60 : 80,
    format: 'webp'
  });

  const handleClick = (e: React.MouseEvent) => {
    if (isMobile) {
      // Add haptic feedback on mobile if available
      if ('vibrate' in navigator) {
        navigator.vibrate(10);
      }
    }
    onClick?.();
  };

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      className={`mobile-optimized-image ${className}`}
      width={width}
      height={height}
      loading={loading}
      onClick={handleClick}
      style={{
        maxWidth: '100%',
        height: 'auto',
        objectFit: 'cover'
      }}
    />
  );
}

// Mobile-optimized button component
interface MobileOptimizedButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export function MobileOptimizedButton({
  children,
  onClick,
  className = '',
  disabled = false,
  variant = 'primary',
  size = 'md'
}: MobileOptimizedButtonProps) {
  const { useTouchOptimized, isMobile } = useMobilePerformance();

  const touchHandlers = useTouchOptimized(() => {
    onClick?.();
  }, { delay: isMobile ? 200 : 0 });

  const baseClasses = [
    'mobile-optimized-button',
    'touch-manipulation',
    'transition-all',
    'duration-200',
    'font-medium',
    'rounded-lg',
    'focus:outline-none',
    'focus:ring-2',
    'focus:ring-offset-2',
    disabled && 'opacity-50',
    disabled && 'cursor-not-allowed'
  ].filter(Boolean).join(' ');

  const variantClasses = {
    primary: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500',
    outline: 'border-2 border-green-600 text-green-600 hover:bg-green-50 focus:ring-green-500'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-2 text-base min-h-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px]'
  };

  const buttonClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  ].join(' ');

  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      {...touchHandlers}
    >
      {children}
    </button>
  );
}

// Mobile-optimized text input component
interface MobileOptimizedInputProps {
  type?: 'text' | 'email' | 'tel' | 'number';
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

export function MobileOptimizedInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  disabled = false
}: MobileOptimizedInputProps) {
  const { isMobile } = useMobilePerformance();

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`
        mobile-optimized-input
        w-full
        px-4
        py-3
        border-2
        border-gray-300
        rounded-lg
        focus:outline-none
        focus:ring-2
        focus:ring-green-500
        focus:border-green-500
        transition-all
        duration-200
        ${isMobile ? 'text-lg' : 'text-base'}
        ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
        ${className}
      `}
      style={{
        fontSize: isMobile ? '16px' : '16px' // Prevent zoom on iOS
      }}
    />
  );
}