import { useState } from 'react';
import { useBatchStore } from '@/store/useBatchStore';
import { useRecallStore } from '@/store/useRecallStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { RiskBadge } from '@/components/common/RiskBadge';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatNumber } from '@/utils/formatUtils';
import type { Batch } from '@/types';
import { Package, Plus, Edit2, Trash2, Search, AlertTriangle } from 'lucide-react';

export const BatchManagement = () => {
  const { batches, addBatch, updateBatch, deleteBatch } = useBatchStore();
  const { recalls } = useRecallStore();
  const { canCreateRecall } = useAuth();
  const [keyword, setKeyword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [formData, setFormData] = useState<Partial<Batch>>({
    productName: '',
    specification: '',
    batchNumber: '',
    productionDate: '',
    expiryDate: '',
    quantity: 0,
    recallTaskId: '',
  });

  const filteredBatches = batches.filter(
    (b) =>
      b.productName.includes(keyword) ||
      b.batchNumber.includes(keyword) ||
      b.specification?.includes(keyword)
  );

  const handleAdd = () => {
    setEditingBatch(null);
    setFormData({
      productName: '',
      specification: '',
      batchNumber: '',
      productionDate: '',
      expiryDate: '',
      quantity: 0,
      recallTaskId: recalls[0]?.id || '',
    });
    setShowModal(true);
  };

  const handleEdit = (batch: Batch) => {
    setEditingBatch(batch);
    setFormData(batch);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除该批次吗？')) {
      deleteBatch(id);
    }
  };

  const handleSubmit = () => {
    if (editingBatch) {
      updateBatch(editingBatch.id, formData);
    } else {
      addBatch(formData as Omit<Batch, 'id'>);
    }
    setShowModal(false);
  };

  const getRecallInfo = (recallTaskId: string) => {
    return recalls.find((r) => r.id === recallTaskId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">批次范围</h1>
          <p className="text-slate-500 mt-1">管理所有召回批次信息，追踪产品流向</p>
        </div>
        {canCreateRecall() && (
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={handleAdd}>
            添加批次
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
        <Input
          placeholder="搜索产品名称、批号、规格..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">产品信息</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">生产批号</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">生产日期</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">有效期至</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">召回数量</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-slate-600">关联任务</th>
                  {canCreateRecall() && (
                    <th className="text-right py-4 px-6 text-sm font-semibold text-slate-600">操作</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                      <p className="text-slate-500">暂无批次数据</p>
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((batch) => {
                    const recall = getRecallInfo(batch.recallTaskId);
                    return (
                      <tr
                        key={batch.id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <p className="font-medium text-slate-800">{batch.productName}</p>
                          <p className="text-sm text-slate-500">{batch.specification}</p>
                        </td>
                        <td className="py-4 px-6 font-mono text-slate-700">{batch.batchNumber}</td>
                        <td className="py-4 px-6 text-slate-600">{formatDate(batch.productionDate)}</td>
                        <td className="py-4 px-6 text-slate-600">{formatDate(batch.expiryDate)}</td>
                        <td className="py-4 px-6 font-medium text-slate-800">
                          {formatNumber(batch.quantity)} 盒
                        </td>
                        <td className="py-4 px-6">
                          {recall ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-slate-700">{recall.title}</span>
                              <RiskBadge level={recall.riskLevel} size="sm" />
                            </div>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        {canCreateRecall() && (
                          <td className="py-4 px-6">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<Edit2 className="w-4 h-4" />}
                                onClick={() => handleEdit(batch)}
                              >
                                编辑
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                leftIcon={<Trash2 className="w-4 h-4" />}
                                onClick={() => handleDelete(batch.id)}
                              >
                                删除
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingBatch ? '编辑批次' : '添加批次'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowModal(false)}>
              取消
            </Button>
            <Button onClick={handleSubmit}>{editingBatch ? '保存修改' : '添加批次'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="产品名称"
              placeholder="如：布洛芬缓释胶囊"
              value={formData.productName}
              onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            />
            <Input
              label="规格"
              placeholder="如：0.3g*20粒/盒"
              value={formData.specification}
              onChange={(e) => setFormData({ ...formData, specification: e.target.value })}
            />
          </div>
          <Input
            label="生产批号"
            placeholder="如：20240315A"
            value={formData.batchNumber}
            onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="生产日期"
              type="date"
              value={formData.productionDate}
              onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })}
            />
            <Input
              label="有效期至"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />
          </div>
          <Input
            label="召回数量（盒）"
            type="number"
            min="1"
            value={formData.quantity || ''}
            onChange={(e) =>
              setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
            }
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">关联召回任务</label>
            <select
              value={formData.recallTaskId}
              onChange={(e) => setFormData({ ...formData, recallTaskId: e.target.value })}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {recalls.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
