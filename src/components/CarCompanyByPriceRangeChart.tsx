import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion } from 'framer-motion';
import { DateRange, CarCompany } from '../types';
import { getCurrentCarModelData, carCompanies } from '../mocks/data';

interface CarCompanyByPriceRangeChartProps {
  className?: string;
  dateRange?: DateRange;
}

// 定义价格区间
const PRICE_RANGES = [
  { name: '10万以下', min: 0, max: 10, color: '#3b82f6' },
  { name: '10~15万', min: 10, max: 15, color: '#10b981' },
  { name: '15~25万', min: 15, max: 25, color: '#f59e0b' },
  { name: '25~35万', min: 25, max: 35, color: '#8b5cf6' },
  { name: '35~50万', min: 35, max: 50, color: '#ec4899' },
  { name: '50万以上', min: 50, max: Infinity, color: '#ef4444' }
];

const CarCompanyByPriceRangeChart: React.FC<CarCompanyByPriceRangeChartProps> = ({ className = '', dateRange }) => {
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<CarCompany[]>(carCompanies);
  
  // 当日期范围变化时，更新图表数据
  useEffect(() => {
    updateChartData();
  }, [dateRange, selectedCompanies]);

  // 更新图表数据
  const updateChartData = () => {
    const carModelData = getCurrentCarModelData(dateRange);
    
    // 按月和价格区间统计各车企销量
    const monthlyDataMap = new Map<string, Record<string, number>>();
    
    // 初始化雷达图数据
    const radarDataTemp: any[] = [];
    
    // 按月和价格区间统计
    carModelData.forEach(model => {
      const price = model.minPrice; // 使用最低价格作为分类依据
      const month = `${model.year}.${String(parseInt(model.month)).padStart(2, '0')}`;
      
      // 查找价格所在的区间
      const priceRange = PRICE_RANGES.find(range => 
        price >= range.min && price < range.max
      );
      
      if (priceRange && selectedCompanies.some(company => company.name === model.manufacturer)) {
        // 初始化月度数据
        if (!monthlyDataMap.has(month)) {
          const monthData: any = { month };
          PRICE_RANGES.forEach(range => {
            // 为每个价格区间初始化所有选中车企的数据为0
            selectedCompanies.forEach(company => {
              monthData[`${company.name}-${range.name}`] = 0;
            });
          });
          monthlyDataMap.set(month, monthData);
        }
        
        // 更新月度数据
        const monthData = monthlyDataMap.get(month)!;
        monthData[`${model.manufacturer}-${priceRange.name}`] += model.sales;
        
        // 更新雷达图数据
        // 查找该车企的雷达图数据项
        let radarEntry = radarDataTemp.find(item => item.company === model.manufacturer);
        if (!radarEntry) {
          radarEntry = { company: model.manufacturer };
          PRICE_RANGES.forEach(range => {
            radarEntry[range.name] = 0;
          });
          radarDataTemp.push(radarEntry);
        }
        radarEntry[priceRange.name] += model.sales;
      }
    });
    
    // 转换月度数据为数组并排序
    const monthlyData = Array.from(monthlyDataMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    setLineChartData(monthlyData);
    
    // 转换雷达图数据
    setRadarData(radarDataTemp);
  };

  // 格式化数字，添加千位分隔符
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => {
            // 从数据键中提取车企名称和价格区间
            const [companyName, priceRange] = entry.name.split('-');
            
            return (
              <p key={index} className="flex items-center mt-1">
                <span 
                  className="w-3 h-3 inline-block mr-2" 
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className="text-sm text-gray-600 dark:text-gray-300">{companyName} ({priceRange}):</span>
                <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                  {formatNumber(entry.value)} 辆
                </span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  // 图表动画配置
  const chartVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  // 生成随机颜色
  const generateColor = (index: number): string => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#14b8a6', '#84cc16'];
    return colors[index % colors.length];
  };

  return (
    <motion.div
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 ${className}`}
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">车企各价格区间销量分析</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          分析各车企在不同价格区间的销量表现
        </p>
      </div>

      <div className="h-[400px]">
        {lineChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={lineChartData}
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
                wrapperStyle={{ paddingTop: 10, maxHeight: 80, overflowY: 'auto' }}
                formatter={(value) => <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>}
              />
              {selectedCompanies.map((company, companyIndex) => {
                return PRICE_RANGES.map((range, rangeIndex) => (
                  <Line 
                    key={`${company.id}-${range.name}`}
                    type="monotone" 
                    dataKey={`${company.name}-${range.name}`} 
                    stroke={generateColor(companyIndex * PRICE_RANGES.length + rangeIndex)}
                    strokeWidth={2}
                    dot={{ 
                      fill: generateColor(companyIndex * PRICE_RANGES.length + rangeIndex), 
                      r: 4,
                      strokeWidth: 2
                    }}
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                    animationDuration={1500}
                    style={{ cursor: 'pointer' }}
                  />
                ));
              })}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 dark:text-gray-400">暂无数据</p>
          </div>
        )}
      </div>

      {/* 说明信息 */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>注：图表显示各车企在不同价格区间的月度销量趋势。</p>
      </div>
    </motion.div>
  );
};

export default CarCompanyByPriceRangeChart;