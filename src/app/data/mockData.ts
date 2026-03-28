
import { Calendar, Users, DollarSign, TrendingUp, Music, Briefcase, Mic, PartyPopper } from "lucide-react";

export const EVENTS = [
  {
    id: "1",
    title: "Tech Summit 2026",
    date: "2026-03-15",
    time: "09:00 AM",
    location: "San Francisco, CA",
    category: "Technology",
    image: "https://images.unsplash.com/photo-1761223976272-0d6d4bc38636?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0ZWNoJTIwY29uZmVyZW5jZSUyMGV2ZW50JTIwYXVkaWVuY2V8ZW58MXx8fHwxNzcwMjY5NzM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    attendees: 1240,
    price: 299,
    status: "Upcoming",
    description: "The biggest tech conference of the year featuring industry leaders and innovative workshops."
  },
  {
    id: "2",
    title: "Summer Music Festival",
    date: "2026-06-20",
    time: "04:00 PM",
    location: "Austin, TX",
    category: "Music",
    image: "https://images.unsplash.com/photo-1735748917428-be035e873f97?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGNvbmNlcnQlMjBjcm93ZCUyMGxpZ2h0c3xlbnwxfHx8fDE3NzAyNjI1MTN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    attendees: 5400,
    price: 150,
    status: "Upcoming",
    description: "Three days of non-stop music, food, and fun under the summer sun."
  },
  {
    id: "3",
    title: "Future of Work Workshop",
    date: "2026-02-10",
    time: "10:00 AM",
    location: "New York, NY",
    category: "Business",
    image: "https://images.unsplash.com/photo-1620326079720-500ba364af6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHdvcmtzaG9wJTIwYnJhaW5zdG9ybWluZ3xlbnwxfHx8fDE3NzAyNjk3Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    attendees: 85,
    price: 499,
    status: "Completed",
    description: "Interactive session on remote work strategies and team building."
  },
  {
    id: "4",
    title: "Startup Networking Night",
    date: "2026-02-28",
    time: "06:30 PM",
    location: "Chicago, IL",
    category: "Networking",
    image: "https://images.unsplash.com/photo-1752766074353-565489ca3e3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXR3b3JraW5nJTIwcm9vZnRvcCUyMGV2ZW50fGVufDF8fHx8MTc3MDI2OTczOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    attendees: 200,
    price: 50,
    status: "Upcoming",
    description: "Connect with founders, investors, and professionals in a relaxed rooftop setting."
  }
];

export const STATS = [
  { label: "Total Revenue", value: "$425,800", icon: DollarSign, trend: "+12.5%", color: "text-green-500" },
  { label: "Total Attendees", value: "8,245", icon: Users, trend: "+8.2%", color: "text-blue-500" },
  { label: "Events Hosted", value: "124", icon: Calendar, trend: "+24%", color: "text-purple-500" },
  { label: "Avg. Ticket Price", value: "$185", icon: TrendingUp, trend: "-2.1%", color: "text-orange-500" },
];

export const ATTENDEES = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", event: "Tech Summit 2026", status: "Confirmed", date: "2026-01-15" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", event: "Tech Summit 2026", status: "Pending", date: "2026-01-16" },
  { id: 3, name: "Charlie Davis", email: "charlie@example.com", event: "Summer Music Festival", status: "Confirmed", date: "2026-01-20" },
  { id: 4, name: "Diana Prince", email: "diana@example.com", event: "Future of Work Workshop", status: "Checked In", date: "2026-01-22" },
  { id: 5, name: "Evan Wright", email: "evan@example.com", event: "Startup Networking Night", status: "Cancelled", date: "2026-02-01" },
];
