import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import RegisterModal from "@/components/RegisterModal";
import SmetaSection from "@/components/SmetaSection";
import RaskhodySection from "@/components/RaskhodySection";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("расходы");
  const [showRegister, setShowRegister] = useState(false);

  const channels = [
    { name: "расходы", icon: "Receipt" },
    { name: "смета", icon: "FileText" },
    { name: "аналитика", icon: "BarChart2" },
    { name: "команда", icon: "Users" },
    { name: "отчёты", icon: "ClipboardList" },
  ];

  const projects = ["Жилой комплекс А", "ТЦ Восток", "Склад №3", "Офисный центр"];

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-white overflow-x-hidden">
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSuccess={() => setShowRegister(false)}
        />
      )}

      {/* Навигация */}
      <nav className="bg-[#141824] border-b border-[#0d1017] px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#e67e22] rounded-xl flex items-center justify-center">
              <Icon name="HardHat" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white">СтройУчёт</h1>
              <p className="text-xs text-[#8892a4] hidden sm:block">Платформа управления строительными проектами</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <Button variant="ghost" className="text-[#8892a4] hover:text-white hover:bg-[#252c3d]">
              Войти
            </Button>
            <Button onClick={() => setShowRegister(true)} className="bg-[#e67e22] hover:bg-[#d35400] text-white px-6 py-2 rounded-lg text-sm font-medium">
              Начать бесплатно
            </Button>
          </div>
          <Button
            variant="ghost"
            className="sm:hidden text-[#8892a4] hover:text-white hover:bg-[#252c3d] p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
          </Button>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden mt-4 pt-4 border-t border-[#0d1017]">
            <div className="flex flex-col gap-3">
              <Button variant="ghost" className="text-[#8892a4] hover:text-white hover:bg-[#252c3d] justify-start">
                Войти
              </Button>
              <Button onClick={() => setShowRegister(true)} className="bg-[#e67e22] hover:bg-[#d35400] text-white px-6 py-2 rounded-lg text-sm font-medium">
                Начать бесплатно
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Основной макет */}
      <div className="flex" style={{ height: "calc(100vh - 73px)" }}>

        {/* Боковая панель проектов */}
        <div className="hidden lg:flex w-[72px] bg-[#0d1017] flex-col items-center py-3 gap-2 flex-shrink-0">
          <div className="w-12 h-12 bg-[#e67e22] rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer">
            <Icon name="HardHat" size={22} className="text-white" />
          </div>
          <div className="w-8 h-[2px] bg-[#1a1f2e] rounded-full my-1" />
          {projects.map((p, i) => (
            <div key={i} title={p}
              className="w-12 h-12 bg-[#1a1f2e] rounded-3xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer hover:bg-[#e67e22] group">
              <span className="text-[#8892a4] group-hover:text-white text-sm font-bold">{p.charAt(0)}</span>
            </div>
          ))}
          <div className="w-12 h-12 bg-[#1a1f2e] rounded-3xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer hover:bg-[#27ae60] mt-1">
            <Icon name="Plus" size={20} className="text-[#8892a4]" />
          </div>
        </div>

        {/* Панель разделов + контент */}
        <div className="flex-1 flex overflow-hidden">

          {/* Боковая панель разделов */}
          <div className={`${mobileSidebarOpen ? "flex" : "hidden"} lg:flex w-full lg:w-60 bg-[#141824] flex-col flex-shrink-0`}>
            <div className="p-4 border-b border-[#0d1017] flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold text-base">Жилой комплекс А</h2>
                <p className="text-[#8892a4] text-xs mt-0.5">Активный проект</p>
              </div>
              <Button variant="ghost"
                className="lg:hidden text-[#8892a4] hover:text-white hover:bg-[#252c3d] p-1"
                onClick={() => setMobileSidebarOpen(false)}>
                <Icon name="X" size={16} />
              </Button>
            </div>

            <div className="flex-1 p-2 overflow-y-auto">
              <div className="mb-4">
                <div className="flex items-center gap-1 px-2 py-1 text-[#8892a4] text-xs font-semibold uppercase tracking-wide">
                  <Icon name="ChevronDown" size={12} />
                  <span>Разделы</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {channels.map((ch) => (
                    <div key={ch.name} onClick={() => { setActiveSection(ch.name); setMobileSidebarOpen(false); }}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                        activeSection === ch.name
                          ? "bg-[#252c3d] text-white"
                          : "text-[#8892a4] hover:text-[#c8d0de] hover:bg-[#1e2536]"
                      }`}>
                      <Icon name={ch.icon} size={16} />
                      <span className="text-sm">{ch.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 px-2 py-1 text-[#8892a4] text-xs font-semibold uppercase tracking-wide">
                  <Icon name="ChevronDown" size={12} />
                  <span>Команда</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {[
                    { name: "Прораб Иванов", color: "#e67e22" },
                    { name: "Заказчик Смирнов", color: "#2980b9" },
                    { name: "Дизайнер Петрова", color: "#8e44ad" },
                  ].map((m) => (
                    <div key={m.name}
                      className="flex items-center gap-2 px-2 py-1.5 rounded text-[#8892a4] hover:text-[#c8d0de] hover:bg-[#1e2536] cursor-pointer">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
                      <span className="text-sm truncate">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Пользователь */}
            <div className="p-2 bg-[#0d1017] flex items-center gap-2">
              <div className="w-8 h-8 bg-[#e67e22] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-bold">К</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">СтройМаст</div>
                <div className="text-[#8892a4] text-xs flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#27ae60] rounded-full inline-block" />
                  Администратор
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-[#252c3d]">
                <Icon name="Settings" size={16} className="text-[#8892a4]" />
              </Button>
            </div>
          </div>

          {/* Основной контент */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Мобильный хедер */}
            <div className="lg:hidden h-12 bg-[#1a1f2e] border-b border-[#0d1017] flex items-center px-4 gap-2 flex-shrink-0">
              <Button variant="ghost"
                className="text-[#8892a4] hover:text-[#c8d0de] hover:bg-[#252c3d] p-1"
                onClick={() => setMobileSidebarOpen(true)}>
                <Icon name="Menu" size={20} />
              </Button>
              <Icon name={channels.find(c => c.name === activeSection)?.icon ?? "Receipt"} size={16} className="text-[#8892a4]" />
              <span className="text-white font-semibold capitalize">{activeSection}</span>
            </div>

            {/* Разделы */}
            {activeSection === "расходы" && <RaskhodySection />}
            {activeSection === "смета" && <SmetaSection />}

            {["аналитика", "команда", "отчёты"].includes(activeSection) && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-[#252c3d] rounded-2xl flex items-center justify-center mb-4">
                  <Icon
                    name={activeSection === "аналитика" ? "BarChart2" : activeSection === "команда" ? "Users" : "ClipboardList"}
                    size={28} className="text-[#8892a4]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2 capitalize">{activeSection}</h3>
                <p className="text-[#8892a4] text-sm max-w-xs">Этот раздел появится в следующем обновлении платформы</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
