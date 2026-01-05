import axiosInstance from './axiosConfig';

export interface DashboardStats {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  totalClients: number;
  totalEmployees: number;
  totalInvestments: number;
  recentSales: any[];
  topProducts: any[];
  salesByCategory: any[];
  monthlyRevenue: any[];
}

export const dashboardApi = {
  getStats: () => axiosInstance.get<DashboardStats>('/dashboard/stats'),
  
  getSalesTrends: (period: string) => 
    axiosInstance.get(`/dashboard/sales-trends?period=${period}`),
  
  getTopProducts: (limit: number = 5) => 
    axiosInstance.get(`/dashboard/top-products?limit=${limit}`),
  
  getCategoryAnalysis: () => 
    axiosInstance.get('/dashboard/category-analysis'),
};
