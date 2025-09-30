'use client';

import { Loader2, AlertCircle, RefreshCw, Leaf, TreePine, Sprout } from 'lucide-react';

interface MobileLoadingProps {
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function MobileLoading({ 
  isLoading = false, 
  error = null, 
  onRetry, 
  message = 'Loading...',
  size = 'md' 
}: MobileLoadingProps) {
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  };

  const iconSizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex items-center justify-center">
          <AlertCircle className="h-12 w-12 text-red-500" />
        </div>
        <h3 className={`font-semibold text-gray-900 mb-2 ${textSizeClasses[size]}`}>
          Oops! Something went wrong
        </h3>
        <p className={`text-gray-600 mb-4 ${textSizeClasses[size]}`}>
          {error}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors touch-manipulation"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6">
        <div className="relative">
          <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-green-100 to-emerald-100 flex items-center justify-center`}>
            <div className="flex items-center gap-1">
              <Leaf className={`${iconSizeClasses[size]} text-green-600 animate-pulse`} />
              <TreePine className={`${iconSizeClasses[size]} text-emerald-600 animate-pulse`} style={{ animationDelay: '0.2s' }} />
              <Sprout className={`${iconSizeClasses[size]} text-teal-600 animate-pulse`} style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
          <div className={`absolute inset-0 rounded-full border-4 border-green-200 border-t-green-600 animate-spin ${sizeClasses[size]}`}></div>
        </div>
        <p className={`mt-4 text-gray-600 font-medium ${textSizeClasses[size]}`}>
          {message}
        </p>
        <div className="mt-2 flex gap-1">
          <div className="h-1 w-1 bg-green-400 rounded-full animate-bounce"></div>
          <div className="h-1 w-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="h-1 w-1 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  return null;
}

// Mobile-optimized skeleton loader
interface MobileSkeletonProps {
  lines?: number;
  className?: string;
}

export function MobileSkeleton({ lines = 3, className = '' }: MobileSkeletonProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          {index === lines - 1 && (
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          )}
        </div>
      ))}
    </div>
  );
}

// Mobile-optimized card skeleton
interface MobileCardSkeletonProps {
  count?: number;
}

export function MobileCardSkeleton({ count = 1 }: MobileCardSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-5/6"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-4/5"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Mobile-optimized button loading state
interface MobileButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function MobileButtonLoading({ 
  isLoading, 
  children, 
  disabled = false, 
  className = '' 
}: MobileButtonLoadingProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`relative touch-manipulation ${className} ${
        disabled || isLoading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      )}
      <span className={isLoading ? 'invisible' : 'visible'}>
        {children}
      </span>
    </button>
  );
}