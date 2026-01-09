import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { 
  ArrowLeft, Download, RefreshCw, Shield, AlertTriangle, 
  CheckCircle, Clock, TrendingUp, Users, BarChart3, PieChart,
  Activity, Target, Percent, Globe
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const COLORS = {
  level_1: '#22c55e', // green
  level_2: '#eab308', // yellow
  level_3: '#ef4444', // red
  pending: '#3b82f6', // blue
  approved: '#22c55e', // green
  rejected: '#ef4444', // red
  modified: '#f59e0b' // amber
};

const HITLAnalyticsPage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [moderators, setModerators] = useState([]);
  const [days, setDays] = useState(30);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, navigate, days]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [overviewRes, timelineRes, moderatorsRes] = await Promise.all([
        axios.get(`${API}/analytics/hitl/overview?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/analytics/hitl/timeline?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/analytics/hitl/moderator-performance?days=${days}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setOverview(overviewRes.data);
      setTimeline(timelineRes.data);
      setModerators(moderatorsRes.data.moderators || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error(t("Gagal memuat data analytics", "Failed to load analytics data"));
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format = 'json') => {
    setExporting(true);
    try {
      const response = await axios.get(
        `${API}/analytics/hitl/export?days=${days}&format=${format}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: format === 'csv' ? 'blob' : 'json'
        }
      );

      if (format === 'csv') {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `hitl_export_${days}d.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        const dataStr = JSON.stringify(response.data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `hitl_export_${days}d.json`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      toast.success(t("Data berhasil diexport", "Data exported successfully"));
    } catch (error) {
      console.error('Export error:', error);
      toast.error(t("Gagal export data", "Failed to export data"));
    } finally {
      setExporting(false);
    }
  };

  if (!user?.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={() => navigate('/admin')} 
              className="flex items-center text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("Kembali ke Admin", "Back to Admin")}
            </button>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={toggleLanguage}
                className="rounded-full"
                data-testid="language-toggle"
              >
                <Globe className="w-4 h-4 mr-1" />
                {language === "id" ? "EN" : "ID"}
              </Button>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="border rounded-lg px-3 py-2 text-sm bg-background"
                data-testid="days-select"
              >
                <option value={7}>7 {t("hari", "days")}</option>
                <option value={30}>30 {t("hari", "days")}</option>
                <option value={90}>90 {t("hari", "days")}</option>
              </select>
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading} data-testid="refresh-btn">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <div className="mb-8">
            <h1 className="heading-2 text-foreground flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              {t("HITL Analytics Dashboard", "HITL Analytics Dashboard")}
            </h1>
            <p className="text-muted-foreground mt-2">
              {t(`Data ${days} hari terakhir`, `Data from last ${days} days`)}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
              <p className="text-muted-foreground">{t("Memuat data...", "Loading data...")}</p>
            </div>
          ) : (
            <>
              {/* Enhanced Overview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                <Card data-testid="stat-total-flagged">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-primary/10">
                        <Shield className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {(overview?.risk_distribution?.level_1 || 0) + 
                           (overview?.risk_distribution?.level_2 || 0) + 
                           (overview?.risk_distribution?.level_3 || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground">{t("Total Flagged", "Total Flagged")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card data-testid="stat-level-1">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-green-100 dark:bg-green-950/50">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{overview?.risk_distribution?.level_1 || 0}</p>
                        <p className="text-xs text-muted-foreground">Level 1</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card data-testid="stat-level-2">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-yellow-100 dark:bg-yellow-950/50">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{overview?.risk_distribution?.level_2 || 0}</p>
                        <p className="text-xs text-muted-foreground">Level 2</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card data-testid="stat-level-3">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/50">
                        <Shield className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{overview?.risk_distribution?.level_3 || 0}</p>
                        <p className="text-xs text-muted-foreground">Level 3</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card data-testid="stat-avg-response">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950/50">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {overview?.response_time?.avg_response_time 
                            ? `${Math.round(overview.response_time.avg_response_time / 60)}m`
                            : '0m'
                          }
                        </p>
                        <p className="text-xs text-muted-foreground">{t("Avg Response", "Avg Response")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card data-testid="stat-approval-rate">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-950/50">
                        <Percent className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {(() => {
                            const approved = overview?.queue_stats?.approved || 0;
                            const total = Object.values(overview?.queue_stats || {}).reduce((a, b) => a + b, 0) || 1;
                            return `${Math.round((approved / total) * 100)}%`;
                          })()}
                        </p>
                        <p className="text-xs text-muted-foreground">{t("Approval Rate", "Approval Rate")}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row - Recharts */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Risk Distribution Pie Chart */}
                <Card data-testid="chart-risk-distribution">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5" />
                      {t("Distribusi Risiko", "Risk Distribution")}
                    </CardTitle>
                    <CardDescription>{t("Breakdown berdasarkan level risiko", "Breakdown by risk level")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(overview?.risk_distribution || {}).length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <RechartsPie>
                          <Pie
                            data={Object.entries(overview?.risk_distribution || {}).map(([level, count]) => ({
                              name: level === 'level_1' ? 'Normal' : level === 'level_2' ? 'Sensitive' : 'Critical',
                              value: count,
                              level
                            }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {Object.entries(overview?.risk_distribution || {}).map(([level], index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[level]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, t("Laporan", "Reports")]} />
                          <Legend />
                        </RechartsPie>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        {t("Belum ada data", "No data yet")}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Queue Status Bar Chart */}
                <Card data-testid="chart-queue-status">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      {t("Status Moderasi", "Moderation Status")}
                    </CardTitle>
                    <CardDescription>{t("Status antrian moderasi saat ini", "Current moderation queue status")}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {Object.keys(overview?.queue_stats || {}).length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart
                          data={Object.entries(overview?.queue_stats || {}).map(([status, count]) => ({
                            name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            count,
                            status
                          }))}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis />
                          <Tooltip formatter={(value) => [value, t("Laporan", "Reports")]} />
                          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {Object.entries(overview?.queue_stats || {}).map(([status], index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[status] || '#8884d8'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        {t("Belum ada data moderasi", "No moderation data yet")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Timeline Area Chart with Recharts */}
              <Card className="mb-8" data-testid="chart-timeline">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {t("Timeline Risiko", "Risk Timeline")}
                  </CardTitle>
                  <CardDescription>{t("Trend laporan berdasarkan waktu", "Report trends over time")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {timeline?.dates?.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart
                        data={timeline.dates.map((date, idx) => ({
                          date: date.split('-').slice(1).join('/'),
                          'Level 1': timeline.series.level_1[idx]?.count || 0,
                          'Level 2': timeline.series.level_2[idx]?.count || 0,
                          'Level 3': timeline.series.level_3[idx]?.count || 0
                        }))}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorL1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorL2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#eab308" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#eab308" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorL3" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="Level 1" stroke="#22c55e" fillOpacity={1} fill="url(#colorL1)" stackId="1" />
                        <Area type="monotone" dataKey="Level 2" stroke="#eab308" fillOpacity={1} fill="url(#colorL2)" stackId="1" />
                        <Area type="monotone" dataKey="Level 3" stroke="#ef4444" fillOpacity={1} fill="url(#colorL3)" stackId="1" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      {t("Belum ada data timeline", "No timeline data yet")}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Keyword Trends with Bar Chart */}
              <Card className="mb-8" data-testid="chart-keywords">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    {t("Keyword Terdeteksi Terbanyak", "Top Detected Keywords")}
                  </CardTitle>
                  <CardDescription>{t("Kata kunci sensitif yang sering muncul", "Frequently detected sensitive keywords")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {overview?.keyword_trends?.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart
                          data={overview.keyword_trends
                            .filter(item => item.keyword && typeof item.keyword === 'string')
                            .slice(0, 8)
                            .map(item => ({
                              keyword: item.keyword.length > 12 ? item.keyword.slice(0, 12) + '...' : item.keyword,
                              count: item.count
                            }))}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                          <XAxis type="number" />
                          <YAxis dataKey="keyword" type="category" tick={{ fontSize: 11 }} />
                          <Tooltip formatter={(value) => [value, t("Terdeteksi", "Detected")]} />
                          <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t">
                        {overview.keyword_trends
                          .filter(item => item.keyword && typeof item.keyword === 'string')
                          .map((item, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 text-sm"
                          >
                            {item.keyword} ({item.count})
                          </span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                      {t("Tidak ada keyword terdeteksi", "No keywords detected")}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Moderator Performance */}
              <Card className="mb-8" data-testid="moderator-performance">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {t("Performa Moderator", "Moderator Performance")}
                  </CardTitle>
                  <CardDescription>{t("Aktivitas dan metrik moderator", "Moderator activity and metrics")}</CardDescription>
                </CardHeader>
                <CardContent>
                  {moderators.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2">{t("Moderator", "Moderator")}</th>
                            <th className="text-left py-3 px-2">{t("Total Aksi", "Total Actions")}</th>
                            <th className="text-left py-3 px-2">{t("Breakdown", "Breakdown")}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {moderators.map((mod, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="py-3 px-2">
                                <div>
                                  <p className="font-medium">{mod.name}</p>
                                  <p className="text-sm text-muted-foreground">{mod.email}</p>
                                </div>
                              </td>
                              <td className="py-3 px-2 font-bold">{mod.total_actions}</td>
                              <td className="py-3 px-2">
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(mod.action_breakdown || {}).map(([action, count]) => (
                                    <span key={action} className="px-2 py-0.5 rounded bg-secondary text-xs">
                                      {action.replace(/_/g, ' ')}: {count}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      {t("Belum ada aktivitas moderator", "No moderator activity yet")}
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Export Buttons */}
              <div className="flex justify-center gap-4" data-testid="export-section">
                <Button 
                  variant="outline" 
                  onClick={() => handleExport('json')}
                  disabled={exporting}
                  data-testid="export-json-btn"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("Export JSON", "Export JSON")}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => handleExport('csv')}
                  disabled={exporting}
                  data-testid="export-csv-btn"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t("Export CSV", "Export CSV")}
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default HITLAnalyticsPage;
