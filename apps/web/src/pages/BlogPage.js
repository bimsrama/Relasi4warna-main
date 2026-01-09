import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useLanguage, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { 
  ArrowLeft, Calendar, Eye, Tag, Search, ChevronRight, 
  BookOpen, Clock, ArrowRight
} from "lucide-react";
import axios from "axios";

const CATEGORY_ICONS = {
  communication: "💬",
  relationships: "❤️",
  archetypes: "🎭",
  tips: "💡",
  stories: "📖"
};

const BlogPage = () => {
  const { t, language } = useLanguage();
  const { slug } = useParams();
  const navigate = useNavigate();

  const [articles, setArticles] = useState([]);
  const [article, setArticle] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (slug) {
      fetchArticle(slug);
    } else {
      fetchArticles();
      fetchCategories();
    }
  }, [slug, page, selectedCategory]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let url = `${API}/blog/articles?page=${page}&limit=9`;
      if (selectedCategory) url += `&category=${selectedCategory}`;
      
      const response = await axios.get(url);
      setArticles(response.data.articles || []);
      setTotalPages(response.data.total_pages || 1);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticle = async (articleSlug) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/blog/articles/${articleSlug}`);
      setArticle(response.data);
    } catch (error) {
      console.error("Error fetching article:", error);
      navigate("/blog");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/blog/categories`);
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString(language === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // Single Article View
  if (slug && article) {
    const title = language === "id" ? article.title_id : article.title_en;
    const content = language === "id" ? article.content_id : article.content_en;
    const categoryObj = categories.find(c => c.id === article.category);
    const categoryName = categoryObj ? (language === "id" ? categoryObj.name_id : categoryObj.name_en) : article.category;

    return (
      <div className="min-h-screen bg-background">
        {/* SEO Meta would be handled by helmet in production */}
        <header className="fixed top-0 left-0 right-0 z-50 glass">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <div className="flex items-center justify-between h-16">
              <Link to="/blog" className="flex items-center text-muted-foreground hover:text-foreground" data-testid="back-to-blog">
                <ArrowLeft className="w-5 h-5 mr-2" />
                {t("Blog", "Blog")}
              </Link>
            </div>
          </div>
        </header>

        <main className="pt-24 pb-16 px-4 md:px-8">
          <article className="max-w-3xl mx-auto">
            {/* Article Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary">
                  {CATEGORY_ICONS[article.category]} {categoryName}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(article.created_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.views} {t("views", "views")}
                </span>
              </div>
              
              <h1 className="heading-1 text-foreground mb-4">{title}</h1>
              
              {article.featured_image && (
                <img 
                  src={article.featured_image} 
                  alt={title}
                  className="w-full h-64 md:h-96 object-cover rounded-2xl mb-6"
                />
              )}

              {article.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {article.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 text-xs bg-secondary rounded-full text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Article Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert" data-testid="article-content">
              {content.split('\n').map((line, idx) => {
                if (line.startsWith('# ')) {
                  return <h1 key={idx} className="text-3xl font-bold mt-8 mb-4 text-foreground">{line.replace('# ', '')}</h1>;
                }
                if (line.startsWith('## ')) {
                  return <h2 key={idx} className="text-2xl font-bold mt-6 mb-3 text-foreground">{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={idx} className="text-xl font-semibold mt-4 mb-2 text-foreground">{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('- ')) {
                  return <li key={idx} className="ml-6 text-muted-foreground">{line.replace('- ', '')}</li>;
                }
                if (line.startsWith('> ')) {
                  return <blockquote key={idx} className="border-l-4 border-primary pl-4 italic text-muted-foreground my-4">{line.replace('> ', '')}</blockquote>;
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={idx} className="font-bold text-foreground">{line.replace(/\*\*/g, '')}</p>;
                }
                if (line.trim()) {
                  return <p key={idx} className="text-muted-foreground mb-4 leading-relaxed">{line}</p>;
                }
                return <br key={idx} />;
              })}
            </div>

            {/* Author Info */}
            <div className="mt-12 pt-8 border-t">
              <p className="text-sm text-muted-foreground">
                {t("Ditulis oleh", "Written by")} <span className="font-medium text-foreground">{article.author_name}</span>
              </p>
            </div>

            {/* Back to Blog */}
            <div className="mt-8">
              <Button variant="outline" onClick={() => navigate("/blog")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("Kembali ke Blog", "Back to Blog")}
              </Button>
            </div>
          </article>
        </main>
      </div>
    );
  }

  // Blog List View
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center text-muted-foreground hover:text-foreground" data-testid="back-home">
              <ArrowLeft className="w-5 h-5 mr-2" />
              {t("Beranda", "Home")}
            </Link>
            <h1 className="font-bold">{t("Blog", "Blog")}</h1>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h1 className="heading-1 text-foreground mb-2">
              {t("Blog & Artikel", "Blog & Articles")}
            </h1>
            <p className="body-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                "Tips, insight, dan panduan untuk meningkatkan komunikasi dan hubungan Anda",
                "Tips, insights, and guides to improve your communication and relationships"
              )}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  !selectedCategory 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                }`}
                onClick={() => { setSelectedCategory(""); setPage(1); }}
                data-testid="filter-all"
              >
                {t("Semua", "All")}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  }`}
                  onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                  data-testid={`filter-${cat.id}`}
                >
                  {CATEGORY_ICONS[cat.id]} {language === "id" ? cat.name_id : cat.name_en}
                </button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : articles.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {t("Belum ada artikel", "No articles yet")}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {articles.map(art => {
                  const title = language === "id" ? art.title_id : art.title_en;
                  const excerpt = language === "id" ? art.excerpt_id : art.excerpt_en;
                  const categoryObj = categories.find(c => c.id === art.category);
                  const categoryName = categoryObj 
                    ? (language === "id" ? categoryObj.name_id : categoryObj.name_en) 
                    : art.category;

                  return (
                    <Card 
                      key={art.article_id} 
                      className="card-hover cursor-pointer overflow-hidden"
                      onClick={() => navigate(`/blog/${art.slug}`)}
                      data-testid={`article-${art.slug}`}
                    >
                      {art.featured_image && (
                        <img 
                          src={art.featured_image} 
                          alt={title}
                          className="w-full h-40 object-cover"
                        />
                      )}
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {CATEGORY_ICONS[art.category]} {categoryName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(art.created_at)}
                          </span>
                        </div>
                        <h3 className="font-bold text-foreground mb-2 line-clamp-2">{title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{excerpt}</p>
                        <div className="flex items-center text-sm text-primary font-medium">
                          {t("Baca selengkapnya", "Read more")}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    {t("Sebelumnya", "Previous")}
                  </Button>
                  <span className="flex items-center px-4 text-muted-foreground">
                    {page} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    {t("Selanjutnya", "Next")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default BlogPage;
