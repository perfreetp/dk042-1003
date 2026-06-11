import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  ClipboardList,
  Package,
  Bell,
  FileSpreadsheet,
  BarChart3,
  Archive,
  PlusCircle,
  Pill,
} from 'lucide-react';

export const Sidebar = () => {
  const location = useLocation();
  const { canCreateRecall, canViewDashboard } = useAuth();

  const navItems = [
    {
      path: '/',
      label: '召回任务',
      icon: ClipboardList,
      roles: ['pharma', 'distributor', 'store'],
    },
    {
      path: '/batches',
      label: '批次范围',
      icon: Package,
      roles: ['pharma', 'distributor', 'store'],
    },
    {
      path: '/notifications',
      label: '下游通知',
      icon: Bell,
      roles: ['pharma', 'distributor', 'store'],
    },
    {
      path: '/recovery',
      label: '回收登记',
      icon: FileSpreadsheet,
      roles: ['distributor', 'store'],
    },
    {
      path: '/recovery/list',
      label: '回收列表',
      icon: FileSpreadsheet,
      roles: ['pharma'],
    },
  ];

  const pharmaOnlyItems = [
    {
      path: '/dashboard',
      label: '进度看板',
      icon: BarChart3,
      roles: ['pharma'],
    },
    {
      path: '/archive',
      label: '结果归档',
      icon: Archive,
      roles: ['pharma'],
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="w-60 bg-gradient-to-b from-slate-900 to-slate-800 min-h-screen flex flex-col border-r border-slate-700">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg tracking-tight">药品召回</h1>
            <p className="text-slate-400 text-xs">协同管理平台</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {canCreateRecall() && (
          <NavLink
            to="/recalls/create"
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg mb-4 transition-all duration-200',
              'bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-600/20',
              'hover:shadow-blue-500/30 hover:scale-[1.02]'
            )}
          >
            <PlusCircle className="w-5 h-5" />
            <span className="font-medium">发起召回</span>
          </NavLink>
        )}

        <div className="px-4 py-2">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            业务管理
          </p>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group',
                isActive(item.path)
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive(item.path) ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          );
        })}

        {canViewDashboard() && (
          <>
            <div className="px-4 py-2 mt-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                数据分析
              </p>
            </div>

            {pharmaOnlyItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group',
                    isActive(item.path)
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isActive(item.path)
                        ? 'text-blue-400'
                        : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                  <span className="font-medium text-sm">{item.label}</span>
                </NavLink>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <p className="text-xs text-slate-500 mb-1">系统版本</p>
          <p className="text-sm font-medium text-slate-300">v1.0.0</p>
        </div>
      </div>
    </aside>
  );
};
