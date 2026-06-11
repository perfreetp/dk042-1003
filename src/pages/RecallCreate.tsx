import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecallStore } from '@/store/useRecallStore';
import { useBatchStore } from '@/store/useBatchStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { RiskBadge } from '@/components/common/RiskBadge';
import { useAuth } from '@/hooks/useAuth';
import { getDistributors, getStores } from '@/data/mockUsers';
import type { RiskLevel, TaskStatus, Batch, User } from '@/types';
import {
  ArrowLeft,
  Save,
  Send,
  AlertTriangle,
  AlertCircle,
  Info,
  Plus,
  Trash2,
  ChevronRight,
  Check,
} from 'lucide-react';

export const RecallCreate = () => {
  const navigate = useNavigate();
  const { createRecall } = useRecallStore();
  const { addBatch } = useBatchStore();
  const { sendNotifications } = useNotificationStore();
  const { currentUser, canCreateRecall } = useAuth();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel>('medium');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [batches, setBatches] = useState<Partial<Batch>[]>([
    { productName: '', batchNumber: '', productionDate: '', expiryDate: '', quantity: 0, specification: '' },
  ]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const distributors = getDistributors();
  const stores = getStores();
  const allRecipients: User[] = [...distributors, ...stores];

  if (!canCreateRecall()) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">权限不足</h2>
        <p className="text-slate-500">只有药企角色可以发起召回任务</p>
      </div>
    );
  }

  const handleAddBatch = () => {
    setBatches([
      ...batches,
      { productName: '', batchNumber: '', productionDate: '', expiryDate: '', quantity: 0, specification: '' },
    ]);
  };

  const handleRemoveBatch = (index: number) => {
    if (batches.length > 1) {
      setBatches(batches.filter((_, i) => i !== index));
    }
  };

  const handleBatchChange = (index: number, field: keyof Batch, value: string | number) => {
    const newBatches = [...batches];
    newBatches[index] = { ...newBatches[index], [field]: value };
    setBatches(newBatches);
  };

  const toggleRecipient = (userId: string) => {
    setSelectedRecipients((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectAll = () => {
    setSelectedRecipients(allRecipients.map((u) => u.id));
  };

  const deselectAll = () => {
    setSelectedRecipients([]);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return title.trim() && reason.trim() && description.trim();
      case 2:
        return batches.every(
          (b) =>
            b.productName?.trim() &&
            b.batchNumber?.trim() &&
            b.productionDate &&
            b.expiryDate &&
            b.quantity &&
            b.quantity > 0
        );
      case 3:
        return selectedRecipients.length > 0;
      default:
        return false;
    }
  };

  const handleSubmit = async (sendNow: boolean) => {
    setSubmitting(true);
    try {
      const newTask = {
        title,
        reason,
        description,
        riskLevel,
        deadline,
        status: sendNow ? ('in_progress' as TaskStatus) : ('draft' as TaskStatus),
      };

      const taskId = createRecall(newTask);

      batches.forEach((batch) => {
        addBatch({
          ...batch,
          recallTaskId: taskId,
          quantity: batch.quantity || 0,
          specification: batch.specification || '',
        } as Omit<Batch, 'id'>);
      });

      if (sendNow) {
        sendNotifications(taskId, selectedRecipients);
      }

      navigate(`/recalls/${taskId}`);
    } finally {
      setSubmitting(false);
    }
  };

  const riskOptions = [
    { value: 'high' as RiskLevel, icon: AlertTriangle, label: '高风险', desc: '可能造成严重健康危害' },
    { value: 'medium' as RiskLevel, icon: AlertCircle, label: '中风险', desc: '可能造成暂时或可逆健康危害' },
    { value: 'low' as RiskLevel, icon: Info, label: '低风险', desc: '不太可能造成健康危害' },
  ];

  const steps = [
    { num: 1, title: '基本信息' },
    { num: 2, title: '批次信息' },
    { num: 3, title: '通知对象' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/')}>
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">发起召回</h1>
          <p className="text-slate-500 mt-1">填写召回任务信息，通知相关单位协同处理</p>
        </div>
      </div>

      <div className="flex items-center justify-center py-4">
        {steps.map((s, index) => (
          <div key={s.num} className="flex items-center">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                step >= s.num
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-500'
              } transition-all duration-200`}
            >
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold bg-white/20">
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </span>
              <span className="font-medium text-sm">{s.title}</span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-6 h-6 text-slate-300 mx-2" />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>召回基本信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="召回任务名称"
              placeholder="请输入召回任务名称"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Input
              label="召回原因"
              placeholder="请简要说明召回原因"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                详细说明
              </label>
              <textarea
                placeholder="请详细描述召回原因、影响范围和处理要求"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                风险等级
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {riskOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRiskLevel(option.value)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        riskLevel === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <RiskBadge level={option.value} />
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-1">{option.label}</p>
                      <p className="text-xs text-slate-500">{option.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <Input
              label="反馈截止日期"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>召回批次信息</CardTitle>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={handleAddBatch}
            >
              添加批次
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {batches.map((batch, index) => (
              <div
                key={index}
                className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative"
              >
                {batches.length > 1 && (
                  <button
                    onClick={() => handleRemoveBatch(index)}
                    className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <h3 className="font-medium text-slate-700 mb-4">批次 {index + 1}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="产品名称"
                    placeholder="如：布洛芬缓释胶囊"
                    value={batch.productName}
                    onChange={(e) => handleBatchChange(index, 'productName', e.target.value)}
                  />
                  <Input
                    label="规格"
                    placeholder="如：0.3g*20粒/盒"
                    value={batch.specification}
                    onChange={(e) => handleBatchChange(index, 'specification', e.target.value)}
                  />
                  <Input
                    label="生产批号"
                    placeholder="如：20240315A"
                    value={batch.batchNumber}
                    onChange={(e) => handleBatchChange(index, 'batchNumber', e.target.value)}
                  />
                  <Input
                    label="生产日期"
                    type="date"
                    value={batch.productionDate}
                    onChange={(e) => handleBatchChange(index, 'productionDate', e.target.value)}
                  />
                  <Input
                    label="有效期至"
                    type="date"
                    value={batch.expiryDate}
                    onChange={(e) => handleBatchChange(index, 'expiryDate', e.target.value)}
                  />
                  <Input
                    label="召回数量（盒）"
                    type="number"
                    min="1"
                    value={batch.quantity || ''}
                    onChange={(e) => handleBatchChange(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>选择通知对象</CardTitle>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={selectAll}>
                全选
              </Button>
              <Button variant="ghost" size="sm" onClick={deselectAll}>
                取消
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                {selectedRecipients.length}
              </div>
              <div>
                <p className="font-medium text-blue-700">已选择通知对象</p>
                <p className="text-sm text-blue-600">共 {selectedRecipients.length} 个单位将收到召回通知</p>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full" />
                经销商
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {distributors.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggleRecipient(user.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedRecipients.includes(user.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-700">{user.name}</p>
                        <p className="text-sm text-slate-500">
                          {user.province} · {user.contact}
                        </p>
                      </div>
                      {selectedRecipients.includes(user.id) && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-slate-700 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-teal-500 rounded-full" />
                门店
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {stores.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggleRecipient(user.id)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedRecipients.includes(user.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-700">{user.name}</p>
                        <p className="text-sm text-slate-500">
                          {user.channel} · {user.city}
                        </p>
                      </div>
                      {selectedRecipients.includes(user.id) && (
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={() => navigate('/')}>
          取消
        </Button>
        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)}>
              上一步
            </Button>
          )}
          {step < 3 ? (
            <Button disabled={!canProceed()} onClick={() => setStep(step + 1)}>
              下一步
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                leftIcon={<Save className="w-4 h-4" />}
                loading={submitting}
                onClick={() => handleSubmit(false)}
              >
                保存草稿
              </Button>
              <Button
                leftIcon={<Send className="w-4 h-4" />}
                loading={submitting}
                onClick={() => handleSubmit(true)}
                disabled={!canProceed()}
              >
                发送通知
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
