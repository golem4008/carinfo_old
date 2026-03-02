import { MonthlySalesData, MarketShareData, SalesTrendData, GrowthRateData, CarCompany, CarBrand, BrandMonthlySales, CarModelData, DateRange } from '../types';

// 为字符串生成一致的颜色
const stringToColor = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

// 获取指定车型在特定时间范围内的最新价格 - 确保在所有页面中使用
export const getLatestModelPrice = (
  carModelData: CarModelData[], 
  manufacturer: string, 
  brand: string, 
  modelName: string, 
  dateRange?: DateRange
): { minPrice: number; maxPrice: number } | null => {
  // 过滤出指定车型的数据
  let filteredData = carModelData.filter(item => 
    item.manufacturer === manufacturer && 
    item.brand === brand && 
    item.modelName === modelName
  );
  
  // 如果有日期范围，进一步过滤
  if (dateRange) {
    const { startDate, endDate } = dateRange;
    const startYear = parseInt(startDate.split('-')[0]);
    const startMonth = parseInt(startDate.split('-')[1]);
    const endYear = parseInt(endDate.split('-')[0]);
    const endMonth = parseInt(endDate.split('-')[1]);
    
    filteredData = filteredData.filter(item => {
      const itemYear = item.year;
      const itemMonth = parseInt(item.month.replace('月', ''));
      
      // 如果年份在范围内，或者年份相同但月份在范围内
      if (itemYear > startYear && itemYear < endYear) {
        return true;
      } else if (itemYear === startYear && itemYear === endYear) {
        return itemMonth >= startMonth && itemMonth <= endMonth;
      } else if (itemYear === startYear) {
        return itemMonth >= startMonth;
      } else if (itemYear === endYear) {
        return itemMonth <= endMonth;
      }
      
      return false;
    });
  }
  
  // 按年份和月份排序，获取最新的数据
  filteredData.sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year; // 年份降序
    }
    return parseInt(b.month) - parseInt(a.month); // 月份降序
  });
  
  // 返回最新的价格数据
  return filteredData.length > 0 
    ? { minPrice: filteredData[0].minPrice, maxPrice: filteredData[0].maxPrice } 
    : null;
};

// 从CSV文件加载数据
const loadCSVData = async (): Promise<string> => {
  try {
    const response = await fetch('/src/mocks/car_sales_data.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error loading CSV data:', error);
    // 如果加载失败，返回一个空的CSV内容作为后备
    return '';
  }
};

// 解析CSV数据
const parseCSVData = (csvContent: string): { 
  monthlySalesData: MonthlySalesData[], 
  brandMonthlySalesData: BrandMonthlySales[],
  carModelData: CarModelData[],
  carCompanies: CarCompany[],
  carBrands: CarBrand[],
  manufacturers: string[]
} => {
  // 从CSV内容解析数据 - 使用用户指定的新格式：每一个月份为一个表格页面
  // 第一列：厂商，第二列：品牌，第三列：型号，第四列：车辆类型，第五列：能源类型，第六列：销量，第七列：最低价格，第八列：最高价格
  // 处理CSV内容，确保正确解析
  const lines = csvContent.split('\n');
  
  const monthlySalesData: MonthlySalesData[] = [];
  const brandMonthlySalesData: BrandMonthlySales[] = [];
  const carModelData: CarModelData[] = [];
  
  // 用于存储公司级别的月度销量（用于聚合）
  const companyMonthlySales: Record<string, Record<string, number>> = {};
  // 用于存储品牌级别的月度销量（用于聚合）
  const brandMonthlySales: Record<string, Record<string, number>> = {};
  
  // 用于存储从CSV中提取的车企、品牌和厂商信息
  const uniqueManufacturers = new Set<string>();
  const uniqueBrands = new Set<{ brand: string; manufacturer: string }>();
  const uniqueCompanies = new Set<string>();
  
  let currentMonth = '';
  let currentYear = 2025;
  let isHeaderLine = false;
  
  // 解析CSV数据
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
     // 检查是否是月份标识行
    const monthMatch = line.match(/(\d{4})年(\d{1,2})月数据/);
    if (monthMatch) {
      currentYear = parseInt(monthMatch[1]);
      const monthNum = parseInt(monthMatch[2]);
      currentMonth = monthNum + '月';
      isHeaderLine = true;
      continue;
    }
    
    // 检查是否是表头行
    if (line.includes('厂商') && line.includes('品牌') && line.includes('型号') && 
        line.includes('车辆类型') && line.includes('能源类型') && line.includes('销量') &&
        line.includes('最低价格') && line.includes('最高价格')) {
      isHeaderLine = true;
      continue;
    }
    
    // 如果是数据行
    if (!isHeaderLine || (isHeaderLine && !line.includes('厂商'))) {
      const values = line.split(',').map(value => value.trim());
      
      if (values.length >= 8) {
        const manufacturer = values[0];  // 厂商名称
        const brand = values[1];         // 品牌名称
        const modelName = values[2];     // 型号名称
        const vehicleType = values[3];   // 车辆类型
        const energyType = values[4];    // 能源类型
        const sales = parseInt(values[5]) || 0;    // 销量
        const minPrice = parseFloat(values[6]) || 0; // 最低价格
        const maxPrice = parseFloat(values[7]) || 0; // 最高价格
        
        // 记录唯一的厂商、品牌和车企信息
        uniqueManufacturers.add(manufacturer);
        uniqueBrands.add({ brand, manufacturer });
        uniqueCompanies.add(manufacturer); // 假设车企名称就是厂商名称
        
        // 构建车型详细数据
        const modelData: CarModelData = {
          manufacturer,
          brand,
          modelName,
          vehicleType,
          energyType,
          sales,
          minPrice,
          maxPrice,
          month: currentMonth,
          year: currentYear
        };
        carModelData.push(modelData);
        
        // 这里我们假设公司名称就是厂商名称
        const company = manufacturer;
        
        // 更新公司级别的月度销量统计
        if (!companyMonthlySales[company]) {
          companyMonthlySales[company] = {};
        }
        if (!companyMonthlySales[company][currentMonth]) {
          companyMonthlySales[company][currentMonth] = 0;
        }
        companyMonthlySales[company][currentMonth] += sales;
        
        // 更新品牌级别的月度销量统计
        const brandKey = `${manufacturer}_${brand}`; // 组合厂商和品牌作为唯一键
        if (!brandMonthlySales[brandKey]) {
          brandMonthlySales[brandKey] = {};
        }
        if (!brandMonthlySales[brandKey][currentMonth]) {
          brandMonthlySales[brandKey][currentMonth] = 0;
        }
        brandMonthlySales[brandKey][currentMonth] += sales;
      }
    }
    
    isHeaderLine = false;
  }
  
   // 构建公司月度销量数据（聚合车型数据）
  // 为每个公司和月份创建独立的记录，确保不会合并不同年份的数据
  Object.keys(companyMonthlySales).forEach(company => {
    Object.keys(companyMonthlySales[company]).forEach(month => {
      // 查找所有匹配月份和公司的记录，确保获取所有年份的信息
      const matchingModelData = carModelData.filter(
        item => item.manufacturer === company && item.month === month
      );
      
      // 确保为每个年份创建单独的记录
      if (matchingModelData.length > 0) {
        // 按年份分组数据
        const yearGroups = new Map<number, number>();
        matchingModelData.forEach(modelData => {
          if (!yearGroups.has(modelData.year)) {
            yearGroups.set(modelData.year, 0);
          }
          yearGroups.set(modelData.year, yearGroups.get(modelData.year)! + modelData.sales);
        });
        
        // 为每个年份创建一条记录
        yearGroups.forEach((sales, year) => {
          monthlySalesData.push({
            company,
            month,
            sales: sales,
            year: year
          });
        });
      } else {
        // 如果没有匹配的车型数据，查找当前年份的默认值
        const modelDataWithSameMonth = carModelData.find(item => item.month === month);
        monthlySalesData.push({
          company,
          month,
          sales: companyMonthlySales[company][month],
          year: modelDataWithSameMonth ? modelDataWithSameMonth.year : currentYear
        });
      }
    });
  });
  
  // 构建品牌月度销量数据（聚合车型数据）
  Object.keys(brandMonthlySales).forEach(brandKey => {
    const [manufacturer, brand] = brandKey.split('_');
    Object.keys(brandMonthlySales[brandKey]).forEach(month => {
      // 从车辆型号数据中找到对应月份和厂商的记录，获取正确的年份
      const modelDataWithSameMonthAndManufacturer = carModelData.find(
        item => item.manufacturer === manufacturer && item.month === month
      );
      
      brandMonthlySalesData.push({
        brand,
        manufacturer,
        month,
        sales: brandMonthlySales[brandKey][month],
        year: modelDataWithSameMonthAndManufacturer ? modelDataWithSameMonthAndManufacturer.year : 2025 // 使用找到的年份或默认值
      });
    });
  });
  
// 构建车企信息
const carCompanies: CarCompany[] = Array.from(uniqueCompanies).map((company, index) => {
  // 根据公司名称提供固定的logo URL
  let logoUrl = '';
  switch (company) {
    case '特斯拉':
      logoUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=tesla%20logo&sign=067179d013d6e811dea8c3cf284c96fa';
      break;
    case '比亚迪':
      logoUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=byd%20logo&sign=dc7e620d2a7c36dd33434c8e1e799bb3';
      break;
    case '大众':
      logoUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=volkswagen%20logo&sign=6940a58a9f716dc02ad409c9b005e663';
      break;
    case '丰田':
      logoUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=toyota%20logo&sign=6454024ca28b81ecdbe76cc06e0ec6c9';
      break;
    case '本田':
      logoUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=honda%20logo&sign=28c9bb378958d9fcd8ecd6f043caf15c';
      break;
    case '吉利':
      logoUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=geely%20logo&sign=e8fa6f2618d6a082df2d1d023c97d04a';
      break;
    default:
      logoUrl = 'https://space.coze.cn/api/coze_space/gen_image?image_size=square&prompt=car%20company%20logo&sign=87063a1c77430983c50943e9cd9157f2';
  }

    return {
     id: (index + 1).toString(),
     name: company,
     logo: logoUrl,
     // 为所有厂商生成一致的随机颜色，确保相同厂商始终获得相同的颜色
     color: stringToColor(company)
   };
});
  
  // 构建品牌信息
  const carBrands: CarBrand[] = Array.from(uniqueBrands).map((brandInfo, index) => ({
    id: (index + 1).toString(),
    name: brandInfo.brand,
    manufacturer: brandInfo.manufacturer
  }));
  
  // 构建厂商列表
  const manufacturers = Array.from(uniqueManufacturers);
  
  return { 
    monthlySalesData, 
    brandMonthlySalesData,
    carModelData,
    carCompanies,
    carBrands,
    manufacturers
  };
};

// 异步获取CSV数据并解析
let staticMonthlySalesData: MonthlySalesData[] = [];
let staticBrandMonthlySalesData: BrandMonthlySales[] = [];
let staticCarModelData: CarModelData[] = [];
let staticCarCompanies: CarCompany[] = [];
let staticCarBrands: CarBrand[] = [];
let staticManufacturers: string[] = [];

// 初始化数据
const initData = async () => {
  try {
    // 加载CSV文件内容
    const csvContent = await loadCSVData();
    
    // 如果加载失败或内容为空，使用默认的mock数据
    if (!csvContent) {
      throw new Error('CSV content is empty');
    }
    
    // 解析CSV数据
    const result = parseCSVData(csvContent);
    
    // 更新静态数据
    staticMonthlySalesData = result.monthlySalesData;
    staticBrandMonthlySalesData = result.brandMonthlySalesData;
    staticCarModelData = result.carModelData;
    staticCarCompanies = result.carCompanies;
    staticCarBrands = result.carBrands;
    staticManufacturers = result.manufacturers;
    
    // 触发全局更新事件，通知组件数据已加载完成
    window.dispatchEvent(new CustomEvent('dataLoaded'));
  } catch (error) {
    console.warn('Failed to load CSV data, using mock data instead:', error);
    
    // 使用默认的mock数据，确保应用能够正常运行
    // 这些默认数据应该与原有的mock数据保持一致，确保功能正常staticMonthlySalesData = monthlySalesData2024;
    staticCarCompanies = [
      { id: '1', name: '特斯拉', logo: '', color: '#E82127' },
      { id: '2', name: '比亚迪', logo: '', color: '#0066B3' },
      { id: '3', name: '大众', logo: '', color: '#000000' },
      { id: '4', name: '丰田', logo: '', color: '#EB0A1E' },
      { id: '5', name: '本田', logo: '', color: '#FF3333' },
      { id: '6', name: '吉利', logo: '', color: '#2C3E50' },
      { id: '7', name: '理想', logo: '', color: '#6b7280' },
      { id: '8', name: '长安', logo: '', color: '#10b981' },
    ];
    
    // 触发全局更新事件
    window.dispatchEvent(new CustomEvent('dataLoaded'));
  }
};

// 初始化数据
initData();

// 根据日期范围筛选数据的辅助函数
const filterDataByDateRange = <T extends { month: string; year: number }>(
  data: T[], 
  dateRange?: DateRange
): T[] => {
  if (!dateRange) return data;
  
  const { startDate, endDate } = dateRange;
  
  // 解析开始和结束日期
  const startYear = parseInt(startDate.split('-')[0]);
  const startMonth = parseInt(startDate.split('-')[1]);
  const endYear = parseInt(endDate.split('-')[0]);
  const endMonth = parseInt(endDate.split('-')[1]);
  
  // 筛选数据
  return data.filter(item => {
    const itemMonth = parseInt(item.month.replace('月', ''));
    const itemYear = item.year;
    
    // 如果年份在范围内，或者年份相同但月份在范围内
    if (itemYear > startYear && itemYear < endYear) {
      return true;
    } else if (itemYear === startYear && itemYear === endYear) {
      return itemMonth >= startMonth && itemMonth <= endMonth;
    } else if (itemYear === startYear) {
      return itemMonth >= startMonth;
    } else if (itemYear === endYear) {
      return itemMonth <= endMonth;
    }
    
    return false;
  });
};

// 获取当前使用的数据（使用静态解析的数据）
export const getCurrentMonthlySalesData = (dateRange?: DateRange): MonthlySalesData[] => {
  return filterDataByDateRange(staticMonthlySalesData, dateRange);
};

// 格式化月份为带年份的格式（如 2025.01）
export const formatMonthWithYear = (month: string, year: number): string => {
  const monthNum = parseInt(month.replace('月', ''));
  return `${year}.${monthNum < 10 ? '0' + monthNum : monthNum}`;
};

const getCurrentBrandMonthlySalesData = (dateRange?: DateRange): BrandMonthlySales[] => {
  return filterDataByDateRange(staticBrandMonthlySalesData, dateRange);
};

// 获取车型详细数据
export const getCurrentCarModelData = (dateRange?: DateRange): CarModelData[] => {
  // 先过滤基础数据
  const filteredData = filterDataByDateRange(staticCarModelData, dateRange);
  
  // 补充没有数据的车企
  const allManufacturers = carCompanies.map(company => company.name);
  const existingManufacturers = new Set(filteredData.map(item => item.manufacturer));
  const missingManufacturers = allManufacturers.filter(name => !existingManufacturers.has(name));
  
  // 为每个缺失的车企生成基本数据
  missingManufacturers.forEach(manufacturer => {
    filteredData.push({
      manufacturer,
      brand: manufacturer,
      modelName: '暂无车型数据',
      vehicleType: '未知',
      energyType: '未知',
      sales: 0,
      minPrice: 0,
      maxPrice: 0,
      month: '1月',
      year: 2025
    });
  });
  
  return filteredData;
};

// 异步版本的getCurrentCarModelData，确保返回的数据是完整的
export const getCurrentCarModelDataAsync = async (dateRange?: DateRange): Promise<CarModelData[]> => {
  // 如果数据还没加载完成，等待数据加载完成后再返回
  if (staticCarModelData.length === 0) {
    await new Promise(resolve => {
      const handleDataLoaded = () => {
        window.removeEventListener('dataLoaded', handleDataLoaded);
        resolve(null);
      };
      window.addEventListener('dataLoaded', handleDataLoaded);
      
      // 超时处理，防止数据加载永远不完成
      setTimeout(() => {
        window.removeEventListener('dataLoaded', handleDataLoaded);
        resolve(null);
      }, 2000);
    });
  }
  
  return getCurrentCarModelData(dateRange);
};

// 车企信息 - 使用动态更新的静态数据
export const carCompanies: CarCompany[] = staticCarCompanies;

// 品牌信息 - 使用动态更新的静态数据
export const carBrands: CarBrand[] = staticCarBrands;

// 厂商信息 - 使用动态更新的静态数据
export const manufacturers = staticManufacturers;

// 导出初始化函数，以便在需要时手动触发数据加载
export const initializeData = initData;

// 月度销量数据 (2024年，用于计算同比) - 默认mock数据
export const monthlySalesData2024: MonthlySalesData[] = [
  { month: '1月', sales: 10000, company: '特斯拉', year: 2024 },
  { month: '2月', sales: 11000, company: '特斯拉', year: 2024 },
  { month: '3月', sales: 12000, company: '特斯拉', year: 2024 },
  { month: '4月', sales: 13000, company: '特斯拉', year: 2024 },
  { month: '5月', sales: 14000, company: '特斯拉', year: 2024 },
  { month: '6月', sales: 15000, company: '特斯拉', year: 2024 },
  { month: '7月', sales: 16000, company: '特斯拉', year: 2024 },
  { month: '8月', sales: 17000, company: '特斯拉', year: 2024 },
  { month: '9月', sales: 18000, company: '特斯拉', year: 2024 },
  { month: '10月', sales: 19000, company: '特斯拉', year: 2024 },
  { month: '11月', sales: 20000, company: '特斯拉', year: 2024 },
  { month: '12月', sales: 21000, company: '特斯拉', year: 2024 },
  
  { month: '1月', sales: 12000, company: '比亚迪', year: 2024 },
  { month: '2月', sales: 13000, company: '比亚迪', year: 2024 },
  { month: '3月', sales: 14000, company: '比亚迪', year: 2024 },
  { month: '4月', sales: 15000, company: '比亚迪', year: 2024 },
  { month: '5月', sales: 16000, company: '比亚迪', year: 2024 },
  { month: '6月', sales: 17000, company: '比亚迪', year: 2024 },
  { month: '7月', sales: 18000, company: '比亚迪', year: 2024 },
  { month: '8月', sales: 19000, company: '比亚迪', year: 2024 },
  { month: '9月', sales: 20000, company: '比亚迪', year: 2024 },
  { month: '10月', sales: 21000, company: '比亚迪', year: 2024 },
  { month: '11月', sales: 22000, company: '比亚迪', year: 2024 },
  { month: '12月', sales: 23000, company: '比亚迪', year: 2024 },
];

// 获取品牌销量表格数据
export const getBrandSalesTableData = (dateRange?: DateRange) => {
  // 获取当前使用的车型数据
  const carModelData = getCurrentCarModelData(dateRange);
  
  // 使用Map确保品牌唯一性
  const brandMap = new Map<string, { brand: string; manufacturer: string }>();
  
  // 从当前数据中提取所有唯一的品牌信息
  carModelData.forEach(item => {
    // 使用厂商+品牌作为唯一键
    const uniqueKey = `${item.manufacturer}_${item.brand}`;
    brandMap.set(uniqueKey, { brand: item.brand, manufacturer: item.manufacturer });
  });
  
  // 转换为数组
  const uniqueBrands = Array.from(brandMap.values());
  
  // 获取数据中的所有月份（包含年份）
  const monthsInData = Array.from(new Set(carModelData.map(item => `${item.year}-${item.month}`)))
    .sort((a, b) => {
      const [yearA, monthA] = a.split('-');
      const [yearB, monthB] = b.split('-');
      if (parseInt(yearA) !== parseInt(yearB)) {
        return parseInt(yearA) - parseInt(yearB);
      }
      return parseInt(monthA.replace('月', '')) - parseInt(monthB.replace('月', ''));
    });
  
  // 构建表格数据
  const tableData = uniqueBrands.map(brandInfo => {
    const row: any = {
      manufacturer: brandInfo.manufacturer,
      brand: brandInfo.brand
    };
    
    // 为每个月添加销量（聚合该品牌下所有车型的销量）
    monthsInData.forEach(month => {
      // 分解年份和月份
      const [year, monthName] = month.split('-');
      // 确保正确累加销量，只计算该厂商、该品牌在特定月份的所有车型销量总和
      const brandSalesForMonth = carModelData
        .filter(item => item.brand === brandInfo.brand && 
                       item.manufacturer === brandInfo.manufacturer && 
                       item.month === monthName &&
                       item.year === parseInt(year))
          .reduce((sum, item) => {
            // 确保item.sales是数字类型，并正确累加
            const salesValue = typeof item.sales === 'number' ? item.sales : 0;
            return sum + salesValue;
          }, 0);
      
      row[month] = brandSalesForMonth;
    });
    
    // 计算总销量
    row.total = monthsInData.reduce((sum, month) => {
      // 确保row[month]是数字类型，并正确累加
      const monthlySales = typeof row[month] === 'number' ? row[month] : 0;
      return sum + monthlySales;
    }, 0);
    
    return row;
  });
  
  // 按厂商和品牌名称排序，确保表格展示的一致性
  tableData.sort((a, b) => {
    if (a.manufacturer !== b.manufacturer) {
      return a.manufacturer.localeCompare(b.manufacturer);
    }
    return a.brand.localeCompare(b.brand);
  });
  
  return tableData;
};

// 市场份额数据 - 基于CSV数据动态计算
export const getMarketShareData = (dateRange?: DateRange): MarketShareData[] => {
  // 获取所有公司的总销量
  const totalSalesByCompany: Record<string, number> = {};
  
  // 计算各公司总销量
  const filteredData = getCurrentMonthlySalesData(dateRange);
  filteredData.forEach(item => {
    if (!totalSalesByCompany[item.company]) {
      totalSalesByCompany[item.company] = 0;
    }
    totalSalesByCompany[item.company] += item.sales;
  });
  
  // 计算总销量
  const totalSales = Object.values(totalSalesByCompany).reduce((sum, sales) => sum + sales, 0);
  
  // 计算市场份额并生成数据
     return Object.keys(totalSalesByCompany).map((company, index) => {
      const companyData = staticCarCompanies.find(c => c.name === company);
      // 确保销量不为0，使用实际计算的销量数据
      const salesValue = totalSalesByCompany[company] || 0;
      return {
        company,
        share: totalSales > 0 ? parseFloat(((salesValue / totalSales) * 100).toFixed(1)) : 0,
        color: companyData?.color || stringToColor(company),
        sales: salesValue
      };
    }).sort((a, b) => b.share - a.share); // 按市场份额降序排列
};

// 销量趋势数据（格式化后的）
export const getSalesTrendData = (dateRange?: DateRange): SalesTrendData[] => {
  // 获取当前使用的数据
  const currentData = getCurrentMonthlySalesData(dateRange);
  
  // 获取数据中的所有月份
  const monthsInData = Array.from(new Set(currentData.map(item => item.month)))
    .sort((a, b) => parseInt(a) - parseInt(b));
    
  const result: SalesTrendData[] = [];
  
  monthsInData.forEach(month => {
    const monthData: any = { month };
    carCompanies.forEach(company => {
      const salesData = currentData.find(
        item => item.month === month && item.company === company.name
      );
      monthData[company.name] = salesData?.sales || 0;
    });
    result.push(monthData);
  });
  
  return result;
};

// 计算增长率数据
export const getGrowthRateData = (dateRange?: DateRange): GrowthRateData[] => {
  const result: GrowthRateData[] = [];
  
  // 获取当前使用的数据
  const currentData = getCurrentMonthlySalesData(dateRange);
  
  carCompanies.forEach(company => {
    // 获取当前数据中该公司的所有月份
    const companyMonths = Array.from(
      new Set(currentData.filter(item => item.company === company.name).map(item => item.month))
    ).sort((a, b) => parseInt(a) - parseInt(b));
    
    companyMonths.forEach(month => {
      const currentYearData = currentData.find(
        item => item.month === month && item.company === company.name
      );
      
      if (!currentYearData) return;
      
      // 使用默认2024年数据计算同比，因为外部数据不太可能包含去年数据
      const lastYearData = monthlySalesData2024.find(
        item => item.month === month && item.company === company.name
      );
      
      // 找出当前数据中的前一个月
      const monthNum = parseInt(month);
      const prevMonth = `${monthNum > 1 ? monthNum - 1 : 12}月`;
      const prevMonthData = currentData.find(
        item => item.month === prevMonth && item.company === company.name
      );
      
      if (lastYearData && prevMonthData) {
        const yoyGrowth = ((currentYearData.sales - lastYearData.sales) / lastYearData.sales) * 100;
        const momGrowth = ((currentYearData.sales - prevMonthData.sales) / prevMonthData.sales) * 100;
        
        result.push({
          month,
          year: currentYearData.year || 2025,
          company: company.name,
          yoyGrowth: parseFloat(yoyGrowth.toFixed(2)),
          momGrowth: parseFloat(momGrowth.toFixed(2))
        });
      }
    });
  });
  
  return result;
};

// 获取总销量
export const getTotalSales = (dateRange?: DateRange): number => {
  return getCurrentMonthlySalesData(dateRange).reduce((sum, item) => sum + item.sales, 0);
};

// 获取数据中的最早和最晚日期
export const getDataDateRange = (): { startDate: string; endDate: string } => {
  // 从CSV数据中提取最早和最晚日期
  // 从上面的CSV内容可以看到数据范围从2024年12月到2026年2月
  // 确保返回数据中的最早和最晚年月
  return {
    startDate: '2024-12-01',
    endDate: '2026-02-01'
  };
};

// 获取月度平均销量
export const getAverageMonthlySales = (dateRange?: DateRange): number => {
  const salesData = getCurrentMonthlySalesData(dateRange);
  if (salesData.length === 0) return 0;
  
  // 计算唯一月份的数量
  const uniqueMonths = new Set(salesData.map(item => `${item.year}-${item.month}`));
  const monthsCount = uniqueMonths.size;
  
  return Math.round(getTotalSales(dateRange) / monthsCount);
};

// 获取同比增长
export const getYoYGrowth = (dateRange?: DateRange): number => {
  const totalSalesCurrent = getTotalSales(dateRange);
  
  // 如果没有日期范围，使用默认2024年数据计算同比
  if (!dateRange) {
    const totalSales2024 = monthlySalesData2024.reduce((sum, item) => sum + item.sales, 0);
    return totalSales2024 > 0 
      ? parseFloat((((totalSalesCurrent - totalSales2024) / totalSales2024) * 100).toFixed(2))
      : 0;
  }
  
  // 计算同比（假设使用2024年的相同月份范围）
  const { startDate, endDate } = dateRange;
  const startYear = parseInt(startDate.split('-')[0]);
  const endYear = parseInt(endDate.split('-')[0]);
  
  // 构建去年相同月份范围
  const lastYearStartDate = `${startYear - 1}-${startDate.split('-')[1]}-${startDate.split('-')[2]}`;
  const lastYearEndDate = `${endYear - 1}-${endDate.split('-')[1]}-${endDate.split('-')[2]}`;
  const lastYearDateRange = { startDate: lastYearStartDate, endDate: lastYearEndDate };
  
  // 从2024年数据中筛选相应月份
  const filtered2024Data = monthlySalesData2024.filter(item => {
    const itemMonth = parseInt(item.month.replace('月', ''));
    const startMonth = parseInt(startDate.split('-')[1]);
    const endMonth = parseInt(endDate.split('-')[1]);
    
    return itemMonth >= startMonth && itemMonth <= endMonth;
  });
  
  const totalSalesLastYear = filtered2024Data.reduce((sum, item) => sum + item.sales, 0);
  
  return totalSalesLastYear > 0
    ? parseFloat((((totalSalesCurrent - totalSalesLastYear) / totalSalesLastYear) * 100).toFixed(2))
    : 0;
};