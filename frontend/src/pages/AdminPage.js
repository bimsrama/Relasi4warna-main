import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLanguage, useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Switch } from "../components/ui/switch";
import { 
  ArrowLeft, Users, FileText, DollarSign, Tag, BarChart3, 
  Plus, Trash2, Edit, Save, X, RefreshCw, Bell, Send, Loader2, BookOpen, Eye,
  Shield, AlertTriangle, CheckCircle, XCircle, Clock, AlertCircle, Settings, CreditCard,
  TrendingUp, PieChart, ToggleLeft
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

  // HITL Moderation State
  const [hitlStats, setHitlStats] = useState(null);
  const [moderationQueue, setModerationQueue] = useState([]);
  const [selectedQueueItem, setSelectedQueueItem] = useState(null);
  const [moderationDecision, setModerationDecision] = useState({ action: "", notes: "", edited_output: "" });
  const [processingDecision, setProcessingDecision] = useState(false);
  const [queueFilter, setQueueFilter] = useState({ status: "pending", risk_level: "" });

  // Enhanced Admin State
  const [pricing, setPricing] = useState([]);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionForm, setQuestionForm] = useState({
    question_id_text: "", question_en_text: "",
    question_type: "forced_choice",
    options: [
      { text_id: "", text_en: "", archetype: "driver", weight: 1 },
      { text_id: "", text_en: "", archetype: "spark", weight: 1 },
      { text_id: "", text_en: "", archetype: "anchor", weight: 1 },
      { text_id: "", text_en: "", archetype: "analyst", weight: 1 }
    ],
    stress_marker_flag: false, active: true, order: 0
  });
  const [advancedCoupon, setAdvancedCoupon] = useState({
    code: "", discount_type: "percent", discount_value: 10,
    max_uses: 100, min_purchase_idr: 0, valid_products: [],
    valid_from: "", valid_until: "", one_per_user: true, active: true
  });
  const [showAdvancedCoupon, setShowAdvancedCoupon] = useState(false);
  const [showPricingForm, setShowPricingForm] = useState(false);
  const [editingPricing, setEditingPricing] = useState(null);
  const [pricingForm, setPricingForm] = useState({
    product_id: "", name_id: "", name_en: "",
    description_id: "", description_en: "",
    price_idr: 0, price_usd: 0,
    features_id: "", features_en: "",
    active: true, is_popular: false
  });
  const [dashboardStats, setDashboardStats] = useState(null);

  useEffect(() => {
    if (!user?.is_admin) {
      navigate("/dashboard");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes, resultsRes, couponsRes, tipsRes, blogRes, hitlStatsRes, queueRes, pricingRes, dashboardRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/users?limit=20`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/results?limit=20`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/coupons`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/admin/tips-subscribers`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { subscribers: [] } })),
        axios.get(`${API}/admin/blog/articles?status=all`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { articles: [] } })),
        axios.get(`${API}/admin/hitl/stats`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: {} })),
        axios.get(`${API}/admin/hitl/queue?status=pending`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { items: [] } })),
        axios.get(`${API}/admin/pricing`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { pricing: [] } })),
        axios.get(`${API}/admin/dashboard/overview`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: null }))
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setResults(resultsRes.data.results || []);
      setCoupons(couponsRes.data.coupons || []);
      setTipsSubscribers(tipsRes.data.subscribers || []);
      setBlogArticles(blogRes.data.articles || []);
      setHitlStats(hitlStatsRes.data);
      setModerationQueue(queueRes.data.items || []);
      setPricing(pricingRes.data.pricing || []);
      setDashboardStats(dashboardRes.data);
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

  // HITL Moderation Functions
  const fetchModerationQueue = async () => {
    try {
      const params = new URLSearchParams();
      if (queueFilter.status) params.append('status', queueFilter.status);
      if (queueFilter.risk_level) params.append('risk_level', queueFilter.risk_level);
      
      const response = await axios.get(`${API}/admin/hitl/queue?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setModerationQueue(response.data.items || []);
    } catch (error) {
      console.error("Error fetching moderation queue:", error);
    }
  };

  const fetchQueueItemDetail = async (queueId) => {
    try {
      const response = await axios.get(`${API}/admin/hitl/queue/${queueId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedQueueItem(response.data);
      setModerationDecision({ action: "", notes: "", edited_output: response.data.original_output || "" });
    } catch (error) {
      toast.error("Failed to load queue item details");
    }
  };

  const handleModerationDecision = async () => {
    if (!moderationDecision.action) {
      toast.error("Please select an action");
      return;
    }
    if (!moderationDecision.notes) {
      toast.error("Please add moderator notes");
      return;
    }
    
    setProcessingDecision(true);
    try {
      await axios.post(
        `${API}/admin/hitl/queue/${selectedQueueItem.queue_id}/decision`,
        {
          action: moderationDecision.action,
          moderator_notes: moderationDecision.notes,
          edited_output: moderationDecision.action === 'edit_output' ? moderationDecision.edited_output : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Decision processed successfully!");
      setSelectedQueueItem(null);
      fetchModerationQueue();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to process decision");
    } finally {
      setProcessingDecision(false);
    }
  };

  const getRiskLevelColor = (level) => {
    switch(level) {
      case 'level_1': return 'bg-green-100 text-green-700';
      case 'level_2': return 'bg-yellow-100 text-yellow-700';
      case 'level_3': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'approved_with_buffer': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'edited': return <Edit className="w-4 h-4 text-purple-600" />;
      case 'safe_response_only': return <Shield className="w-4 h-4 text-orange-600" />;
      case 'escalated': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  // Enhanced Admin Functions
  const handleSaveQuestion = async () => {
    try {
      const payload = {
        series: selectedSeries,
        question_id_text: questionForm.question_id_text,
        question_en_text: questionForm.question_en_text,
        question_type: questionForm.question_type,
        options: questionForm.options.filter(o => o.text_id && o.text_en),
        scoring_map: questionForm.options.reduce((acc, o) => ({ ...acc, [o.archetype]: 1 }), {}),
        stress_marker_flag: questionForm.stress_marker_flag,
        active: questionForm.active,
        order: questionForm.order
      };

      if (editingQuestion) {
        await axios.put(`${API}/admin/questions/${editingQuestion.question_id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Question updated!");
      } else {
        await axios.post(`${API}/admin/questions`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Question created!");
      }
      
      setShowQuestionForm(false);
      setEditingQuestion(null);
      resetQuestionForm();
      fetchQuestions(selectedSeries);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save question");
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      question_id_text: "", question_en_text: "",
      question_type: "forced_choice",
      options: [
        { text_id: "", text_en: "", archetype: "driver", weight: 1 },
        { text_id: "", text_en: "", archetype: "spark", weight: 1 },
        { text_id: "", text_en: "", archetype: "anchor", weight: 1 },
        { text_id: "", text_en: "", archetype: "analyst", weight: 1 }
      ],
      stress_marker_flag: false, active: true, order: questions.length + 1
    });
  };

  const handleEditQuestion = (q) => {
    setEditingQuestion(q);
    setQuestionForm({
      question_id_text: q.question_id_text || "",
      question_en_text: q.question_en_text || "",
      question_type: q.question_type || "forced_choice",
      options: q.options || [],
      stress_marker_flag: q.stress_marker_flag || false,
      active: q.active !== false,
      order: q.order || 0
    });
    setShowQuestionForm(true);
  };

  const handleToggleQuestion = async (questionId) => {
    try {
      await axios.post(`${API}/admin/questions/${questionId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuestions(selectedSeries);
      toast.success("Question status updated!");
    } catch (error) {
      toast.error("Failed to toggle question");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Delete this question? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/admin/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchQuestions(selectedSeries);
      toast.success("Question deleted!");
    } catch (error) {
      toast.error("Failed to delete question");
    }
  };

  const handleCreateAdvancedCoupon = async () => {
    if (!advancedCoupon.code) {
      toast.error("Please enter a coupon code");
      return;
    }
    try {
      await axios.post(`${API}/admin/coupons/advanced`, advancedCoupon, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Coupon created!");
      setAdvancedCoupon({
        code: "", discount_type: "percent", discount_value: 10,
        max_uses: 100, min_purchase_idr: 0, valid_products: [],
        valid_from: "", valid_until: "", one_per_user: true, active: true
      });
      setShowAdvancedCoupon(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create coupon");
    }
  };

  const handleToggleCoupon = async (couponId) => {
    try {
      await axios.post(`${API}/admin/coupons/${couponId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
      toast.success("Coupon status updated!");
    } catch (error) {
      toast.error("Failed to toggle coupon");
    }
  };

  const handleSavePricing = async () => {
    if (!pricingForm.product_id || !pricingForm.name_id) {
      toast.error("Please fill in required fields");
      return;
    }
    try {
      const payload = {
        ...pricingForm,
        features_id: pricingForm.features_id.split('\n').filter(f => f.trim()),
        features_en: pricingForm.features_en.split('\n').filter(f => f.trim())
      };

      if (editingPricing) {
        await axios.put(`${API}/admin/pricing/${pricingForm.product_id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Pricing updated!");
      } else {
        await axios.post(`${API}/admin/pricing`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Pricing created!");
      }
      
      setShowPricingForm(false);
      setEditingPricing(null);
      resetPricingForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to save pricing");
    }
  };

  const resetPricingForm = () => {
    setPricingForm({
      product_id: "", name_id: "", name_en: "",
      description_id: "", description_en: "",
      price_idr: 0, price_usd: 0,
      features_id: "", features_en: "",
      active: true, is_popular: false
    });
  };

  const handleEditPricing = (p) => {
    setEditingPricing(p);
    setPricingForm({
      product_id: p.product_id || "",
      name_id: p.name_id || "",
      name_en: p.name_en || "",
      description_id: p.description_id || "",
      description_en: p.description_en || "",
      price_idr: p.price_idr || 0,
      price_usd: p.price_usd || 0,
      features_id: (p.features_id || []).join('\n'),
      features_en: (p.features_en || []).join('\n'),
      active: p.active !== false,
      is_popular: p.is_popular || false
    });
    setShowPricingForm(true);
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
            <TabsList className="grid grid-cols-8 w-full max-w-4xl">
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="coupons">Coupons</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
              <TabsTrigger value="tips">Tips</TabsTrigger>
              <TabsTrigger value="blog">Blog</TabsTrigger>
              <TabsTrigger value="moderation" className="relative">
                <Shield className="w-4 h-4 mr-1" />
                HITL
                {hitlStats?.pending_count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {hitlStats.pending_count}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Questions Tab */}
            <TabsContent value="questions">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Question Management</CardTitle>
                  <div className="flex gap-2">
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
                    <Button onClick={() => { setShowQuestionForm(true); setEditingQuestion(null); resetQuestionForm(); }}>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {showQuestionForm ? (
                    <div className="space-y-4 p-4 border rounded-lg mb-4" data-testid="question-form">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold">{editingQuestion ? "Edit Question" : "New Question"}</h3>
                        <Button variant="ghost" size="sm" onClick={() => { setShowQuestionForm(false); setEditingQuestion(null); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Question (Indonesian) *</Label>
                          <Textarea
                            value={questionForm.question_id_text}
                            onChange={(e) => setQuestionForm({...questionForm, question_id_text: e.target.value})}
                            placeholder="Pertanyaan dalam Bahasa Indonesia..."
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label>Question (English) *</Label>
                          <Textarea
                            value={questionForm.question_en_text}
                            onChange={(e) => setQuestionForm({...questionForm, question_en_text: e.target.value})}
                            placeholder="Question in English..."
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label>Answer Options (4 archetypes)</Label>
                        {['driver', 'spark', 'anchor', 'analyst'].map((archetype, idx) => (
                          <div key={archetype} className="grid md:grid-cols-2 gap-2 p-3 bg-secondary/20 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className={`w-3 h-3 rounded-full ${
                                archetype === 'driver' ? 'bg-red-500' :
                                archetype === 'spark' ? 'bg-yellow-500' :
                                archetype === 'anchor' ? 'bg-green-500' : 'bg-blue-500'
                              }`} />
                              <span className="text-xs font-medium uppercase">{archetype}</span>
                            </div>
                            <Input
                              placeholder={`Option ID for ${archetype}`}
                              value={questionForm.options[idx]?.text_id || ''}
                              onChange={(e) => {
                                const newOptions = [...questionForm.options];
                                newOptions[idx] = { ...newOptions[idx], text_id: e.target.value, archetype };
                                setQuestionForm({...questionForm, options: newOptions});
                              }}
                            />
                            <div />
                            <Input
                              placeholder={`Option EN for ${archetype}`}
                              value={questionForm.options[idx]?.text_en || ''}
                              onChange={(e) => {
                                const newOptions = [...questionForm.options];
                                newOptions[idx] = { ...newOptions[idx], text_en: e.target.value, archetype };
                                setQuestionForm({...questionForm, options: newOptions});
                              }}
                            />
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={questionForm.stress_marker_flag}
                            onChange={(e) => setQuestionForm({...questionForm, stress_marker_flag: e.target.checked})}
                            className="rounded"
                          />
                          <Label>Stress Marker</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={questionForm.active}
                            onChange={(e) => setQuestionForm({...questionForm, active: e.target.checked})}
                            className="rounded"
                          />
                          <Label>Active</Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label>Order:</Label>
                          <Input
                            type="number"
                            value={questionForm.order}
                            onChange={(e) => setQuestionForm({...questionForm, order: parseInt(e.target.value)})}
                            className="w-20"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => { setShowQuestionForm(false); setEditingQuestion(null); }}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveQuestion} data-testid="save-question-btn">
                          <Save className="w-4 h-4 mr-2" />
                          {editingQuestion ? "Update" : "Create"}
                        </Button>
                      </div>
                    </div>
                  ) : null}

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
                            {q.options && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {q.options.map((opt, i) => (
                                  <span key={i} className="text-xs px-2 py-0.5 bg-secondary rounded">
                                    {opt.archetype}: {opt.text_id?.substring(0, 30)}...
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2 ml-4">
                            {q.stress_marker_flag && (
                              <span className="text-xs px-2 py-1 rounded bg-orange-100 text-orange-700">Stress</span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${q.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {q.active ? 'Active' : 'Inactive'}
                            </span>
                            <Button variant="ghost" size="sm" onClick={() => handleEditQuestion(q)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleToggleQuestion(q.question_id)}>
                              <ToggleLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteQuestion(q.question_id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
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

            {/* Pricing Tab */}
            <TabsContent value="pricing">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Pricing Tiers
                  </CardTitle>
                  <Button onClick={() => { setShowPricingForm(true); setEditingPricing(null); resetPricingForm(); }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Pricing Tier
                  </Button>
                </CardHeader>
                <CardContent>
                  {showPricingForm ? (
                    <div className="space-y-4 p-4 border rounded-lg mb-4" data-testid="pricing-form">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold">{editingPricing ? "Edit Pricing" : "New Pricing Tier"}</h3>
                        <Button variant="ghost" size="sm" onClick={() => { setShowPricingForm(false); setEditingPricing(null); }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Product ID *</Label>
                          <Input
                            value={pricingForm.product_id}
                            onChange={(e) => setPricingForm({...pricingForm, product_id: e.target.value})}
                            placeholder="single_report, family_pack, etc."
                            disabled={!!editingPricing}
                          />
                        </div>
                        <div className="flex items-center gap-4 pt-6">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={pricingForm.active}
                              onChange={(e) => setPricingForm({...pricingForm, active: e.target.checked})}
                              className="rounded"
                            />
                            Active
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={pricingForm.is_popular}
                              onChange={(e) => setPricingForm({...pricingForm, is_popular: e.target.checked})}
                              className="rounded"
                            />
                            Popular Badge
                          </label>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Name (ID) *</Label>
                          <Input
                            value={pricingForm.name_id}
                            onChange={(e) => setPricingForm({...pricingForm, name_id: e.target.value})}
                            placeholder="Nama produk..."
                          />
                        </div>
                        <div>
                          <Label>Name (EN) *</Label>
                          <Input
                            value={pricingForm.name_en}
                            onChange={(e) => setPricingForm({...pricingForm, name_en: e.target.value})}
                            placeholder="Product name..."
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Description (ID)</Label>
                          <Textarea
                            value={pricingForm.description_id}
                            onChange={(e) => setPricingForm({...pricingForm, description_id: e.target.value})}
                            rows={2}
                          />
                        </div>
                        <div>
                          <Label>Description (EN)</Label>
                          <Textarea
                            value={pricingForm.description_en}
                            onChange={(e) => setPricingForm({...pricingForm, description_en: e.target.value})}
                            rows={2}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Price IDR *</Label>
                          <Input
                            type="number"
                            value={pricingForm.price_idr}
                            onChange={(e) => setPricingForm({...pricingForm, price_idr: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label>Price USD *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={pricingForm.price_usd}
                            onChange={(e) => setPricingForm({...pricingForm, price_usd: parseFloat(e.target.value)})}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Features (ID) - one per line</Label>
                          <Textarea
                            value={pricingForm.features_id}
                            onChange={(e) => setPricingForm({...pricingForm, features_id: e.target.value})}
                            rows={4}
                            placeholder="Fitur 1&#10;Fitur 2&#10;Fitur 3"
                          />
                        </div>
                        <div>
                          <Label>Features (EN) - one per line</Label>
                          <Textarea
                            value={pricingForm.features_en}
                            onChange={(e) => setPricingForm({...pricingForm, features_en: e.target.value})}
                            rows={4}
                            placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => { setShowPricingForm(false); setEditingPricing(null); }}>
                          Cancel
                        </Button>
                        <Button onClick={handleSavePricing} data-testid="save-pricing-btn">
                          <Save className="w-4 h-4 mr-2" />
                          {editingPricing ? "Update" : "Create"}
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pricing.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8 col-span-full">No pricing tiers configured yet</p>
                    ) : (
                      pricing.map((p) => (
                        <div key={p.product_id} className={`p-4 border rounded-lg ${p.is_popular ? 'border-primary ring-2 ring-primary/20' : ''}`}>
                          {p.is_popular && (
                            <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">Popular</span>
                          )}
                          <h4 className="font-bold mt-2">{p.name_en || p.name_id}</h4>
                          <p className="text-sm text-muted-foreground">{p.product_id}</p>
                          <p className="text-2xl font-bold mt-2">
                            Rp {(p.price_idr || 0).toLocaleString()}
                          </p>
                          <p className="text-sm text-muted-foreground">${p.price_usd || 0} USD</p>
                          <div className="mt-3 space-y-1">
                            {(p.features_en || p.features_id || []).slice(0, 3).map((f, i) => (
                              <p key={i} className="text-xs text-muted-foreground flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-green-500" /> {f}
                              </p>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditPricing(p)}>
                              <Edit className="w-4 h-4 mr-1" /> Edit
                            </Button>
                            <span className={`px-2 py-1 rounded text-xs ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              {p.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Coupon Management
                  </CardTitle>
                  <Button onClick={() => setShowAdvancedCoupon(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Coupon
                  </Button>
                </CardHeader>
                <CardContent>
                  {showAdvancedCoupon ? (
                    <div className="space-y-4 p-4 border rounded-lg mb-6" data-testid="advanced-coupon-form">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold">Create New Coupon</h3>
                        <Button variant="ghost" size="sm" onClick={() => setShowAdvancedCoupon(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label>Code *</Label>
                          <Input
                            value={advancedCoupon.code}
                            onChange={(e) => setAdvancedCoupon({...advancedCoupon, code: e.target.value.toUpperCase()})}
                            placeholder="SAVE20"
                          />
                        </div>
                        <div>
                          <Label>Discount Type</Label>
                          <select
                            className="w-full border rounded-lg px-3 py-2"
                            value={advancedCoupon.discount_type}
                            onChange={(e) => setAdvancedCoupon({...advancedCoupon, discount_type: e.target.value})}
                          >
                            <option value="percent">Percentage (%)</option>
                            <option value="fixed_idr">Fixed Amount (IDR)</option>
                            <option value="fixed_usd">Fixed Amount (USD)</option>
                          </select>
                        </div>
                        <div>
                          <Label>Discount Value *</Label>
                          <Input
                            type="number"
                            value={advancedCoupon.discount_value}
                            onChange={(e) => setAdvancedCoupon({...advancedCoupon, discount_value: parseFloat(e.target.value)})}
                            placeholder={advancedCoupon.discount_type === 'percent' ? "10" : "50000"}
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label>Max Uses</Label>
                          <Input
                            type="number"
                            value={advancedCoupon.max_uses}
                            onChange={(e) => setAdvancedCoupon({...advancedCoupon, max_uses: parseInt(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label>Min Purchase (IDR)</Label>
                          <Input
                            type="number"
                            value={advancedCoupon.min_purchase_idr}
                            onChange={(e) => setAdvancedCoupon({...advancedCoupon, min_purchase_idr: parseFloat(e.target.value)})}
                            placeholder="0"
                          />
                        </div>
                        <div className="flex items-center gap-4 pt-6">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={advancedCoupon.one_per_user}
                              onChange={(e) => setAdvancedCoupon({...advancedCoupon, one_per_user: e.target.checked})}
                              className="rounded"
                            />
                            One per User
                          </label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={advancedCoupon.active}
                              onChange={(e) => setAdvancedCoupon({...advancedCoupon, active: e.target.checked})}
                              className="rounded"
                            />
                            Active
                          </label>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label>Valid From</Label>
                          <Input
                            type="datetime-local"
                            value={advancedCoupon.valid_from}
                            onChange={(e) => setAdvancedCoupon({...advancedCoupon, valid_from: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Valid Until</Label>
                          <Input
                            type="datetime-local"
                            value={advancedCoupon.valid_until}
                            onChange={(e) => setAdvancedCoupon({...advancedCoupon, valid_until: e.target.value})}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setShowAdvancedCoupon(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleCreateAdvancedCoupon} data-testid="create-coupon-btn">
                          <Save className="w-4 h-4 mr-2" />
                          Create Coupon
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* Simple Create Form */
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
                      <div className="flex items-end gap-2">
                        <Button onClick={handleCreateCoupon}>
                          <Plus className="w-4 h-4 mr-2" />
                          Quick Add
                        </Button>
                        <Button variant="outline" onClick={() => setShowAdvancedCoupon(true)}>
                          <Settings className="w-4 h-4 mr-2" />
                          Advanced
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Coupons List */}
                  <div className="space-y-2">
                    {coupons.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No coupons created yet</p>
                    ) : (
                      coupons.map((c) => (
                        <div key={c.coupon_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold">{c.code}</span>
                              <span className={`px-2 py-0.5 rounded text-xs ${c.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {c.active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {c.discount_type === 'percent' ? `${c.discount_value || c.discount_percent}%` : `Rp ${c.discount_value?.toLocaleString()}`} off • 
                              {c.uses}/{c.max_uses} used
                              {c.min_purchase_idr > 0 && ` • Min Rp ${c.min_purchase_idr.toLocaleString()}`}
                              {c.valid_until && ` • Until ${new Date(c.valid_until).toLocaleDateString()}`}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleToggleCoupon(c.coupon_id)}>
                              <ToggleLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCoupon(c.coupon_id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
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

            {/* HITL Moderation Tab */}
            <TabsContent value="moderation">
              <div className="space-y-6">
                {/* HITL Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-yellow-600" />
                        <div>
                          <p className="text-2xl font-bold">{hitlStats?.pending_count || 0}</p>
                          <p className="text-sm text-muted-foreground">Pending Review</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                        <div>
                          <p className="text-2xl font-bold">{hitlStats?.assessments_by_risk?.level_3 || 0}</p>
                          <p className="text-sm text-muted-foreground">Critical (Level 3)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-8 h-8 text-yellow-600" />
                        <div>
                          <p className="text-2xl font-bold">{hitlStats?.assessments_by_risk?.level_2 || 0}</p>
                          <p className="text-sm text-muted-foreground">Sensitive (Level 2)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                        <div>
                          <p className="text-2xl font-bold">{hitlStats?.assessments_by_risk?.level_1 || 0}</p>
                          <p className="text-sm text-muted-foreground">Normal (Level 1)</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Moderation Queue */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Moderation Queue
                    </CardTitle>
                    <div className="flex gap-2">
                      <select
                        value={queueFilter.status}
                        onChange={(e) => {
                          setQueueFilter({...queueFilter, status: e.target.value});
                          setTimeout(fetchModerationQueue, 100);
                        }}
                        className="border rounded-lg px-3 py-2 text-sm"
                        data-testid="queue-status-filter"
                      >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="approved_with_buffer">Approved with Buffer</option>
                        <option value="edited">Edited</option>
                        <option value="safe_response_only">Safe Response</option>
                        <option value="escalated">Escalated</option>
                      </select>
                      <select
                        value={queueFilter.risk_level}
                        onChange={(e) => {
                          setQueueFilter({...queueFilter, risk_level: e.target.value});
                          setTimeout(fetchModerationQueue, 100);
                        }}
                        className="border rounded-lg px-3 py-2 text-sm"
                        data-testid="queue-risk-filter"
                      >
                        <option value="">All Risk Levels</option>
                        <option value="level_1">Level 1 (Normal)</option>
                        <option value="level_2">Level 2 (Sensitive)</option>
                        <option value="level_3">Level 3 (Critical)</option>
                      </select>
                      <Button variant="outline" size="sm" onClick={fetchModerationQueue}>
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {moderationQueue.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p>No items in queue matching your filters.</p>
                        <p className="text-sm mt-2">All clear! 🎉</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {moderationQueue.map((item) => (
                          <div
                            key={item.queue_id}
                            className="p-4 border rounded-lg hover:bg-secondary/20 cursor-pointer transition-colors"
                            onClick={() => fetchQueueItemDetail(item.queue_id)}
                            data-testid={`queue-item-${item.queue_id}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(item.status)}
                                <div>
                                  <p className="font-medium text-sm">
                                    Result: {item.result_id}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Series: {item.series} • Score: {item.risk_score}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskLevelColor(item.risk_level)}`}>
                                  {item.risk_level?.replace('_', ' ').toUpperCase()}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(item.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            {item.detected_keywords && Object.keys(item.detected_keywords).length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {Object.entries(item.detected_keywords).map(([category, keywords]) => (
                                  keywords.slice(0, 2).map((kw, idx) => (
                                    <span key={`${category}-${idx}`} className="px-2 py-0.5 bg-red-50 text-red-600 text-xs rounded">
                                      {kw}
                                    </span>
                                  ))
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Queue Item Detail Modal */}
                {selectedQueueItem && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-background rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                      <div className="p-6 border-b flex items-center justify-between">
                        <div>
                          <h2 className="text-xl font-bold flex items-center gap-2">
                            <Shield className="w-5 h-5" />
                            Review Content
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            Queue ID: {selectedQueueItem.queue_id}
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedQueueItem(null)}>
                          <X className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {/* Risk Info */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-3 bg-secondary/30 rounded-lg">
                            <p className="text-xs text-muted-foreground">Risk Level</p>
                            <p className={`font-bold ${
                              selectedQueueItem.risk_level === 'level_3' ? 'text-red-600' :
                              selectedQueueItem.risk_level === 'level_2' ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                              {selectedQueueItem.risk_level?.replace('_', ' ').toUpperCase()}
                            </p>
                          </div>
                          <div className="p-3 bg-secondary/30 rounded-lg">
                            <p className="text-xs text-muted-foreground">Risk Score</p>
                            <p className="font-bold">{selectedQueueItem.risk_score}</p>
                          </div>
                          <div className="p-3 bg-secondary/30 rounded-lg">
                            <p className="text-xs text-muted-foreground">Series</p>
                            <p className="font-bold capitalize">{selectedQueueItem.series}</p>
                          </div>
                          <div className="p-3 bg-secondary/30 rounded-lg">
                            <p className="text-xs text-muted-foreground">Status</p>
                            <p className="font-bold capitalize">{selectedQueueItem.status?.replace('_', ' ')}</p>
                          </div>
                        </div>

                        {/* Detected Keywords */}
                        {selectedQueueItem.detected_keywords && Object.keys(selectedQueueItem.detected_keywords).length > 0 && (
                          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                            <h4 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4" />
                              Detected Risk Keywords
                            </h4>
                            <div className="space-y-2">
                              {Object.entries(selectedQueueItem.detected_keywords).map(([category, keywords]) => (
                                <div key={category}>
                                  <span className="text-xs font-medium text-red-600 uppercase">{category}:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {keywords.map((kw, idx) => (
                                      <span key={idx} className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                                        {kw}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Flags */}
                        {selectedQueueItem.flags && selectedQueueItem.flags.length > 0 && (
                          <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                            <h4 className="font-medium text-yellow-800 mb-2">Risk Flags</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedQueueItem.flags.map((flag, idx) => (
                                <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                                  {flag.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Original Output */}
                        <div>
                          <h4 className="font-medium mb-2">Original AI Output</h4>
                          <div className="p-4 bg-secondary/30 rounded-lg max-h-64 overflow-y-auto">
                            <pre className="text-sm whitespace-pre-wrap font-sans">
                              {selectedQueueItem.original_output?.substring(0, 2000)}
                              {selectedQueueItem.original_output?.length > 2000 && '... [truncated]'}
                            </pre>
                          </div>
                        </div>

                        {/* Moderator Decision */}
                        {selectedQueueItem.status === 'pending' && (
                          <div className="border-t pt-6 space-y-4">
                            <h4 className="font-medium">Moderator Decision</h4>
                            
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                              {[
                                { value: 'approve_as_is', label: 'Approve As-Is', icon: CheckCircle, color: 'text-green-600' },
                                { value: 'approve_with_buffer', label: 'Add Safety Buffer', icon: Shield, color: 'text-blue-600' },
                                { value: 'edit_output', label: 'Edit Output', icon: Edit, color: 'text-purple-600' },
                                { value: 'safe_response_only', label: 'Safe Response Only', icon: AlertCircle, color: 'text-orange-600' },
                                { value: 'escalate', label: 'Escalate', icon: AlertTriangle, color: 'text-red-600' }
                              ].map(({ value, label, icon: Icon, color }) => (
                                <button
                                  key={value}
                                  onClick={() => setModerationDecision({...moderationDecision, action: value})}
                                  className={`p-3 border rounded-lg text-center transition-colors ${
                                    moderationDecision.action === value 
                                      ? 'border-primary bg-primary/10' 
                                      : 'hover:bg-secondary/50'
                                  }`}
                                  data-testid={`decision-${value}`}
                                >
                                  <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
                                  <p className="text-xs">{label}</p>
                                </button>
                              ))}
                            </div>

                            {moderationDecision.action === 'edit_output' && (
                              <div>
                                <Label>Edited Output</Label>
                                <Textarea
                                  value={moderationDecision.edited_output}
                                  onChange={(e) => setModerationDecision({...moderationDecision, edited_output: e.target.value})}
                                  rows={8}
                                  className="mt-2"
                                  placeholder="Edit the AI output here..."
                                  data-testid="edit-output-textarea"
                                />
                              </div>
                            )}

                            <div>
                              <Label>Moderator Notes *</Label>
                              <Textarea
                                value={moderationDecision.notes}
                                onChange={(e) => setModerationDecision({...moderationDecision, notes: e.target.value})}
                                rows={3}
                                className="mt-2"
                                placeholder="Add notes explaining your decision..."
                                data-testid="moderator-notes"
                              />
                            </div>

                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setSelectedQueueItem(null)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleModerationDecision}
                                disabled={processingDecision || !moderationDecision.action || !moderationDecision.notes}
                                data-testid="submit-decision"
                              >
                                {processingDecision ? (
                                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                                ) : (
                                  <><Save className="w-4 h-4 mr-2" /> Submit Decision</>
                                )}
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Audit Logs */}
                        {selectedQueueItem.audit_logs && selectedQueueItem.audit_logs.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Audit Log</h4>
                            <div className="space-y-2">
                              {selectedQueueItem.audit_logs.map((log, idx) => (
                                <div key={idx} className="p-3 bg-secondary/30 rounded-lg text-sm">
                                  <div className="flex justify-between">
                                    <span className="font-medium">{log.action?.replace(/_/g, ' ')}</span>
                                    <span className="text-muted-foreground">
                                      {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                  </div>
                                  {log.notes && <p className="text-muted-foreground mt-1">{log.notes}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
