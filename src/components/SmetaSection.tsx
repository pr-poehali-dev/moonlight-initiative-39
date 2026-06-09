import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

interface SmetaItem {
  id: number;
  name: string;
  unit: string;
  qty: string;
  price: string;
}

interface Smeta {
  id: number;
  title: string;
  items: SmetaItem[];
}

const UNITS = ["шт.", "м²", "м³", "м.п.", "т", "кг", "л", "компл.", "услуга"];

const formatNum = (n: number) =>
  n.toLocaleString("ru-RU", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const emptyItem = (): SmetaItem => ({
  id: Date.now() + Math.random(),
  name: "",
  unit: "шт.",
  qty: "",
  price: "",
});

const defaultSmetas: Smeta[] = [
  {
    id: 1,
    title: "Смета №1 — Жилой комплекс А",
    items: [
      { id: 1, name: "Фундаментные работы", unit: "м³", qty: "120", price: "4000" },
      { id: 2, name: "Кирпичная кладка", unit: "м²", qty: "640", price: "500" },
      { id: 3, name: "Кровельные материалы", unit: "м²", qty: "430", price: "500" },
      { id: 4, name: "Внутренняя отделка", unit: "м²", qty: "780", price: "500" },
    ],
  },
];

const SmetaSection = () => {
  const [smetas, setSmetas] = useState<Smeta[]>(defaultSmetas);
  const [activeSmetaId, setActiveSmetaId] = useState<number>(1);
  const [editingCell, setEditingCell] = useState<{ itemId: number; field: string } | null>(null);
  const [showAddSmeta, setShowAddSmeta] = useState(false);
  const [newSmetaTitle, setNewSmetaTitle] = useState("");
  const [sendModal, setSendModal] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [sent, setSent] = useState(false);

  const activeSmeta = smetas.find((s) => s.id === activeSmetaId)!;

  const updateItem = (itemId: number, field: keyof SmetaItem, value: string) => {
    setSmetas((prev) =>
      prev.map((s) =>
        s.id === activeSmetaId
          ? { ...s, items: s.items.map((it) => (it.id === itemId ? { ...it, [field]: value } : it)) }
          : s
      )
    );
  };

  const addItem = () => {
    const item = emptyItem();
    setSmetas((prev) =>
      prev.map((s) => (s.id === activeSmetaId ? { ...s, items: [...s.items, item] } : s))
    );
    setTimeout(() => setEditingCell({ itemId: item.id, field: "name" }), 50);
  };

  const deleteItem = (itemId: number) => {
    setSmetas((prev) =>
      prev.map((s) =>
        s.id === activeSmetaId ? { ...s, items: s.items.filter((it) => it.id !== itemId) } : s
      )
    );
  };

  const addSmeta = () => {
    if (!newSmetaTitle.trim()) return;
    const id = Date.now();
    setSmetas((prev) => [...prev, { id, title: newSmetaTitle.trim(), items: [] }]);
    setActiveSmetaId(id);
    setNewSmetaTitle("");
    setShowAddSmeta(false);
  };

  const itemTotal = (it: SmetaItem) => {
    const q = parseFloat(it.qty) || 0;
    const p = parseFloat(it.price) || 0;
    return q * p;
  };

  const grandTotal = activeSmeta.items.reduce((acc, it) => acc + itemTotal(it), 0);
  const vatTotal = grandTotal * 0.2;

  const handleSend = () => {
    if (!sendEmail.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSendModal(false);
      setSent(false);
      setSendEmail("");
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Шапка */}
      <div className="h-12 bg-[#1a1f2e] border-b border-[#0d1017] flex items-center px-4 gap-2">
        <Icon name="FileText" size={18} className="text-[#8892a4]" />
        <span className="text-white font-semibold">смета</span>
        <div className="w-px h-6 bg-[#252c3d] mx-2 hidden sm:block" />
        <span className="text-[#8892a4] text-sm hidden sm:block">Составление и управление сметами проекта</span>
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setSendModal(true)}
            className="bg-[#27ae60] hover:bg-[#219a52] text-white text-xs px-3 h-7"
          >
            <Icon name="Send" size={13} className="mr-1.5" />
            Отправить
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-[#8892a4] hover:text-white hover:bg-[#252c3d] text-xs px-3 h-7"
          >
            <Icon name="Download" size={13} className="mr-1.5" />
            PDF
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Вкладки смет */}
        <div className="flex items-center gap-2 flex-wrap">
          {smetas.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSmetaId(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeSmetaId === s.id
                  ? "bg-[#e67e22] text-white"
                  : "bg-[#141824] text-[#8892a4] hover:text-white hover:bg-[#252c3d] border border-[#252c3d]"
              }`}
            >
              <Icon name="FileText" size={13} />
              <span className="max-w-[160px] truncate">{s.title}</span>
            </button>
          ))}
          {showAddSmeta ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={newSmetaTitle}
                onChange={(e) => setNewSmetaTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addSmeta()}
                placeholder="Название сметы"
                className="bg-[#141824] border border-[#e67e22] rounded-lg px-3 py-1.5 text-white text-sm placeholder-[#8892a4] outline-none w-48"
              />
              <Button size="sm" onClick={addSmeta} className="bg-[#e67e22] hover:bg-[#d35400] text-white h-7 px-3">
                <Icon name="Check" size={13} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddSmeta(false)} className="text-[#8892a4] h-7 px-2 hover:bg-[#252c3d]">
                <Icon name="X" size={13} />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddSmeta(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-[#8892a4] hover:text-white hover:bg-[#252c3d] border border-dashed border-[#252c3d] transition-colors"
            >
              <Icon name="Plus" size={13} />
              Новая смета
            </button>
          )}
        </div>

        {/* Заголовок сметы */}
        <div className="bg-[#141824] border border-[#252c3d] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#252c3d]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#e67e22]/15 rounded-lg flex items-center justify-center">
                <Icon name="ClipboardList" size={18} className="text-[#e67e22]" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm">{activeSmeta.title}</div>
                <div className="text-[#8892a4] text-xs">
                  {activeSmeta.items.length} позиций · Дата: {new Date().toLocaleDateString("ru-RU")}
                </div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <div className="text-[#8892a4] text-xs">Итого с НДС</div>
              <div className="text-[#27ae60] font-bold text-lg">₽ {formatNum(grandTotal + vatTotal)}</div>
            </div>
          </div>

          {/* Таблица позиций */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-[#252c3d]">
                  <th className="text-left text-[#8892a4] text-xs font-semibold uppercase tracking-wide px-4 py-2.5 w-8">#</th>
                  <th className="text-left text-[#8892a4] text-xs font-semibold uppercase tracking-wide px-3 py-2.5">Наименование</th>
                  <th className="text-center text-[#8892a4] text-xs font-semibold uppercase tracking-wide px-3 py-2.5 w-24">Ед.</th>
                  <th className="text-right text-[#8892a4] text-xs font-semibold uppercase tracking-wide px-3 py-2.5 w-24">Кол-во</th>
                  <th className="text-right text-[#8892a4] text-xs font-semibold uppercase tracking-wide px-3 py-2.5 w-32">Цена, ₽</th>
                  <th className="text-right text-[#8892a4] text-xs font-semibold uppercase tracking-wide px-3 py-2.5 w-32">Сумма, ₽</th>
                  <th className="w-8 px-2" />
                </tr>
              </thead>
              <tbody>
                {activeSmeta.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-[#8892a4] text-sm py-10">
                      <div className="flex flex-col items-center gap-2">
                        <Icon name="FileText" size={32} className="text-[#252c3d]" />
                        <span>Нет позиций. Нажмите «Добавить позицию»</span>
                      </div>
                    </td>
                  </tr>
                )}
                {activeSmeta.items.map((item, idx) => (
                  <tr
                    key={item.id}
                    className="border-b border-[#1a1f2e] hover:bg-[#1a1f2e]/60 group transition-colors"
                  >
                    <td className="px-4 py-2 text-[#8892a4] text-sm">{idx + 1}</td>

                    {/* Наименование */}
                    <td className="px-3 py-1.5">
                      {editingCell?.itemId === item.id && editingCell.field === "name" ? (
                        <input
                          autoFocus
                          value={item.name}
                          onChange={(e) => updateItem(item.id, "name", e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                          className="w-full bg-[#252c3d] border border-[#e67e22] rounded px-2 py-1 text-white text-sm outline-none"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingCell({ itemId: item.id, field: "name" })}
                          className={`px-2 py-1 rounded cursor-text text-sm min-h-[28px] ${item.name ? "text-[#c8d0de]" : "text-[#8892a4]"} hover:bg-[#252c3d]`}
                        >
                          {item.name || "Введите наименование..."}
                        </div>
                      )}
                    </td>

                    {/* Единица */}
                    <td className="px-3 py-1.5 text-center">
                      {editingCell?.itemId === item.id && editingCell.field === "unit" ? (
                        <select
                          autoFocus
                          value={item.unit}
                          onChange={(e) => { updateItem(item.id, "unit", e.target.value); setEditingCell(null); }}
                          onBlur={() => setEditingCell(null)}
                          className="bg-[#252c3d] border border-[#e67e22] rounded px-1 py-1 text-white text-sm outline-none"
                        >
                          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                        </select>
                      ) : (
                        <div
                          onClick={() => setEditingCell({ itemId: item.id, field: "unit" })}
                          className="px-2 py-1 rounded cursor-pointer text-sm text-[#c8d0de] hover:bg-[#252c3d] inline-flex items-center gap-1"
                        >
                          {item.unit}
                          <Icon name="ChevronDown" size={10} className="text-[#8892a4]" />
                        </div>
                      )}
                    </td>

                    {/* Количество */}
                    <td className="px-3 py-1.5 text-right">
                      {editingCell?.itemId === item.id && editingCell.field === "qty" ? (
                        <input
                          autoFocus
                          type="number"
                          min="0"
                          value={item.qty}
                          onChange={(e) => updateItem(item.id, "qty", e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                          className="w-full bg-[#252c3d] border border-[#e67e22] rounded px-2 py-1 text-white text-sm outline-none text-right"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingCell({ itemId: item.id, field: "qty" })}
                          className={`px-2 py-1 rounded cursor-text text-sm text-right min-h-[28px] ${item.qty ? "text-[#c8d0de]" : "text-[#8892a4]"} hover:bg-[#252c3d]`}
                        >
                          {item.qty || "—"}
                        </div>
                      )}
                    </td>

                    {/* Цена */}
                    <td className="px-3 py-1.5 text-right">
                      {editingCell?.itemId === item.id && editingCell.field === "price" ? (
                        <input
                          autoFocus
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => updateItem(item.id, "price", e.target.value)}
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingCell(null)}
                          className="w-full bg-[#252c3d] border border-[#e67e22] rounded px-2 py-1 text-white text-sm outline-none text-right"
                        />
                      ) : (
                        <div
                          onClick={() => setEditingCell({ itemId: item.id, field: "price" })}
                          className={`px-2 py-1 rounded cursor-text text-sm text-right min-h-[28px] ${item.price ? "text-[#c8d0de]" : "text-[#8892a4]"} hover:bg-[#252c3d]`}
                        >
                          {item.price ? formatNum(parseFloat(item.price)) : "—"}
                        </div>
                      )}
                    </td>

                    {/* Итог строки */}
                    <td className="px-3 py-1.5 text-right">
                      <span className={`text-sm font-semibold ${itemTotal(item) > 0 ? "text-white" : "text-[#8892a4]"}`}>
                        {itemTotal(item) > 0 ? formatNum(itemTotal(item)) : "—"}
                      </span>
                    </td>

                    {/* Удалить */}
                    <td className="px-2 py-1.5">
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[#8892a4] hover:text-[#e74c3c] p-1 rounded hover:bg-[#e74c3c]/10"
                      >
                        <Icon name="Trash2" size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Кнопка добавить */}
          <div className="px-4 py-3 border-t border-[#252c3d]">
            <button
              onClick={addItem}
              className="flex items-center gap-2 text-[#e67e22] hover:text-white text-sm font-medium hover:bg-[#e67e22]/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Icon name="Plus" size={15} />
              Добавить позицию
            </button>
          </div>

          {/* Итоги */}
          <div className="px-4 py-4 border-t border-[#252c3d] bg-[#1a1f2e]/50">
            <div className="flex flex-col items-end gap-1.5 max-w-xs ml-auto">
              <div className="flex justify-between w-full text-sm">
                <span className="text-[#8892a4]">Подытог:</span>
                <span className="text-[#c8d0de] font-medium">₽ {formatNum(grandTotal)}</span>
              </div>
              <div className="flex justify-between w-full text-sm">
                <span className="text-[#8892a4]">НДС 20%:</span>
                <span className="text-[#c8d0de] font-medium">₽ {formatNum(vatTotal)}</span>
              </div>
              <div className="w-full h-px bg-[#252c3d] my-1" />
              <div className="flex justify-between w-full">
                <span className="text-white font-bold text-base">ИТОГО:</span>
                <span className="text-[#27ae60] font-bold text-xl">₽ {formatNum(grandTotal + vatTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Подсказка */}
        <div className="flex items-center gap-2 text-[#8892a4] text-xs px-1">
          <Icon name="Info" size={13} />
          <span>Кликните на любую ячейку таблицы для редактирования</span>
        </div>
      </div>

      {/* Модал отправки */}
      {sendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSendModal(false)} />
          <div className="relative bg-[#141824] border border-[#252c3d] rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            {sent ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-[#27ae60]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon name="CheckCircle" size={32} className="text-[#27ae60]" />
                </div>
                <div className="text-white font-bold text-lg mb-1">Смета отправлена!</div>
                <div className="text-[#8892a4] text-sm">Получатель: {sendEmail}</div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-bold text-base">Отправить смету</h3>
                  <button onClick={() => setSendModal(false)} className="text-[#8892a4] hover:text-white">
                    <Icon name="X" size={18} />
                  </button>
                </div>
                <div className="bg-[#1a1f2e] rounded-lg px-3 py-2 border border-[#252c3d] mb-4">
                  <div className="text-[#8892a4] text-xs mb-0.5">Смета</div>
                  <div className="text-white text-sm font-medium">{activeSmeta.title}</div>
                  <div className="text-[#27ae60] text-sm font-bold mt-0.5">₽ {formatNum(grandTotal + vatTotal)}</div>
                </div>
                <label className="text-[#c8d0de] text-sm font-medium block mb-1.5">Email получателя</label>
                <input
                  autoFocus
                  value={sendEmail}
                  onChange={(e) => setSendEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="zakazchik@example.com"
                  className="w-full bg-[#1a1f2e] border border-[#252c3d] rounded-lg px-4 py-2.5 text-white text-sm placeholder-[#8892a4] outline-none focus:border-[#27ae60] transition-colors mb-4"
                />
                <Button onClick={handleSend} className="w-full bg-[#27ae60] hover:bg-[#219a52] text-white font-medium">
                  <Icon name="Send" size={15} className="mr-2" />
                  Отправить
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SmetaSection;
