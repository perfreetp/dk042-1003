import type { RecallTask } from '@/types';

export const mockRecalls: RecallTask[] = [
  {
    id: 'recall-001',
    title: '布洛芬缓释胶囊批次召回',
    reason: '经检验发现该批次药品含量测定不符合标准规定',
    riskLevel: 'high',
    description:
      '针对批次20240315A的布洛芬缓释胶囊，经第三方检测机构检验，有效成分含量低于标准要求，可能影响治疗效果。请各相关单位立即停止销售该批次产品，并按照召回流程完成回收工作。',
    status: 'in_progress',
    deadline: '2026-06-20',
    createdAt: '2026-06-10 09:30:00',
    updatedAt: '2026-06-11 14:20:00',
    creatorId: 'u001',
    creatorName: '华润制药集团',
  },
  {
    id: 'recall-002',
    title: '阿莫西林胶囊包装缺陷召回',
    reason: '部分产品包装存在密封不严问题，可能导致药品受潮',
    riskLevel: 'medium',
    description:
      '近期收到多起门店反馈，批次20240402B的阿莫西林胶囊外包装存在密封不严的情况。为确保药品质量安全，决定对该批次产品实施主动召回。请各单位检查库存，对问题产品进行隔离并按流程退回。',
    status: 'in_progress',
    deadline: '2026-06-25',
    createdAt: '2026-06-08 14:15:00',
    updatedAt: '2026-06-11 10:30:00',
    creatorId: 'u001',
    creatorName: '华润制药集团',
  },
  {
    id: 'recall-003',
    title: '复方感冒灵颗粒说明书更正',
    reason: '药品说明书中用法用量表述需要更正',
    riskLevel: 'low',
    description:
      '经核查，批次20240501C的复方感冒灵颗粒药品说明书中，儿童用法用量表述不够准确。为避免误导患者用药，现对该批次产品进行主动召回，更换正确的说明书后重新上市。',
    status: 'completed',
    deadline: '2026-06-05',
    createdAt: '2026-05-25 08:45:00',
    updatedAt: '2026-06-06 16:30:00',
    creatorId: 'u002',
    creatorName: '扬子江药业',
  },
  {
    id: 'recall-004',
    title: '维生素C片外观异常排查',
    reason: '个别药片出现颜色异常变化',
    riskLevel: 'medium',
    description:
      '近期质量巡检中发现，批次20240228D的维生素C片中有个别药片出现颜色异常。经初步分析，可能是储存过程中光照影响所致。为确保产品质量，决定对该批次进行全面召回检查。',
    status: 'pending',
    deadline: '2026-06-30',
    createdAt: '2026-06-11 08:00:00',
    updatedAt: '2026-06-11 08:00:00',
    creatorId: 'u001',
    creatorName: '华润制药集团',
  },
  {
    id: 'recall-005',
    title: '奥美拉唑肠溶胶囊质量回顾',
    reason: '年度质量回顾中发现溶出度数据波动',
    riskLevel: 'low',
    description:
      '在2024年度产品质量回顾分析中，发现批次20240610E的奥美拉唑肠溶胶囊溶出度数据存在轻微波动。虽然仍在合格范围内，但为确保产品质量的均一性，决定对该批次进行预防性召回。',
    status: 'closed',
    deadline: '2026-05-20',
    createdAt: '2026-05-05 10:20:00',
    updatedAt: '2026-05-25 11:15:00',
    creatorId: 'u002',
    creatorName: '扬子江药业',
  },
  {
    id: 'recall-006',
    title: '头孢克洛分散片杂质超标',
    reason: '有关物质检测项超出限度标准',
    riskLevel: 'high',
    description:
      '紧急通知：批次20240705F的头孢克洛分散片在最新抽检中发现有关物质含量超过药典标准限度。请各单位立即采取行动，停止销售、封存库存，并配合召回工作。对已售出产品，务必通知消费者停止使用并办理退换货。',
    status: 'in_progress',
    deadline: '2026-06-15',
    createdAt: '2026-06-09 16:30:00',
    updatedAt: '2026-06-11 15:45:00',
    creatorId: 'u001',
    creatorName: '华润制药集团',
  },
  {
    id: 'recall-007',
    title: '盐酸二甲双胍片标签错误',
    reason: '药品标签打印错误，规格标注有误',
    riskLevel: 'medium',
    description:
      '近日发现批次20240812G的盐酸二甲双胍片包装标签存在印刷错误，0.5g规格误印为0.25g。为避免临床用药差错，现紧急召回该批次全部产品，请各单位认真核对，确保问题产品全部回收。',
    status: 'completed',
    deadline: '2026-05-30',
    createdAt: '2026-05-15 09:10:00',
    updatedAt: '2026-06-02 14:20:00',
    creatorId: 'u002',
    creatorName: '扬子江药业',
  },
];

export const getRecallById = (id: string): RecallTask | undefined => {
  return mockRecalls.find((r) => r.id === id);
};

export const getRecallsByStatus = (status: string): RecallTask[] => {
  return mockRecalls.filter((r) => r.status === status);
};

export const getRecallsByCreator = (creatorId: string): RecallTask[] => {
  return mockRecalls.filter((r) => r.creatorId === creatorId);
};

export const getActiveRecalls = (): RecallTask[] => {
  return mockRecalls.filter((r) => r.status !== 'closed');
};

export const getCompletedRecalls = (): RecallTask[] => {
  return mockRecalls.filter((r) => r.status === 'completed' || r.status === 'closed');
};
