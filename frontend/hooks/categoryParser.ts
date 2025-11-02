export interface CategoryLevel {
  top: string;           // Level đầu tiên
  mid: string;           // Level thứ hai
  sublevel1: string;     // Level thứ ba
  sublevel2: string;     // Level thứ tư
  leaf: string;          // Level cuối cùng
  allLevels: string[];   // Tất cả các level (mới)
}

export interface ParsedCategory {
  full: string;          // Original string
  path: string[];        // Array of all levels
  levels: CategoryLevel;
  breadcrumb: string;    // "Computers & Accessories > Accessories & Peripherals > ..."
}

/**
 * Parse category string từ format: 'Level1|Level2|Level3|...|LevelN'
 * Chỉ lấy 4 level đầu và level cuối cùng
 */
export const parseCategoryString = (categoryStr: string): ParsedCategory => {
  const parts = categoryStr.split('|').filter(p => p.trim());
  
  // Lấy 4 level đầu và level cuối cùng
  const top = parts[0] || '';
  const mid = parts[1] || '';
  const sublevel1 = parts[2] || '';
  const sublevel2 = parts[3] || '';
  const leaf = parts[parts.length - 1] || '';
  
  // Tạo breadcrumb với tối đa 5 phần (4 đầu + 1 cuối)
  let breadcrumbParts: string[] = [];
  if (parts.length <= 5) {
    breadcrumbParts = parts;
  } else {
    // Nếu nhiều hơn 5 level, chỉ lấy 4 đầu + 1 cuối, thêm "..." ở giữa
    breadcrumbParts = [
      ...parts.slice(0, 4),
      '...',
      parts[parts.length - 1]
    ];
  }

  return {
    full: categoryStr,
    path: parts,
    levels: {
      top,
      mid,
      sublevel1,
      sublevel2,
      leaf,
      allLevels: parts // Giữ lại tất cả levels để dùng khi cần
    },
    breadcrumb: breadcrumbParts
      .map(cat => formatCategoryName(cat))
      .join(' > ')
  };
};

/**
 * Format category name: "USBCable" → "USB Cable"
 */
export const formatCategoryName = (name: string): string => {
  if (!name || name === '...') return name;
  
  return name
    .replace(/&/g, ' & ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')  // camelCase → spaces
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // ACRONYM handling
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .trim();
};

/**
 * Extract display names for breadcrumb (giới hạn số lượng)
 */
export const getCategoryBreadcrumb = (categoryStr: string): string[] => {
  const parsed = parseCategoryString(categoryStr);
  return parsed.breadcrumb.split(' > ');
};

/**
 * Get only main category (top level)
 */
export const getMainCategory = (categoryStr: string): string => {
  const parts = categoryStr.split('|');
  return formatCategoryName(parts[0] || '');
};

/**
 * Get leaf category (most specific)
 */
export const getLeafCategory = (categoryStr: string): string => {
  const parts = categoryStr.split('|');
  return formatCategoryName(parts[parts.length - 1] || '');
};

/**
 * Get simplified category path (4 đầu + 1 cuối)
 */
export const getSimplifiedCategoryPath = (categoryStr: string): string[] => {
  const parts = categoryStr.split('|').filter(p => p.trim());
  
  if (parts.length <= 5) {
    return parts.map(formatCategoryName);
  }
  
  return [
    ...parts.slice(0, 4).map(formatCategoryName),
    '...',
    formatCategoryName(parts[parts.length - 1])
  ];
};

/**
 * Check if category matches search (tìm kiếm trên tất cả levels)
 */
export const searchInCategory = (categoryStr: string, searchTerm: string): boolean => {
  const parts = categoryStr.split('|');
  return parts.some(part => 
    formatCategoryName(part).toLowerCase().includes(searchTerm.toLowerCase())
  );
};