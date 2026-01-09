import React, { useState } from "react";
import { useLanguage, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Download, Copy, Check, X } from "lucide-react";
import { toast } from "sonner";

const ShareCompatibility = ({ archetype1, archetype2, score, title, onClose }) => {
  const { t, language } = useLanguage();
  const [copied, setCopied] = useState(false);

  const archetype_names = {
    driver: { id: "Penggerak", en: "Driver" },
    spark: { id: "Percikan", en: "Spark" },
    anchor: { id: "Jangkar", en: "Anchor" },
    analyst: { id: "Analis", en: "Analyst" }
  };

  const arch1Name = archetype_names[archetype1]?.[language] || archetype1;
  const arch2Name = archetype_names[archetype2]?.[language] || archetype2;
  
  const shareUrl = `${window.location.origin}/compatibility`;
  const shareImageUrl = `${API}/compatibility/share/card/${archetype1}/${archetype2}?language=${language}`;

  const shareText = language === "id"
    ? `Kompatibilitas ${arch1Name} × ${arch2Name}: ${score}! "${title}" 💕 Cek kompatibilitasmu di Relasi4Warna`
    : `${arch1Name} × ${arch2Name} Compatibility: ${score}! "${title}" 💕 Check your compatibility at 4Color Relating`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success(t("Link disalin!", "Link copied!"));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleShareWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
  };

  const handleDownloadImage = () => {
    window.open(shareImageUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <Card className="w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: 'Merriweather, serif' }}>
              {t("Bagikan Kompatibilitas", "Share Compatibility")}
            </h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground" data-testid="share-compat-close">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Preview Card */}
          <div className="mb-6 rounded-xl overflow-hidden border border-border">
            <img 
              src={shareImageUrl} 
              alt="Compatibility Share Card"
              className="w-full"
              data-testid="share-compat-preview"
            />
          </div>

          {/* Share Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button variant="outline" onClick={handleShareTwitter} className="flex items-center gap-2" data-testid="share-twitter">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              X / Twitter
            </Button>
            <Button variant="outline" onClick={handleShareFacebook} className="flex items-center gap-2" data-testid="share-facebook">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
            <Button variant="outline" onClick={handleShareWhatsApp} className="flex items-center gap-2" data-testid="share-whatsapp">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp
            </Button>
            <Button variant="outline" onClick={handleDownloadImage} className="flex items-center gap-2" data-testid="share-download">
              <Download className="w-4 h-4" />
              {t("Unduh", "Download")}
            </Button>
          </div>

          {/* Copy Link */}
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 text-sm border rounded-lg bg-secondary/50 text-muted-foreground"
              data-testid="share-url-input"
            />
            <Button onClick={handleCopyLink} variant={copied ? "default" : "outline"} data-testid="share-copy-btn">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShareCompatibility;
