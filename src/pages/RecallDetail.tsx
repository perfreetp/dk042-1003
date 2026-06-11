import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRecallStore } from '@/store/useRecallStore';
import { useBatchStore } from '@/store/useBatchStore';
import { useNotificationStore } from '@/store/useNotificationStore';
import { useRecoveryStore } from '@/store/useRecoveryStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { RiskBadge } from '@/components/common/RiskBadge';
import { StatusTag } from '@/components/common/StatusTag';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Modal } from '@/components/common/Modal';
import { useAuth } from '@/hooks/useAuth';
import { formatDate, formatPercent, formatNumber } from '@/utils/formatUtils';
import { exportRecallCertificate } from '@/utils/exportUtils';
import {
  ArrowLeft,
  Package,
  Users,
  ClipboardList,
  Calendar,
  AlertTriangle,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
} from 'lucide-react';

export const RecallDetail = () => {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const { getRecallById, updateStatus, closeRecall } = useRecallStore();
  const { getBatchesByRecallId } = useBatchStore();
  const { getNotificationsByRecallId, sendNotifications } = useNotificationStore();
  const { getRecoveryRecordsByRecallId, getStatistics } = useRecoveryStore();
  const { currentUser, canEditRecall, canViewRecovery } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'batches' | 'notifications' | 'recovery'>('overview');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closingNote, setClosingNote] = useState('');
  const [exporting, setExporting] = useState(false);

  const recall = getRecallById(id);
  const batches = getBatchesByRecallId(id);
  const notifications = getNotificationsByRecallId(id);
  const recoveryRecords = getRecoveryRecordsByRecallId(id);
  const stats = useMemo(() => getStatistics(id), [id, getStatistics]);
  const overdueCount = useMemo(
    () => notifications.filter((n) => n.status === 'overdue').length,
    [notifications]
  );

  if (!recall) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-slate-800 mb-2">任务不存在</h2>
        <p className="text-slate-500 mb-6">未找到该召回任务</p>
        <Button leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/')}>
          返回列表
        </Button>
      </div>
    );
  }

  const handleSendNotifications = () => {
    sendNotifications(id, notifications.map((n) => n.recipientId));
    updateStatus(id, 'in_progress');
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportRecallCertificate(recall, batches, notifications, recoveryRecords);
    } finally {
      setExporting(false);
    }
  };

  const handleCloseTask = () => {
    closeRecall(id, closingNote);
    setShowCloseModal(false);
    setClosingNote('');
  };

  const tabs = [
    { key: 'overview' as const, label: '任务概览', icon: FileText },
    { key: 'batches' as const, label: '批次范围', icon: Package, count: batches.length },
    { key: 'notifications' as const, label: '下游通知', icon: Users, count: notifications.length },
    { key: 'recovery' as const, label: '回收登记', icon: ClipboardList, count: recoveryRecords.length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/')}>
            返回
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-800">{recall.title}</h1>
              <RiskBadge level={recall.riskLevel} />
              <StatusTag type="task" status={recall.status} />
            </div>
            <p className="text-slate-500">
              {recall.reason} · 创建于 {formatDate(recall.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          {canEditRecall() && recall.status === 'draft' && (
            <Button leftIcon={<Send className="w-4 h-4" />} onClick={handleSendNotifications}>
              发送通知
            </Button>
          )}
          {canEditRecall() && recall.status === 'in_progress' && (
            <Button
              variant="outline"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              onClick={() => setShowCloseModal(true)}
            >
              关闭任务
            </Button>
          )}
          {(recall.status === 'completed' || recall.status === 'closed') && canEditRecall() && (
            <Button
              variant="outline"
              leftIcon={<Download className="w-4 h-4" />}
              loading={exporting}
              onClick={handleExport}
            >
              导出证明
            </Button>
          )}
        </div>
      </div>

      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.5 text-xs bg-slate-200 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Package className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">涉及批次</p>
                    <p className="text-2xl font-bold text-slate-800">{batches.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">通知单位</p>
                    <p className="text-2xl font-bold text-slate-800">{notifications.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">已反馈</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {stats.submittedUnits}
                      <span className="text-sm font-normal text-slate-500 ml-1">
                        ({formatPercent(stats.submittedUnits, notifications.length)})
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">回收率</p>
                    <p className="text-2xl font-bold text-slate-800">
                      {formatPercent(stats.totalRecovered, stats.totalStock)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>任务详情</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">截止日期</p>
                      <p className="font-medium text-slate-700">{formatDate(recall.deadline)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-slate-500">风险等级</p>
                      <RiskBadge level={recall.riskLevel} />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">召回原因</p>
                  <p className="font-medium text-slate-700">{recall.reason}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">详细说明</p>
                  <p className="text-slate-600 leading-relaxed">{recall.description}</p>
                </div>
                {recall.closingNote && (
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-green-700 mb-1">结案说明</p>
                        <p className="text-green-600">{recall.closingNote}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>处理进度</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">整体进度</span>
                    <span className="text-sm font-medium text-slate-700">
                      {formatPercent(stats.submittedUnits, notifications.length)}
                    </span>
                  </div>
                  <ProgressBar
                    value={stats.submittedUnits}
                    max={notifications.length || 1}
                    colorScheme="blue"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">回收率</span>
                    <span className="text-sm font-medium text-slate-700">
                      {formatPercent(stats.totalRecovered, stats.totalStock)}
                    </span>
                  </div>
                  <ProgressBar
                    value={stats.totalRecovered}
                    max={stats.totalStock || 1}
                    colorScheme="green"
                  />
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">待回复</span>
                    <span className="font-medium text-amber-600">
                      {notifications.length - stats.submittedUnits - overdueCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">逾期未反馈</span>
                    <span className="font-medium text-red-600">{overdueCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">已回收数量</span>
                    <span className="font-medium text-slate-700">
                      {formatNumber(stats.totalRecovered)} 盒
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'batches' && (
        <Card>
          <CardHeader>
            <CardTitle>召回批次列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">产品名称</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">规格</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">生产批号</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">生产日期</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">有效期至</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">召回数量</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr key={batch.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-700">{batch.productName}</td>
                      <td className="py-3 px-4 text-slate-600">{batch.specification}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{batch.batchNumber}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(batch.productionDate)}</td>
                      <td className="py-3 px-4 text-slate-600">{formatDate(batch.expiryDate)}</td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        {formatNumber(batch.quantity)} 盒
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>通知对象与反馈状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">单位名称</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">角色</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">地区</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">已读时间</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">反馈时间</th>
                    {canEditRecall() && (
                      <th className="text-right py-3 px-4 text-sm font-semibold text-slate-600">操作</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((notif) => {
                    const recovery = recoveryRecords.find((r) => r.notificationId === notif.id);
                    return (
                      <tr key={notif.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4 font-medium text-slate-700">{notif.recipientName}</td>
                        <td className="py-3 px-4">
                          <StatusTag type="role" status={notif.recipientRole} />
                        </td>
                        <td className="py-3 px-4 text-slate-600">{notif.recipientRegion}</td>
                        <td className="py-3 px-4">
                          <StatusTag type="notification" status={notif.status} />
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-sm">
                          {notif.readAt ? formatDate(notif.readAt) : '-'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-sm">
                          {recovery ? formatDate(recovery.submittedAt) : '-'}
                        </td>
                        {canEditRecall() && (
                          <td className="py-3 px-4 text-right">
                            {notif.status === 'unread' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<MessageSquare className="w-4 h-4" />}
                              >
                                催办
                              </Button>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'recovery' && canViewRecovery() && (
        <div className="space-y-6">
          {recoveryRecords.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <ClipboardList className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-700 mb-2">暂无回收记录</h3>
                <p className="text-slate-500">通知对象尚未提交回收信息</p>
              </CardContent>
            </Card>
          ) : (
            recoveryRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{record.unitName}</CardTitle>
                    <p className="text-sm text-slate-500">提交于 {formatDate(record.submittedAt)}</p>
                  </div>
                  <StatusTag type="role" status={record.unitRole} />
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <p className="text-sm text-blue-600 mb-1">库存数量</p>
                      <p className="text-2xl font-bold text-blue-700">{formatNumber(record.stockQuantity)}</p>
                      <p className="text-xs text-blue-500">盒</p>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-xl">
                      <p className="text-sm text-amber-600 mb-1">已售数量</p>
                      <p className="text-2xl font-bold text-amber-700">{formatNumber(record.soldQuantity)}</p>
                      <p className="text-xs text-amber-500">盒</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-600 mb-1">已回收数量</p>
                      <p className="text-2xl font-bold text-green-700">{formatNumber(record.recoveredQuantity)}</p>
                      <p className="text-xs text-green-500">盒</p>
                    </div>
                    <div className="text-center p-4 bg-teal-50 rounded-xl">
                      <p className="text-sm text-teal-600 mb-1">回收率</p>
                      <p className="text-2xl font-bold text-teal-700">
                        {formatPercent(record.recoveredQuantity, record.stockQuantity + record.soldQuantity)}
                      </p>
                    </div>
                  </div>
                  {record.notes && (
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <p className="text-sm text-slate-500 mb-1">补充说明</p>
                      <p className="text-slate-700">{record.notes}</p>
                    </div>
                  )}
                  {record.photos.length > 0 && (
                    <div>
                      <p className="text-sm text-slate-500 mb-3">处理照片</p>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {record.photos.map((photo, index) => (
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
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Modal
        open={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        title="关闭召回任务"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCloseModal(false)}>
              取消
            </Button>
            <Button onClick={handleCloseTask} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              确认关闭
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-700">请注意</p>
              <p className="text-sm text-amber-600">关闭后任务将无法继续接收反馈，请确认所有单位已完成回收工作。</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">结案说明</label>
            <textarea
              placeholder="请填写结案说明，总结本次召回工作成果..."
              value={closingNote}
              onChange={(e) => setClosingNote(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
