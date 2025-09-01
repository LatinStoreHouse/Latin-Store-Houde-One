
export interface MonthlySales {
  [advisorName: string]: {
    [month: string]: // YYYY-MM format
      {
        sales: number;
      }
  };
}

export const initialSalesData: MonthlySales = {
  'Jane Smith': {
    '2024-07': { sales: 150000000 },
    '2024-06': { sales: 120000000 },
  },
  'John Doe': {
    '2024-07': { sales: 180000000 },
    '2024-06': { sales: 165000000 },
  },
  'Peter Jones': {
    '2024-07': { sales: 95000000 },
    '2024-06': { sales: 110000000 },
  }
};
