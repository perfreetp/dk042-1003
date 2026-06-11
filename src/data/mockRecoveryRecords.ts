import type { RecoveryRecord } from '@/types';

const samplePhotos = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pharmacy%20medicine%20storage%20room%20with%20shelves%20of%20drug%20boxes%20professional%20lighting&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=recalled%20medicine%20packages%20organized%20in%20cartons%20ready%20for%20return&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=pharmacy%20staff%20checking%20medicine%20batch%20numbers%20inventory&image_size=square',
];

export const mockRecoveryRecords: RecoveryRecord[] = [
  {
    id: 'record-001',
    recallTaskId: 'recall-001',
    notificationId: 'notif-001',
    unitId: 'd001',
    unitRole: 'distributor',
    unitName: '国药控股江苏有限公司',
    unitRegion: '江苏省南京市',
    stockQuantity: 5000,
    soldQuantity: 3200,
    recoveredQuantity: 4850,
    notes: '已完成库存盘点和回收工作，剩余未回收的150盒已通知下游门店正在追回中。库存药品已单独存放，等待上门回收。',
    submittedAt: '2026-06-11 10:30:00',
    photos: [samplePhotos[0], samplePhotos[1]],
  },
  {
    id: 'record-002',
    recallTaskId: 'recall-001',
    notificationId: 'notif-004',
    unitId: 's001',
    unitRole: 'store',
    unitName: '益丰大药房南京新街口店',
    unitRegion: '江苏省南京市',
    stockQuantity: 200,
    soldQuantity: 156,
    recoveredQuantity: 198,
    notes: '已下架该批次所有产品，通过会员系统通知了购买顾客，已回收198盒，另有2盒顾客表示愿意退回，预计明天完成。',
    submittedAt: '2026-06-10 16:20:00',
    photos: [samplePhotos[2]],
  },
  {
    id: 'record-003',
    recallTaskId: 'recall-001',
    notificationId: 'notif-006',
    unitId: 's003',
    unitRole: 'store',
    unitName: '大参林药店无锡崇安寺店',
    unitRegion: '江苏省无锡市',
    stockQuantity: 180,
    soldQuantity: 95,
    recoveredQuantity: 175,
    notes: '完成召回，库存全部封存，已销售的通过电话通知客户，追回了大部分。',
    submittedAt: '2026-06-11 09:15:00',
    photos: [samplePhotos[1]],
  },
  {
    id: 'record-004',
    recallTaskId: 'recall-002',
    notificationId: 'notif-010',
    unitId: 's001',
    unitRole: 'store',
    unitName: '益丰大药房南京新街口店',
    unitRegion: '江苏省南京市',
    stockQuantity: 350,
    soldQuantity: 120,
    recoveredQuantity: 345,
    notes: '检查了库存，发现部分包装确实存在密封问题，已全部下架。售出产品正在积极联系顾客退回。',
    submittedAt: '2026-06-10 14:30:00',
    photos: [samplePhotos[0], samplePhotos[2]],
  },
  {
    id: 'record-005',
    recallTaskId: 'recall-002',
    notificationId: 'notif-012',
    unitId: 'd004',
    unitRole: 'distributor',
    unitName: '九州通医药集团',
    unitRegion: '湖北省武汉市',
    stockQuantity: 8000,
    soldQuantity: 4500,
    recoveredQuantity: 7800,
    notes: '仓库库存已全部封存，正在协调下游客户退回，预计3天内完成全部回收。',
    submittedAt: '2026-06-10 11:20:00',
    photos: [samplePhotos[0]],
  },
  {
    id: 'record-006',
    recallTaskId: 'recall-006',
    notificationId: 'notif-014',
    unitId: 'd002',
    unitRole: 'distributor',
    unitName: '上药控股江苏有限公司',
    unitRegion: '江苏省苏州市',
    stockQuantity: 3500,
    soldQuantity: 1800,
    recoveredQuantity: 3200,
    notes: '接到紧急通知后立即停止发货，库存已全部清点。已发出的正在紧急追回，部分客户已经退回。',
    submittedAt: '2026-06-10 15:45:00',
    photos: [samplePhotos[1], samplePhotos[2]],
  },
  {
    id: 'record-007',
    recallTaskId: 'recall-003',
    notificationId: 'notif-000',
    unitId: 'd001',
    unitRole: 'distributor',
    unitName: '国药控股江苏有限公司',
    unitRegion: '江苏省南京市',
    stockQuantity: 12000,
    soldQuantity: 8500,
    recoveredQuantity: 11800,
    notes: '已完成全部回收，旧说明书已销毁，更换新说明书后重新入库待销售。',
    submittedAt: '2026-06-02 10:00:00',
    photos: [samplePhotos[0]],
  },
  {
    id: 'record-008',
    recallTaskId: 'recall-003',
    notificationId: 'notif-000',
    unitId: 's001',
    unitRole: 'store',
    unitName: '益丰大药房南京新街口店',
    unitRegion: '江苏省南京市',
    stockQuantity: 500,
    soldQuantity: 380,
    recoveredQuantity: 490,
    notes: '配合经销商完成了说明书更换工作，产品已重新上架销售。',
    submittedAt: '2026-06-01 16:30:00',
    photos: [samplePhotos[2]],
  },
];

export const getRecordsByRecallId = (recallTaskId: string): RecoveryRecord[] => {
  return mockRecoveryRecords.filter((r) => r.recallTaskId === recallTaskId);
};

export const getRecordsByUnit = (unitId: string): RecoveryRecord[] => {
  return mockRecoveryRecords.filter((r) => r.unitId === unitId);
};

export const getRecordById = (id: string): RecoveryRecord | undefined => {
  return mockRecoveryRecords.find((r) => r.id === id);
};

export const getRecordsByRegion = (region: string): RecoveryRecord[] => {
  return mockRecoveryRecords.filter((r) => r.unitRegion.includes(region));
};
