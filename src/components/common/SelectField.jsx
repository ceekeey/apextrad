export default function SelectField({ label, value, onChange, options }) {
    return (
        <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{label}</label>
            <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-blue-500 focus:outline-none">
                {options.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
        </div>
    );
}
