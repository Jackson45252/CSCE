interface Tab {
  key: string;
  label: string;
}

interface Props {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export default function Tabs({ tabs, activeKey, onChange }: Props) {
  return (
    <div className="flex border-b-2 border-gray-200 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`px-5 py-2.5 text-sm font-bold uppercase tracking-wider border-b-3 transition-colors -mb-0.5 ${
            activeKey === tab.key
              ? "border-nba-red text-nba-navy"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
