'use client';

import { useEffect, useState, useCallback } from 'react';

interface MobilePerformanceOptions {
  enableReducedMotion?: boolean;
  enableLazyLoading?: boolean;
  enableImageOptimization?: boolean;
  enableTouchOptimization?: boolean;
}

export function useMobilePerformance(options: MobilePerformanceOptions = {}) {
  const {
    enableReducedMotion = true,
    enableLazyLoading = true,
    enableImageOptimization = true,
    enableTouchOptimization = true
  } = options;

  const [isMobile, setIsMobile] = useState(false);
  const [isSmallMobile, setIsSmallMobile] = useState(false);
  const [isSlowNetwork, setIsSlowNetwork] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [deviceMemory, setDeviceMemory] = useState<number | null>(null);
  const [hardwareConcurrency, setHardwareConcurrency] = useState<number | null>(null);

  // Check device capabilities
  useEffect(() => {
    const checkDeviceCapabilities = () => {
      // Check screen size
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsSmallMobile(width < 480);

      // Check network connection
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          setIsSlowNetwork(
            connection.effectiveType === 'slow-2g' || 
            connection.effectiveType === '2g' ||
            connection.saveData === true
          );
        }
      }

      // Check reduced motion preference
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      // Check device memory and CPU cores
      if ('deviceMemory' in navigator) {
        setDeviceMemory((navigator as any).deviceMemory);
      }
      if ('hardwareConcurrency' in navigator) {
        setHardwareConcurrency(navigator.hardwareConcurrency);
      }
    };

    checkDeviceCapabilities();
    window.addEventListener('resize', checkDeviceCapabilities);

    // Listen for network changes
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        connection.addEventListener('change', checkDeviceCapabilities);
      }
    }

    // Listen for reduced motion changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', (e) => setPrefersReducedMotion(e.matches));

    return () => {
      window.removeEventListener('resize', checkDeviceCapabilities);
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          connection.removeEventListener('change', checkDeviceCapabilities);
        }
      }
      mediaQuery.removeEventListener('change', (e) => setPrefersReducedMotion(e.matches));
    };
  }, []);

  // Performance-optimized image loader
  const loadOptimizedImage = useCallback((src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}) => {
    if (!enableImageOptimization) {
      return src;
    }

    const { width = 800, height = 600, quality = 80, format = 'webp' } = options;
    
    // For slow networks, reduce quality further
    const finalQuality = isSlowNetwork ? Math.max(quality - 20, 50) : quality;
    
    // If it's already a data URL or external URL, return as is
    if (src.startsWith('data:') || src.startsWith('http')) {
      return src;
    }
    
    // For local images, we could add optimization logic here
    // This is a placeholder for actual image optimization
    return src;
  }, [enableImageOptimization, isSlowNetwork]);

  // Lazy loading hook
  const useLazyLoading = useCallback((callback: () => void, options: {
    rootMargin?: string;
    threshold?: number;
  } = {}) => {
    if (!enableLazyLoading) {
      callback();
      return () => {};
    }

    const { rootMargin = '50px', threshold = 0.1 } = options;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            callback();
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin, threshold }
    );

    return (element: Element | null) => {
      if (element) {
        observer.observe(element);
      }
      return () => {
        if (element) {
          observer.unobserve(element);
        }
      };
    };
  }, [enableLazyLoading]);

  // Touch-optimized event handler
  const useTouchOptimized = useCallback((
    onClick: () => void,
    options: {
      delay?: number;
      preventDefault?: boolean;
    } = {}
  ) => {
    if (!enableTouchOptimization || !isMobile) {
      return { onClick };
    }

    const { delay = 300, preventDefault = true } = options;
    let timeoutId: NodeJS.Timeout | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      if (preventDefault) {
        e.preventDefault();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        onClick();
      }, delay);
    };

    const handleTouchEnd = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    return {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
      onClick: (e: React.MouseEvent) => {
        if (preventDefault) {
          e.preventDefault();
        }
        onClick();
      }
    };
  }, [enableTouchOptimization, isMobile]);

  // Performance monitoring
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const start = performance.now();
      fn();
      const end = performance.now();
      const duration = end - start;
      
      // Log slow operations
      if (duration > 100) {
        console.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return duration;
    }
    
    fn();
    return 0;
  }, []);

  // Debounced function for better performance
  const debounce = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  // Throttled function for better performance
  const throttle = useCallback(<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }, []);

  return {
    isMobile,
    isSmallMobile,
    isSlowNetwork,
    prefersReducedMotion,
    deviceMemory,
    hardwareConcurrency,
    shouldReduceMotion: enableReducedMotion && prefersReducedMotion,
    loadOptimizedImage,
    useLazyLoading,
    useTouchOptimized,
    measurePerformance,
    debounce,
    throttle,
    // Performance recommendations
    recommendations: {
      reduceAnimations: shouldReduceMotion || isSlowNetwork,
      useLazyLoading: enableLazyLoading && (isSlowNetwork || deviceMemory !== null && deviceMemory < 4),
      optimizeImages: enableImageOptimization && isSlowNetwork,
      simplifyInteractions: isSmallMobile || isSlowNetwork
    }
  };
}