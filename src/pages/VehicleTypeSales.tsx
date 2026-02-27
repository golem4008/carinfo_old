import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { DateRange } from '../types';
import DateFilter from '../components/DateFilter';
import { useLocation } from 'react-router-dom';
import ViewSelector from '../components/ViewSelector';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';

// 模拟的车辆类型销量数据
const vehicleTypeData = [
  { name: 'SUV', value: 210000, color: '#3b82f6' },
  { name: '轿车', value: 185000, color: '#10b981' },
  { name: '小型车', value: 32000, color: '#f59e0b' },
  { name: '豪华SUV', value: 20000, color: '#8b5cf6' },
];

// 模拟的各厂商车辆类型分布数据
const manufacturerVehicleTypeData = [
  { manufacturer: '特斯拉', SUV: 40000, 轿车: 45000, 小型车: 0, 豪华SUV: 0, color: '#E82127' },
  { manufacturer: '比亚迪', SUV: 35000, 轿车: 75000, 小型车: 20000, 豪华SUV: 10000, color: '#0066B3' },
  { manufacturer: '大众', SUV: 30000, 轿车: 25000, 小型车: 0, 豪华SUV: 0, color: '#000000' },
  { manufacturer: '丰田', SUV: 25000, 轿车: 20000, 小型车: 0, 豪华SUV: 0, color: '#EB0A1E' },
  { manufacturer: '本田', SUV: 30000, 轿车: 20000, 小型车: 0, 豪华SUV: 0, color: '#FF3333' },
  { manufacturer: '吉利', SUV: 25000, 轿车: 0, 小型车: 12000, 豪华SUV: 10000, color: '#2C3E50' },
  { manufacturer: '理想', SUV: 25000, 轿车: 0, 小型车: 0, 豪华SUV: 0, color: '#6b7280' },
];

// 模拟的月度车辆类型变化数据
const monthlyVehicleTypeData = [
  { month: '2025.01', SUV: 38000, 轿车: 34000, 小型车: 5000, 豪华SUV: 3000 },
  { month: '2025.02', SUV: 39000, 轿车: 35000, 小型车: 5500, 豪华SUV: 3500 },
  { month: '2025.03', SUV: 40000, 轿车: 36000, 小型车: 6000, 豪华SUV: 4000 },
  { month: '2025.04', SUV: 41000, 轿车: 37000, 小型车: 7000, 豪华SUV: 4500 },
  { month: '2025.05', SUV: 42000, 轿车: 38000, 小型车: 8500, 豪华SUV: 5000 },
];

// 模拟的各厂商车辆类型占比趋势数据
const vehicleTypeTrendData = [
  { month: '2025.01', SUV: 45, 轿车: 40, 小型车: 7, 豪华SUV: 8 },
  { month: '2025.02', SUV: 45, 轿车: 40, 小型车: 7, 豪华SUV: 8 },
  { month: '2025.03', SUV: 44, 轿车: 40, 小型车: 8, 豪华SUV: 8 },
  { month: '2025.04', SUV: 44, 轿车: 40, 小型车: 8, 豪华SUV: 8 },
  { month: '2025.05', SUV: 43, 轿车: 39, 小型车: 9, 豪华SUV: 9 },
];

export default function VehicleTypeSales() {
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
                {typeof entry.value === 'number' && entry.value < 100 
                  ? `${entry.value}%` 
                  : `${formatNumber(entry.value)} 辆`
                }
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 计算总销量
  const totalSales = vehicleTypeData.reduce((sum, item) => sum + item.value, 0);

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
        <ViewSelector currentView="vehicle-type" dateRange={dateRange} />

        {/* 视图标题 */}
        <motion.div 
          className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <i className="fa-solid fa-car-side text-red-500 mr-2"></i>
            车辆类型区分销量
          </h2>
        </motion.div>

        {/* 车辆类型销量占比和月度趋势 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">车辆类型销量占比</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vehicleTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                    animationDuration={1500}
                    animationBegin={200}
                  >
                    {vehicleTypeData.map((entry, index) => (
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

          {/* 月度车辆类型销量趋势 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">月度车辆类型销量趋势</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyVehicleTypeData}
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
                  <Line type="monotone" dataKey="SUV" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="轿车" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="小型车" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="豪华SUV" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* 各厂商车辆类型分布和车辆类型占比趋势 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 各厂商车辆类型分布 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">各厂商车辆类型分布</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={manufacturerVehicleTypeData}
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
                  <Bar dataKey="SUV" stackId="a" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="轿车" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="小型车" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="豪华SUV" stackId="a" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* 车辆类型占比趋势 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">车辆类型占比趋势</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={vehicleTypeTrendData}
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
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: 10 }}
                    formatter={(value) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>}
                  />
                  <Line type="monotone" dataKey="SUV" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="轿车" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="小型车" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="豪华SUV" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* 车辆类型销量明细表格 */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">车辆类型销量明细</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    车辆类型
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
                {vehicleTypeData.map((vehicleType) => {
                  const percentage = ((vehicleType.value / totalSales) * 100).toFixed(1);
                  let mainManufacturer = '';
                  
                  // 查找该车辆类型的主要厂商
                  if (vehicleType.name === 'SUV') mainManufacturer = '特斯拉、比亚迪、大众、本田、理想';
                  else if (vehicleType.name === '轿车') mainManufacturer = '特斯拉、比亚迪、大众';
                  else if (vehicleType.name === '小型车') mainManufacturer = '比亚迪、吉利';
                  else if (vehicleType.name === '豪华SUV') mainManufacturer = '比亚迪、吉利';
                  
                  return (
                    <tr key={vehicleType.name} className="bg-white dark:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: vehicleType.color }}>
                            <i className={`fa-solid text-white ${
                              vehicleType.name.includes('SUV') ? 'fa-truck' :
                              vehicleType.name === '轿车' ? 'fa-car' :
                              'fa-car-side'
                            }`}></i>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{vehicleType.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(vehicleType.value)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="h-2.5 rounded-full" 
                              style={{ width: `${percentage}%`, backgroundColor: vehicleType.color }}
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