import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface RegisterModalProps {
  onClose: () => void;
  onSuccess: (company: string, project: string) => void;
}

const STEPS = ["company", "project", "admin", "done"] as const;
type Step = typeof STEPS[number];

const RegisterModal = ({ onClose, onSuccess }: RegisterModalProps) => {
  const [step, setStep] = useState<Step>("company");
  const [companyName, setCompanyName] = useState("");
  const [inn, setInn] = useState("");
  const [projectName, setProjectName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (s: Step) => {
    const e: Record<string, string> = {};
    if (s === "company") {
      if (!companyName.trim()) e.companyName = "Введите название компании";
      if (inn && !/^\d{10,12}$/.test(inn)) e.inn = "ИНН — 10 или 12 цифр";
    }
    if (s === "project") {
      if (!projectName.trim()) e.projectName = "Введите название первого объекта";
    }
    if (s === "admin") {
      if (!adminName.trim()) e.adminName = "Введите ваше имя";
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) e.email = "Введите корректный email";
      if (!password || password.length < 6) e.password = "Минимум 6 символов";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    const current = step;
    if (!validate(current)) return;
    const idx = STEPS.indexOf(current);
    setStep(STEPS[idx + 1]);
  };

  const handleDone = () => {
    onSuccess(companyName, projectName);
  };

  const stepIndex = STEPS.indexOf(step);

  const stepLabels = ["Компания", "Объект", "Аккаунт", "Готово"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#141824] border border-[#252c3d] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#252c3d]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#e67e22] rounded-xl flex items-center justify-center">
              <Icon name="HardHat" size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base">Регистрация компании</h2>
              <p className="text-[#8892a4] text-xs">СтройУчёт — платформа учёта расходов</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#8892a4] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#252c3d]">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Step Progress */}
        {step !== "done" && (
          <div className="px-6 pt-4 pb-2">
            <div className="flex items-center gap-2">
              {stepLabels.slice(0, 3).map((label, i) => (
                <div key={label} className="flex items-center gap-2 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                        i < stepIndex
                          ? "bg-[#27ae60] text-white"
                          : i === stepIndex
                          ? "bg-[#e67e22] text-white"
                          : "bg-[#252c3d] text-[#8892a4]"
                      }`}
                    >
                      {i < stepIndex ? <Icon name="Check" size={12} /> : i + 1}
                    </div>
                    <span
                      className={`text-xs font-medium ${
                        i === stepIndex ? "text-white" : i < stepIndex ? "text-[#27ae60]" : "text-[#8892a4]"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < 2 && <div className={`flex-1 h-px ${i < stepIndex ? "bg-[#27ae60]" : "bg-[#252c3d]"}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">
          {/* Step 1 — Компания */}
          {step === "company" && (
            <div className="space-y-4">
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">
                  Название компании <span className="text-[#e67e22]">*</span>
                </label>
                <input
                  autoFocus
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ООО «СтройМастер»"
                  className={`w-full bg-[#1a1f2e] border ${errors.companyName ? "border-[#e74c3c]" : "border-[#252c3d]"} rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#e67e22] transition-colors`}
                />
                {errors.companyName && <p className="text-[#e74c3c] text-xs mt-1">{errors.companyName}</p>}
              </div>
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">
                  ИНН <span className="text-[#8892a4] font-normal">(необязательно)</span>
                </label>
                <input
                  value={inn}
                  onChange={(e) => setInn(e.target.value.replace(/\D/g, ""))}
                  placeholder="7712345678"
                  maxLength={12}
                  className={`w-full bg-[#1a1f2e] border ${errors.inn ? "border-[#e74c3c]" : "border-[#252c3d]"} rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#e67e22] transition-colors`}
                />
                {errors.inn && <p className="text-[#e74c3c] text-xs mt-1">{errors.inn}</p>}
              </div>
            </div>
          )}

          {/* Step 2 — Первый объект */}
          {step === "project" && (
            <div className="space-y-4">
              <div className="bg-[#1a1f2e] rounded-xl p-3 border border-[#252c3d] flex items-center gap-2 mb-2">
                <Icon name="Building2" size={16} className="text-[#e67e22]" />
                <span className="text-[#8892a4] text-xs">Компания: </span>
                <span className="text-white text-xs font-semibold">{companyName}</span>
              </div>
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">
                  Название первого объекта <span className="text-[#e67e22]">*</span>
                </label>
                <input
                  autoFocus
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Жилой комплекс «Солнечный»"
                  className={`w-full bg-[#1a1f2e] border ${errors.projectName ? "border-[#e74c3c]" : "border-[#252c3d]"} rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#e67e22] transition-colors`}
                />
                {errors.projectName && <p className="text-[#e74c3c] text-xs mt-1">{errors.projectName}</p>}
              </div>
              <p className="text-[#8892a4] text-xs leading-relaxed">
                Можно добавить несколько объектов после регистрации. Каждый объект — отдельный учёт расходов, смета и команда.
              </p>
            </div>
          )}

          {/* Step 3 — Аккаунт администратора */}
          {step === "admin" && (
            <div className="space-y-4">
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">
                  Ваше имя <span className="text-[#e67e22]">*</span>
                </label>
                <input
                  autoFocus
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Александр Петров"
                  className={`w-full bg-[#1a1f2e] border ${errors.adminName ? "border-[#e74c3c]" : "border-[#252c3d]"} rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#e67e22] transition-colors`}
                />
                {errors.adminName && <p className="text-[#e74c3c] text-xs mt-1">{errors.adminName}</p>}
              </div>
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">
                  Email <span className="text-[#e67e22]">*</span>
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="admin@stroymaster.ru"
                  className={`w-full bg-[#1a1f2e] border ${errors.email ? "border-[#e74c3c]" : "border-[#252c3d]"} rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#e67e22] transition-colors`}
                />
                {errors.email && <p className="text-[#e74c3c] text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">
                  Пароль <span className="text-[#e67e22]">*</span>
                </label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Минимум 6 символов"
                    className={`w-full bg-[#1a1f2e] border ${errors.password ? "border-[#e74c3c]" : "border-[#252c3d]"} rounded-lg px-4 py-2.5 pr-10 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#e67e22] transition-colors`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8892a4] hover:text-white"
                  >
                    <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
                  </button>
                </div>
                {errors.password && <p className="text-[#e74c3c] text-xs mt-1">{errors.password}</p>}
              </div>
            </div>
          )}

          {/* Step Done */}
          {step === "done" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-[#27ae60]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" size={36} className="text-[#27ae60]" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Компания зарегистрирована!</h3>
              <p className="text-[#8892a4] text-sm mb-2">
                <span className="text-white font-medium">{companyName}</span> — аккаунт создан
              </p>
              <p className="text-[#8892a4] text-sm mb-6">
                Первый объект <span className="text-[#e67e22] font-medium">«{projectName}»</span> добавлен и готов к работе.
              </p>
              <div className="bg-[#1a1f2e] rounded-xl p-4 border border-[#252c3d] text-left mb-6 space-y-2">
                {[
                  { label: "Добавить прораба и команду", icon: "UserPlus" },
                  { label: "Создать первую смету", icon: "FileText" },
                  { label: "Добавить первый чек", icon: "Receipt" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-sm">
                    <Icon name={item.icon} size={14} className="text-[#e67e22]" />
                    <span className="text-[#c8d0de]">{item.label}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleDone}
                className="w-full bg-[#e67e22] hover:bg-[#d35400] text-white font-medium py-2.5"
              >
                Перейти в платформу
                <Icon name="ArrowRight" size={16} className="ml-2" />
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        {step !== "done" && (
          <div className="px-6 pb-6 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={stepIndex === 0 ? onClose : () => setStep(STEPS[stepIndex - 1])}
              className="text-[#8892a4] hover:text-white hover:bg-[#252c3d]"
            >
              {stepIndex === 0 ? "Отмена" : "Назад"}
            </Button>
            <Button
              onClick={next}
              className="bg-[#e67e22] hover:bg-[#d35400] text-white font-medium px-6"
            >
              {step === "admin" ? "Зарегистрироваться" : "Далее"}
              <Icon name="ArrowRight" size={16} className="ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterModal;
