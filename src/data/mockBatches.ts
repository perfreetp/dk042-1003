import type { Batch } from '@/types';

export const mockBatches: Batch[] = [
  {
    id: 'batch-001',
    recallTaskId: 'recall-001',
    batchNumber: '20240315A',
    productionDate: '2024-03-15',
    expiryDate: '2026-03-14',
    quantity: 50000,
    productName: '布洛芬缓释胶囊',
    specification: '0.3g*20粒/盒',
  },
  {
    id: 'batch-002',
    recallTaskId: 'recall-001',
    batchNumber: '20240316A',
    productionDate: '2024-03-16',
    expiryDate: '2026-03-15',
    quantity: 45000,
    productName: '布洛芬缓释胶囊',
    specification: '0.3g*20粒/盒',
  },
  {
    id: 'batch-003',
    recallTaskId: 'recall-002',
    batchNumber: '20240402B',
    productionDate: '2024-04-02',
    expiryDate: '2026-04-01',
    quantity: 80000,
    productName: '阿莫西林胶囊',
    specification: '0.25g*24粒/盒',
  },
  {
    id: 'batch-004',
    recallTaskId: 'recall-002',
    batchNumber: '20240403B',
    productionDate: '2024-04-03',
    expiryDate: '2026-04-02',
    quantity: 65000,
    productName: '阿莫西林胶囊',
    specification: '0.25g*24粒/盒',
  },
  {
    id: 'batch-005',
    recallTaskId: 'recall-003',
    batchNumber: '20240501C',
    productionDate: '2024-05-01',
    expiryDate: '2026-04-30',
    quantity: 120000,
    productName: '复方感冒灵颗粒',
    specification: '14g*15袋/盒',
  },
  {
    id: 'batch-006',
    recallTaskId: 'recall-004',
    batchNumber: '20240228D',
    productionDate: '2024-02-28',
    expiryDate: '2026-02-27',
    quantity: 75000,
    productName: '维生素C片',
    specification: '100mg*100片/瓶',
  },
  {
    id: 'batch-007',
    recallTaskId: 'recall-005',
    batchNumber: '20240610E',
    productionDate: '2024-06-10',
    expiryDate: '2026-06-09',
    quantity: 90000,
    productName: '奥美拉唑肠溶胶囊',
    specification: '20mg*14粒/盒',
  },
  {
    id: 'batch-008',
    recallTaskId: 'recall-006',
    batchNumber: '20240705F',
    productionDate: '2024-07-05',
    expiryDate: '2026-07-04',
    quantity: 40000,
    productName: '头孢克洛分散片',
    specification: '0.25g*6片/盒',
  },
  {
    id: 'batch-009',
    recallTaskId: 'recall-006',
    batchNumber: '20240706F',
    productionDate: '2024-07-06',
    expiryDate: '2026-07-05',
    quantity: 35000,
    productName: '头孢克洛分散片',
    specification: '0.25g*6片/盒',
  },
  {
    id: 'batch-010',
    recallTaskId: 'recall-007',
    batchNumber: '20240812G',
    productionDate: '2024-08-12',
    expiryDate: '2026-08-11',
    quantity: 100000,
    productName: '盐酸二甲双胍片',
    specification: '0.5g*30片/盒',
  },
];

export const getBatchesByRecallId = (recallTaskId: string): Batch[] => {
  return mockBatches.filter((b) => b.recallTaskId === recallTaskId);
};

export const getBatchById = (id: string): Batch | undefined => {
  return mockBatches.find((b) => b.id === id);
};

export const getBatchByNumber = (batchNumber: string): Batch | undefined => {
  return mockBatches.find((b) => b.batchNumber === batchNumber);
};
