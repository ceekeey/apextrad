export default function InputField({ label, value, onChange, type = 'text' }) {
    return (
        <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400">{label}</label>
            <input type={type} value={value ?? ''} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none" />
        </div>
    );
}
