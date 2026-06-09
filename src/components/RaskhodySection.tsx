import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ─── Типы ───────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface Receipt {
  id: number;
  date: string;
  author: string;
  authorColor: string;
  category: string;
  description: string;
  amount: number;
  comment: string;
  photoBase64: string | null;   // фото чека
  funding: "personal" | "advance" | "client"; // источник финансирования
}

// ─── Константы ──────────────────────────────────────────────────────────────

const DEFAULT_CATEGORIES: Category[] = [
  { id: "c1",  name: "Чистовые материалы", color: "#27ae60", icon: "Sparkles" },
  { id: "c2",  name: "Черновые материалы", color: "#e67e22", icon: "Layers" },
  { id: "c3",  name: "Электрика",           color: "#f1c40f", icon: "Zap" },
  { id: "c4",  name: "Сантехника",          color: "#2980b9", icon: "Droplets" },
  { id: "c5",  name: "Инструменты",         color: "#e74c3c", icon: "Wrench" },
  { id: "c6",  name: "Техника/Аренда",      color: "#8e44ad", icon: "Truck" },
  { id: "c7",  name: "Работы/Субподряд",    color: "#16a085", icon: "HardHat" },
  { id: "c8",  name: "Прочее",              color: "#8892a4", icon: "MoreHorizontal" },
];

const FUNDING_OPTIONS = [
  { value: "personal", label: "Личные средства",    sub: "Требуется возврат от заказчика", color: "#e74c3c", icon: "Wallet" },
  { value: "advance",  label: "Из аванса",           sub: "Списывается с аванса проекта",  color: "#f39c12", icon: "CreditCard" },
  { value: "client",   label: "Оплачено заказчиком", sub: "Заказчик оплатил напрямую",    color: "#27ae60", icon: "UserCheck" },
] as const;

const AUTHORS = ["Прораб Иванов", "Заказчик Смирнов", "Дизайнер Петрова", "Менеджер Кузнецов"];
const AUTHOR_COLORS: Record<string, string> = {
  "Прораб Иванов":    "#e67e22",
  "Заказчик Смирнов": "#2980b9",
  "Дизайнер Петрова": "#8e44ad",
  "Менеджер Кузнецов":"#27ae60",
};

const defaultReceipts: Receipt[] = [
  { id: 1, date: "2026-06-09", author: "Прораб Иванов",    authorColor: "#e67e22", category: "Черновые материалы",  description: "Арматура А500С, 12мм, 5т",        amount: 142500, comment: "Поставщик: СтальМаркет",     photoBase64: null, funding: "advance"  },
  { id: 2, date: "2026-06-08", author: "Дизайнер Петрова", authorColor: "#8e44ad", category: "Чистовые материалы",  description: "Обои Elitis, 45 рулонов",          amount: 87200,  comment: "Клиент одобрил образцы",    photoBase64: null, funding: "client"   },
  { id: 3, date: "2026-06-07", author: "Прораб Иванов",    authorColor: "#e67e22", category: "Техника/Аренда",      description: "Аренда экскаватора JCB 3CX",       amount: 35000,  comment: "Аренда на 2 дня",           photoBase64: null, funding: "personal" },
  { id: 4, date: "2026-06-06", author: "Менеджер Кузнецов",authorColor: "#27ae60", category: "Черновые материалы",  description: "Цемент М400, 200 мешков",          amount: 48000,  comment: "",                          photoBase64: null, funding: "advance"  },
  { id: 5, date: "2026-06-05", author: "Прораб Иванов",    authorColor: "#e67e22", category: "Работы/Субподряд",    description: "Субподряд: монолитные работы",     amount: 320000, comment: "Договор №44 от 01.06.2026", photoBase64: null, funding: "advance"  },
  { id: 6, date: "2026-06-04", author: "Дизайнер Петрова", authorColor: "#8e44ad", category: "Электрика",           description: "Кабель ВВГнг 3×2.5, 500м",        amount: 54000,  comment: "",                          photoBase64: null, funding: "client"   },
  { id: 7, date: "2026-06-03", author: "Прораб Иванов",    authorColor: "#e67e22", category: "Сантехника",          description: "Трубы PPR 32мм + фитинги",        amount: 28500,  comment: "",                          photoBase64: null, funding: "personal" },
];

// ─── Утилиты ─────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";
const fmtDate = (d: string) => new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });

const fundingInfo = (f: Receipt["funding"]) => FUNDING_OPTIONS.find(o => o.value === f)!;

// PDF: кириллица через latin транслитерацию (без внешних шрифтов)
const toLatinPdf = (s: string) => {
  const map: Record<string, string> = {
    а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"j",
    к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",
    х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"shch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya",
    А:"A",Б:"B",В:"V",Г:"G",Д:"D",Е:"E",Ё:"Yo",Ж:"Zh",З:"Z",И:"I",Й:"J",
    К:"K",Л:"L",М:"M",Н:"N",О:"O",П:"P",Р:"R",С:"S",Т:"T",У:"U",Ф:"F",
    Х:"Kh",Ц:"Ts",Ч:"Ch",Ш:"Sh",Щ:"Shch",Ъ:"",Ы:"Y",Ь:"",Э:"E",Ю:"Yu",Я:"Ya",
    "№":"No.",
  };
  return s.split("").map(c => map[c] ?? c).join("");
};

const emptyForm = (cats: Category[]): Omit<Receipt, "id"> => ({
  date: new Date().toISOString().split("T")[0],
  author: AUTHORS[0],
  authorColor: AUTHOR_COLORS[AUTHORS[0]],
  category: cats[0]?.name ?? "",
  description: "",
  amount: 0,
  comment: "",
  photoBase64: null,
  funding: "advance",
});

// ─── Компонент ───────────────────────────────────────────────────────────────

const RaskhodySection = () => {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [receipts, setReceipts]     = useState<Receipt[]>(defaultReceipts);

  const [filterCategory, setFilterCategory] = useState("Все");
  const [filterAuthor,   setFilterAuthor]   = useState("Все");
  const [filterFunding,  setFilterFunding]  = useState("Все");
  const [search,         setSearch]         = useState("");

  const [showAddModal,    setShowAddModal]    = useState(false);
  const [showDetailId,    setShowDetailId]    = useState<number | null>(null);
  const [showCatSettings, setShowCatSettings] = useState(false);

  const [form,      setForm]      = useState<Omit<Receipt,"id">>(emptyForm(categories));
  const [formError, setFormError] = useState("");

  // Настройки категорий
  const [newCatName,  setNewCatName]  = useState("");
  const [newCatColor, setNewCatColor] = useState("#3498db");

  const photoInputRef = useRef<HTMLInputElement>(null);

  // ── Фильтрация ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => receipts.filter(r => {
    if (filterCategory !== "Все" && r.category !== filterCategory) return false;
    if (filterAuthor   !== "Все" && r.author   !== filterAuthor)   return false;
    if (filterFunding  !== "Все" && r.funding  !== filterFunding)  return false;
    if (search && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [receipts, filterCategory, filterAuthor, filterFunding, search]);

  const total      = filtered.reduce((s, r) => s + r.amount, 0);
  const grandTotal = receipts.reduce((s, r) => s + r.amount, 0);

  const byCategory = useMemo(() =>
    categories.map(c => ({
      ...c,
      sum: receipts.filter(r => r.category === c.name).reduce((s, r) => s + r.amount, 0),
    })), [receipts, categories]);

  const personalTotal = receipts.filter(r => r.funding === "personal").reduce((s,r) => s+r.amount, 0);

  const catColor = (name: string) => categories.find(c => c.name === name)?.color ?? "#8892a4";
  const catIcon  = (name: string) => categories.find(c => c.name === name)?.icon  ?? "Tag";
  const detailReceipt = receipts.find(r => r.id === showDetailId);

  // ── Действия ────────────────────────────────────────────────────────────

  const addReceipt = () => {
    if (!form.description.trim()) { setFormError("Введите описание расхода"); return; }
    if (!form.amount || form.amount <= 0) { setFormError("Введите сумму больше 0"); return; }
    setReceipts(prev => [{ ...form, id: Date.now() }, ...prev]);
    setShowAddModal(false);
    setForm(emptyForm(categories));
    setFormError("");
  };

  const deleteReceipt = (id: number) => {
    setReceipts(prev => prev.filter(r => r.id !== id));
    if (showDetailId === id) setShowDetailId(null);
  };

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, photoBase64: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    setCategories(prev => [...prev, {
      id: "c" + Date.now(),
      name: newCatName.trim(),
      color: newCatColor,
      icon: "Tag",
    }]);
    setNewCatName("");
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  // ── PDF (транслитерация) ─────────────────────────────────────────────────

  const exportPDF = () => {
    const doc = new jsPDF();
    const tr = toLatinPdf;

    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text(tr("Otchet po raskhodam — Zhiloy kompleks A"), 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text(tr(`Data: ${new Date().toLocaleDateString("ru-RU")}`), 14, 25);
    doc.text(tr(`Vsego: ${fmt(total)}`), 14, 30);

    // Источник финансирования
    doc.setFontSize(8);
    doc.text(tr(`Lichnye (vozvrat): ${fmt(personalTotal)}`), 14, 36);

    autoTable(doc, {
      startY: 42,
      head: [[tr("Data"), tr("Uchastnik"), tr("Kategoriya"), tr("Opisanie"), tr("Istochnik"), tr("Summa")]],
      body: filtered.map(r => [
        fmtDate(r.date),
        tr(r.author),
        tr(r.category),
        tr(r.description),
        tr(fundingInfo(r.funding).label),
        fmt(r.amount),
      ]),
      headStyles: { fillColor: [230, 126, 34], textColor: 255 },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      styles: { fontSize: 8, cellPadding: 2.5 },
      columnStyles: { 5: { halign: "right", fontStyle: "bold" } },
    });

    const y2 = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 60;
    if (y2 + 50 < doc.internal.pageSize.height) {
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(tr("Razбivka po kategoriyam:"), 14, y2 + 10);
      autoTable(doc, {
        startY: y2 + 16,
        head: [[tr("Kategoriya"), tr("Summa")]],
        body: byCategory.map(c => [tr(c.name), fmt(c.sum)]),
        headStyles: { fillColor: [40, 50, 65] },
        styles: { fontSize: 8 },
        columnStyles: { 1: { halign: "right" } },
        tableWidth: 100,
      });
    }

    doc.save(`raskhody_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // ── Рендер ───────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col overflow-hidden">

      {/* Шапка */}
      <div className="h-12 bg-[#1a1f2e] border-b border-[#0d1017] flex items-center px-4 gap-2 flex-shrink-0">
        <Icon name="Receipt" size={18} className="text-[#8892a4]" />
        <span className="text-white font-semibold">расходы</span>
        <div className="w-px h-6 bg-[#252c3d] mx-2 hidden sm:block" />
        <span className="text-[#8892a4] text-sm hidden sm:block">Учёт чеков и затрат по проекту</span>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={() => setShowCatSettings(true)}
            variant="ghost" className="text-[#8892a4] hover:text-white hover:bg-[#252c3d] text-xs px-3 h-7">
            <Icon name="Settings" size={13} className="mr-1.5" />
            Категории
          </Button>
          <Button size="sm" onClick={() => { setForm(emptyForm(categories)); setShowAddModal(true); }}
            className="bg-[#e67e22] hover:bg-[#d35400] text-white text-xs px-3 h-7">
            <Icon name="Plus" size={13} className="mr-1.5" />
            Добавить чек
          </Button>
          <Button size="sm" variant="ghost" onClick={exportPDF}
            className="text-[#8892a4] hover:text-white hover:bg-[#252c3d] text-xs px-3 h-7">
            <Icon name="Download" size={13} className="mr-1.5" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Карточки категорий */}
        <div className="flex gap-2 flex-wrap">
          {byCategory.map(c => (
            <div key={c.id} onClick={() => setFilterCategory(filterCategory === c.name ? "Все" : c.name)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all flex-shrink-0 ${
                filterCategory === c.name
                  ? "border-[#e67e22] bg-[#e67e22]/10"
                  : "bg-[#141824] border-[#252c3d] hover:border-[#8892a4]"}`}>
              <Icon name={c.icon} size={13} style={{ color: c.color }} />
              <span className="text-[#8892a4] text-xs">{c.name}</span>
              {c.sum > 0 && <span className="text-white text-xs font-bold">{fmt(c.sum)}</span>}
            </div>
          ))}
        </div>

        {/* Итог + фильтры */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">

          {/* Суммы */}
          <div className="bg-[#141824] border border-[#252c3d] rounded-xl px-4 py-2.5 flex items-center gap-4 flex-shrink-0">
            <div>
              <div className="text-[#8892a4] text-xs">Всего</div>
              <div className="text-white font-bold">{fmt(grandTotal)}</div>
            </div>
            <div className="w-px h-8 bg-[#252c3d]" />
            <div>
              <div className="text-[#8892a4] text-xs">Показано</div>
              <div className="text-[#e67e22] font-bold">{fmt(total)}</div>
            </div>
            {personalTotal > 0 && <>
              <div className="w-px h-8 bg-[#252c3d]" />
              <div>
                <div className="text-[#e74c3c] text-xs">К возврату</div>
                <div className="text-[#e74c3c] font-bold">{fmt(personalTotal)}</div>
              </div>
            </>}
          </div>

          {/* Поиск и фильтры */}
          <div className="flex flex-wrap gap-2 flex-1">
            <div className="relative min-w-[160px] flex-1">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8892a4]" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Поиск по описанию..."
                className="w-full bg-[#141824] border border-[#252c3d] rounded-lg pl-8 pr-3 py-2 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#e67e22] transition-colors" />
            </div>
            <select value={filterAuthor} onChange={e => setFilterAuthor(e.target.value)}
              className="bg-[#141824] border border-[#252c3d] rounded-lg px-3 py-2 text-[#c8d0de] text-sm outline-none focus:border-[#e67e22] cursor-pointer">
              <option value="Все">Все участники</option>
              {AUTHORS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select value={filterFunding} onChange={e => setFilterFunding(e.target.value)}
              className="bg-[#141824] border border-[#252c3d] rounded-lg px-3 py-2 text-[#c8d0de] text-sm outline-none focus:border-[#e67e22] cursor-pointer">
              <option value="Все">Все источники</option>
              {FUNDING_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Таблица чеков */}
        <div className="bg-[#141824] border border-[#252c3d] rounded-xl overflow-hidden">
          <div className="hidden sm:grid grid-cols-[auto_1fr_130px_120px_120px_52px] gap-2 px-4 py-2.5 border-b border-[#252c3d]">
            {["", "Описание", "Категория", "Источник", "Сумма", ""].map((h, i) => (
              <span key={i} className={`text-[#8892a4] text-xs font-semibold uppercase tracking-wide ${i >= 3 ? "text-right" : ""}`}>{h}</span>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12 flex flex-col items-center gap-2">
              <Icon name="Receipt" size={32} className="text-[#252c3d]" />
              <span className="text-[#8892a4] text-sm">Чеки не найдены</span>
            </div>
          )}

          {filtered.map((r, idx) => {
            const fi = fundingInfo(r.funding);
            return (
              <div key={r.id} onClick={() => setShowDetailId(r.id)}
                className={`flex sm:grid sm:grid-cols-[auto_1fr_130px_120px_120px_52px] gap-2 items-center px-4 py-3 hover:bg-[#1a1f2e] cursor-pointer group transition-colors ${idx !== filtered.length - 1 ? "border-b border-[#1a1f2e]" : ""}`}>

                {/* Фото-иконка */}
                <div className="flex-shrink-0 hidden sm:flex">
                  {r.photoBase64
                    ? <img src={r.photoBase64} alt="чек" className="w-9 h-9 object-cover rounded-lg border border-[#252c3d]" />
                    : <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: r.authorColor }}>
                        {r.author.charAt(0)}
                      </div>}
                </div>

                {/* Описание */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="sm:hidden w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: r.authorColor }}>{r.author.charAt(0)}</div>
                  <div className="min-w-0">
                    <div className="text-[#c8d0de] text-sm font-medium truncate">{r.description}</div>
                    <div className="text-[#8892a4] text-xs mt-0.5">{fmtDate(r.date)} · {r.author.split(" ")[0]}</div>
                  </div>
                </div>

                {/* Категория */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <Icon name={catIcon(r.category)} size={12} style={{ color: catColor(r.category) }} />
                  <span className="text-sm text-[#c8d0de] truncate">{r.category}</span>
                </div>

                {/* Источник */}
                <div className="hidden sm:flex items-center gap-1.5 justify-end">
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: fi.color + "22", color: fi.color }}>
                    {fi.label.split(" ")[0]}
                  </span>
                  {r.photoBase64 && <Icon name="ImageIcon" size={12} className="text-[#8892a4]" />}
                </div>

                {/* Сумма */}
                <div className="text-right ml-auto sm:ml-0 flex-shrink-0">
                  <span className="text-white font-bold text-sm">{fmt(r.amount)}</span>
                  {r.funding === "personal" &&
                    <div className="text-[#e74c3c] text-xs">к возврату</div>}
                </div>

                {/* Удалить */}
                <div className="hidden sm:flex justify-center flex-shrink-0">
                  <button onClick={e => { e.stopPropagation(); deleteReceipt(r.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8892a4] hover:text-[#e74c3c] p-1 rounded hover:bg-[#e74c3c]/10">
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Модал добавления чека ─────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-[#141824] border border-[#252c3d] rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#252c3d] sticky top-0 bg-[#141824] z-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#e67e22]/20 rounded-lg flex items-center justify-center">
                  <Icon name="Receipt" size={16} className="text-[#e67e22]" />
                </div>
                <h3 className="text-white font-bold">Добавить чек</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-[#8892a4] hover:text-white">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">

              {/* Описание */}
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Описание <span className="text-[#e67e22]">*</span></label>
                <input autoFocus value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Арматура А500С, 5т"
                  className="w-full bg-[#1a1f2e] border border-[#252c3d] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#e67e22] transition-colors" />
              </div>

              {/* Сумма + Дата */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Сумма, ₽ <span className="text-[#e67e22]">*</span></label>
                  <input type="number" min="0" value={form.amount || ""}
                    onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                    placeholder="150 000"
                    className="w-full bg-[#1a1f2e] border border-[#252c3d] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#e67e22] transition-colors" />
                </div>
                <div>
                  <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Дата</label>
                  <input type="date" value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-[#1a1f2e] border border-[#252c3d] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#e67e22] transition-colors" />
                </div>
              </div>

              {/* Участник */}
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Участник</label>
                <select value={form.author}
                  onChange={e => setForm({ ...form, author: e.target.value, authorColor: AUTHOR_COLORS[e.target.value] || "#8892a4" })}
                  className="w-full bg-[#1a1f2e] border border-[#252c3d] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#e67e22] transition-colors cursor-pointer">
                  {AUTHORS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              {/* Категория */}
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Категория</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c => (
                    <button key={c.id} type="button"
                      onClick={() => setForm({ ...form, category: c.name })}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border"
                      style={form.category === c.name
                        ? { backgroundColor: c.color + "33", borderColor: c.color, color: c.color }
                        : { backgroundColor: "#1a1f2e", borderColor: "#252c3d", color: "#8892a4" }}>
                      <Icon name={c.icon} size={12} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Источник финансирования */}
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Источник финансирования</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {FUNDING_OPTIONS.map(o => (
                    <button key={o.value} type="button"
                      onClick={() => setForm({ ...form, funding: o.value })}
                      className="flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl border transition-all text-left"
                      style={form.funding === o.value
                        ? { backgroundColor: o.color + "22", borderColor: o.color }
                        : { backgroundColor: "#1a1f2e", borderColor: "#252c3d" }}>
                      <div className="flex items-center gap-1.5">
                        <Icon name={o.icon} size={13} style={{ color: o.color }} />
                        <span className="text-sm font-medium" style={{ color: form.funding === o.value ? o.color : "#c8d0de" }}>
                          {o.label}
                        </span>
                      </div>
                      <span className="text-[#8892a4] text-xs leading-tight">{o.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Фото чека */}
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Фото чека</label>
                <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                {form.photoBase64 ? (
                  <div className="relative inline-block">
                    <img src={form.photoBase64} alt="чек" className="h-32 rounded-xl border border-[#252c3d] object-cover" />
                    <button onClick={() => setForm({ ...form, photoBase64: null })}
                      className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-1 text-white hover:bg-[#e74c3c]">
                      <Icon name="X" size={12} />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => photoInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-3 bg-[#1a1f2e] border border-dashed border-[#252c3d] rounded-xl text-[#8892a4] hover:border-[#e67e22] hover:text-white transition-colors text-sm w-full justify-center">
                    <Icon name="Camera" size={16} />
                    Прикрепить фото чека
                  </button>
                )}
              </div>

              {/* Комментарий */}
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Комментарий</label>
                <input value={form.comment}
                  onChange={e => setForm({ ...form, comment: e.target.value })}
                  placeholder="Поставщик, договор, заметка..."
                  className="w-full bg-[#1a1f2e] border border-[#252c3d] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#e67e22] transition-colors" />
              </div>

              {formError && (
                <div className="flex items-center gap-2 text-[#e74c3c] text-sm bg-[#e74c3c]/10 px-3 py-2 rounded-lg">
                  <Icon name="AlertCircle" size={14} />
                  {formError}
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}
                className="text-[#8892a4] hover:text-white hover:bg-[#252c3d] flex-1">Отмена</Button>
              <Button onClick={addReceipt}
                className="bg-[#e67e22] hover:bg-[#d35400] text-white flex-1 font-medium">
                <Icon name="Plus" size={15} className="mr-2" />
                Добавить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Детали чека ───────────────────────────────────────────────── */}
      {detailReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDetailId(null)} />
          <div className="relative bg-[#141824] border border-[#252c3d] rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#252c3d]">
              <h3 className="text-white font-bold">Детали чека</h3>
              <button onClick={() => setShowDetailId(null)} className="text-[#8892a4] hover:text-white">
                <Icon name="X" size={18} />
              </button>
            </div>

            {detailReceipt.photoBase64 && (
              <div className="px-5 pt-4">
                <img src={detailReceipt.photoBase64} alt="чек" className="w-full rounded-xl border border-[#252c3d] object-contain max-h-48" />
              </div>
            )}

            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#8892a4] text-sm">Сумма</span>
                <span className="text-white font-bold text-xl">{fmt(detailReceipt.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8892a4] text-sm">Дата</span>
                <span className="text-[#c8d0de] text-sm">{fmtDate(detailReceipt.date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8892a4] text-sm">Участник</span>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: detailReceipt.authorColor }}>{detailReceipt.author.charAt(0)}</div>
                  <span className="text-[#c8d0de] text-sm">{detailReceipt.author}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8892a4] text-sm">Категория</span>
                <span className="text-sm font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: catColor(detailReceipt.category) + "33", color: catColor(detailReceipt.category) }}>
                  {detailReceipt.category}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#8892a4] text-sm">Источник</span>
                {(() => {
                  const fi = fundingInfo(detailReceipt.funding);
                  return (
                    <span className="text-sm font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: fi.color + "22", color: fi.color }}>
                      <Icon name={fi.icon} size={12} />
                      {fi.label}
                    </span>
                  );
                })()}
              </div>
              {detailReceipt.description && (
                <div>
                  <span className="text-[#8892a4] text-sm block mb-1">Описание</span>
                  <span className="text-[#c8d0de] text-sm">{detailReceipt.description}</span>
                </div>
              )}
              {detailReceipt.comment && (
                <div>
                  <span className="text-[#8892a4] text-sm block mb-1">Комментарий</span>
                  <span className="text-[#c8d0de] text-sm">{detailReceipt.comment}</span>
                </div>
              )}
            </div>

            <div className="px-5 pb-5 flex gap-3">
              <Button variant="ghost" onClick={() => deleteReceipt(detailReceipt.id)}
                className="text-[#e74c3c] hover:text-white hover:bg-[#e74c3c]/20 flex-1">
                <Icon name="Trash2" size={14} className="mr-2" />
                Удалить
              </Button>
              <Button onClick={() => setShowDetailId(null)}
                className="bg-[#252c3d] hover:bg-[#2f3749] text-white flex-1">Закрыть</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Настройки категорий ───────────────────────────────────────── */}
      {showCatSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCatSettings(false)} />
          <div className="relative bg-[#141824] border border-[#252c3d] rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] flex flex-col">

            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#252c3d]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#252c3d] rounded-lg flex items-center justify-center">
                  <Icon name="Settings" size={16} className="text-[#8892a4]" />
                </div>
                <h3 className="text-white font-bold">Управление категориями</h3>
              </div>
              <button onClick={() => setShowCatSettings(false)} className="text-[#8892a4] hover:text-white">
                <Icon name="X" size={18} />
              </button>
            </div>

            {/* Список */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
              {categories.map(c => (
                <div key={c.id}
                  className="flex items-center gap-3 bg-[#1a1f2e] border border-[#252c3d] rounded-xl px-3 py-2.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                  <Icon name={c.icon} size={15} style={{ color: c.color }} />
                  <span className="text-[#c8d0de] text-sm flex-1">{c.name}</span>
                  <button onClick={() => deleteCategory(c.id)}
                    className="text-[#8892a4] hover:text-[#e74c3c] p-1 rounded hover:bg-[#e74c3c]/10 transition-colors">
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Добавить */}
            <div className="px-6 pb-6 border-t border-[#252c3d] pt-4">
              <p className="text-[#8892a4] text-xs mb-3">Добавить новую категорию</p>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={newCatColor}
                  onChange={e => setNewCatColor(e.target.value)}
                  className="w-10 h-10 rounded-lg border border-[#252c3d] cursor-pointer bg-[#1a1f2e] p-1"
                />
                <input value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCategory()}
                  placeholder="Название категории..."
                  className="flex-1 bg-[#1a1f2e] border border-[#252c3d] rounded-lg px-3 py-2 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#e67e22] transition-colors" />
                <Button onClick={addCategory}
                  className="bg-[#e67e22] hover:bg-[#d35400] text-white px-4">
                  <Icon name="Plus" size={15} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RaskhodySection;
