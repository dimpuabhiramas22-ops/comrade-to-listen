export default function ProgressCircle({
  progress = 0,
  size = 180,
}) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const offset =
    circumference - (progress / 100) * circumference;

  return (
    <div className="flex justify-center">
      <svg width={size} height={size}>
        <circle
          stroke="#E5E7EB"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />

        <circle
          stroke="#2563EB"
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          r={radius}
          cx={size / 2}
          cy={size / 2}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="transition-all duration-700"
        />

        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          className="fill-blue-700 text-2xl font-bold"
        >
          {progress}%
        </text>
      </svg>
    </div>
  );
}