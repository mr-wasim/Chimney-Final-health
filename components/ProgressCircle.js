export default function ProgressCircle({ value=0, size=120, label }){
  const radius = (size/2) - 10;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value/100) * circumference;
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth="10" fill="none"/>
        <circle
          cx={size/2} cy={size/2} r={radius}
          stroke="url(#grad)"
          strokeWidth="10" fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#25D366"/>
            <stop offset="100%" stopColor="#128C7E"/>
          </linearGradient>
        </defs>
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" className="fill-white text-xl font-bold">{value}%</text>
      </svg>
      {label && <div className="mt-2 text-sm text-white/80">{label}</div>}
    </div>
  );
}
