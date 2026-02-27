import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../hooks/useTheme';
import { DateRange } from '../types';
import DateFilter from '../components/DateFilter';
import { useLocation } from 'react-router-dom';
import ViewSelector from '../components/ViewSelector';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from 'recharts';

// 模拟的新势力企业销量数据
const newEnergyCompaniesData = [
  { name: '特斯拉', sales: 98000, marketShare: 28.5, growthRate: 15.2, color: '#E82127' },
  { name: '比亚迪', sales: 85000, marketShare: 24.8, growthRate: 25.3, color: '#0066B3' },
  { name: '理想', sales: 45000, marketShare: 13.1, growthRate: 45.8, color: '#2C3E50' },
  { name: '蔚来', sales: 32000, marketShare: 9.3, growthRate: 35.6, color: '#3b82f6' },
  { name: '小鹏', sales: 28000, marketShare: 8.1, growthRate: 20.4, color: '#10b981' },
  { name: '极氪', sales: 20000, marketShare: 5.8, growthRate: 65.2, color: '#8b5cf6' },
  { name: '高合', sales: 10000, marketShare: 2.9, growthRate: 55.3, color: '#f59e0b' },
  { name: '深蓝', sales: 7500, marketShare: 2.2, growthRate: 85.4, color: '#ec4899' },
  { name: '零跑', sales: 6000, marketShare: 1.7, growthRate: 30.1, color: '#ef4444' },
  { name: '哪吒', sales: 5500, marketShare: 1.6, growthRate: 25.8, color: '#14b8a6' },
];

// 模拟的月度销量趋势数据
const monthlySalesData = [
  { month: '2025.01', 特斯拉: 16000, 比亚迪: 14000, 理想: 7500, 蔚来: 5000, 小鹏: 4500, 极氪: 3000, 高合: 1500, 深蓝: 1000, 零跑: 800, 哪吒: 700 },
  { month: '2025.02', 特斯拉: 17000, 比亚迪: 15000, 理想: 8000, 蔚来: 5500, 小鹏: 4800, 极氪: 3200, 高合: 1600, 深蓝: 1200, 零跑: 850, 哪吒: 750 },
  { month: '2025.03', 特斯拉: 18000, 比亚迪: 16000, 理想: 8500, 蔚来: 5800, 小鹏: 5000, 极氪: 3500, 高合: 1700, 深蓝: 1500, 零跑: 900, 哪吒: 800 },
  { month: '2025.04', 特斯拉: 19000, 比亚迪: 17000, 理想: 9000, 蔚来: 6200, 小鹏: 5200, 极氪: 3800, 高合: 1800, 深蓝: 1900, 零跑: 1100, 哪吒: 900 },
  { month: '2025.05', 特斯拉: 20000, 比亚迪: 18000, 理想: 12000, 蔚来: 9500, 小鹏: 8500, 极氪: 6500, 高合: 3400, 深蓝: 1900, 零跑: 2350, 哪吒: 2350 },
];

// 模拟的新势力企业特性雷达图数据
const radarData = [
  {
    subject: '销量规模',
    特斯拉: 9.5,
    比亚迪: 9.0,
    理想: 7.0,
    蔚来: 6.0,
    小鹏: 5.5,
    fullMark: 10,
  },
  {
    subject: '增长率',
    特斯拉: 5.5,
    比亚迪: 8.0,
    理想: 8.5,
    蔚来: 8.0,
    小鹏: 6.5,
    fullMark: 10,
  },
  {
    subject: '技术创新',
    特斯拉: 9.0,
    比亚迪: 8.5,
    理想: 7.5,
    蔚来: 8.0,
    小鹏: 7.5,
    fullMark: 10,
  },
  {
    subject: '产品线丰富度',
    特斯拉: 6.0,
    比亚迪: 9.5,
    理想: 5.0,
    蔚来: 6.0,
    小鹏: 7.0,
    fullMark: 10,
  },
  {
    subject: '市场份额',
    特斯拉: 9.0,
    比亚迪: 8.5,
    理想: 6.5,
    蔚来: 5.5,
    小鹏: 5.0,
    fullMark: 10,
  },
  {
    subject: '品牌影响力',
    特斯拉: 9.5,
    比亚迪: 8.0,
    理想: 7.0,
    蔚来: 7.5,
    小鹏: 6.5,
    fullMark: 10,
  },
];

// 模拟的新势力企业价格区间分布数据
const priceRangeData = [{ name: '10万以下', 销量: 0, 占比: 0 },
  { name: '10~15万', 销量: 5000, 占比: 1.5 },
  { name: '15~25万', 销量: 80000, 占比: 23.2 },
  { name: '25~35万', 销量: 150000, 占比: 43.6 },
  { name: '35~50万', 销量: 80000, 占比: 23.2 },
  { name: '50万以上', 销量: 25000, 占比: 7.2 },
];

export default function NewEnergyCompanies() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  
  // 从路由状态中获取日期范围，如果没有则使用默认值
  const initialDateRange = location.state?.dateRange || {
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  };
  
  const [dateRange, setDateRange] = useState<DateRange>(initialDateRange);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>(['特斯拉', '比亚迪', '理想', '蔚来', '小鹏']);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [sortedData, setSortedData] = useState(newEnergyCompaniesData);

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
    // 在实际应用中，这里会根据新的日期范围获取数据
    console.log('Date range changed:', newDateRange);
  };

  // 处理企业选择变化
  const handleCompanyToggle = (company: string) => {
    setSelectedCompanies(prev => {
      if (prev.includes(company)) {
        // 确保至少保留一个选中项
        if (prev.length > 1) {
          return prev.filter(c => c !== company);
        }
        return prev;
      } else {
        return [...prev, company];
      }
    });
  };

  // 处理排序
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    
    const sorted = [...newEnergyCompaniesData].sort((a: any, b: any) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setSortedData(sorted);
    setSortConfig({ key, direction });
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
          <p className="font-medium text-gray-900 dark:text-white">{data.name || data.month}</p>
          {payload.map((entry: any, index: number) => {
            const isPercentage = typeof entry.value === 'number' && entry.value < 100 && entry.name !== '销量';
            return (
              <p key={index} className="flex items-center mt-1">
                <span 
                  className="w-3 h-3 inline-block mr-2" 
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{entry.name}:</span>
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                  {isPercentage ? `${entry.value}%` : `${formatNumber(entry.value)} 辆`}
                </span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // 获取企业颜色
  const getCompanyColor = (name: string) => {
    const company = newEnergyCompaniesData.find(c => c.name === name);
    return company?.color || '#6b7280';
  };

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
        <ViewSelector currentView="new-energy-companies" dateRange={dateRange} />

        {/* 视图标题 */}
        <motion.div 
          className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <i className="fa-solid fa-leaf text-emerald-500 mr-2"></i>
            新势力企业情况
          </h2>
        </motion.div>

        {/* 新势力企业销量对比和月度趋势 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 新势力企业销量对比 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">新势力企业销量对比</h3>
              
              {/* 企业选择器 */}
              <div className="flex flex-wrap gap-2">
                {newEnergyCompaniesData.slice(0, 5).map(company => (
                  <button
                    key={company.name}
                    onClick={() => handleCompanyToggle(company.name)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedCompanies.includes(company.name) 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' 
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {company.name}
                  </button>
                ))}
                {newEnergyCompaniesData.length > 5 && (
                  <button 
                    className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                  >
                    +{newEnergyCompaniesData.length - 5}
                  </button>
                )}
              </div>
            </div>
            
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={sortedData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#6b7280' }} 
                    axisLine={{ stroke: '#e5e7eb' }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
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
                  {sortedData.map(company => {
                    if (!selectedCompanies.includes(company.name)) return null;
                    return (
                      <Bar 
                        key={company.name} 
                        dataKey="sales" 
                        name="销量" 
                        fill={company.color}
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      />
                    );
                  })}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* 月度销量趋势 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">月度销量趋势</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlySalesData}
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
                  {selectedCompanies.map(company => (
                    <Line 
                      key={company} 
                      type="monotone" 
                      dataKey={company} 
                      stroke={getCompanyColor(company)}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      animationDuration={1500}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* 新势力企业特性雷达图和价格区间分布 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 新势力企业特性雷达图 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">企业综合能力雷达图</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart outerRadius={150} data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#6b7280' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: 10 }}
                    formatter={(value) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>}
                  />
                  {selectedCompanies.map(company => (
                    <Radar 
                      key={company} 
                      name={company} 
                      dataKey={company} 
                      stroke={getCompanyColor(company)} 
                      fill={getCompanyColor(company)} 
                      fillOpacity={0.3}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* 价格区间分布 */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">价格区间分布</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priceRangeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="销量"
                    animationDuration={1500}
                    animationBegin={200}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {priceRangeData.map((entry, index) => {
                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={colors[index % colors.length]} 
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      );
                    })}
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
        </div>

        {/* 新势力企业详细数据表格 */}
        <motion.div 
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">新势力企业详细数据</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => handleSort('name')}>
                    <div className="flex items-center">
                      <span>企业名称</span>
                      {sortConfig?.key === 'name' && (
                        <i className={`fa-solid ml-1 ${sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => handleSort('sales')}>
                    <div className="flex items-center">
                      <span>销量</span>
                      {sortConfig?.key === 'sales' && (
                        <i className={`fa-solid ml-1 ${sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => handleSort('marketShare')}>
                    <div className="flex items-center">
                      <span>市场份额</span>
                      {sortConfig?.key === 'marketShare' && (
                        <i className={`fa-solid ml-1 ${sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={() => handleSort('growthRate')}>
                    <div className="flex items-center">
                      <span>增长率</span>
                      {sortConfig?.key === 'growthRate' && (
                        <i className={`fa-solid ml-1 ${sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    主要产品
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedData.map((company) => {
                  // 为每个企业设置主要产品
                  let mainProducts = '';
                  switch(company.name) {
                    case '特斯拉': mainProducts = 'Model 3, Model Y'; break;
                    case '比亚迪': mainProducts = '汉EV, 唐DM-i, 海豹, 海豚'; break;
                    case '理想': mainProducts = 'L8, L9'; break;
                    case '蔚来': mainProducts = 'ES6, ES8, EC6'; break;
                    case '小鹏': mainProducts = 'P7, G9, P5'; break;
                    case '极氪': mainProducts = '001, 007'; break;
                    case '高合': mainProducts = 'HiPhi X, HiPhi Z'; break;
                    case '深蓝': mainProducts = 'L07, S7'; break;
                    case '零跑': mainProducts = 'C11, C01'; break;
                    case '哪吒': mainProducts = 'U, S'; break;
                    default: mainProducts = '多款产品';
                  }
                  
                  return (
                    <tr key={company.name} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: company.color }}>
                            <span className="text-white font-medium">{company.name[0]}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{company.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{formatNumber(company.sales)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${company.marketShare * 3}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-900 dark:text-white">{company.marketShare}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          company.growthRate > 30 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                          company.growthRate > 15 ? 'bg-green-50 text-green-700 dark:bg-green-800/20 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {company.growthRate}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{mainProducts}</div>
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