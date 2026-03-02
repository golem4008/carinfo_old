import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { DateRange } from '../types';
import SalesOverview from '../components/SalesOverview';
import MonthlySalesChart from '../components/MonthlySalesChart';
import MarketShareChart from '../components/MarketShareChart';
import SalesTrendChart from '../components/SalesTrendChart';
import SalesTable from '../components/SalesTable';
import DateFilter from '../components/DateFilter';
import ViewSelector from '../components/ViewSelector';
import { useLocation } from 'react-router-dom';
import { initializeData } from '../mocks/data';

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  // 从路由状态中获取日期范围，如果没有则使用默认值
  const initialDateRange = location.state?.dateRange || {
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  };
  
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
    // 在实际应用中，这里会根据新的日期范围获取数据
    console.log('Date range changed:', newDateRange);
  };

  // 页面容器动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // 头部动画配置
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // 添加事件监听器，监听数据加载完成事件
  useEffect(() => {
    const handleDataLoaded = () => {
      setIsLoading(false);
    };

    // 监听数据加载完成事件
    window.addEventListener('dataLoaded', handleDataLoaded);

    // 清理事件监听器
    return () => {
      window.removeEventListener('dataLoaded', handleDataLoaded);
    };
  }, []);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${theme}`}>
      <motion.div 
        className="container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate={isLoading ? "hidden" : "visible"}
      >
        {/* 页面头部 */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
          variants={headerVariants}
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              车企销量数据分析平台
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              全面分析各车企销量表现、市场份额和增长趋势
            </p>
          </div>
           <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <DateFilter 
             onDateRangeChange={handleDateRangeChange}
             defaultStartDate={dateRange.startDate}
             defaultEndDate={dateRange.endDate}
           />
          <button
            onClick={toggleTheme}
            className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow"
            aria-label="切换主题"
          >
            <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-gray-700 dark:text-gray-300`}></i>
          </button>
        </div>
        </motion.div>

        {/* 视图选择器 */}
        <ViewSelector currentView="overall-sales" dateRange={dateRange} />

        {/* 视图标题 */}
        <motion.div 
          className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <i className="fa-solid fa-chart-line text-blue-500 mr-2"></i>
            车企总体销量
          </h2>
        </motion.div>

        {/* 销量概览卡片 - 传递日期范围 */}
        <SalesOverview className="mb-8" dateRange={dateRange} />

         {/* 图表部分 - 传递日期范围 */}
         <MonthlySalesChart className="mb-8" dateRange={dateRange} />
         <MarketShareChart className="mb-8" dateRange={dateRange} />

         {/* 销量趋势分析 */}
         <SalesTrendChart className="mb-8" dateRange={dateRange} />

        {/* 厂商品牌销量表格 - 传递日期范围 */}
        <SalesTable className="mb-8" dateRange={dateRange} />

        {/* 页脚 */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2026 车企销量数据分析平台 | 数据更新时间: {new Date().toLocaleDateString()}
          </p>
        </div>
      </motion.div>
      
      {/* 数据加载中展示 */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900 z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl text-gray-900 dark:text-white">加载数据中...</p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">正在从CSV文件读取数据</p>
          </div>
        </div>
      )}
    </div>
  );
}