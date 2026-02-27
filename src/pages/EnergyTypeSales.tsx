import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { DateRange } from '../types';
import DateFilter from '../components/DateFilter';
import { useLocation } from 'react-router-dom';
import ViewSelector from '../components/ViewSelector';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// 模拟的能源类型销量数据
const energyTypeData = [
  { name: '纯电', value: 185000, color: '#3b82f6' },
  { name: '插混', value: 124000, color: '#10b981' },
  { name: '燃油', value: 98000, color: '#ef4444' },
  { name: '增程', value: 45000, color: '#8b5cf6' },
];

// 模拟的各厂商能源类型分布数据
const manufacturerEnergyTypeData = [
  { manufacturer: '特斯拉', 纯电: 98000, 插混: 0, 燃油: 0, 增程: 0, color: '#E82127' },
  { manufacturer: '比亚迪', 纯电: 62000, 插混: 85000, 燃油: 0, 增程: 0, color: '#0066B3' },
  { manufacturer: '大众', 纯电: 25000, 插混: 20000, 燃油: 15000, 增程: 0, color: '#000000' },
  { manufacturer: '丰田', 纯电: 0, 插混: 19000, 燃油: 65000, 增程: 0, color: '#EB0A1E' },
  { manufacturer: '本田', 纯电: 0, 插混: 0, 燃油: 18000, 增程: 0, color: '#FF3333' },
  { manufacturer: '理想', 纯电: 0, 插混: 0, 燃油: 0, 增程: 45000, color: '#2C3E50' },
];

// 模拟的月度能源类型变化数据
const monthlyEnergyTypeData = [
  { month: '2025.01', 纯电: 32000, 插混: 24000, 燃油: 19000, 增程: 8000 },
  { month: '2025.02', 纯电: 34000, 插混: 25000, 燃油: 18000, 增程: 8500 },
  { month: '2025.03', 纯电: 36000, 插混: 26000, 燃油: 17000, 增程: 9000 },
  { month: '2025.04', 纯电: 38000, 插混: 27000, 燃油: 16000, 增程: 9500 },
  { month: '2025.05', 纯电: 40000, 插混: 28000, 燃油: 15000, 增程: 10000 },
];

export default function EnergyTypeSales() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  // 从路由状态中获取日期范围，如果没有则使用默认值
  const initialDateRange = location.state?.dateRange || {
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  };
  
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);

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

  // 格式化数字，添加千位分隔符
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{data.name || data.manufacturer}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="flex items-center mt-1">
              <span 
                className="w-3 h-3 inline-block mr-2" 
                style={{ backgroundColor: entry.color }}
              ></span>
              <span className="text-sm text-gray-600 dark:text-gray-300">{entry.name}:</span>
              <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                {formatNumber(entry.value)} 辆
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 计算总销量
  const totalSales = energyTypeData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 ${theme}`}>
      <motion.div 
        className="container mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
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
        <ViewSelector currentView="energy-type" dateRange={dateRange} />

        {/* 视图标题 */}
        <motion.div 
          className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <i className="fa-solid fa-bolt text-purple-500 mr-2"></i>
            动力类型区分销量
          </h2>
        </motion.div>

        {/* 能源类型销量占比 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">能源类型销量占比</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={energyTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={1500}
                    animationBegin={200}
                  >
                    {energyTypeData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        stroke="#fff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* 各厂商能源类型分布 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">各厂商能源类型分布</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={manufacturerEnergyTypeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis 
                    type="number"
                    tick={{ fill: '#6b7280' }} 
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <YAxis 
                    dataKey="manufacturer" 
                    type="category"
                    tick={{ fill: '#6b7280' }} 
                    axisLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: 10 }}
                    formatter={(value) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>}
                  />
                  <Bar dataKey="纯电" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="插混" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="燃油" stackId="a" fill="#ef4444" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="增程" stackId="a" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* 月度能源类型销量趋势 */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">月度能源类型销量趋势</h3>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyEnergyTypeData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fill: '#6b7280' }} 
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280' }} 
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 10 }}
                  formatter={(value) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>}
                />
                <Bar dataKey="纯电" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="插混" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="燃油" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="增程" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 能源类型销量明细表格 */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">能源类型销量明细</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    能源类型
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    销量
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    占比
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    主要厂商
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {energyTypeData.map((energyType) => {
                  const percentage = ((energyType.value / totalSales) * 100).toFixed(1);
                  let mainManufacturer = '';
                  
                  // 查找该能源类型的主要厂商
                  if (energyType.name === '纯电') mainManufacturer = '特斯拉、比亚迪';
                  else if (energyType.name === '插混') mainManufacturer = '比亚迪、大众';
                  else if (energyType.name === '燃油') mainManufacturer = '丰田、本田';
                  else if (energyType.name === '增程') mainManufacturer = '理想';
                  
                  return (
                    <tr key={energyType.name} className="bg-white dark:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: energyType.color }}>
                            <i className={`fa-solid text-white ${
                              energyType.name === '纯电' ? 'fa-bolt' :
                              energyType.name === '插混' ? 'fa-plug' :
                              energyType.name === '燃油' ? 'fa-fire' :
                              'fa-battery-full'
                            }`}></i>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{energyType.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(energyType.value)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="h-2.5 rounded-full" 
                              style={{ width: `${percentage}%`, backgroundColor: energyType.color }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-900 dark:text-white">{percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{mainManufacturer}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* 页脚 */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2026 车企销量数据分析平台 | 数据更新时间: {new Date().toLocaleDateString()}
          </p>
        </div>
      </motion.div>
    </div>
  );
}