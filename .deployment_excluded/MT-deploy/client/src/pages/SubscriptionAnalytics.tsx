import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  CreditCard,
  Activity,
  Download,
  Calendar,
  Zap,
  Target,
  Award,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

// MT ocean theme colors
const COLORS = ['#14b8a6', '#06b6d4', '#0891b2', '#0e7490', '#155e75'];
const CHART_COLORS = {
  primary: '#14b8a6',
  secondary: '#06b6d4',
  tertiary: '#0891b2',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444'
};

interface MetricCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  prefix?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, prefix = '' }) => {
  const isPositive = change > 0;
  
  return (
    <Card className="glassmorphic-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900">
              {prefix}{value}
            </h3>
            <div className="flex items-center gap-1 mt-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{change}%
              </span>
              <span className="text-sm text-gray-500">vs last month</span>
            </div>
          </div>
          <div className="p-3 bg-gradient-to-br from-turquoise-100 to-cyan-100 rounded-lg">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SubscriptionAnalytics: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  
  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['/api/payments/analytics', timeRange],
    queryFn: async () => {
      return apiRequest(`/api/payments/analytics?range=${timeRange}`, { method: 'GET' });
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    window.location.href = '/api/login';
    return null;
  }

  // Demo data - replace with real data from API
  const demoData = {
    metrics: {
      mrr: { value: 24567, change: 12.5 },
      totalSubscribers: { value: 456, change: 8.3 },
      churnRate: { value: 3.2, change: -0.5 },
      averageRevenue: { value: 53.82, change: 4.2 },
      ltv: { value: 645.84, change: 15.3 },
      conversionRate: { value: 18.5, change: 2.1 }
    },
    revenueChart: Array.from({ length: 30 }, (_, i) => ({
      date: format(subDays(new Date(), 29 - i), 'MMM dd'),
      revenue: 20000 + Math.random() * 10000 + i * 200,
      subscribers: 400 + Math.floor(Math.random() * 100) + i * 2
    })),
    tierDistribution: [
      { name: 'Basic', value: 245, percentage: 53.7 },
      { name: 'Enthusiast', value: 128, percentage: 28.1 },
      { name: 'Professional', value: 65, percentage: 14.3 },
      { name: 'Enterprise', value: 18, percentage: 3.9 }
    ],
    churnAnalysis: [
      { month: 'Jan', rate: 4.2, rescued: 12 },
      { month: 'Feb', rate: 3.8, rescued: 15 },
      { month: 'Mar', rate: 3.5, rescued: 18 },
      { month: 'Apr', rate: 3.2, rescued: 22 },
      { month: 'May', rate: 3.0, rescued: 25 },
      { month: 'Jun', rate: 3.2, rescued: 20 }
    ],
    growthMetrics: [
      { metric: 'Trial to Paid', value: 68, target: 70 },
      { metric: 'Upgrade Rate', value: 22, target: 25 },
      { metric: 'Retention', value: 92, target: 90 },
      { metric: 'Referral Rate', value: 15, target: 20 }
    ]
  };

  const data = analytics || demoData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-turquoise-50 via-cyan-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Analytics</h1>
            <p className="text-gray-600">Monitor your subscription performance and growth metrics</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Monthly Recurring Revenue"
            value={data.metrics.mrr.value.toLocaleString()}
            change={data.metrics.mrr.change}
            icon={<DollarSign className="w-6 h-6 text-turquoise-600" />}
            prefix="$"
          />
          <MetricCard
            title="Total Subscribers"
            value={data.metrics.totalSubscribers.value.toString()}
            change={data.metrics.totalSubscribers.change}
            icon={<Users className="w-6 h-6 text-cyan-600" />}
          />
          <MetricCard
            title="Churn Rate"
            value={`${data.metrics.churnRate.value}%`}
            change={data.metrics.churnRate.change}
            icon={<Activity className="w-6 h-6 text-orange-600" />}
          />
          <MetricCard
            title="Average Revenue per User"
            value={data.metrics.averageRevenue.value.toFixed(2)}
            change={data.metrics.averageRevenue.change}
            icon={<CreditCard className="w-6 h-6 text-green-600" />}
            prefix="$"
          />
        </div>

        {/* Charts */}
        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="glassmorphic-card p-1">
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
            <TabsTrigger value="churn">Churn Analysis</TabsTrigger>
            <TabsTrigger value="growth">Growth Metrics</TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card className="glassmorphic-card">
              <CardHeader>
                <CardTitle>Revenue & Subscriber Growth</CardTitle>
                <CardDescription>Track your revenue and subscriber trends over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={data.revenueChart}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_COLORS.secondary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={CHART_COLORS.secondary} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis yAxisId="left" stroke="#6b7280" />
                    <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                    <Tooltip />
                    <Legend />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="revenue"
                      stroke={CHART_COLORS.primary}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      name="Revenue ($)"
                    />
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="subscribers"
                      stroke={CHART_COLORS.secondary}
                      fillOpacity={1}
                      fill="url(#colorSubscribers)"
                      name="Subscribers"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glassmorphic-card">
                <CardHeader>
                  <CardTitle>Subscription Tier Distribution</CardTitle>
                  <CardDescription>Breakdown of subscribers by plan</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.tierDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name} ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data.tierDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="glassmorphic-card">
                <CardHeader>
                  <CardTitle>Key Performance Indicators</CardTitle>
                  <CardDescription>Critical metrics at a glance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-turquoise-600" />
                      <span>Customer Lifetime Value</span>
                    </div>
                    <span className="font-semibold text-lg">${data.metrics.ltv.value}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-600" />
                      <span>Trial Conversion Rate</span>
                    </div>
                    <span className="font-semibold text-lg">{data.metrics.conversionRate.value}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-600" />
                      <span>Net Revenue Retention</span>
                    </div>
                    <span className="font-semibold text-lg">112%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span>Failed Payments</span>
                    </div>
                    <span className="font-semibold text-lg">2.3%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Subscribers Tab */}
          <TabsContent value="subscribers">
            <Card className="glassmorphic-card">
              <CardHeader>
                <CardTitle>Subscriber Acquisition & Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={data.revenueChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="subscribers" fill={CHART_COLORS.primary} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Churn Analysis Tab */}
          <TabsContent value="churn">
            <Card className="glassmorphic-card">
              <CardHeader>
                <CardTitle>Churn Rate & Recovery</CardTitle>
                <CardDescription>Monitor customer retention and win-back efforts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={data.churnAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="rate"
                      stroke={CHART_COLORS.danger}
                      name="Churn Rate (%)"
                      strokeWidth={2}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="rescued"
                      stroke={CHART_COLORS.success}
                      name="Customers Rescued"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Growth Metrics Tab */}
          <TabsContent value="growth">
            <Card className="glassmorphic-card">
              <CardHeader>
                <CardTitle>Growth & Conversion Metrics</CardTitle>
                <CardDescription>Track progress against targets</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="10%"
                    outerRadius="90%"
                    data={data.growthMetrics}
                    startAngle={180}
                    endAngle={0}
                  >
                    <RadialBar
                      minAngle={15}
                      label={{ position: 'insideStart', fill: '#fff' }}
                      background
                      clockWise
                      dataKey="value"
                      fill={CHART_COLORS.primary}
                    />
                    <Legend />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SubscriptionAnalytics;