import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, ComposedChart
} from 'recharts';
import { clsx } from 'clsx';

const COLORS = {
  primary: '#06b6d4',
  danger: '#ef4444',
  warning: '#f97316',
  moderate: '#fbbf24',
  success: '#22c55e',
  critical: '#f97316',
  grid: '#1e293b',
  text: '#94a3b8',
};

interface ChartContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  height?: number;
}

export function ChartContainer({ children, title, subtitle, className, height = 300 }: ChartContainerProps) {
  return (
    <div className={clsx('glass-strong rounded-xl p-4 border border-flood-border', className)}>
      {(title || subtitle) && (
        <div className="mb-4">
          {title && <h3 className="font-semibold text-flood-text">{title}</h3>}
          {subtitle && <p className="text-sm text-flood-muted mt-1">{subtitle}</p>}
        </div>
      )}
      <div style={{ height }}>{children}</div>
    </div>
  );
}

interface LineChartProps {
  data: { name: string; [key: string]: number | string }[];
  lines: { key: string; color: string; name: string }[];
  height?: number;
}

export function MultiLineChart({ data, lines, height = 300 }: LineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke={COLORS.text} 
          fontSize={11} 
          tickLine={false} 
          axisLine={false}
          tick={{ fill: COLORS.text }}
        />
        <YAxis 
          stroke={COLORS.text} 
          fontSize={11} 
          tickLine={false} 
          axisLine={false}
          tick={{ fill: COLORS.text }}
          tickFormatter={val => val >= 1000 ? `${(val/1000).toFixed(1)}k` : val}
        />
        <Tooltip 
          contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }}
          labelStyle={{ color: '#f1f5f9' }}
          itemStyle={{ fontSize: '12px' }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '10px' }}
          formatter={val => val}
        />
        {lines.map(line => (
          <Line
            key={line.key}
            type="monotone"
            dataKey={line.key}
            stroke={line.color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 2 }}
            name={line.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface AreaChartProps {
  data: { name: string; [key: string]: number | string }[];
  areas: { key: string; color: string; name: string }[];
  height?: number;
}

export function StackedAreaChart({ data, areas, height = 300 }: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis dataKey="name" stroke={COLORS.text} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: COLORS.text }} />
        <YAxis stroke={COLORS.text} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: COLORS.text }} />
        <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        {areas.map(area => (
          <Area
            key={area.key}
            type="monotone"
            dataKey={area.key}
            stackId="1"
            stroke={area.color}
            fill={area.color}
            fillOpacity={0.3}
            name={area.name}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface BarChartProps {
  data: { name: string; value: number; color?: string }[];
  horizontal?: boolean;
  height?: number;
  maxBars?: number;
}

export function HorizontalBarChart({ data, height = 300, maxBars = 10 }: BarChartProps) {
  const displayData = data.slice(0, maxBars);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={displayData} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} horizontal={false} />
        <XAxis type="number" stroke={COLORS.text} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: COLORS.text }} />
        <YAxis type="category" dataKey="name" stroke={COLORS.text} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: COLORS.text }} width={120} />
        <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
        <Bar dataKey="value" fill={COLORS.primary} radius={[0, 4, 4, 0]} maxBarSize={30}>
          {displayData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS.primary} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function VerticalBarChart({ data, height = 300 }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis dataKey="name" stroke={COLORS.text} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: COLORS.text }} />
        <YAxis stroke={COLORS.text} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: COLORS.text }} />
        <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
        <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS.primary} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface PieChartProps {
  data: { name: string; value: number; color?: string }[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
}

export function DonutChart({ data, height = 300, innerRadius = 60, outerRadius = 100 }: PieChartProps) {
  const COLORS_PIE = [COLORS.critical, COLORS.danger, COLORS.warning, COLORS.primary, COLORS.success, '#8b5cf6', '#ec4899'];
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
          labelLine={false}
          startAngle={90}
          endAngle={450}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS_PIE[index % COLORS_PIE.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

interface ComposedChartProps {
  data: { name: string; [key: string]: number | string }[];
  bars: { key: string; color: string; name: string }[];
  lines: { key: string; color: string; name: string }[];
  height?: number;
}

export function ComposedBarLineChart({ data, bars, lines, height = 300 }: ComposedChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={COLORS.grid} vertical={false} />
        <XAxis dataKey="name" stroke={COLORS.text} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: COLORS.text }} />
        <YAxis yAxisId="left" stroke={COLORS.text} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: COLORS.text }} orientation="left" />
        <YAxis yAxisId="right" stroke={COLORS.text} fontSize={11} tickLine={false} axisLine={false} tick={{ fill: COLORS.text }} orientation="right" />
        <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1e293b', borderRadius: '8px' }} />
        <Legend wrapperStyle={{ paddingTop: '10px' }} />
        {bars.map(bar => (
          <Bar key={bar.key} yAxisId="left" dataKey={bar.key} fill={bar.color} name={bar.name} maxBarSize={30} radius={[4, 4, 0, 0]} />
        ))}
        {lines.map(line => (
          <Line key={line.key} yAxisId="right" type="monotone" dataKey={line.key} stroke={line.color} strokeWidth={2} dot={false} name={line.name} />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: { value: number; label: string };
  icon?: React.ReactNode;
  color?: string;
}

export function MetricCard({ label, value, unit, trend, icon, color = COLORS.primary }: MetricCardProps) {
  return (
    <div className="glass rounded-lg p-4 border border-flood-border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-flood-muted uppercase tracking-wider">{label}</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-flood-text">{value}</span>
            {unit && <span className="text-sm text-flood-muted">{unit}</span>}
          </div>
          {trend && (
            <div className="mt-2 flex items-center gap-1 text-xs">
              {trend.value > 0 ? (
                <svg className="w-3 h-3 text-flood-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/></svg>
              ) : trend.value < 0 ? (
                <svg className="w-3 h-3 text-flood-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/></svg>
              ) : (
                <svg className="w-3 h-3 text-flood-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14"/></svg>
              )}
              <span className={clsx(trend.value > 0 && 'text-flood-success', trend.value < 0 && 'text-flood-danger', trend.value === 0 && 'text-flood-muted')}>
                {Math.abs(trend.value)}%
              </span>
              <span className="text-flood-muted">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}><span style={{ color }}>{icon}</span></div>}
      </div>
    </div>
  );
}