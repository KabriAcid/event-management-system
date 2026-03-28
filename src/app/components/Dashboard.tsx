
import { STATS, EVENTS } from "../data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Calendar, Clock, MapPin } from "lucide-react";

const data = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 2000 },
  { name: 'Apr', revenue: 2780 },
  { name: 'May', revenue: 1890 },
  { name: 'Jun', revenue: 2390 },
  { name: 'Jul', revenue: 3490 },
];

export function Dashboard() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your events.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gray-50 ${stat.color.replace('text-', 'bg-').replace('500', '100')}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <span className={`text-sm font-medium ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Revenue Analytics</h2>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#4f46e5' }}
                  formatter={(value) => [`$${value}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h2>
          <div className="space-y-4">
            {EVENTS.slice(0, 3).map((event) => (
              <div key={event.id} className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer group">
                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">{event.title}</h4>
                  <div className="flex items-center text-gray-500 text-xs mt-1">
                    <Calendar className="w-3 h-3 mr-1" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-gray-500 text-xs mt-1">
                    <MapPin className="w-3 h-3 mr-1" />
                    {event.location}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
            View All Events
          </button>
        </div>
      </div>
    </div>
  );
}
