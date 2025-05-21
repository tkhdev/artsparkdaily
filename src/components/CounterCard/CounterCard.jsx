import './CounterCard.css'

export default function CounterCard({ count, label, colorClass }) {
  return (
    <div className={`counter-card rounded-xl p-4 w-32 ${colorClass}`}>
      <h3 className="text-3xl font-bold">{count}</h3>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
