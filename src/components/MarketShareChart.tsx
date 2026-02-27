import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';
import { motion } from 'framer-motion';
import { getMarketShareData, getCurrentMonthlySalesData, formatMonthWithYear, carCompanies } from '../mocks/data';
import { manufacturerCategories } from '../mocks/manufacturerCategories';
import CarCompanySelector from './CarCompanySelector';
import { CarCompany, DateRange } from '../types';

interface MarketShareChartProps {
  className?: string;
  dateRange?: DateRange;
}

const MarketShareChart: React.FC<MarketShareChartProps> = ({ className = '', dateRange }) => {
  const [selectedCompanies, setSelectedCompanies] = useState<CarCompany[]>(carCompanies);
  const [pieChartData, setPieChartData] = useState<any[]>([]);
  const [barChartData, setBarChartData] = useState<any[]>([]);
  // 新增：传统厂商和新势力厂商的市占率变化趋势数据
  const [traditionalMarketShareData, setTraditionalMarketShareData] = useState<any[]>([]);
  const [newEnergyMarketShareData, setNewEnergyMarketShareData] = useState<any[]>([]);
  // 追踪当前悬停的车企
  const [hoveredCompany, setHoveredCompany] = useState<string | null>(null);
  
  // 当选中的车企变化或日期范围变化时，更新图表数据
  useEffect(() => {
    if (selectedCompanies.length === 0) return;

    // 更新圆饼图数据（总销量市场份额）
    updatePieChartData();
    
    // 更新柱状图数据（月度销量市场份额）
    updateBarChartData();
    
    // 更新折线图数据（传统厂商和新势力厂商市占率变化趋势）
    updateLineChartData();
  }, [selectedCompanies, dateRange]);

  // 更新圆饼图数据
  const updatePieChartData = () => {
    // 获取市场份额数据
    const marketShare = getMarketShareData(dateRange);
    
    // 过滤市场份额数据
    const filteredData = marketShare.filter(item => 
      selectedCompanies.some(company => company.name === item.company)
    );

    setPieChartData(filteredData);
  };

  // 更新柱状图数据（月度市场份额）
  const updateBarChartData = () => {
    // 获取月度销量数据
    const monthlySalesData = getCurrentMonthlySalesData(dateRange);
    
    // 获取数据中的所有月份和年份组合
    const monthYearPairs = Array.from(new Set(monthlySalesData.map(item => `${item.year}-${item.month}`)))
      .sort((a, b) => {
        const [yearA, monthA] = a.split('-');
        const [yearB, monthB] = b.split('-');
        if (parseInt(yearA) !== parseInt(yearB)) {
          return parseInt(yearA) - parseInt(yearB);
        }
        return parseInt(monthA) - parseInt(monthB);
      });
    
    // 对于每个月，计算各车企的市场份额
    const monthlyMarketShare = monthYearPairs.map(monthYear => {
      const [year, month] = monthYear.split('-');
      // 获取当前月的所有销量数据
      const monthSalesData = monthlySalesData.filter(item => item.month === month && item.year === parseInt(year));
      
      // 计算当前月的总销量
      const monthTotalSales = monthSalesData.reduce((sum, item) => sum + item.sales, 0);
      
      // 使用从月份年份组合中提取的年份
      const currentYear = parseInt(year);
      
      // 构建当前月的数据对象
      const monthData: any = {
        month: formatMonthWithYear(month, currentYear),
        year: currentYear
      };
      
      // 计算每个所选车企的市场份额
      selectedCompanies.forEach(company => {
        const companySales = monthSalesData.find(item => item.company === company.name)?.sales || 0;
        const share = monthTotalSales > 0 ? (companySales / monthTotalSales) * 100 : 0;
        monthData[company.name] = parseFloat(share.toFixed(1));
      });
      
      return monthData;
    });
    
    // 按年月排序
    monthlyMarketShare.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return a.month.localeCompare(b.month);
    });
    
    setBarChartData(monthlyMarketShare);
  };
  
  // 更新折线图数据（显示每个分类中各车企的市占率变化趋势）
  const updateLineChartData = () => {
    // 获取月度销量数据
    const monthlySalesData = getCurrentMonthlySalesData(dateRange);
    
    // 获取数据中的所有月份
    const monthsInData = Array.from(new Set(monthlySalesData.map(item => item.month)))
      .sort((a, b) => parseInt(a) - parseInt(b));
    
    // 对于每个月，计算每个车企的市场份额
    const monthlyCompanyShare = monthsInData.map(month => {
      // 获取当前月的所有销量数据
      const monthSalesData = monthlySalesData.filter(item => item.month === month);
      
      // 计算当前月的总销量
      const monthTotalSales = monthSalesData.reduce((sum, item) => sum + item.sales, 0);
      
      // 找出当前月中包含所选车企的年份
      const year = monthSalesData.length > 0 ? monthSalesData[0].year : 2025;
      
      // 构建当前月的数据对象
      const monthData: any = {
        month: formatMonthWithYear(month, year),
        year
      };
      
      // 为每个公司计算市场份额
      selectedCompanies.forEach(company => {
        const companySales = monthSalesData.find(item => item.company === company.name)?.sales || 0;
        const share = monthTotalSales > 0 ? (companySales / monthTotalSales) * 100 : 0;
        monthData[company.name] = parseFloat(share.toFixed(1));
      });
      
      return monthData;
    });
    
    // 按年月排序
    monthlyCompanyShare.sort((a, b) => {
      if (a.year !== b.year) {
        return a.year - b.year;
      }
      return a.month.localeCompare(b.month);
    });
    
    // 为两个折线图准备数据
    // 传统厂商市占率变化趋势数据 - 只包含传统厂商的车企
    const traditionalData = monthlyCompanyShare.map(item => {
      const monthData: any = { month: item.month };
      selectedCompanies
        .filter(company => manufacturerCategories.traditional.includes(company.name))
        .forEach(company => {
          monthData[company.name] = item[company.name] || 0;
        });
      return monthData;
    });
    
    // 新势力厂商市占率变化趋势数据 - 只包含新势力厂商的车企
    const newEnergyData = monthlyCompanyShare.map(item => {
      const monthData: any = { month: item.month };
      selectedCompanies
        .filter(company => manufacturerCategories.newEnergy.includes(company.name))
        .forEach(company => {
          monthData[company.name] = item[company.name] || 0;
        });
      return monthData;
    });
    
    setTraditionalMarketShareData(traditionalData);
    setNewEnergyMarketShareData(newEnergyData);
  };

  // 处理柱状图的鼠标进入事件
  const handleBarMouseEnter = (companyName: string) => {
    setHoveredCompany(companyName);
  };

  // 处理柱状图的鼠标离开事件
  const handleBarMouseLeave = () => {
    setHoveredCompany(null);
  };

  // 处理图表的鼠标离开事件
  const handleChartMouseLeave = () => {
    setHoveredCompany(null);
  };

  // 自定义圆饼图Tooltip
  const PieCustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{data.company}</p>
          <p className="text-sm text-gray-600 dark:text-gray-300">市场份额:</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{data.share}%</p>
        </div>
      );
    }
    return null;
  };

  // 自定义柱状图Tooltip
  const BarCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => {
            // 检查当前条目是否是悬停的车企
            const isHovered = hoveredCompany && entry.name === hoveredCompany;
            
            return (
              <p 
                key={index} 
                className={`flex items-center mt-1 ${isHovered ? 'font-bold' : ''}`}
              >
                <span 
                  className="w-3 h-3 inline-block mr-2" 
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className={`text-sm ${isHovered ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                  {entry.name}:
                </span>
                <span className={`ml-2 text-sm ${isHovered ? 'font-bold text-blue-600 dark:text-blue-400' : 'font-medium text-gray-900 dark:text-white'}`}>
                  {entry.value}%
                </span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };
  
   // 自定义折线图Tooltip
  const LineCustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => {
            // 检查当前条目是否是悬停的车企
            const isHovered = hoveredCompany && entry.name === hoveredCompany;
            
            return (
              <p 
                key={index} 
                className={`flex items-center mt-1 ${isHovered ? 'font-bold' : ''}`}
              >
                <span 
                  className="w-3 h-3 inline-block mr-2" 
                  style={{ backgroundColor: entry.color }}
                ></span>
                <span className={`text-sm ${isHovered ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-300'}`}>
                  {entry.name}:
                </span>
                <span className={`ml-2 text-sm ${isHovered ? 'font-bold text-blue-600 dark:text-blue-400' : 'font-medium text-gray-900 dark:text-white'}`}>
                  {entry.value}%
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

  return (
    <motion.div
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 ${className}`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">市场份额分析</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            分析所选车企的总销量市场份额及月度变化趋势
          </p>
        </div>
        <CarCompanySelector 
          onCompanyChange={setSelectedCompanies} 
          initialSelectedCompanies={selectedCompanies}
        />
      </div>
      
      {/* 圆饼图 - 总销量市场份额 */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">总销量市场份额</h4>
        <div className="h-[350px]">
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="share"
                  animationDuration={1500}
                  animationBegin={200}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                 <Tooltip content={<PieCustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => {
                    // 确保显示的是公司名称，而不是value字段
                    const companyData = pieChartData.find(item => item.company === value);
                    return <span className="text-sm text-gray-700 dark:text-gray-300">{companyData?.company || value}</span>;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">请选择车企查看市场份额数据</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 叠放柱状图 - 月度销量市场份额（改为横轴为月份） */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">月度销量市场份额</h4>
        <div className="h-[400px]">
          {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                onMouseLeave={handleChartMouseLeave}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis 
                  type="category" 
                  dataKey="month"
                  tick={{ fill: '#6b7280' }} 
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => value}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  type="number"
                  tick={{ fill: '#6b7280' }} 
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<BarCustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 10 }}
                  formatter={(value) => <span className={`text-sm ${hoveredCompany === value ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{value}</span>}
                />
{carCompanies.map((company) => {
  // 检查公司是否被选中
  const isSelected = selectedCompanies.some(selected => selected.id === company.id);
  // 只有选中的公司才会显示数据
  if (!isSelected) return null;
  
  return (
    <Bar 
      key={company.id} 
      dataKey={company.name} 
      fill={company.color}
      stackId="a"
      radius={[4, 4, 0, 0]}
      animationDuration={1500}
      // 添加鼠标事件处理器
      onMouseEnter={() => handleBarMouseEnter(company.name)}
      onMouseLeave={handleBarMouseLeave}
      style={{ 
        opacity: hoveredCompany ? (hoveredCompany === company.name ? 1 : 0.6) : 1,
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer'  // 添加指针样式，提升用户体验
      }}
    />
  );
})}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">请选择车企查看月度市场份额数据</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 新增：传统厂商市占率变化趋势折线图 */}
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">传统厂商市占率变化趋势</h4>
        <div className="h-[350px]">
          {traditionalMarketShareData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
             <LineChart
                data={traditionalMarketShareData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                onMouseLeave={handleChartMouseLeave}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month"
                  tick={{ fill: '#6b7280' }} 
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => value}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#6b7280' }} 
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<LineCustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 10 }}
                  formatter={(value) => <span className={`text-sm ${hoveredCompany === value ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{value}</span>}
                />
                  {carCompanies
                    .filter(company => manufacturerCategories.traditional.includes(company.name))
                    .filter(company => selectedCompanies.some(selected => selected.id === company.id))
                    .map((company) => (
                      <Line 
                        key={company.id}
                        type="monotone" 
                        dataKey={company.name} 
                        stroke={company.color}
                        strokeWidth={hoveredCompany === company.name ? 4 : 2}
                        dot={{ 
                          fill: company.color, 
                          r: hoveredCompany === company.name ? 6 : 4,
                          stroke: hoveredCompany === company.name ? company.color : 'none',
                          strokeWidth: 2
                        }}
                        activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={1500}
                        onMouseEnter={() => handleBarMouseEnter(company.name)}
                        onMouseLeave={handleBarMouseLeave}
                        onMouseOver={() => handleBarMouseEnter(company.name)}
                        onMouseOut={handleBarMouseLeave}
                        style={{ 
                          opacity: hoveredCompany ? (hoveredCompany === company.name ? 1 : 0.4) : 1,
                          transition: 'all 0.2s ease-in-out',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">暂无传统厂商市占率数据</p>
            </div>
          )}
        </div>
      </div>
      
      {/* 新增：新势力厂商市占率变化趋势折线图 */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">新势力厂商市占率变化趋势</h4>
        <div className="h-[350px]">
          {newEnergyMarketShareData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
             <LineChart
                data={newEnergyMarketShareData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                onMouseLeave={handleChartMouseLeave}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month"
                  tick={{ fill: '#6b7280' }} 
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => value}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tick={{ fill: '#6b7280' }} 
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip content={<LineCustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: 10 }}
                  formatter={(value) => <span className={`text-sm ${hoveredCompany === value ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{value}</span>}
                />
                  {carCompanies
                    .filter(company => manufacturerCategories.newEnergy.includes(company.name))
                    .filter(company => selectedCompanies.some(selected => selected.id === company.id))
                    .map((company) => (
                      <Line 
                        key={company.id}
                        type="monotone" 
                        dataKey={company.name} 
                        stroke={company.color}
                        strokeWidth={hoveredCompany === company.name ? 4 : 2}
                        dot={{ 
                          fill: company.color, 
                          r: hoveredCompany === company.name ? 6 : 4,
                          stroke: hoveredCompany === company.name ? company.color : 'none',
                          strokeWidth: 2
                        }}
                        activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                        animationDuration={1500}
                        onMouseEnter={() => handleBarMouseEnter(company.name)}
                        onMouseLeave={handleBarMouseLeave}
                        onMouseOver={() => handleBarMouseEnter(company.name)}
                        onMouseOut={handleBarMouseLeave}
                        style={{ 
                          opacity: hoveredCompany ? (hoveredCompany === company.name ? 1 : 0.4) : 1,
                          transition: 'all 0.2s ease-in-out',
                          cursor: 'pointer'
                        }}
                      />
                    ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 dark:text-gray-400">暂无新势力厂商市占率数据</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MarketShareChart;