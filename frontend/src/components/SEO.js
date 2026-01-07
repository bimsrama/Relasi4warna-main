import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// SEO configuration for each page
const SEO_CONFIG = {
  '/': {
    title: {
      id: 'Relasi4Warna - Tes Komunikasi Hubungan | Temukan Gaya Komunikasi Anda',
      en: 'Relasi4Warna - Relationship Communication Test | Discover Your Style'
    },
    description: {
      id: 'Temukan gaya komunikasi Anda dengan 4 arketipe unik: Penggerak, Percikan, Jangkar, Analis. Tes gratis untuk memahami diri dan orang terdekat.',
      en: 'Discover your communication style with 4 unique archetypes: Driver, Spark, Anchor, Analyst. Free test to understand yourself and loved ones.'
    },
    keywords: {
      id: 'tes komunikasi, gaya komunikasi, kepribadian, hubungan, relasi, penggerak, percikan, jangkar, analis',
      en: 'communication test, communication style, personality, relationship, driver, spark, anchor, analyst'
    }
  },
  '/quiz': {
    title: {
      id: 'Mulai Tes Komunikasi - Relasi4Warna',
      en: 'Start Communication Test - Relasi4Warna'
    },
    description: {
      id: 'Jawab 24 pertanyaan untuk menemukan gaya komunikasi unik Anda. Tes gratis dan hasilnya langsung tersedia.',
      en: 'Answer 24 questions to discover your unique communication style. Free test with instant results.'
    },
    keywords: {
      id: 'tes kepribadian gratis, tes komunikasi online, quiz hubungan',
      en: 'free personality test, online communication test, relationship quiz'
    }
  },
  '/series': {
    title: {
      id: 'Pilih Seri Tes - Keluarga, Bisnis, Pertemanan, Pasangan',
      en: 'Choose Test Series - Family, Business, Friendship, Couples'
    },
    description: {
      id: 'Pilih konteks hubungan yang ingin Anda analisis: Keluarga, Bisnis, Pertemanan, atau Pasangan.',
      en: 'Choose the relationship context you want to analyze: Family, Business, Friendship, or Couples.'
    },
    keywords: {
      id: 'tes keluarga, tes bisnis, tes pertemanan, tes pasangan',
      en: 'family test, business test, friendship test, couples test'
    }
  },
  '/pricing': {
    title: {
      id: 'Harga & Paket - Laporan Premium Relasi4Warna',
      en: 'Pricing & Packages - Relasi4Warna Premium Reports'
    },
    description: {
      id: 'Dapatkan laporan lengkap dengan analisis mendalam, skrip dialog, dan rencana aksi. Mulai dari Rp 99.000.',
      en: 'Get complete reports with in-depth analysis, dialogue scripts, and action plans. Starting from $6.99.'
    },
    keywords: {
      id: 'laporan komunikasi premium, analisis kepribadian lengkap, harga tes kepribadian',
      en: 'premium communication report, complete personality analysis, personality test price'
    }
  },
  '/how-it-works': {
    title: {
      id: 'Cara Kerja Tes 4 Warna - Relasi4Warna',
      en: 'How the 4 Color Test Works - Relasi4Warna'
    },
    description: {
      id: 'Pelajari metodologi di balik tes 4 arketipe komunikasi dan bagaimana hasilnya bisa membantu hubungan Anda.',
      en: 'Learn the methodology behind the 4 communication archetype test and how results can help your relationships.'
    },
    keywords: {
      id: 'metodologi tes kepribadian, cara kerja tes komunikasi, 4 arketipe',
      en: 'personality test methodology, how communication test works, 4 archetypes'
    }
  },
  '/blog': {
    title: {
      id: 'Blog Komunikasi & Hubungan - Relasi4Warna',
      en: 'Communication & Relationship Blog - Relasi4Warna'
    },
    description: {
      id: 'Tips dan artikel tentang komunikasi efektif, membangun hubungan yang sehat, dan memahami kepribadian.',
      en: 'Tips and articles about effective communication, building healthy relationships, and understanding personality.'
    },
    keywords: {
      id: 'tips komunikasi, artikel hubungan, blog kepribadian',
      en: 'communication tips, relationship articles, personality blog'
    }
  },
  '/compatibility': {
    title: {
      id: 'Matriks Kompatibilitas - 16 Kombinasi Tipe Komunikasi',
      en: 'Compatibility Matrix - 16 Communication Type Combinations'
    },
    description: {
      id: 'Lihat kompatibilitas antara semua kombinasi 4 arketipe komunikasi dan temukan cara terbaik berinteraksi.',
      en: 'See compatibility between all 4 communication archetype combinations and find the best ways to interact.'
    },
    keywords: {
      id: 'kompatibilitas kepribadian, kecocokan tipe komunikasi, pasangan ideal',
      en: 'personality compatibility, communication type match, ideal partner'
    }
  },
  '/faq': {
    title: {
      id: 'FAQ - Pertanyaan Umum Relasi4Warna',
      en: 'FAQ - Frequently Asked Questions Relasi4Warna'
    },
    description: {
      id: 'Jawaban untuk pertanyaan umum tentang tes komunikasi, hasil, dan layanan Relasi4Warna.',
      en: 'Answers to common questions about communication tests, results, and Relasi4Warna services.'
    },
    keywords: {
      id: 'faq tes kepribadian, pertanyaan umum, bantuan',
      en: 'personality test faq, common questions, help'
    }
  },
  '/login': {
    title: {
      id: 'Masuk - Relasi4Warna',
      en: 'Login - Relasi4Warna'
    },
    description: {
      id: 'Masuk ke akun Relasi4Warna untuk melihat hasil tes dan riwayat Anda.',
      en: 'Login to your Relasi4Warna account to view your test results and history.'
    },
    keywords: {
      id: 'login, masuk akun',
      en: 'login, sign in'
    }
  },
  '/register': {
    title: {
      id: 'Daftar Gratis - Relasi4Warna',
      en: 'Register Free - Relasi4Warna'
    },
    description: {
      id: 'Buat akun gratis untuk menyimpan hasil tes dan mendapatkan akses ke fitur premium.',
      en: 'Create a free account to save test results and get access to premium features.'
    },
    keywords: {
      id: 'daftar gratis, buat akun',
      en: 'register free, create account'
    }
  },
  '/dashboard': {
    title: {
      id: 'Dashboard - Hasil Tes Anda | Relasi4Warna',
      en: 'Dashboard - Your Test Results | Relasi4Warna'
    },
    description: {
      id: 'Lihat semua hasil tes komunikasi Anda dan akses laporan premium.',
      en: 'View all your communication test results and access premium reports.'
    },
    keywords: {
      id: 'dashboard, hasil tes, riwayat',
      en: 'dashboard, test results, history'
    }
  }
};

// Default SEO for pages not in config
const DEFAULT_SEO = {
  title: {
    id: 'Relasi4Warna - Platform Asesmen Komunikasi Hubungan',
    en: 'Relasi4Warna - Relationship Communication Assessment Platform'
  },
  description: {
    id: 'Platform asesmen komunikasi hubungan dengan 4 arketipe unik untuk memahami diri sendiri dan orang terdekat.',
    en: 'Relationship communication assessment platform with 4 unique archetypes to understand yourself and loved ones.'
  },
  keywords: {
    id: 'komunikasi, hubungan, kepribadian, tes',
    en: 'communication, relationship, personality, test'
  }
};

// Structured Data for Organization
const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Relasi4Warna",
  "url": "https://relasi4warna.com",
  "logo": "https://relasi4warna.com/icon-512.png",
  "description": "Platform asesmen komunikasi hubungan dengan 4 arketipe komunikasi",
  "sameAs": []
};

// Structured Data for WebApplication
const WEB_APP_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Relasi4Warna",
  "applicationCategory": "LifestyleApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "IDR"
  }
};

export const useSEO = (language = 'id', customTitle = null, customDescription = null) => {
  const location = useLocation();
  
  useEffect(() => {
    // Get base path (without dynamic segments)
    const basePath = '/' + location.pathname.split('/')[1];
    const config = SEO_CONFIG[basePath] || SEO_CONFIG[location.pathname] || DEFAULT_SEO;
    
    // Set title
    const title = customTitle || config.title[language] || config.title.id;
    document.title = title;
    
    // Set meta description
    const description = customDescription || config.description[language] || config.description.id;
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }
    
    // Set keywords
    const keywords = config.keywords?.[language] || config.keywords?.id || '';
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);
    
    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    
    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute('content', description);
    
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (!ogUrl) {
      ogUrl = document.createElement('meta');
      ogUrl.setAttribute('property', 'og:url');
      document.head.appendChild(ogUrl);
    }
    ogUrl.setAttribute('content', window.location.href);
    
    // Set canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.href);
    
    // Add structured data
    let structuredData = document.querySelector('script[type="application/ld+json"]');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.setAttribute('type', 'application/ld+json');
      document.head.appendChild(structuredData);
    }
    
    // Combine schemas
    const schemas = [ORGANIZATION_SCHEMA, WEB_APP_SCHEMA];
    structuredData.textContent = JSON.stringify(schemas);
    
    // Set language
    document.documentElement.lang = language;
    
  }, [location.pathname, language, customTitle, customDescription]);
};

// Component version for easy use
const SEO = ({ language = 'id', title = null, description = null }) => {
  useSEO(language, title, description);
  return null;
};

export default SEO;
