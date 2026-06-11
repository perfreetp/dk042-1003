import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { RecallTask, Batch, Notification, RecoveryRecord, OperationLog } from '@/types';
import { formatDate, formatDateTime, formatNumber } from './formatUtils';
import { RISK_LEVEL_CONFIG, TASK_STATUS_CONFIG, USER_ROLE_CONFIG, OPERATION_TYPE_CONFIG } from '@/types';

export const exportRecallCertificate = async (
  recall: RecallTask,
  batches: Batch[],
  notifications: Notification[],
  recoveryRecords: RecoveryRecord[],
  operationLogs: OperationLog[] = [],
  filterSummary?: string,
  excludeDrafts: boolean = true
): Promise<void> => {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  let yPosition = 20;

  const finalOperationLogs = operationLogs;

  const finalRecoveryRecords = excludeDrafts
    ? recoveryRecords.filter((r) => r.isDraft !== true)
    : recoveryRecords;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.text('药品召回完成证明', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`证明编号: CERT-${recall.id.toUpperCase()}`, 20, yPosition);
  pdf.text(`出具日期: ${formatDate(new Date().toISOString())}`, pageWidth - 80, yPosition);
  yPosition += 10;

  pdf.setLineWidth(0.5);
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 8;

  if (filterSummary) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('筛选条件摘要', 20, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const summaryMaxWidth = pageWidth - 40;
    const splitSummary = pdf.splitTextToSize(filterSummary, summaryMaxWidth);
    splitSummary.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 25, yPosition);
      yPosition += 6;
    });
    yPosition += 5;
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('召回任务信息', 20, yPosition);
  yPosition += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  const infoItems = [
    { label: '召回任务名称', value: recall.title },
    { label: '召回原因', value: recall.reason },
    { label: '风险等级', value: RISK_LEVEL_CONFIG[recall.riskLevel].label },
    { label: '任务状态', value: TASK_STATUS_CONFIG[recall.status].label },
    { label: '发起单位', value: recall.creatorName },
    { label: '创建时间', value: formatDateTime(recall.createdAt) },
    { label: '截止日期', value: formatDate(recall.deadline) },
    { label: '完成时间', value: formatDateTime(recall.updatedAt) },
  ];

  infoItems.forEach((item) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.text(`${item.label}:`, 25, yPosition);
    const valueX = 70;
    const maxWidth = pageWidth - valueX - 20;
    const splitValue = pdf.splitTextToSize(item.value, maxWidth);
    pdf.text(splitValue, valueX, yPosition);
    yPosition += splitValue.length * 6;
  });

  yPosition += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('涉及批次范围', 20, yPosition);
  yPosition += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  batches.forEach((batch, index) => {
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.text(`批次 ${index + 1}:`, 25, yPosition);
    yPosition += 6;
    const batchItems = [
      { label: '  产品名称', value: batch.productName },
      { label: '  规格', value: batch.specification },
      { label: '  生产批号', value: batch.batchNumber },
      { label: '  生产日期', value: formatDate(batch.productionDate) },
      { label: '  有效期至', value: formatDate(batch.expiryDate) },
      { label: '  召回数量', value: formatNumber(batch.quantity) + ' 盒' },
    ];
    batchItems.forEach((item) => {
      pdf.text(`${item.label}: ${item.value}`, 30, yPosition);
      yPosition += 5;
    });
    yPosition += 3;
  });

  yPosition += 5;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('通知对象与反馈情况', 20, yPosition);
  yPosition += 8;

  const totalStock = finalRecoveryRecords.reduce((sum, r) => sum + r.stockQuantity, 0);
  const totalSold = finalRecoveryRecords.reduce((sum, r) => sum + r.soldQuantity, 0);
  const totalRecovered = finalRecoveryRecords.reduce((sum, r) => sum + r.recoveredQuantity, 0);
  const recoveryRate = totalStock > 0 ? Math.round((totalRecovered / totalStock) * 100) : 0;

  const stats = [
    { label: '应通知单位数', value: notifications.length.toString() },
    { label: '已反馈单位数', value: finalRecoveryRecords.length.toString() },
    { label: '反馈率', value: notifications.length > 0 ? `${Math.round((finalRecoveryRecords.length / notifications.length) * 100)}%` : '0%' },
    { label: '库存总数', value: formatNumber(totalStock) + ' 盒' },
    { label: '已销售数量', value: formatNumber(totalSold) + ' 盒' },
    { label: '已回收数量', value: formatNumber(totalRecovered) + ' 盒' },
    { label: '回收率', value: `${recoveryRate}%` },
  ];

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  stats.forEach((stat) => {
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 20;
    }
    pdf.text(`${stat.label}: ${stat.value}`, 25, yPosition);
    yPosition += 6;
  });

  yPosition += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('回收登记明细', 20, yPosition);
  yPosition += 8;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  if (finalRecoveryRecords.length === 0) {
    pdf.text('暂无回收登记记录', 25, yPosition);
    yPosition += 6;
  } else {
    finalRecoveryRecords.forEach((record, index) => {
      if (yPosition > pageHeight - 40) {
        pdf.addPage();
        yPosition = 20;
      }
      const userType = USER_ROLE_CONFIG[record.unitRole].label;
      pdf.text(
        `${index + 1}. [${userType}] ${record.unitName} - ${record.unitRegion}`,
        25,
        yPosition
      );
      pdf.text(
        `   库存: ${formatNumber(record.stockQuantity)} | 已售: ${formatNumber(record.soldQuantity)} | 已回收: ${formatNumber(record.recoveredQuantity)}`,
        30,
        yPosition + 4
      );
      if (record.notes) {
        const notesMaxWidth = pageWidth - 35;
        const splitNotes = pdf.splitTextToSize(`   备注: ${record.notes}`, notesMaxWidth);
        splitNotes.forEach((line: string, lineIndex: number) => {
          pdf.text(line, 30, yPosition + 8 + lineIndex * 4);
        });
        yPosition += splitNotes.length * 4;
      }
      yPosition += 10;
    });
  }

  if (finalOperationLogs.length > 0) {
    yPosition += 10;
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('处理过程记录', 20, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    finalOperationLogs
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .forEach((log, index) => {
        if (yPosition > pageHeight - 35) {
          pdf.addPage();
          yPosition = 20;
        }
        const timeText = `[${formatDateTime(log.timestamp)}]`;
        const opType = OPERATION_TYPE_CONFIG[log.operation]?.label || log.operation;
        const firstLine = `${index + 1}. ${timeText} [${opType}] ${log.operator}`;
        pdf.text(firstLine, 25, yPosition);
        yPosition += 5;
        const detailsMaxWidth = pageWidth - 30 - 20;
        const splitDetails = pdf.splitTextToSize(log.details, detailsMaxWidth);
        pdf.text(splitDetails, 30, yPosition);
        yPosition += splitDetails.length * 5;
        const metaParts: string[] = [];
        if (log.relatedUnit) metaParts.push(`关联单位: ${log.relatedUnit}`);
        if (log.processingResult) metaParts.push(`处理结果: ${log.processingResult}`);
        if (metaParts.length > 0) {
          const metaLine = metaParts.join(' | ');
          const splitMeta = pdf.splitTextToSize(metaLine, detailsMaxWidth);
          pdf.setFont('helvetica', 'italic');
          pdf.text(splitMeta, 30, yPosition);
          pdf.setFont('helvetica', 'normal');
          yPosition += splitMeta.length * 5;
        }
        yPosition += 2;
      });
  }

  if (recall.closingNote) {
    yPosition += 10;
    if (yPosition > pageHeight - 40) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('结案说明', 20, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const closingMaxWidth = pageWidth - 45;
    const splitClosing = pdf.splitTextToSize(recall.closingNote, closingMaxWidth);
    splitClosing.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, 25, yPosition);
      yPosition += 6;
    });
  }

  yPosition += 8;
  if (yPosition > pageHeight - 40) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setLineWidth(0.5);
  pdf.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 8;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'italic');
  pdf.text('本证明由药品召回协同系统自动生成，具有同等法律效力。', pageWidth / 2, yPosition, {
    align: 'center',
  });
  yPosition += 6;
  pdf.text(`系统生成时间: ${formatDateTime(new Date().toISOString())}`, pageWidth / 2, yPosition, {
    align: 'center',
  });

  pdf.save(`召回证明_${recall.title}_${formatDate(new Date().toISOString())}.pdf`);
};

export const exportToCSV = (
  data: Record<string, unknown>[],
  filename: string,
  columns: { key: string; label: string }[]
): void => {
  const headers = columns.map((c) => c.label).join(',');
  const rows = data.map((row) =>
    columns.map((c) => {
      const value = row[c.key];
      if (typeof value === 'string' && value.includes(',')) {
        return `"${value}"`;
      }
      return value ?? '';
    }).join(',')
  );
  const csvContent = [headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${formatDate(new Date().toISOString())}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportElementToPDF = async (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
  pdf.save(`${filename}.pdf`);
};
