export default function StockBadge({ quantity, minStock }) {
  if (quantity === 0) {
    return <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5">ZERO</span>;
  }
  if (quantity <= minStock * 0.5) {
    return <span className="text-[10px] font-bold bg-red-900 text-red-300 px-2 py-0.5">CRITICAL</span>;
  }
  if (quantity <= minStock) {
    return <span className="text-[10px] font-bold bg-amber-900 text-amber-300 px-2 py-0.5">LOW</span>;
  }
  return <span className="text-[10px] font-bold bg-zinc-800 text-zinc-400 px-2 py-0.5">OK</span>;
}
