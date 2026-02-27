import React from 'react';
import { motion } from 'framer-motion';
import { DateRange } from '../types';
import MonthlyChart from './MonthlyChart';
import MonthlySalesTable from './MonthlySalesTable';

interface MonthlySalesChartProps {
  className?: string;
  dateRange?: DateRange;
}

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ className = '', dateRange }) => {
  // 容器动画配置
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {/* 柱状图 - 单独占据一行 */}
      <MonthlyChart dateRange={dateRange} className="mb-8" />
      
      {/* 表格 - 单独占据一行 */}
      <MonthlySalesTable dateRange={dateRange} />
    </motion.div>
  );
};

export default MonthlySalesChart;