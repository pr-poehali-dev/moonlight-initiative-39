import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Receipt {
  id: number;
  date: string;
  author: string;
  authorColor: string;
  category: string;
  description: string;
  amount: number;
  comment: string;
}

const CATEGORIES = [
  { name: "Материалы", color: "#27ae60", icon: "Package" },
  { name: "Техника", color: "#f39c12", icon: "Truck" },
  { name: "Работы", color: "#2980b9", icon: "HardHat" },
  { name: "Отделка", color: "#8e44ad", icon: "PaintBucket" },
  { name: "Прочее", color: "#8892a4", icon: "MoreHorizontal" },
];

const AUTHORS = ["Прораб Иванов", "Заказчик Смирнов", "Дизайнер Петрова", "Менеджер Кузнецов"];
const AUTHOR_COLORS: Record<string, string> = {
  "Прораб Иванов": "#e67e22",
  "Заказчик Смирнов": "#2980b9",
  "Дизайнер Петрова": "#8e44ad",
  "Менеджер Кузнецов": "#27ae60",
};

const defaultReceipts: Receipt[] = [
  { id: 1, date: "2026-06-09", author: "Прораб Иванов", authorColor: "#e67e22", category: "Материалы", description: "Арматура А500С, 12мм, 5т", amount: 142500, comment: "Поставщик: СтальМаркет" },
  { id: 2, date: "2026-06-08", author: "Дизайнер Петрова", authorColor: "#8e44ad", category: "Отделка", description: "Обои Elitis, 45 рулонов", amount: 87200, comment: "Клиент одобрил образцы" },
  { id: 3, date: "2026-06-07", author: "Прораб Иванов", authorColor: "#e67e22", category: "Техника", description: "Аренда экскаватора JCB 3CX", amount: 35000, comment: "Аренда на 2 дня" },
  { id: 4, date: "2026-06-06", author: "Менеджер Кузнецов", authorColor: "#27ae60", category: "Материалы", description: "Цемент М400, 200 мешков", amount: 48000, comment: "" },
  { id: 5, date: "2026-06-05", author: "Прораб Иванов", authorColor: "#e67e22", category: "Работы", description: "Субподряд: монолитные работы", amount: 320000, comment: "Договор №44 от 01.06.2026" },
  { id: 6, date: "2026-06-04", author: "Дизайнер Петрова", authorColor: "#8e44ad", category: "Отделка", description: "Краска Tikkurila Euro, 80 л", amount: 22400, comment: "Цвет RAL 9010" },
];

const fmt = (n: number) => n.toLocaleString("ru-RU") + " ₽";
const fmtDate = (d: string) => new Date(d).toLocaleDateString("ru-RU", { day: "2-digit", month: "short", year: "numeric" });

const emptyReceipt = (): Omit<Receipt, "id"> => ({
  date: new Date().toISOString().split("T")[0],
  author: AUTHORS[0],
  authorColor: AUTHOR_COLORS[AUTHORS[0]],
  category: "Материалы",
  description: "",
  amount: 0,
  comment: "",
});

const RaskhodySection = () => {
  const [receipts, setReceipts] = useState<Receipt[]>(defaultReceipts);
  const [filterCategory, setFilterCategory] = useState<string>("Все");
  const [filterAuthor, setFilterAuthor] = useState<string>("Все");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailId, setShowDetailId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyReceipt());
  const [formError, setFormError] = useState("");

  const filtered = useMemo(() => {
    return receipts.filter((r) => {
      if (filterCategory !== "Все" && r.category !== filterCategory) return false;
      if (filterAuthor !== "Все" && r.author !== filterAuthor) return false;
      if (search && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [receipts, filterCategory, filterAuthor, search]);

  const total = filtered.reduce((s, r) => s + r.amount, 0);
  const byCategory = useMemo(() =>
    CATEGORIES.map((c) => ({
      ...c,
      sum: receipts.filter((r) => r.category === c.name).reduce((s, r) => s + r.amount, 0),
    })), [receipts]);

  const grandTotal = receipts.reduce((s, r) => s + r.amount, 0);

  const addReceipt = () => {
    if (!form.description.trim()) { setFormError("Введите описание расхода"); return; }
    if (!form.amount || form.amount <= 0) { setFormError("Введите сумму больше 0"); return; }
    setReceipts((prev) => [
      { ...form, id: Date.now(), authorColor: AUTHOR_COLORS[form.author] || "#8892a4" },
      ...prev,
    ]);
    setShowAddModal(false);
    setForm(emptyReceipt());
    setFormError("");
  };

  const deleteReceipt = (id: number) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
    if (showDetailId === id) setShowDetailId(null);
  };

  const exportPDF = () => {
    const doc = new jsPDF();

    // Заголовок
    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text("Отчёт по расходам", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Проект: Жилой комплекс А`, 14, 28);
    doc.text(`Дата формирования: ${new Date().toLocaleDateString("ru-RU")}`, 14, 34);
    doc.text(`Фильтр: ${filterCategory !== "Все" ? filterCategory : "Все категории"} · ${filterAuthor !== "Все" ? filterAuthor : "Все участники"}`, 14, 40);

    // Итог
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text(`Итого: ${fmt(total)}`, 14, 50);

    // Таблица
    autoTable(doc, {
      startY: 56,
      head: [["Дата", "Участник", "Категория", "Описание", "Сумма"]],
      body: filtered.map((r) => [
        fmtDate(r.date),
        r.author,
        r.category,
        r.description,
        fmt(r.amount),
      ]),
      headStyles: { fillColor: [230, 126, 34], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [248, 248, 248] },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: { 4: { halign: "right", fontStyle: "bold" } },
    });

    // Разбивка по категориям
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? 60;
    if (finalY + 60 < doc.internal.pageSize.height) {
      doc.setFontSize(11);
      doc.setTextColor(40, 40, 40);
      doc.text("Разбивка по категориям:", 14, finalY + 12);
      autoTable(doc, {
        startY: finalY + 18,
        head: [["Категория", "Сумма"]],
        body: byCategory.map((c) => [c.name, fmt(c.sum)]),
        headStyles: { fillColor: [60, 70, 90] },
        styles: { fontSize: 9 },
        columnStyles: { 1: { halign: "right" } },
        tableWidth: 90,
      });
    }

    doc.save(`raskhody_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const detailReceipt = receipts.find((r) => r.id === showDetailId);
  const catColor = (name: string) => CATEGORIES.find((c) => c.name === name)?.color ?? "#8892a4";

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Шапка */}
      <div className="h-12 bg-[#1a1f2e] border-b border-[#0d1017] flex items-center px-4 gap-2 flex-shrink-0">
        <Icon name="Receipt" size={18} className="text-[#8892a4]" />
        <span className="text-white font-semibold">расходы</span>
        <div className="w-px h-6 bg-[#252c3d] mx-2 hidden sm:block" />
        <span className="text-[#8892a4] text-sm hidden sm:block">Учёт чеков и затрат по проекту</span>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" onClick={() => { setForm(emptyReceipt()); setShowAddModal(true); }}
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
        {/* Статистика по категориям */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {byCategory.map((c) => (
            <div key={c.name}
              onClick={() => setFilterCategory(filterCategory === c.name ? "Все" : c.name)}
              className={`bg-[#141824] border rounded-xl p-3 cursor-pointer transition-all ${filterCategory === c.name ? "border-[#e67e22] bg-[#e67e22]/10" : "border-[#252c3d] hover:border-[#8892a4]"}`}>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Icon name={c.icon} size={13} style={{ color: c.color }} />
                <span className="text-[#8892a4] text-xs">{c.name}</span>
              </div>
              <div className="text-white font-bold text-sm">{c.sum > 0 ? fmt(c.sum) : "—"}</div>
            </div>
          ))}
        </div>

        {/* Итог + фильтры */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="bg-[#141824] border border-[#252c3d] rounded-xl px-4 py-2.5 flex items-center gap-3">
            <div>
              <div className="text-[#8892a4] text-xs">Всего расходов</div>
              <div className="text-white font-bold text-lg">{fmt(grandTotal)}</div>
            </div>
            <div className="w-px h-8 bg-[#252c3d]" />
            <div>
              <div className="text-[#8892a4] text-xs">Показано</div>
              <div className="text-[#e67e22] font-bold text-lg">{fmt(total)}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 flex-1">
            {/* Поиск */}
            <div className="relative flex-1 min-w-[160px]">
              <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8892a4]" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по описанию..."
                className="w-full bg-[#141824] border border-[#252c3d] rounded-lg pl-8 pr-3 py-2 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#e67e22] transition-colors" />
            </div>
            {/* Фильтр по участнику */}
            <select value={filterAuthor} onChange={(e) => setFilterAuthor(e.target.value)}
              className="bg-[#141824] border border-[#252c3d] rounded-lg px-3 py-2 text-[#c8d0de] text-sm outline-none focus:border-[#e67e22] cursor-pointer">
              <option value="Все">Все участники</option>
              {AUTHORS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* Список чеков */}
        <div className="bg-[#141824] border border-[#252c3d] rounded-xl overflow-hidden">
          {/* Заголовок таблицы */}
          <div className="hidden sm:grid grid-cols-[1fr_140px_120px_110px_44px] gap-2 px-4 py-2.5 border-b border-[#252c3d]">
            <span className="text-[#8892a4] text-xs font-semibold uppercase tracking-wide">Описание</span>
            <span className="text-[#8892a4] text-xs font-semibold uppercase tracking-wide">Участник</span>
            <span className="text-[#8892a4] text-xs font-semibold uppercase tracking-wide">Категория</span>
            <span className="text-[#8892a4] text-xs font-semibold uppercase tracking-wide text-right">Сумма</span>
            <span />
          </div>

          {filtered.length === 0 && (
            <div className="text-center text-[#8892a4] text-sm py-12">
              <div className="flex flex-col items-center gap-2">
                <Icon name="Receipt" size={32} className="text-[#252c3d]" />
                <span>Чеки не найдены</span>
              </div>
            </div>
          )}

          {filtered.map((r, idx) => (
            <div key={r.id}
              className={`flex sm:grid sm:grid-cols-[1fr_140px_120px_110px_44px] gap-2 items-center px-4 py-3 hover:bg-[#1a1f2e] cursor-pointer group transition-colors ${idx !== filtered.length - 1 ? "border-b border-[#1a1f2e]" : ""}`}
              onClick={() => setShowDetailId(r.id)}>

              {/* Описание */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ backgroundColor: r.authorColor }}>
                  {r.author.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-[#c8d0de] text-sm font-medium truncate">{r.description}</div>
                  <div className="text-[#8892a4] text-xs mt-0.5">{fmtDate(r.date)}</div>
                </div>
              </div>

              {/* Участник */}
              <div className="hidden sm:block text-[#8892a4] text-sm truncate">{r.author.split(" ")[0]}</div>

              {/* Категория */}
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: catColor(r.category) }} />
                <span className="text-sm text-[#c8d0de]">{r.category}</span>
              </div>

              {/* Сумма */}
              <div className="text-right ml-auto sm:ml-0">
                <span className="text-white font-bold text-sm">{fmt(r.amount)}</span>
              </div>

              {/* Удалить */}
              <div className="flex-shrink-0 hidden sm:flex justify-center">
                <button onClick={(e) => { e.stopPropagation(); deleteReceipt(r.id); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8892a4] hover:text-[#e74c3c] p-1 rounded hover:bg-[#e74c3c]/10">
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Модал добавления чека */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-[#141824] border border-[#252c3d] rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#252c3d]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#e67e22]/20 rounded-lg flex items-center justify-center">
                  <Icon name="Receipt" size={16} className="text-[#e67e22]" />
                </div>
                <h3 className="text-white font-bold">Добавить чек</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-[#8892a4] hover:text-white p-1">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* Описание */}
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Описание <span className="text-[#e67e22]">*</span></label>
                <input autoFocus value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Арматура А500С, 5т"
                  className="w-full bg-[#1a1f2e] border border-[#252c3d] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#e67e22] transition-colors" />
              </div>

              {/* Сумма */}
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Сумма, ₽ <span className="text-[#e67e22]">*</span></label>
                <input type="number" min="0" value={form.amount || ""}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="150 000"
                  className="w-full bg-[#1a1f2e] border border-[#252c3d] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#e67e22] transition-colors" />
              </div>

              {/* Дата + Участник */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Дата</label>
                  <input type="date" value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full bg-[#1a1f2e] border border-[#252c3d] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#e67e22] transition-colors" />
                </div>
                <div>
                  <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Участник</label>
                  <select value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value, authorColor: AUTHOR_COLORS[e.target.value] || "#8892a4" })}
                    className="w-full bg-[#1a1f2e] border border-[#252c3d] rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-[#e67e22] transition-colors cursor-pointer">
                    {AUTHORS.map((a) => <option key={a} value={a}>{a.split(" ")[0]}</option>)}
                  </select>
                </div>
              </div>

              {/* Категория */}
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Категория</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c.name} type="button"
                      onClick={() => setForm({ ...form, category: c.name })}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${form.category === c.name ? "text-white" : "bg-[#1a1f2e] text-[#8892a4] hover:text-white border border-[#252c3d]"}`}
                      style={form.category === c.name ? { backgroundColor: c.color + "33", borderColor: c.color, border: "1px solid", color: c.color } : {}}>
                      <Icon name={c.icon} size={13} />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Комментарий */}
              <div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Комментарий</label>
                <input value={form.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
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
                className="text-[#8892a4] hover:text-white hover:bg-[#252c3d] flex-1">
                Отмена
              </Button>
              <Button onClick={addReceipt}
                className="bg-[#e67e22] hover:bg-[#d35400] text-white flex-1 font-medium">
                <Icon name="Plus" size={15} className="mr-2" />
                Добавить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Модал детали чека */}
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
                    style={{ backgroundColor: detailReceipt.authorColor }}>
                    {detailReceipt.author.charAt(0)}
                  </div>
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
              <div>
                <span className="text-[#8892a4] text-sm block mb-1">Описание</span>
                <span className="text-[#c8d0de] text-sm">{detailReceipt.description}</span>
              </div>
              {detailReceipt.comment && (
                <div>
                  <span className="text-[#8892a4] text-sm block mb-1">Комментарий</span>
                  <span className="text-[#c8d0de] text-sm">{detailReceipt.comment}</span>
                </div>
              )}
            </div>
            <div className="px-5 pb-5 flex gap-3">
              <Button variant="ghost"
                onClick={() => { deleteReceipt(detailReceipt.id); }}
                className="text-[#e74c3c] hover:text-white hover:bg-[#e74c3c]/20 flex-1">
                <Icon name="Trash2" size={14} className="mr-2" />
                Удалить
              </Button>
              <Button onClick={() => setShowDetailId(null)}
                className="bg-[#252c3d] hover:bg-[#2f3749] text-white flex-1">
                Закрыть
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RaskhodySection;
