import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { 
  ArrowLeft, Users, FileText, DollarSign, Tag, BarChart3, 
  Plus, Trash2, Edit, Save, X, RefreshCw, Bell, Send, Loader2, BookOpen, Eye 
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const AdminPage = () => {
  const { t, language } = useLanguage();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSeries, setSelectedSeries] = useState("family");
  const [newCoupon, setNewCoupon] = useState({ code: "", discount_percent: 10, max_uses: 100 });
  const [tipsSubscribers, setTipsSubscribers] = useState([]);
  const [sendingTips, setSendingTips] = useState(false);
  const [blogArticles, setBlogArticles] = useState([]);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleForm, setArticleForm] = useState({
    title_id: "", title_en: "", slug: "",
    excerpt_id: "", excerpt_en: "",
    content_id: "", content_en: "",
    category: "communication", tags: "", status: "draft"
  });

  useEffect(() => {
    if (!user?.is_admin) {
      navigate("/dashboard");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, resultsRes, couponsRes, tipsRes, blogRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/users?limit=20`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/results?limit=20`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/coupons`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/tips-subscribers`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { subscribers: [] } })),
        axios.get(`${API}/admin/blog/articles?status=all`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { articles: [] } }))
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setResults(resultsRes.data.results || []);
      setCoupons(couponsRes.data.coupons || []);
      setTipsSubscribers(tipsRes.data.subscribers || []);
      setBlogArticles(blogRes.data.articles || []);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (series) => {
    try {
      const response = await axios.get(`${API}/admin/questions?series=${series}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchQuestions(selectedSeries);
    }
  }, [selectedSeries, token]);

  const handleCreateCoupon = async () => {
    if (!newCoupon.code) {
      toast.error("Please enter a coupon code");
      return;
    }
    try {
      await axios.post(`${API}/admin/coupons`, newCoupon, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Coupon created!");
      setNewCoupon({ code: "", discount_percent: 10, max_uses: 100 });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create coupon");
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    try {
      await axios.delete(`${API}/admin/coupons/${couponId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Coupon deleted!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete coupon");
    }
  };

  const handleSendWeeklyTips = async () => {
    setSendingTips(true);
    try {
      const response = await axios.post(
        `${API}/admin/send-weekly-tips`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Tips sent to ${response.data.sent_count} subscribers!`);
    } catch (error) {
      toast.error("Failed to send weekly tips");
    } finally {
      setSendingTips(false);
    }
  };

  const handleSaveArticle = async () => {
    try {
      const payload = {
        ...articleForm,
        tags: articleForm.tags.split(',').map(t => t.trim()).filter(t => t)
      };
      
      if (editingArticle) {
        await axios.put(
          `${API}/admin/blog/articles/${editingArticle.article_id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Article updated!");
      } else {
        await axios.post(
          `${API}/admin/blog/articles`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Article created!");
      }
      
      setShowArticleForm(false);
      setEditingArticle(null);
      setArticleForm({
        title_id: "", title_en: "", slug: "",
        excerpt_id: "", excerpt_en: "",
        content_id: "", content_en: "",
        category: "communication", tags: "", status: "draft"
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save article");
    }
  };

  const handleEditArticle = (article) => {
    setEditingArticle(article);
    setArticleForm({
      title_id: article.title_id || "",
      title_en: article.title_en || "",
      slug: article.slug || "",
      excerpt_id: article.excerpt_id || "",
      excerpt_en: article.excerpt_en || "",
      content_id: article.content_id || "",
      content_en: article.content_en || "",
      category: article.category || "communication",
      tags: (article.tags || []).join(", "),
      status: article.status || "draft"
    });
    setShowArticleForm(true);
  };

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm("Delete this article?")) return;
    try {
      await axios.delete(`${API}/admin/blog/articles/${articleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Article deleted!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete article");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-pulse-soft">
          <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground" data-testid="back-link">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Dashboard
            </Link>
            <h1 className="font-bold text-foreground">Admin CMS</h1>
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{stats?.total_users || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-spark" />
                  <div>
                    <p className="text-2xl font-bold">{stats?.total_attempts || 0}</p>
                    <p className="text-sm text-muted-foreground">Quiz Attempts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-anchor" />
                  <div>
                    <p className="text-2xl font-bold">{stats?.completion_rate || 0}%</p>
                    <p className="text-sm text-muted-foreground">Completion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-driver" />
                  <div>
                    <p className="text-2xl font-bold">{stats?.conversion_rate || 0}%</p>
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Archetype Distribution */}
          {stats?.archetype_distribution && Object.keys(stats.archetype_distribution).length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Archetype Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(stats.archetype_distribution).map(([arch, count]) => (
                    <div key={arch} className="text-center p-4 bg-secondary/30 rounded-lg">
                      <p className="text-2xl font-bold capitalize">{count}</p>
                      <p className="text-sm text-muted-foreground capitalize">{arch}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs defaultValue="questions" className="space-y-4">
            <TabsList className="grid grid-cols-6 w-full max-w-2xl">
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="coupons">Coupons</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
              <TabsTrigger value="blog">Blog</TabsTrigger>
            </TabsList>

            {/* Questions Tab */}
            <TabsContent value="questions">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Question Management</CardTitle>
                  <select
                    value={selectedSeries}
                    onChange={(e) => setSelectedSeries(e.target.value)}
                    className="border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="family">Family</option>
                    <option value="business">Business</option>
                    <option value="friendship">Friendship</option>
                    <option value="couples">Couples</option>
                  </select>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {questions.map((q, idx) => (
                      <div key={q.question_id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-muted-foreground mb-1">
                              Q{idx + 1} - {q.question_id}
                            </p>
                            <p className="text-foreground">{q.question_id_text}</p>
                            <p className="text-sm text-muted-foreground mt-1">{q.question_en_text}</p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <span className={`text-xs px-2 py-1 rounded ${q.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {q.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Total: {questions.length} questions in {selectedSeries} series
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Users ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Language</th>
                          <th className="text-left p-2">Admin</th>
                          <th className="text-left p-2">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.user_id} className="border-b">
                            <td className="p-2">{u.name}</td>
                            <td className="p-2">{u.email}</td>
                            <td className="p-2">{u.language?.toUpperCase()}</td>
                            <td className="p-2">{u.is_admin ? '✅' : ''}</td>
                            <td className="p-2 text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Results ({results.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Result ID</th>
                          <th className="text-left p-2">Series</th>
                          <th className="text-left p-2">Primary</th>
                          <th className="text-left p-2">Secondary</th>
                          <th className="text-left p-2">Paid</th>
                          <th className="text-left p-2">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.map((r) => (
                          <tr key={r.result_id} className="border-b">
                            <td className="p-2 font-mono text-xs">{r.result_id}</td>
                            <td className="p-2 capitalize">{r.series}</td>
                            <td className="p-2 capitalize">{r.primary_archetype}</td>
                            <td className="p-2 capitalize">{r.secondary_archetype}</td>
                            <td className="p-2">{r.is_paid ? '✅' : '❌'}</td>
                            <td className="p-2 text-muted-foreground">
                              {new Date(r.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Coupons Tab */}
            <TabsContent value="coupons">
              <Card>
                <CardHeader>
                  <CardTitle>Coupon Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Create Coupon Form */}
                  <div className="flex flex-wrap gap-4 mb-6 p-4 bg-secondary/30 rounded-lg">
                    <div className="flex-1 min-w-[150px]">
                      <Label>Code</Label>
                      <Input
                        value={newCoupon.code}
                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                        placeholder="SAVE20"
                      />
                    </div>
                    <div className="w-32">
                      <Label>Discount %</Label>
                      <Input
                        type="number"
                        value={newCoupon.discount_percent}
                        onChange={(e) => setNewCoupon({ ...newCoupon, discount_percent: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="w-32">
                      <Label>Max Uses</Label>
                      <Input
                        type="number"
                        value={newCoupon.max_uses}
                        onChange={(e) => setNewCoupon({ ...newCoupon, max_uses: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleCreateCoupon}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Coupon
                      </Button>
                    </div>
                  </div>

                  {/* Coupons List */}
                  <div className="space-y-2">
                    {coupons.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No coupons created yet</p>
                    ) : (
                      coupons.map((c) => (
                        <div key={c.coupon_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <span className="font-mono font-bold">{c.code}</span>
                            <span className="ml-4 text-sm text-muted-foreground">
                              {c.discount_percent}% off • {c.uses}/{c.max_uses} used
                            </span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCoupon(c.coupon_id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Weekly Tips Tab */}
            <TabsContent value="tips">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Weekly Tips Management
                  </CardTitle>
                  <Button onClick={handleSendWeeklyTips} disabled={sendingTips}>
                    {sendingTips ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Send Weekly Tips Now
                  </Button>
                </CardHeader>
                <CardContent>
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-secondary/30 rounded-lg text-center">
                      <p className="text-2xl font-bold">{tipsSubscribers.length}</p>
                      <p className="text-sm text-muted-foreground">Total Subscribers</p>
                    </div>
                    <div className="p-4 bg-anchor/10 rounded-lg text-center">
                      <p className="text-2xl font-bold text-anchor">
                        {tipsSubscribers.filter(s => s.subscribed).length}
                      </p>
                      <p className="text-sm text-muted-foreground">Active Subscribers</p>
                    </div>
                  </div>

                  {/* Subscribers Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Email</th>
                          <th className="text-left p-2">Archetype</th>
                          <th className="text-left p-2">Language</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tipsSubscribers.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="p-4 text-center text-muted-foreground">
                              No subscribers yet
                            </td>
                          </tr>
                        ) : (
                          tipsSubscribers.map((sub, idx) => (
                            <tr key={idx} className="border-b">
                              <td className="p-2">{sub.email}</td>
                              <td className="p-2 capitalize">{sub.primary_archetype || '-'}</td>
                              <td className="p-2">{sub.language?.toUpperCase()}</td>
                              <td className="p-2">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  sub.subscribed 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                  {sub.subscribed ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="p-2 text-muted-foreground">
                                {sub.updated_at ? new Date(sub.updated_at).toLocaleDateString() : '-'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Blog Tab */}
            <TabsContent value="blog">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Blog Articles
                  </CardTitle>
                  <Button onClick={() => { setShowArticleForm(true); setEditingArticle(null); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    New Article
                  </Button>
                </CardHeader>
                <CardContent>
                  {showArticleForm ? (
                    <div className="space-y-4 p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold">{editingArticle ? "Edit Article" : "New Article"}</h3>
                        <Button variant="ghost" size="sm" onClick={() => { setShowArticleForm(false); setEditingArticle(null); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Title (ID)</Label>
                          <Input
                            value={articleForm.title_id}
                            onChange={(e) => setArticleForm({...articleForm, title_id: e.target.value})}
                            placeholder="Judul artikel..."
                          />
                        </div>
                        <div>
                          <Label>Title (EN)</Label>
                          <Input
                            value={articleForm.title_en}
                            onChange={(e) => setArticleForm({...articleForm, title_en: e.target.value})}
                            placeholder="Article title..."
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Slug</Label>
                          <Input
                            value={articleForm.slug}
                            onChange={(e) => setArticleForm({...articleForm, slug: e.target.value})}
                            placeholder="article-url-slug"
                          />
                        </div>
                        <div>
                          <Label>Category</Label>
                          <select
                            className="w-full border rounded-lg px-3 py-2"
                            value={articleForm.category}
                            onChange={(e) => setArticleForm({...articleForm, category: e.target.value})}
                          >
                            <option value="communication">Communication</option>
                            <option value="relationships">Relationships</option>
                            <option value="archetypes">Archetypes</option>
                            <option value="tips">Tips & Tricks</option>
                            <option value="stories">Stories</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Excerpt (ID)</Label>
                          <Textarea
                            value={articleForm.excerpt_id}
                            onChange={(e) => setArticleForm({...articleForm, excerpt_id: e.target.value})}
                            placeholder="Ringkasan singkat..."
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Excerpt (EN)</Label>
                          <Textarea
                            value={articleForm.excerpt_en}
                            onChange={(e) => setArticleForm({...articleForm, excerpt_en: e.target.value})}
                            placeholder="Short summary..."
                            rows={2}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Content (ID)</Label>
                        <Textarea
                          value={articleForm.content_id}
                          onChange={(e) => setArticleForm({...articleForm, content_id: e.target.value})}
                          placeholder="Konten artikel dalam Bahasa Indonesia... (Gunakan ## untuk heading, - untuk list)"
                          rows={6}
                        />
                      </div>

                      <div>
                        <Label>Content (EN)</Label>
                        <Textarea
                          value={articleForm.content_en}
                          onChange={(e) => setArticleForm({...articleForm, content_en: e.target.value})}
                          placeholder="Article content in English... (Use ## for headings, - for lists)"
                          rows={6}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tags (comma separated)</Label>
                          <Input
                            value={articleForm.tags}
                            onChange={(e) => setArticleForm({...articleForm, tags: e.target.value})}
                            placeholder="communication, tips, relationships"
                          />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <select
                            className="w-full border rounded-lg px-3 py-2"
                            value={articleForm.status}
                            onChange={(e) => setArticleForm({...articleForm, status: e.target.value})}
                          >
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => { setShowArticleForm(false); setEditingArticle(null); }}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveArticle}>
                          <Save className="w-4 h-4 mr-2" />
                          {editingArticle ? "Update" : "Create"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {blogArticles.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No articles yet. Create your first one!</p>
                      ) : (
                        blogArticles.map((article) => (
                          <div key={article.article_id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{article.title_en}</h4>
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  article.status === 'published' 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {article.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                /{article.slug} • {article.category} • <Eye className="w-3 h-3 inline" /> {article.views || 0}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditArticle(article)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteArticle(article.article_id)}>
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
