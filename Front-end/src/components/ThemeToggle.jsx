import { MdLightMode, MdDarkMode, MdNightsStay } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { id: 'light', icon: <MdLightMode />, label: 'Light' },
    { id: 'dark', icon: <MdDarkMode />, label: 'Dark' },
    { id: 'night', icon: <MdNightsStay />, label: 'Night' }
  ];

  return (
    <div className="flex bg-background border border-border rounded-xl p-1 shadow-sm mt-auto w-full">
      {themes.map(t => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          title={`${t.label} Mode`}
          className={`flex-1 py-2 flex justify-center items-center rounded-lg transition-all duration-200 ${
            theme === t.id 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-muted hover:text-content hover:bg-card-hover'
          }`}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
