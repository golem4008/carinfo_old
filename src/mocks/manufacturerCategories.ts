// 传统厂商和新势力厂商分类配置
export interface ManufacturerCategories {
  traditional: string[];  // 传统厂商列表
  newEnergy: string[];    // 新势力厂商列表
}

// 厂商分类配置数据
export const manufacturerCategories: ManufacturerCategories = {
  traditional: ['大众', '丰田', '本田'],
  newEnergy: ['特斯拉', '比亚迪', '吉利', '理想']
};

// 可以根据需要扩展更多分类方法
export const getManufacturerCategory = (manufacturer: string): string => {
  if (manufacturerCategories.traditional.includes(manufacturer)) {
    return 'traditional';
  } else if (manufacturerCategories.newEnergy.includes(manufacturer)) {
    return 'newEnergy';
  }
  return 'other';
};

// 获取分类的显示名称
export const getCategoryDisplayName = (category: string): string => {
  switch (category) {
    case 'traditional':
      return '传统厂商';
    case 'newEnergy':
      return '新势力厂商';
    default:
      return '其他厂商';
  }
};