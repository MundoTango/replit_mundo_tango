import React, { useRef, useState, useEffect, useCallback } from 'react';
import { performanceUtils } from '@/hooks/usePerformanceOptimization';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  containerHeight?: number;
  overscan?: number;
  className?: string;
}

// Life CEO Performance: Virtual scrolling for optimal rendering of large lists
export function VirtualScrollList<T>({
  items,
  itemHeight,
  renderItem,
  containerHeight = 600,
  overscan = 3,
  className = ''
}: VirtualScrollListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  // Calculate visible items
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  // Throttled scroll handler for better performance
  const handleScroll = useCallback(
    performanceUtils.throttle(() => {
      if (containerRef.current) {
        setScrollTop(containerRef.current.scrollTop);
      }
    }, 16), // 60fps
    []
  );
  
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);
  
  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((item, index) => (
            <div
              key={startIndex + index}
              style={{ height: itemHeight }}
              className="virtual-scroll-item"
            >
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Hook for virtual scrolling with dynamic item heights
export function useVirtualScroll<T>(
  items: T[],
  estimatedItemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);
  const itemHeights = useRef(new Map<number, number>());
  
  const getItemOffset = useCallback((index: number) => {
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += itemHeights.current.get(i) || estimatedItemHeight;
    }
    return offset;
  }, [estimatedItemHeight]);
  
  const getVisibleRange = useCallback(() => {
    let accumulatedHeight = 0;
    let startIndex = 0;
    let endIndex = items.length - 1;
    
    // Find start index
    for (let i = 0; i < items.length; i++) {
      const height = itemHeights.current.get(i) || estimatedItemHeight;
      if (accumulatedHeight + height > scrollTop) {
        startIndex = i;
        break;
      }
      accumulatedHeight += height;
    }
    
    // Find end index
    accumulatedHeight = getItemOffset(startIndex);
    for (let i = startIndex; i < items.length; i++) {
      if (accumulatedHeight > scrollTop + containerHeight) {
        endIndex = i;
        break;
      }
      accumulatedHeight += itemHeights.current.get(i) || estimatedItemHeight;
    }
    
    return { startIndex: Math.max(0, startIndex - 3), endIndex: Math.min(items.length - 1, endIndex + 3) };
  }, [items.length, scrollTop, containerHeight, estimatedItemHeight, getItemOffset]);
  
  const setItemHeight = useCallback((index: number, height: number) => {
    if (itemHeights.current.get(index) !== height) {
      itemHeights.current.set(index, height);
    }
  }, []);
  
  return {
    scrollTop,
    setScrollTop,
    getVisibleRange,
    setItemHeight,
    getItemOffset
  };
}