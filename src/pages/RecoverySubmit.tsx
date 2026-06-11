import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecallStore } from '@/store/useRecallStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useRecoveryStore } from '@/store/useRecoveryStore';
import { useOperationLogStore } from '@/store/useOperationLogStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { RiskBadge } from '@/components/common/RiskBadge';
import { ProgressBar } from '@/components/common/ProgressBar';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatPercent, formatNumber } from '@/utils/formatUtils';
import type { RecoveryRecord } from '@/types';
import {
  ArrowLeft,
  Package,
  Save,
  Upload,
  X,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Calendar,
  Camera,
  Edit3,
} from 'lucide-react';

export const RecoverySubmit = () => {
  const { notificationId = '' } = useParams();
  const navigate = useNavigate();
  const { getRecallById } = useRecallStore();
  const { getNotificationById, markAsSubmitted, markAsRead } = useNotificationStore();
  const { getRecoveryRecordByNotificationId, submitRecord, saveDraft } = useRecoveryStore();
  const { addOperationLog } = useOperationLogStore();
  const { currentUser } = useAuth();

  const notification = getNotificationById(notificationId);
  const recall = notification ? getRecallById(notification.recallTaskId) : null;
  const existingRecord = getRecoveryRecordByNotificationId(notificationId);

  useEffect(() => {
    if (notification && notification.status === 'unread') {
      markAsRead(notificationId);
    }
  }, [notification, notificationId, markAsRead]);

  const [stockQuantity, setStockQuantity] = useState(existingRecord?.stockQuantity || 0);
  const [soldQuantity, setSoldQuantity] = useState(existingRecord?.soldQuantity || 0);
  const [recoveredQuantity, setRecoveredQuantity] = useState(existingRecord?.recoveredQuantity || 0);
  const [notes, setNotes] = useState(existingRecord?.notes || '');
  const [photos, setPhotos] = useState<string[]>(existingRecord?.photos || []);
  const [submitting, setSubmitting] = useState(false);

  if (!notification || !recall) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">通知不存在</h2>
        <p className="text-slate-500 mb-6">未找到该通知信息</p>
        <Button leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/notifications')}>
          返回通知列表
        </Button>
      </div>
    );
  }

  if (notification.status === 'submitted' && !existingRecord?.isDraft) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/notifications')}>
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">回收登记详情</h1>
            <p className="text-slate-500 mt-1">您已完成本次召回的回收登记</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>召回任务信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <RiskBadge level={recall.riskLevel} />
              <h3 className="text-xl font-bold text-slate-800">{recall.title}</h3>
            </div>
            <p className="text-slate-600">{recall.reason}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">详细说明</p>
                  <p className="text-slate-700">{recall.description}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">截止日期</p>
                  <p className="font-medium text-slate-700">{formatDate(recall.deadline)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Package className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-500">发送时间</p>
                  <p className="font-medium text-slate-700">{formatDate(notification.sentAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {existingRecord && (
          <Card>
            <CardHeader>
              <CardTitle>已提交的回收信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-sm text-blue-600 mb-1">库存数量</p>
                  <p className="text-2xl font-bold text-blue-700">{formatNumber(existingRecord.stockQuantity)}</p>
                  <p className="text-xs text-blue-500">盒</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-xl">
                  <p className="text-sm text-amber-600 mb-1">已售数量</p>
                  <p className="text-2xl font-bold text-amber-700">{formatNumber(existingRecord.soldQuantity)}</p>
                  <p className="text-xs text-amber-500">盒</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-sm text-green-600 mb-1">已回收数量</p>
                  <p className="text-2xl font-bold text-green-700">{formatNumber(existingRecord.recoveredQuantity)}</p>
                  <p className="text-xs text-green-500">盒</p>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-xl">
                  <p className="text-sm text-teal-600 mb-1">回收率</p>
                  <p className="text-2xl font-bold text-teal-700">
                    {formatPercent(
                      existingRecord.recoveredQuantity,
                      existingRecord.stockQuantity + existingRecord.soldQuantity
                    )}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">回收率进度</span>
                  <span className="text-sm font-medium text-slate-700">
                    {formatPercent(
                      existingRecord.recoveredQuantity,
                      existingRecord.stockQuantity + existingRecord.soldQuantity
                    )}
                  </span>
                </div>
                <ProgressBar
                  value={existingRecord.recoveredQuantity}
                  max={existingRecord.stockQuantity + existingRecord.soldQuantity || 1}
                  colorScheme="green"
                />
              </div>
              {existingRecord.notes && (
                <div className="p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">补充说明</p>
                  <p className="text-slate-700">{existingRecord.notes}</p>
                </div>
              )}
              {existingRecord.photos.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 mb-3">处理照片</p>
                  <div className="flex gap-3 flex-wrap">
                    {existingRecord.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo}
                        alt={`处理照片 ${index + 1}`}
                        className="w-32 h-24 object-cover rounded-lg border border-slate-200"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <div>
                  <p className="font-medium text-green-700">已提交</p>
                  <p className="text-sm text-green-600">提交时间：{formatDate(existingRecord.submittedAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  const totalQuantity = stockQuantity + soldQuantity;
  const recoveryRate = totalQuantity > 0 ? (recoveredQuantity / totalQuantity) * 100 : 0;

  const handlePhotoUpload = () => {
    const newPhoto = `https://picsum.photos/400/300?random=${Date.now()}`;
    setPhotos([...photos, newPhoto]);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (recoveredQuantity > totalQuantity) {
      alert('回收数量不能大于库存与已售数量之和');
      return;
    }

    setSubmitting(true);
    try {
      const recordData: Omit<RecoveryRecord, 'id'> = {
        notificationId,
        recallTaskId: notification.recallTaskId,
        unitId: currentUser!.id,
        unitName: currentUser!.name,
        unitRole: currentUser!.role,
        unitRegion: `${currentUser!.province}${currentUser!.city}`,
        stockQuantity,
        soldQuantity,
        recoveredQuantity,
        notes,
        photos,
        submittedAt: new Date().toISOString(),
      };

      if (existingRecord) {
        submitRecord(existingRecord.id, recordData);
      } else {
        submitRecord(null, recordData);
      }

      addOperationLog({
        recallTaskId: notification.recallTaskId,
        operator: currentUser!.name,
        operation: 'submit_recovery',
        details: `提交回收登记，库存：${stockQuantity}盒，已售：${soldQuantity}盒，已回收：${recoveredQuantity}盒`,
      });

      markAsSubmitted(notificationId);
      navigate('/recovery');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    const recordData: Omit<RecoveryRecord, 'id' | 'submittedAt'> = {
      notificationId,
      recallTaskId: notification.recallTaskId,
      unitId: currentUser!.id,
      unitName: currentUser!.name,
      unitRole: currentUser!.role,
      unitRegion: `${currentUser!.province}${currentUser!.city}`,
      stockQuantity,
      soldQuantity,
      recoveredQuantity,
      notes,
      photos,
    };

    if (existingRecord) {
      saveDraft(existingRecord.id, recordData);
    } else {
      saveDraft(null, recordData);
    }

    addOperationLog({
      recallTaskId: notification.recallTaskId,
      operator: currentUser!.name,
      operation: 'save_draft',
      details: `保存回收登记草稿，库存：${stockQuantity}盒`,
    });

    alert('草稿已保存');
    navigate('/recovery');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/notifications')}>
          返回
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">回收登记</h1>
          <p className="text-slate-500 mt-1">请如实填写库存、已售和回收数量</p>
        </div>
      </div>

      {existingRecord?.isDraft && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
          <Edit3 className="w-5 h-5 text-amber-600" />
          <div>
            <p className="font-medium text-amber-700">继续编辑草稿</p>
            <p className="text-sm text-amber-600">上次保存时间：{formatDate(existingRecord.updatedAt || existingRecord.submittedAt)}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>召回任务信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <RiskBadge level={recall.riskLevel} />
            <h3 className="text-xl font-bold text-slate-800">{recall.title}</h3>
          </div>
          <p className="text-slate-600">{recall.reason}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">详细说明</p>
                <p className="text-slate-700">{recall.description}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">截止日期</p>
                <p className="font-medium text-slate-700">{formatDate(recall.deadline)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-sm text-slate-500">发送时间</p>
                <p className="font-medium text-slate-700">{formatDate(notification.sentAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>数量登记</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="库存数量（盒）"
              type="number"
              min="0"
              value={stockQuantity || ''}
              onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
              placeholder="请输入当前库存数量"
            />
            <Input
              label="已售数量（盒）"
              type="number"
              min="0"
              value={soldQuantity || ''}
              onChange={(e) => setSoldQuantity(parseInt(e.target.value) || 0)}
              placeholder="请输入已销售数量"
            />
            <Input
              label="已回收数量（盒）"
              type="number"
              min="0"
              max={totalQuantity}
              value={recoveredQuantity || ''}
              onChange={(e) => setRecoveredQuantity(parseInt(e.target.value) || 0)}
              placeholder="请输入已回收数量"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <p className="text-sm text-blue-600 mb-2">总计应回收</p>
              <p className="text-3xl font-bold text-blue-700">{formatNumber(totalQuantity)}</p>
              <p className="text-xs text-blue-500 mt-1">库存 + 已售</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <p className="text-sm text-green-600 mb-2">已回收</p>
              <p className="text-3xl font-bold text-green-700">{formatNumber(recoveredQuantity)}</p>
              <p className="text-xs text-green-500 mt-1">盒</p>
            </div>
            <div className="text-center p-6 bg-teal-50 rounded-xl">
              <p className="text-sm text-teal-600 mb-2">回收率</p>
              <p className="text-3xl font-bold text-teal-700">{recoveryRate.toFixed(1)}%</p>
              <p className="text-xs text-teal-500 mt-1">
                {recoveredQuantity} / {totalQuantity}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-500">回收率进度</span>
              <span className="text-sm font-medium text-slate-700">{recoveryRate.toFixed(1)}%</span>
            </div>
            <ProgressBar value={recoveredQuantity} max={totalQuantity || 1} colorScheme="green" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>补充说明</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            placeholder="请补充说明回收过程中遇到的问题或其他需要说明的情况..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>处理照片</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`处理照片 ${index + 1}`}
                  className="w-32 h-24 object-cover rounded-lg border border-slate-200"
                />
                <button
                  onClick={() => handleRemovePhoto(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={handlePhotoUpload}
              className="w-32 h-24 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-500 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
              <Camera className="w-8 h-8 mb-1" />
              <span className="text-xs">上传照片</span>
            </button>
          </div>
          <p className="text-sm text-slate-500">
            请上传药品回收、销毁或封存的现场照片作为处理凭证
          </p>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/notifications')}>
          取消
        </Button>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            leftIcon={<Save className="w-4 h-4" />}
            onClick={handleSaveDraft}
          >
            保存草稿
          </Button>
          <Button
            leftIcon={<CheckCircle2 className="w-4 h-4" />}
            loading={submitting}
            onClick={handleSubmit}
          >
            提交回收信息
          </Button>
        </div>
      </div>
    </div>
  );
};
