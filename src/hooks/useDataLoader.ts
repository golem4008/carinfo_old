import { useState, useEffect } from 'react';

// 一个简单的Hook，用于处理数据加载状态
export const useDataLoader = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // 检查数据是否已经加载完成
    const checkDataLoaded = () => {
      // 检查是否有事件监听器已经注册
      const hasListeners = 
        window.addEventListener.toString().indexOf('dataLoaded') > -1;
      
      if (hasListeners) {
        // 如果有事件监听器，等待数据加载完成
        const handleDataLoaded = () => {
          setIsLoading(false);
          window.removeEventListener('dataLoaded', handleDataLoaded);
        };
        
        window.addEventListener('dataLoaded', handleDataLoaded);
        
        // 超时处理，防止数据加载永远不完成
        setTimeout(() => {
          setIsLoading(false);
          window.removeEventListener('dataLoaded', handleDataLoaded);
        }, 3000);
        
        return () => {
          window.removeEventListener('dataLoaded', handleDataLoaded);
        };
      } else {
        // 如果没有事件监听器，假设数据已经加载完成
        setIsLoading(false);
      }
    };
    
    checkDataLoaded();
  }, []);
  
  return isLoading;
};