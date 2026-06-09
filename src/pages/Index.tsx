import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import RegisterModal from "@/components/RegisterModal";
import SmetaSection from "@/components/SmetaSection";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("расходы");
  const [showRegister, setShowRegister] = useState(false);
  const [registeredCompany, setRegisteredCompany] = useState("");

  const channels = [
    { name: "расходы", icon: "Receipt" },
    { name: "смета", icon: "FileText" },
    { name: "аналитика", icon: "BarChart2" },
    { name: "команда", icon: "Users" },
    { name: "отчёты", icon: "ClipboardList" },
  ];

  const projects = ["Жилой комплекс А", "ТЦ Восток", "Склад №3", "Офисный центр"];

  const receipts = [
    {
      author: "Прораб Иванов",
      avatar: "П",
      avatarColor: "#e67e22",
      time: "Сегодня в 10:23",
      text: "Добавил чек на покупку арматуры",
      amount: "₽ 142 500",
      category: "Материалы",
      categoryColor: "#27ae60",
    },
    {
      author: "Заказчик Смирнов",
      avatar: "З",
      avatarColor: "#2980b9",
      time: "Сегодня в 11:45",
      text: "Просматривает отчёт за июнь",
      amount: null,
      category: null,
      categoryColor: null,
    },
    {
      author: "Дизайнер Петрова",
      avatar: "Д",
      avatarColor: "#8e44ad",
      time: "Вчера в 16:30",
      text: "Добавила чек на отделочные материалы",
      amount: "₽ 87 200",
      category: "Отделка",
      categoryColor: "#e74c3c",
    },
    {
      author: "Прораб Иванов",
      avatar: "П",
      avatarColor: "#e67e22",
      time: "Вчера в 14:10",
      text: "Добавил чек на аренду техники",
      amount: "₽ 35 000",
      category: "Техника",
      categoryColor: "#f39c12",
    },
  ];

  const features = [
    {
      icon: "Receipt",
      title: "Учёт чеков и расходов",
      desc: "Все траты по проекту в одном месте — кто, когда и на что потратил деньги.",
    },
    {
      icon: "FileText",
      title: "Составление смет",
      desc: "Создавайте подробные сметы с позициями, единицами и итоговыми суммами.",
    },
    {
      icon: "BarChart2",
      title: "Аналитика и отчёты",
      desc: "Наглядная аналитика по проектам, разбивка по категориям и периодам.",
    },
    {
      icon: "Users",
      title: "Управление командой",
      desc: "Добавляйте прорабов, заказчиков и дизайнеров — у каждого свой доступ.",
    },
    {
      icon: "Send",
      title: "Рассылка отчётов",
      desc: "Отправляйте отчёты заинтересованным лицам в один клик.",
    },
    {
      icon: "Building2",
      title: "Несколько объектов",
      desc: "Ведите учёт одновременно по нескольким строительным проектам.",
    },
  ];

  const handleRegisterSuccess = (company: string, project: string) => {
    setRegisteredCompany(company);
    setShowRegister(false);
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] text-white overflow-x-hidden">
      {showRegister && (
        <RegisterModal
          onClose={() => setShowRegister(false)}
          onSuccess={handleRegisterSuccess}
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
      <div className="flex min-h-screen">
        {/* Боковая панель проектов */}
        <div className="hidden lg:flex w-[72px] bg-[#0d1017] flex-col items-center py-3 gap-2">
          <div className="w-12 h-12 bg-[#e67e22] rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer">
            <Icon name="HardHat" size={22} className="text-white" />
          </div>
          <div className="w-8 h-[2px] bg-[#1a1f2e] rounded-full my-1"></div>
          {projects.map((p, i) => (
            <div
              key={i}
              title={p}
              className="w-12 h-12 bg-[#1a1f2e] rounded-3xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer hover:bg-[#e67e22] group"
            >
              <span className="text-[#8892a4] group-hover:text-white text-sm font-bold">{p.charAt(0)}</span>
            </div>
          ))}
          <div className="w-12 h-12 bg-[#1a1f2e] rounded-3xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer hover:bg-[#27ae60] mt-1">
            <Icon name="Plus" size={20} className="text-[#8892a4]" />
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row">
          {/* Боковая панель разделов */}
          <div className={`${mobileSidebarOpen ? "block" : "hidden"} lg:block w-full lg:w-60 bg-[#141824] flex flex-col`}>
            <div className="p-4 border-b border-[#0d1017] flex items-center justify-between">
              <div>
                <h2 className="text-white font-semibold text-base">Жилой комплекс А</h2>
                <p className="text-[#8892a4] text-xs mt-0.5">Активный проект</p>
              </div>
              <Button
                variant="ghost"
                className="lg:hidden text-[#8892a4] hover:text-white hover:bg-[#252c3d] p-1"
                onClick={() => setMobileSidebarOpen(false)}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>

            <div className="flex-1 p-2">
              <div className="mb-4">
                <div className="flex items-center gap-1 px-2 py-1 text-[#8892a4] text-xs font-semibold uppercase tracking-wide">
                  <Icon name="ChevronDown" size={12} />
                  <span>Разделы</span>
                </div>
                <div className="mt-1 space-y-0.5">
                  {channels.map((ch) => (
                    <div
                      key={ch.name}
                      onClick={() => setActiveSection(ch.name)}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                        activeSection === ch.name
                          ? "bg-[#252c3d] text-white"
                          : "text-[#8892a4] hover:text-[#c8d0de] hover:bg-[#1e2536]"
                      }`}
                    >
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
                    { name: "Прораб Иванов", color: "#e67e22", role: "Прораб" },
                    { name: "Заказчик Смирнов", color: "#2980b9", role: "Заказчик" },
                    { name: "Дизайнер Петрова", color: "#8e44ad", role: "Дизайнер" },
                  ].map((m) => (
                    <div
                      key={m.name}
                      className="flex items-center gap-2 px-2 py-1.5 rounded text-[#8892a4] hover:text-[#c8d0de] hover:bg-[#1e2536] cursor-pointer"
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }}></div>
                      <span className="text-sm truncate">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Пользователь */}
            <div className="p-2 bg-[#0d1017] flex items-center gap-2">
              <div className="w-8 h-8 bg-[#e67e22] rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">К</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-sm font-medium truncate">Компания «СтройМаст»</div>
                <div className="text-[#8892a4] text-xs truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-[#27ae60] rounded-full inline-block"></span>
                  Администратор
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0 hover:bg-[#252c3d]">
                <Icon name="Settings" size={16} className="text-[#8892a4]" />
              </Button>
            </div>
          </div>

          {/* Основной контент */}
          <div className="flex-1 flex flex-col">

            {/* Раздел «Смета» */}
            {activeSection === "смета" && <SmetaSection />}

            {/* Разделы «Аналитика», «Команда», «Отчёты» — заглушки */}
            {["аналитика", "команда", "отчёты"].includes(activeSection) && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 bg-[#252c3d] rounded-2xl flex items-center justify-center mb-4">
                  <Icon name={activeSection === "аналитика" ? "BarChart2" : activeSection === "команда" ? "Users" : "ClipboardList"} size={28} className="text-[#8892a4]" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2 capitalize">{activeSection}</h3>
                <p className="text-[#8892a4] text-sm max-w-xs">Этот раздел появится в следующем обновлении платформы</p>
              </div>
            )}

            {/* Раздел «Расходы» */}
            {activeSection === "расходы" && <>
            {/* Заголовок раздела */}
            <div className="h-12 bg-[#1a1f2e] border-b border-[#0d1017] flex items-center px-4 gap-2">
              <Button
                variant="ghost"
                className="lg:hidden text-[#8892a4] hover:text-[#c8d0de] hover:bg-[#252c3d] p-1 mr-2"
                onClick={() => setMobileSidebarOpen(true)}
              >
                <Icon name="Menu" size={20} />
              </Button>
              <Icon name="Receipt" size={18} className="text-[#8892a4]" />
              <span className="text-white font-semibold">расходы</span>
              <div className="w-px h-6 bg-[#252c3d] mx-2 hidden sm:block"></div>
              <span className="text-[#8892a4] text-sm hidden sm:block">Учёт всех затрат по проекту в реальном времени</span>
              <div className="ml-auto flex items-center gap-3">
                <Icon name="Bell" size={18} className="text-[#8892a4] cursor-pointer hover:text-[#c8d0de]" />
                <Icon name="Users" size={18} className="text-[#8892a4] cursor-pointer hover:text-[#c8d0de]" />
                <Icon name="Search" size={18} className="text-[#8892a4] cursor-pointer hover:text-[#c8d0de]" />
              </div>
            </div>

            {/* Лента расходов */}
            <div className="flex-1 p-4 space-y-6 overflow-y-auto">

              {/* Hero-блок */}
              <div className="bg-gradient-to-br from-[#e67e22]/20 to-[#d35400]/10 border border-[#e67e22]/30 rounded-xl p-6 mb-2">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#e67e22] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon name="HardHat" size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-white text-xl font-bold mb-1">
                      Добро пожаловать в СтройУчёт 👷
                    </h2>
                    <p className="text-[#c8d0de] text-sm leading-relaxed mb-4">
                      Платформа для строительных компаний: учёт расходов по чекам, составление смет,
                      аналитика и рассылка отчётов заинтересованным лицам — всё в одном месте.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={() => setShowRegister(true)} className="bg-[#e67e22] hover:bg-[#d35400] text-white font-medium px-5">
                        <Icon name="Plus" size={16} className="mr-2" />
                        Зарегистрировать компанию
                      </Button>
                      <Button variant="ghost" className="text-[#c8d0de] hover:text-white hover:bg-[#252c3d] border border-[#252c3d]">
                        Посмотреть демо
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Статистика */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Расходов за месяц", value: "₽ 1 247 300", icon: "TrendingUp", color: "#e67e22" },
                  { label: "Активных объектов", value: "4", icon: "Building2", color: "#2980b9" },
                  { label: "Чеков добавлено", value: "83", icon: "Receipt", color: "#27ae60" },
                  { label: "Участников команды", value: "12", icon: "Users", color: "#8e44ad" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#141824] rounded-xl p-4 border border-[#252c3d]">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name={stat.icon} size={16} style={{ color: stat.color }} />
                      <span className="text-[#8892a4] text-xs">{stat.label}</span>
                    </div>
                    <div className="text-white font-bold text-lg">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Лента чеков */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-px h-4 bg-[#e67e22] rounded-full"></div>
                  <span className="text-[#8892a4] text-xs font-semibold uppercase tracking-wide">Последние операции</span>
                </div>
                <div className="space-y-1">
                  {receipts.map((msg, i) => (
                    <div
                      key={i}
                      className="flex gap-3 p-3 rounded-lg hover:bg-[#141824] cursor-pointer group transition-colors"
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                        style={{ backgroundColor: msg.avatarColor }}
                      >
                        {msg.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="text-white text-sm font-semibold">{msg.author}</span>
                          <span className="text-[#8892a4] text-xs">{msg.time}</span>
                        </div>
                        <p className="text-[#c8d0de] text-sm mt-0.5">{msg.text}</p>
                        {msg.amount && (
                          <div className="flex items-center gap-2 mt-2">
                            <span
                              className="text-white font-bold text-sm bg-[#252c3d] px-3 py-1 rounded-lg"
                            >
                              {msg.amount}
                            </span>
                            <span
                              className="text-xs px-2 py-0.5 rounded-full font-medium"
                              style={{ backgroundColor: msg.categoryColor + "33", color: msg.categoryColor }}
                            >
                              {msg.category}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Возможности платформы */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-px h-4 bg-[#2980b9] rounded-full"></div>
                  <span className="text-[#8892a4] text-xs font-semibold uppercase tracking-wide">Возможности платформы</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {features.map((f) => (
                    <div
                      key={f.title}
                      className="bg-[#141824] border border-[#252c3d] rounded-xl p-4 hover:border-[#e67e22]/50 transition-colors"
                    >
                      <div className="w-9 h-9 bg-[#e67e22]/15 rounded-lg flex items-center justify-center mb-3">
                        <Icon name={f.icon} size={18} className="text-[#e67e22]" />
                      </div>
                      <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
                      <p className="text-[#8892a4] text-xs leading-relaxed">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rich Presence — пример сметы */}
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-px h-4 bg-[#27ae60] rounded-full"></div>
                  <span className="text-[#8892a4] text-xs font-semibold uppercase tracking-wide">Пример сметы</span>
                </div>
                <div className="bg-[#141824] border border-[#252c3d] rounded-xl overflow-hidden max-w-md">
                  <div className="flex items-center gap-3 p-4 border-b border-[#252c3d]">
                    <div className="w-10 h-10 bg-[#27ae60] rounded-xl flex items-center justify-center">
                      <Icon name="FileText" size={18} className="text-white" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-sm">Смета — Жилой комплекс А</div>
                      <div className="text-[#8892a4] text-xs">Составлена: 9 июня 2026</div>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {[
                      { name: "Фундаментные работы", sum: "₽ 480 000" },
                      { name: "Кирпичная кладка", sum: "₽ 320 000" },
                      { name: "Кровельные материалы", sum: "₽ 215 000" },
                      { name: "Внутренняя отделка", sum: "₽ 390 000" },
                    ].map((item) => (
                      <div key={item.name} className="flex items-center justify-between py-1.5 border-b border-[#1a1f2e] last:border-0">
                        <span className="text-[#c8d0de] text-sm">{item.name}</span>
                        <span className="text-white font-semibold text-sm">{item.sum}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[#8892a4] text-sm font-semibold">ИТОГО</span>
                      <span className="text-[#27ae60] font-bold text-base">₽ 1 405 000</span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <Button className="w-full bg-[#27ae60] hover:bg-[#219a52] text-white text-sm font-medium">
                      <Icon name="Send" size={14} className="mr-2" />
                      Отправить заказчику
                    </Button>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-r from-[#141824] to-[#1a1f2e] border border-[#252c3d] rounded-xl p-6 text-center mt-4">
                <h3 className="text-white text-lg font-bold mb-2">Готовы навести порядок в учёте?</h3>
                <p className="text-[#8892a4] text-sm mb-4">
                  Зарегистрируйте компанию и добавьте первый объект за 5 минут
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={() => setShowRegister(true)} className="bg-[#e67e22] hover:bg-[#d35400] text-white px-8 py-2 font-medium">
                    Начать бесплатно
                  </Button>
                  <Button variant="ghost" className="text-[#c8d0de] hover:text-white hover:bg-[#252c3d] border border-[#252c3d]">
                    <Icon name="MessageCircle" size={16} className="mr-2" />
                    Связаться с нами
                  </Button>
                </div>
              </div>

            </div>

            {/* Нижняя панель ввода */}
            <div className="p-4 bg-[#1a1f2e] border-t border-[#0d1017]">
              <div className="flex items-center gap-3 bg-[#141824] rounded-lg px-4 py-3 border border-[#252c3d]">
                <Icon name="Plus" size={18} className="text-[#8892a4] cursor-pointer hover:text-[#e67e22] flex-shrink-0" />
                <span className="text-[#8892a4] text-sm flex-1">Добавить чек или операцию...</span>
                <div className="flex items-center gap-2">
                  <Icon name="Paperclip" size={16} className="text-[#8892a4] cursor-pointer hover:text-[#c8d0de]" />
                  <Icon name="Camera" size={16} className="text-[#8892a4] cursor-pointer hover:text-[#c8d0de]" />
                </div>
              </div>
            </div>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;