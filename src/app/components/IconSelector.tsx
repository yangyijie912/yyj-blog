'use client';

import { useState } from 'react';
import * as FaIcons from 'react-icons/fa';
import * as MdIcons from 'react-icons/md';
import * as AiIcons from 'react-icons/ai';
import * as BiIcons from 'react-icons/bi';
import * as BsIcons from 'react-icons/bs';
import classnames from 'classnames';

// 图标集合
const iconSets = {
  fa: {
    name: 'Font Awesome',
    icons: {
      FaLaptopCode: '编程',
      FaPalette: '设计',
      FaTools: '工具',
      FaServer: '服务器',
      FaDatabase: '数据库',
      FaMobile: '移动端',
      FaRobot: '机器人/AI',
      FaCloud: '云服务',
      FaGamepad: '游戏',
      FaShoppingCart: '电商',
      FaChartLine: '数据分析',
      FaLock: '安全',
      FaGlobe: 'Web',
      FaCode: '代码',
      FaCogs: '系统',
      FaBox: '产品',
      FaReact: 'React',
      FaVuejs: 'Vue',
      FaNodeJs: 'Node.js',
      FaPython: 'Python',
      FaJava: 'Java',
      FaDocker: 'Docker',
      FaGitAlt: 'Git',
      FaAws: 'AWS',
    },
  },
  md: {
    name: 'Material Design',
    icons: {
      MdDashboard: '仪表板',
      MdWeb: 'Web',
      MdDevices: '设备',
      MdStorage: '存储',
      MdCode: '代码',
      MdBuild: '构建',
      MdAnalytics: '分析',
      MdSecurity: '安全',
      MdApps: '应用',
      MdExtension: '扩展',
    },
  },
  ai: {
    name: 'Ant Design',
    icons: {
      AiOutlineApi: 'API',
      AiOutlineCloud: '云',
      AiOutlineDatabase: '数据库',
      AiOutlineDeploymentUnit: '部署',
      AiOutlineExperiment: '实验',
      AiOutlineFundProjectionScreen: '项目',
    },
  },
  bi: {
    name: 'BoxIcons',
    icons: {
      BiCodeAlt: '代码',
      BiData: '数据',
      BiDevices: '设备',
      BiGitBranch: 'Git',
      BiMobile: '移动',
      BiServer: '服务器',
    },
  },
  bs: {
    name: 'Bootstrap',
    icons: {
      BsCode: '代码',
      BsCodeSlash: '开发',
      BsGear: '设置',
      BsLightning: '性能',
      BsPlugin: '插件',
      BsTerminal: '终端',
    },
  },
};

// 获取所有图标
const getAllIcons = () => {
  const allIcons: { name: string; label: string; set: string }[] = [];
  Object.entries(iconSets).forEach(([, setData]: [string, (typeof iconSets)[keyof typeof iconSets]]) => {
    Object.entries(setData.icons).forEach(([iconName, label]: [string, string]) => {
      allIcons.push({ name: iconName, label, set: setData.name });
    });
  });
  return allIcons;
};

interface IconSelectorProps {
  value: string;
  onChange: (iconName: string) => void;
}

export default function IconSelector({ value, onChange }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSet, setSelectedSet] = useState<string>('all');

  const allIcons = getAllIcons();

  // 过滤图标
  const filteredIcons = allIcons.filter((icon: { name: string; label: string; set: string }) => {
    const matchesSearch =
      icon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      icon.label.toLowerCase().includes(searchTerm.toLowerCase());
    // 正确匹配图标前缀（Fa、Md、Ai、Bi、Bs）
    const matchesSet = selectedSet === 'all' || icon.name.toLowerCase().startsWith(selectedSet.toLowerCase());
    return matchesSearch && matchesSet;
  });

  // 获取图标组件
  const getIconComponent = (iconName: string) => {
    const allIconComponents = { ...FaIcons, ...MdIcons, ...AiIcons, ...BiIcons, ...BsIcons };
    return allIconComponents[iconName as keyof typeof allIconComponents];
  };

  const CurrentIcon = getIconComponent(value);

  return (
    <div className="relative">
      {/* 当前选中的图标显示 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 border rounded-lg hover:border-blue-500 transition-colors flex items-center justify-between bg-white"
      >
        <div className="flex items-center gap-3">
          {CurrentIcon && <CurrentIcon className="text-2xl text-blue-600" />}
          <div className="text-left">
            <div className="font-medium">{value || '选择图标'}</div>
            <div className="text-xs text-gray-500">
              {allIcons.find((i: { name: string; label: string; set: string }) => i.name === value)?.label ||
                '点击选择图标'}
            </div>
          </div>
        </div>
        <span className="text-gray-400">{isOpen ? '▲' : '▼'}</span>
      </button>

      {/* 图标选择器弹窗 */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-xl max-h-96 overflow-hidden">
          {/* 搜索和筛选 */}
          <div className="p-3 border-b bg-gray-50 sticky top-0">
            <input
              type="text"
              placeholder="搜索图标..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded mb-2 focus:ring-2 focus:ring-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setSelectedSet('all')}
                className={classnames('px-2 py-1 text-xs rounded', {
                  'bg-blue-600 text-white': selectedSet === 'all',
                  'bg-gray-200 text-gray-700 hover:bg-gray-300': selectedSet !== 'all',
                })}
              >
                全部
              </button>
              {Object.entries(iconSets).map(([key, set]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedSet(key)}
                  className={classnames('px-2 py-1 text-xs rounded', {
                    'bg-blue-600 text-white': selectedSet === key,
                    'bg-gray-200 text-gray-700 hover:bg-gray-300': selectedSet !== key,
                  })}
                >
                  {set.name}
                </button>
              ))}
            </div>
          </div>

          {/* 图标网格 */}
          <div className="p-3 overflow-y-auto max-h-64">
            {filteredIcons.length === 0 ? (
              <div className="text-center text-gray-500 py-8">未找到匹配的图标</div>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {filteredIcons.map((icon: { name: string; label: string; set: string }) => {
                  const IconComponent = getIconComponent(icon.name);
                  if (!IconComponent) return null;

                  return (
                    <button
                      key={icon.name}
                      type="button"
                      onClick={() => {
                        onChange(icon.name);
                        setIsOpen(false);
                        setSearchTerm('');
                      }}
                      className={classnames(
                        'p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-all flex flex-col items-center gap-1',
                        {
                          'bg-blue-100 border-blue-500': value === icon.name,
                        }
                      )}
                      title={`${icon.name} - ${icon.label}`}
                    >
                      <IconComponent className="text-2xl text-gray-700" />
                      <span className="text-xs text-gray-600 text-center line-clamp-1">{icon.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 点击外部关闭 */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsOpen(false);
            setSearchTerm('');
          }}
        />
      )}
    </div>
  );
}
