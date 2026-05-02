import { 
  Calendar,
  Download
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from "recharts";

const growthData = [
  { date: "2024-01", orgs: 400, users: 2400 },
  { date: "2024-02", orgs: 600, users: 3200 },
  { date: "2024-03", orgs: 850, users: 4800 },
  { date: "2024-04", orgs: 1100, users: 6500 },
  { date: "2024-05", orgs: 1284, users: 8900 },
];

const planData = [
  { name: "Free", value: 850 },
  { name: "Pro", value: 434 },
];

const COLORS = ["#f1f5f9", "#0f172a"];

export default function AdminAnalytics() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
          <p className="text-muted-foreground mt-1">Deep dive into platform growth and usage patterns.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-input bg-white px-4 py-2 text-sm font-semibold hover:bg-secondary">
            <Calendar size={18} /> Last 90 Days
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
            <Download size={18} /> Download Report
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-6">User Acquisition</h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#0f172a" fill="#0f172a10" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-6">Subscription Mix</h3>
          <div className="h-[350px] w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {planData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Free</p>
                <p className="text-xl font-bold">850</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Pro</p>
                <p className="text-xl font-bold">434</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-bold mb-6">Organization Growth</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
              <Tooltip />
              <Line type="stepAfter" dataKey="orgs" stroke="#0f172a" strokeWidth={3} dot={{ r: 6, fill: '#0f172a' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
