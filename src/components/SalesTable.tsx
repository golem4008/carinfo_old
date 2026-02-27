import React, { useState, useEffect } from 'react';
import { CarCompany } from '../types';
import { carCompanies } from '../mocks/data';
import { motion } from 'framer-motion';
import { getBrandSalesTableData, formatMonthWithYear } from '../mocks/data';
import CarCompanySelector from './CarCompanySelector';
import { DateRange } from '../types';

interface SalesTableProps {
  className?: string;
  dateRange?: DateRange;
}

interface ManufacturerSpan {
  manufacturer: string;
  startIndex: number;
  span: number;
}

const SalesTable: React.FC<SalesTableProps> = ({ className = '', dateRange }) => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  // 使用CarCompany类型的数组，与其他模块保持一致
  const [selectedCompanies, setSelectedCompanies] = useState<CarCompany[]>(carCompanies);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  // 从数据中提取的月份列表
  const [months, setMonths] = useState<string[]>([]);
  // 用于存储带有年份的月份显示格式
  const [formattedMonths, setFormattedMonths] = useState<Record<string, string>>({});
  // 用于跟踪厂商单元格的合并信息
  const [manufacturerSpans, setManufacturerSpans] = useState<ManufacturerSpan[]>([]);
  
  // 初始化表格数据
  useEffect(() => {
    const data = getBrandSalesTableData(dateRange);
    
    // 从数据中提取所有月份
    const allMonths = new Set<string>();
    data.forEach(row => {
      Object.keys(row).forEach(key => {
        if (key.includes('-') && key.split('-')[1].endsWith('月')) {
          allMonths.add(key);
        }
      });
    });
    
    // 排序月份
    const sortedMonths = Array.from(allMonths).sort((a, b) => {
      const [yearA, monthA] = a.split('-');
      const [yearB, monthB] = b.split('-');
      if (parseInt(yearA) !== parseInt(yearB)) {
        return parseInt(yearA) - parseInt(yearB);
      }
      const monthNumA = parseInt(monthA.replace('月', ''));
      const monthNumB = parseInt(monthB.replace('月', ''));
      return monthNumA - monthNumB;
    });
    
    // 为每个月添加年份格式
    const formattedMonthsMap: Record<string, string> = {};
    sortedMonths.forEach(month => {
      const [year, monthName] = month.split('-');
      const monthNum = parseInt(monthName.replace('月', ''));
      formattedMonthsMap[month] = formatMonthWithYear(monthNum.toString(), parseInt(year));
    });
    
    setMonths(sortedMonths);
    setFormattedMonths(formattedMonthsMap);
    
    // 按厂商和品牌排序数据，确保相同厂商的记录相邻
    const sortedData = [...data].sort((a, b) => {
      // 先按厂商排序
      if (a.manufacturer !== b.manufacturer) {
        return a.manufacturer.localeCompare(b.manufacturer);
      }
      // 再按品牌排序
      return a.brand.localeCompare(b.brand);
    });
    
    setTableData(sortedData);
  }, [dateRange]);

  // 筛选数据 - 根据选中的公司进行筛选
  useEffect(() => {
    if (selectedCompanies.length === 0) {
      setFilteredData([]);
      return;
    }
    
    // 获取选中公司的名称列表
    const selectedCompanyNames = selectedCompanies.map(company => company.name);
    
    // 筛选出属于选中公司的数据
    setFilteredData(tableData.filter(item => 
      selectedCompanyNames.includes(item.manufacturer)
    ));
  }, [selectedCompanies, tableData]);

  // 排序数据
  useEffect(() => {
    // 当有排序配置时，根据排序配置排序数据
    if (sortConfig) {
      let sortedData = [...tableData];
      sortedData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        // 如果排序字段值相同，确保相同厂商的记录仍然相邻
        if (a.manufacturer !== b.manufacturer) {
          return a.manufacturer.localeCompare(b.manufacturer);
        }
        return a.brand.localeCompare(b.brand);
      });
      setFilteredData(sortedData);
    } else {
      // 没有排序配置时，按厂商和品牌排序
      const sortedData = [...tableData].sort((a, b) => {
        if (a.manufacturer !== b.manufacturer) {
          return a.manufacturer.localeCompare(b.manufacturer);
        }
        return a.brand.localeCompare(b.brand);
      });
      setFilteredData(sortedData);
    }
  }, [sortConfig, tableData]);

  // 计算厂商单元格合并信息
  useEffect(() => {
    if (filteredData.length === 0) {
      setManufacturerSpans([]);
      return;
    }

    const spans: ManufacturerSpan[] = [];
    let currentManufacturer = filteredData[0].manufacturer;
    let currentSpan = 1;

    for (let i = 1; i < filteredData.length; i++) {
      if (filteredData[i].manufacturer === currentManufacturer) {
        currentSpan++;
      } else {
        spans.push({
          manufacturer: currentManufacturer,
          startIndex: i - currentSpan,
          span: currentSpan
        });
        currentManufacturer = filteredData[i].manufacturer;
        currentSpan = 1;
      }
    }

    // 添加最后一个厂商的合并信息
    spans.push({
      manufacturer: currentManufacturer,
      startIndex: filteredData.length - currentSpan,
      span: currentSpan
    });

    setManufacturerSpans(spans);
  }, [filteredData]);

  // 处理排序
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 格式化数字，添加千位分隔符
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 表格动画配置
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } },
  };

  return (
    <motion.div
      variants={tableVariants}
      initial="hidden"
      animate="visible"
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 ${className}`}
    >
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
         <div>
           <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">厂商品牌销量明细</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400">
             各厂商各品牌月度销量明细
           </p>
         </div>
         
         {/* 使用与其他模块相同的车企选择器 */}
         <CarCompanySelector 
           onCompanyChange={setSelectedCompanies} 
           initialSelectedCompanies={selectedCompanies}
         />
       </div>

         <div className="overflow-x-auto max-h-[900px] border rounded-lg">
           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            {/* 表格头部 - 固定显示 */}
             <thead className="sticky top-0 z-10 bg-gray-100 dark:bg-gray-800">
             <tr>
                <th 
                  className="px-1 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                  style={{ minWidth: '35px' }}
                >
                 <div className="flex items-center justify-center">
                   厂商名称
                 </div>
               </th>
               <th 
                 className="px-1 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                 onClick={() => handleSort('brand')}
                 style={{ minWidth: '35px' }}
               >
                 <div className="flex items-center justify-center">
                   品牌名称
                   {sortConfig?.key === 'brand' && (
                     <i className={`fa-solid ml-1 ${sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>
                   )}
                 </div>
               </th>
              {/* 月份表头 */}
              {months.map((month) => (
                <th 
                  key={month} 
                  className="px-1 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={() => handleSort(month)}
                  style={{ minWidth: '35px' }}
                >
                  <div className="flex items-center justify-center">
                    {formattedMonths[month]}
                    {sortConfig?.key === month && (
                      <i className={`fa-solid ml-1 ${sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>
                    )}
                  </div>
                </th>
              ))}
              <th 
                className="px-1 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => handleSort('total')}
                style={{ minWidth: '35px' }}
              >
                <div className="flex items-center justify-center">
                  总计
                  {sortConfig?.key === 'total' && (
                    <i className={`fa-solid ml-1 ${sortConfig.direction === 'asc' ? 'fa-sort-up' : 'fa-sort-down'}`}></i>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          
          {/* 表格主体 */}
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => {
                // 查找当前行是否需要显示厂商名称
                const currentSpan = manufacturerSpans.find(span => span.startIndex === index);
                
                return (
                  <tr 
                    key={`${row.brand}-${row.manufacturer}-${index}`} 
                    className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-750'}
                  >
                    {/* 厂商名称单元格 - 根据合并信息决定是否显示和合并 */}
                    {currentSpan ? (
                     <td 
                       className="px-1 py-1.5 text-sm text-gray-700 dark:text-gray-300 text-center" 
                       style={{ verticalAlign: 'middle', minWidth: '35px' }}
                       rowSpan={currentSpan.span}
                     >
                       {currentSpan.manufacturer}
                     </td>
                    ) : null}
                    
                    {/* 品牌名称单元格 */}
                     <td className="px-1 py-1.5 text-sm font-medium text-gray-900 dark:text-white text-center" style={{ verticalAlign: 'middle', minWidth: '35px' }}>
                       {row.brand}
                     </td>
                    
                    {/* 月份数据单元格 */}
                    {months.map((month) => (
                      <td 
                        key={month} 
                        className="px-1 py-1.5 text-sm text-center text-gray-700 dark:text-gray-300"
                        style={{ verticalAlign: 'middle', minWidth: '35px' }}
                      >
                        {formatNumber(typeof row[month] === 'number' ? row[month] : parseInt(row[month] as string) || 0)}
                      </td>
                    ))}
                    
                    {/* 总计单元格 */}
                    <td 
                      className="px-1 py-1.5 text-sm font-bold text-center text-gray-900 dark:text-white"
                      style={{ verticalAlign: 'middle', minWidth: '35px' }}
                    >
                      {formatNumber(typeof row.total === 'number' ? row.total : parseInt(row.total as string) || 0)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={months.length + 3} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                  暂无数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* 说明信息 */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>注：销量数据按照厂商-品牌维度聚合，相同厂商的单元格已合并显示。</p>
      </div>
    </motion.div>
  );
};

export default SalesTable;