# Deep Dive Questions - Advanced personality assessment
# 16 questions designed to reveal deeper personality patterns

DEEP_DIVE_QUESTIONS = {
    "universal": [
        # Section 1: Inner Motivations (4 questions)
        {
            "section": "inner_motivation",
            "id_text": "Apa yang PALING memotivasi Anda untuk bangun setiap hari?",
            "en_text": "What MOST motivates you to get up every day?",
            "options": [
                {"text_id": "Mencapai target dan melihat hasil nyata", "text_en": "Achieving targets and seeing real results", "archetype": "driver", "weight": 2},
                {"text_id": "Peluang untuk berinteraksi dan menginspirasi orang", "text_en": "Opportunities to interact and inspire people", "archetype": "spark", "weight": 2},
                {"text_id": "Menjaga keharmonisan dan membantu orang terdekat", "text_en": "Maintaining harmony and helping loved ones", "archetype": "anchor", "weight": 2},
                {"text_id": "Memecahkan masalah kompleks dan belajar hal baru", "text_en": "Solving complex problems and learning new things", "archetype": "analyst", "weight": 2}
            ]
        },
        {
            "section": "inner_motivation",
            "id_text": "Saat Anda merasa paling 'hidup' dan berenergi, biasanya Anda sedang:",
            "en_text": "When you feel most 'alive' and energized, you're usually:",
            "options": [
                {"text_id": "Memimpin proyek penting dan mengambil keputusan", "text_en": "Leading important projects and making decisions", "archetype": "driver", "weight": 2},
                {"text_id": "Di tengah keramaian, berbagi cerita dan tawa", "text_en": "In the middle of a crowd, sharing stories and laughter", "archetype": "spark", "weight": 2},
                {"text_id": "Menghabiskan waktu berkualitas dengan orang tersayang", "text_en": "Spending quality time with loved ones", "archetype": "anchor", "weight": 2},
                {"text_id": "Tenggelam dalam riset atau proyek yang menantang", "text_en": "Immersed in research or a challenging project", "archetype": "analyst", "weight": 2}
            ]
        },
        {
            "section": "inner_motivation",
            "id_text": "Ketakutan terdalam yang kadang menghantui Anda adalah:",
            "en_text": "The deepest fear that sometimes haunts you is:",
            "options": [
                {"text_id": "Gagal mencapai potensi penuh dan tidak diakui", "text_en": "Failing to reach full potential and not being recognized", "archetype": "driver", "weight": 2},
                {"text_id": "Ditolak atau tidak disukai oleh orang lain", "text_en": "Being rejected or not liked by others", "archetype": "spark", "weight": 2},
                {"text_id": "Kehilangan orang-orang yang Anda sayangi", "text_en": "Losing the people you love", "archetype": "anchor", "weight": 2},
                {"text_id": "Membuat keputusan salah karena kurang informasi", "text_en": "Making wrong decisions due to lack of information", "archetype": "analyst", "weight": 2}
            ]
        },
        {
            "section": "inner_motivation",
            "id_text": "Jika harus memilih satu warisan yang ingin dikenang, itu adalah:",
            "en_text": "If you had to choose one legacy to be remembered for, it would be:",
            "options": [
                {"text_id": "Prestasi besar dan perubahan nyata yang Anda ciptakan", "text_en": "Great achievements and real changes you created", "archetype": "driver", "weight": 2},
                {"text_id": "Kebahagiaan dan inspirasi yang Anda berikan ke banyak orang", "text_en": "Happiness and inspiration you gave to many people", "archetype": "spark", "weight": 2},
                {"text_id": "Hubungan mendalam dan keluarga yang harmonis", "text_en": "Deep relationships and a harmonious family", "archetype": "anchor", "weight": 2},
                {"text_id": "Pengetahuan dan keahlian yang Anda kembangkan", "text_en": "Knowledge and expertise you developed", "archetype": "analyst", "weight": 2}
            ]
        },
        
        # Section 2: Stress Response Patterns (4 questions)
        {
            "section": "stress_response",
            "id_text": "Saat menghadapi tekanan ekstrem, reaksi PERTAMA Anda biasanya:",
            "en_text": "When facing extreme pressure, your FIRST reaction is usually:",
            "options": [
                {"text_id": "Langsung bertindak dan mengendalikan situasi", "text_en": "Immediately act and take control of the situation", "archetype": "driver", "weight": 2},
                {"text_id": "Mencari dukungan sosial dan berbicara dengan orang", "text_en": "Seek social support and talk to people", "archetype": "spark", "weight": 2},
                {"text_id": "Diam sejenak dan mencoba menenangkan diri", "text_en": "Pause and try to calm down", "archetype": "anchor", "weight": 2},
                {"text_id": "Menganalisis situasi dan mencari data lebih banyak", "text_en": "Analyze the situation and gather more data", "archetype": "analyst", "weight": 2}
            ]
        },
        {
            "section": "stress_response",
            "id_text": "Ketika seseorang mengkritik Anda secara tidak adil, Anda cenderung:",
            "en_text": "When someone criticizes you unfairly, you tend to:",
            "options": [
                {"text_id": "Langsung membela diri dan membuktikan mereka salah", "text_en": "Immediately defend yourself and prove them wrong", "archetype": "driver", "weight": 2},
                {"text_id": "Merasa terluka tapi mencoba tetap positif", "text_en": "Feel hurt but try to stay positive", "archetype": "spark", "weight": 2},
                {"text_id": "Diam dan memendam perasaan untuk menjaga harmoni", "text_en": "Stay quiet and suppress feelings to maintain harmony", "archetype": "anchor", "weight": 2},
                {"text_id": "Menganalisis apakah ada kebenaran dalam kritik itu", "text_en": "Analyze if there's any truth in the criticism", "archetype": "analyst", "weight": 2}
            ]
        },
        {
            "section": "stress_response",
            "id_text": "Dalam konflik berkepanjangan, kelemahan Anda yang sering muncul adalah:",
            "en_text": "In prolonged conflict, your weakness that often emerges is:",
            "options": [
                {"text_id": "Menjadi terlalu dominan dan tidak mau mengalah", "text_en": "Becoming too dominant and refusing to give in", "archetype": "driver", "weight": 2},
                {"text_id": "Terlalu emosional dan kehilangan fokus", "text_en": "Becoming too emotional and losing focus", "archetype": "spark", "weight": 2},
                {"text_id": "Terlalu mengalah sampai mengabaikan kebutuhan sendiri", "text_en": "Giving in too much and ignoring your own needs", "archetype": "anchor", "weight": 2},
                {"text_id": "Terlalu kaku pada logika dan mengabaikan perasaan", "text_en": "Being too rigid on logic and ignoring feelings", "archetype": "analyst", "weight": 2}
            ]
        },
        {
            "section": "stress_response",
            "id_text": "Setelah konflik selesai, cara Anda 'memulihkan' hubungan adalah:",
            "en_text": "After a conflict is resolved, the way you 'restore' the relationship is:",
            "options": [
                {"text_id": "Fokus ke depan dan tidak membahas masa lalu", "text_en": "Focus forward and don't discuss the past", "archetype": "driver", "weight": 2},
                {"text_id": "Mencairkan suasana dengan humor dan aktivitas bersama", "text_en": "Lighten the mood with humor and activities together", "archetype": "spark", "weight": 2},
                {"text_id": "Berbicara dari hati ke hati untuk memastikan semua baik", "text_en": "Have a heart-to-heart talk to ensure everything is okay", "archetype": "anchor", "weight": 2},
                {"text_id": "Membuat kesepakatan jelas untuk mencegah konflik serupa", "text_en": "Make clear agreements to prevent similar conflicts", "archetype": "analyst", "weight": 2}
            ]
        },
        
        # Section 3: Relationship Dynamics (4 questions)
        {
            "section": "relationship_dynamics",
            "id_text": "Dalam hubungan dekat, peran yang PALING alami bagi Anda adalah:",
            "en_text": "In close relationships, the role that comes MOST naturally to you is:",
            "options": [
                {"text_id": "Pelindung dan pembuat keputusan", "text_en": "Protector and decision-maker", "archetype": "driver", "weight": 2},
                {"text_id": "Penghibur dan penyemangat", "text_en": "Entertainer and encourager", "archetype": "spark", "weight": 2},
                {"text_id": "Pendengar dan penyokong emosional", "text_en": "Listener and emotional supporter", "archetype": "anchor", "weight": 2},
                {"text_id": "Penasihat dan pemecah masalah", "text_en": "Advisor and problem-solver", "archetype": "analyst", "weight": 2}
            ]
        },
        {
            "section": "relationship_dynamics",
            "id_text": "Apa yang PALING Anda butuhkan dari pasangan/orang terdekat?",
            "en_text": "What do you MOST need from your partner/closest person?",
            "options": [
                {"text_id": "Respek, dukungan terhadap ambisi, dan kepercayaan", "text_en": "Respect, support for ambitions, and trust", "archetype": "driver", "weight": 2},
                {"text_id": "Perhatian, apresiasi, dan waktu berkualitas bersama", "text_en": "Attention, appreciation, and quality time together", "archetype": "spark", "weight": 2},
                {"text_id": "Kesetiaan, keamanan emosional, dan kehadiran", "text_en": "Loyalty, emotional security, and presence", "archetype": "anchor", "weight": 2},
                {"text_id": "Komunikasi jujur, konsistensi, dan ruang pribadi", "text_en": "Honest communication, consistency, and personal space", "archetype": "analyst", "weight": 2}
            ]
        },
        {
            "section": "relationship_dynamics",
            "id_text": "Hal yang PALING membuat Anda kecewa dalam hubungan adalah:",
            "en_text": "What MOST disappoints you in relationships is:",
            "options": [
                {"text_id": "Pasangan yang pasif dan tidak punya tujuan jelas", "text_en": "A partner who is passive and has no clear goals", "archetype": "driver", "weight": 2},
                {"text_id": "Pasangan yang dingin dan kurang ekspresif", "text_en": "A partner who is cold and unexpressive", "archetype": "spark", "weight": 2},
                {"text_id": "Pasangan yang tidak bisa diandalkan dan tidak konsisten", "text_en": "A partner who is unreliable and inconsistent", "archetype": "anchor", "weight": 2},
                {"text_id": "Pasangan yang tidak rasional dan terlalu emosional", "text_en": "A partner who is irrational and too emotional", "archetype": "analyst", "weight": 2}
            ]
        },
        {
            "section": "relationship_dynamics",
            "id_text": "Cara Anda menunjukkan cinta yang paling autentik adalah:",
            "en_text": "Your most authentic way of showing love is:",
            "options": [
                {"text_id": "Melindungi, menyediakan, dan menyelesaikan masalah mereka", "text_en": "Protecting, providing, and solving their problems", "archetype": "driver", "weight": 2},
                {"text_id": "Memuji, menghibur, dan membuat mereka tersenyum", "text_en": "Praising, entertaining, and making them smile", "archetype": "spark", "weight": 2},
                {"text_id": "Selalu hadir, mendengarkan, dan memberikan kenyamanan", "text_en": "Always being present, listening, and providing comfort", "archetype": "anchor", "weight": 2},
                {"text_id": "Memberi masukan bijak dan membantu mereka berkembang", "text_en": "Giving wise input and helping them grow", "archetype": "analyst", "weight": 2}
            ]
        },
        
        # Section 4: Communication Patterns (4 questions)
        {
            "section": "communication_patterns",
            "id_text": "Dalam percakapan penting, gaya komunikasi Anda yang dominan:",
            "en_text": "In important conversations, your dominant communication style:",
            "options": [
                {"text_id": "Langsung, to the point, fokus pada solusi", "text_en": "Direct, to the point, focused on solutions", "archetype": "driver", "weight": 2},
                {"text_id": "Ekspresif, penuh cerita, dan melibatkan emosi", "text_en": "Expressive, full of stories, and involving emotions", "archetype": "spark", "weight": 2},
                {"text_id": "Sabar, penuh empati, dan banyak mendengar", "text_en": "Patient, empathetic, and listening a lot", "archetype": "anchor", "weight": 2},
                {"text_id": "Terstruktur, berbasis fakta, dan logis", "text_en": "Structured, fact-based, and logical", "archetype": "analyst", "weight": 2}
            ]
        },
        {
            "section": "communication_patterns",
            "id_text": "Saat menyampaikan kabar tidak menyenangkan, Anda cenderung:",
            "en_text": "When delivering unpleasant news, you tend to:",
            "options": [
                {"text_id": "Menyampaikan langsung tanpa basa-basi", "text_en": "Deliver directly without beating around the bush", "archetype": "driver", "weight": 2},
                {"text_id": "Mengemas dengan cara yang lebih positif", "text_en": "Package it in a more positive way", "archetype": "spark", "weight": 2},
                {"text_id": "Memilih waktu yang tepat dan menyampaikan perlahan", "text_en": "Choose the right time and deliver slowly", "archetype": "anchor", "weight": 2},
                {"text_id": "Menyertakan fakta dan alasan yang jelas", "text_en": "Include facts and clear reasons", "archetype": "analyst", "weight": 2}
            ]
        },
        {
            "section": "communication_patterns",
            "id_text": "Dalam diskusi kelompok, peran komunikasi Anda biasanya:",
            "en_text": "In group discussions, your communication role is usually:",
            "options": [
                {"text_id": "Mengarahkan diskusi dan membuat kesimpulan", "text_en": "Directing the discussion and making conclusions", "archetype": "driver", "weight": 2},
                {"text_id": "Menjaga energi tetap tinggi dan semua terlibat", "text_en": "Keeping energy high and everyone engaged", "archetype": "spark", "weight": 2},
                {"text_id": "Memastikan semua suara didengar", "text_en": "Ensuring all voices are heard", "archetype": "anchor", "weight": 2},
                {"text_id": "Memberikan analisis mendalam dan data pendukung", "text_en": "Providing deep analysis and supporting data", "archetype": "analyst", "weight": 2}
            ]
        },
        {
            "section": "communication_patterns",
            "id_text": "Kesalahan komunikasi yang PALING sering Anda lakukan adalah:",
            "en_text": "The communication mistake you make MOST often is:",
            "options": [
                {"text_id": "Terlalu blak-blakan hingga menyakiti perasaan orang", "text_en": "Being too blunt and hurting people's feelings", "archetype": "driver", "weight": 2},
                {"text_id": "Berbicara terlalu banyak dan kurang mendengar", "text_en": "Talking too much and not listening enough", "archetype": "spark", "weight": 2},
                {"text_id": "Tidak menyampaikan pendapat karena takut konflik", "text_en": "Not expressing opinions due to fear of conflict", "archetype": "anchor", "weight": 2},
                {"text_id": "Terlalu teknis dan sulit dipahami orang awam", "text_en": "Being too technical and hard for others to understand", "archetype": "analyst", "weight": 2}
            ]
        }
    ]
}

# Deep dive report sections enhancement
DEEP_DIVE_REPORT_SECTIONS = {
    "id": {
        "title": "LAPORAN ANALISIS KEPRIBADIAN MENDALAM",
        "sections": [
            "Profil Kepribadian Lengkap",
            "Pola Motivasi Tersembunyi",
            "Respons Stres & Strategi Pemulihan",
            "Dinamika Hubungan Personal",
            "Dampak Anda terhadap Tipe Lain",
            "Panduan Koneksi dengan Setiap Tipe",
            "Blind Spots & Area Pertumbuhan",
            "Rencana Pengembangan 30 Hari"
        ]
    },
    "en": {
        "title": "DEEP PERSONALITY ANALYSIS REPORT",
        "sections": [
            "Complete Personality Profile",
            "Hidden Motivation Patterns",
            "Stress Response & Recovery Strategy",
            "Personal Relationship Dynamics",
            "Your Impact on Other Types",
            "Connection Guide for Each Type",
            "Blind Spots & Growth Areas",
            "30-Day Development Plan"
        ]
    }
}

# Type interaction patterns
TYPE_INTERACTIONS = {
    "driver": {
        "with_driver": {
            "id": {
                "dynamic": "Dua kekuatan bertemu - bisa jadi aliansi kuat atau bentrokan ego",
                "strength": "Sama-sama berorientasi hasil, bisa mencapai tujuan besar bersama",
                "challenge": "Perebutan kontrol dan kepemimpinan",
                "tip": "Bagi peran kepemimpinan secara jelas, fokus pada tujuan bersama"
            },
            "en": {
                "dynamic": "Two forces meet - can be a strong alliance or ego clash",
                "strength": "Both result-oriented, can achieve great goals together",
                "challenge": "Power struggle and leadership competition",
                "tip": "Divide leadership roles clearly, focus on shared goals"
            }
        },
        "with_spark": {
            "id": {
                "dynamic": "Energi dan eksekusi - kombinasi yang dinamis",
                "strength": "Driver memberikan arah, Spark memberikan energi dan kreativitas",
                "challenge": "Driver bisa merasa Spark tidak serius, Spark bisa merasa dikontrol",
                "tip": "Hargai kontribusi kreatif Spark, berikan ruang untuk spontanitas"
            },
            "en": {
                "dynamic": "Energy and execution - a dynamic combination",
                "strength": "Driver provides direction, Spark provides energy and creativity",
                "challenge": "Driver may feel Spark is not serious, Spark may feel controlled",
                "tip": "Appreciate Spark's creative contributions, give room for spontaneity"
            }
        },
        "with_anchor": {
            "id": {
                "dynamic": "Kekuatan dan ketenangan - keseimbangan yang baik",
                "strength": "Driver memimpin, Anchor memberikan stabilitas emosional",
                "challenge": "Driver bisa terlalu mendominasi, Anchor bisa merasa diabaikan",
                "tip": "Libatkan Anchor dalam keputusan, tunjukkan apresiasi secara verbal"
            },
            "en": {
                "dynamic": "Strength and calm - a good balance",
                "strength": "Driver leads, Anchor provides emotional stability",
                "challenge": "Driver may dominate too much, Anchor may feel ignored",
                "tip": "Involve Anchor in decisions, show verbal appreciation"
            }
        },
        "with_analyst": {
            "id": {
                "dynamic": "Aksi dan analisis - bisa sangat efektif atau frustasi",
                "strength": "Driver mengeksekusi, Analyst memastikan kualitas dan akurasi",
                "challenge": "Driver ingin cepat, Analyst butuh waktu untuk analisis",
                "tip": "Berikan Analyst waktu yang cukup, hargai masukan berbasis data"
            },
            "en": {
                "dynamic": "Action and analysis - can be very effective or frustrating",
                "strength": "Driver executes, Analyst ensures quality and accuracy",
                "challenge": "Driver wants speed, Analyst needs time for analysis",
                "tip": "Give Analyst enough time, value data-based input"
            }
        }
    },
    "spark": {
        "with_driver": {
            "id": {
                "dynamic": "Kreativitas bertemu eksekusi - kombinasi produktif",
                "strength": "Spark membawa ide segar, Driver mewujudkannya",
                "challenge": "Spark bisa merasa dikontrol, Driver bisa merasa tidak fokus",
                "tip": "Tunjukkan komitmen melalui tindakan, fokus saat diskusi penting"
            },
            "en": {
                "dynamic": "Creativity meets execution - productive combination",
                "strength": "Spark brings fresh ideas, Driver makes them happen",
                "challenge": "Spark may feel controlled, Driver may feel unfocused",
                "tip": "Show commitment through actions, stay focused during important discussions"
            }
        },
        "with_spark": {
            "id": {
                "dynamic": "Dua api bertemu - sangat menyenangkan tapi bisa kacau",
                "strength": "Energi tinggi, kreativitas berlimpah, selalu seru",
                "challenge": "Kurang struktur, bisa terlalu banyak ide tanpa eksekusi",
                "tip": "Tentukan siapa yang memimpin kapan, buat deadline bersama"
            },
            "en": {
                "dynamic": "Two fires meet - very fun but can be chaotic",
                "strength": "High energy, abundant creativity, always exciting",
                "challenge": "Lack of structure, too many ideas without execution",
                "tip": "Decide who leads when, create deadlines together"
            }
        },
        "with_anchor": {
            "id": {
                "dynamic": "Kegembiraan dan ketenangan - hubungan yang menyeimbangkan",
                "strength": "Spark membawa kegembiraan, Anchor memberikan grounding",
                "challenge": "Spark bisa merasa Anchor terlalu slow, Anchor bisa kewalahan",
                "tip": "Hargai kebutuhan Anchor akan ketenangan, jangan terlalu memaksa"
            },
            "en": {
                "dynamic": "Joy and calm - a balancing relationship",
                "strength": "Spark brings joy, Anchor provides grounding",
                "challenge": "Spark may feel Anchor is too slow, Anchor may feel overwhelmed",
                "tip": "Respect Anchor's need for calm, don't push too hard"
            }
        },
        "with_analyst": {
            "id": {
                "dynamic": "Intuisi dan logika - bisa saling melengkapi atau bertentangan",
                "strength": "Spark membawa perspektif baru, Analyst memvalidasi dengan data",
                "challenge": "Spark merasa dikritik, Analyst merasa kewalahan dengan ide random",
                "tip": "Dengarkan analisis Analyst, sajikan ide dengan lebih terstruktur"
            },
            "en": {
                "dynamic": "Intuition and logic - can complement or contradict",
                "strength": "Spark brings new perspectives, Analyst validates with data",
                "challenge": "Spark feels criticized, Analyst feels overwhelmed with random ideas",
                "tip": "Listen to Analyst's analysis, present ideas more structured"
            }
        }
    },
    "anchor": {
        "with_driver": {
            "id": {
                "dynamic": "Dukungan bertemu kepemimpinan - hubungan yang stabil",
                "strength": "Anchor memberikan dukungan emosional yang Driver butuhkan",
                "challenge": "Anchor bisa merasa tidak dihargai, kebutuhan diabaikan",
                "tip": "Sampaikan kebutuhan Anda, jangan terlalu banyak mengalah"
            },
            "en": {
                "dynamic": "Support meets leadership - a stable relationship",
                "strength": "Anchor provides emotional support that Driver needs",
                "challenge": "Anchor may feel unappreciated, needs ignored",
                "tip": "Express your needs, don't give in too much"
            }
        },
        "with_spark": {
            "id": {
                "dynamic": "Stabilitas bertemu spontanitas - bisa memperkaya atau melelahkan",
                "strength": "Anchor memberikan grounding, Spark membawa kegembiraan",
                "challenge": "Anchor bisa merasa kewalahan dengan energi Spark",
                "tip": "Komunikasikan batas energi Anda, nikmati kegembiraan dalam dosis yang nyaman"
            },
            "en": {
                "dynamic": "Stability meets spontaneity - can enrich or exhaust",
                "strength": "Anchor provides grounding, Spark brings joy",
                "challenge": "Anchor may feel overwhelmed by Spark's energy",
                "tip": "Communicate your energy limits, enjoy joy in comfortable doses"
            }
        },
        "with_anchor": {
            "id": {
                "dynamic": "Dua jangkar bertemu - sangat stabil tapi bisa stagnan",
                "strength": "Hubungan sangat nyaman, penuh pengertian, harmonis",
                "challenge": "Kurang tantangan, bisa terlalu menghindari konflik",
                "tip": "Dorong satu sama lain untuk berkembang, hadapi konflik yang perlu"
            },
            "en": {
                "dynamic": "Two anchors meet - very stable but can stagnate",
                "strength": "Very comfortable relationship, full of understanding, harmonious",
                "challenge": "Lack of challenge, may avoid conflict too much",
                "tip": "Push each other to grow, face necessary conflicts"
            }
        },
        "with_analyst": {
            "id": {
                "dynamic": "Emosi dan logika - bisa saling melengkapi dengan baik",
                "strength": "Anchor memberikan kehangatan, Analyst memberikan kejelasan",
                "challenge": "Anchor merasa Analyst terlalu dingin, Analyst merasa terlalu emosional",
                "tip": "Hargai kebutuhan Analyst akan ruang pribadi, minta kejelasan saat butuh"
            },
            "en": {
                "dynamic": "Emotion and logic - can complement each other well",
                "strength": "Anchor provides warmth, Analyst provides clarity",
                "challenge": "Anchor feels Analyst is too cold, Analyst feels too emotional",
                "tip": "Respect Analyst's need for personal space, ask for clarity when needed"
            }
        }
    },
    "analyst": {
        "with_driver": {
            "id": {
                "dynamic": "Data bertemu eksekusi - partnership yang efektif",
                "strength": "Analyst memastikan keputusan berkualitas, Driver mengeksekusi",
                "challenge": "Analyst butuh waktu, Driver butuh kecepatan",
                "tip": "Berikan ringkasan eksekutif, jangan terlalu detail di awal"
            },
            "en": {
                "dynamic": "Data meets execution - effective partnership",
                "strength": "Analyst ensures quality decisions, Driver executes",
                "challenge": "Analyst needs time, Driver needs speed",
                "tip": "Provide executive summary, don't over-detail at the start"
            }
        },
        "with_spark": {
            "id": {
                "dynamic": "Logika bertemu kreativitas - bisa inovatif atau frustasi",
                "strength": "Analyst memvalidasi ide Spark, Spark menginspirasi Analyst",
                "challenge": "Analyst bisa terlalu kritis, Spark bisa merasa tidak dihargai",
                "tip": "Apresiasi kreativitas sebelum mengkritik, sampaikan kritik dengan lembut"
            },
            "en": {
                "dynamic": "Logic meets creativity - can be innovative or frustrating",
                "strength": "Analyst validates Spark's ideas, Spark inspires Analyst",
                "challenge": "Analyst may be too critical, Spark may feel unappreciated",
                "tip": "Appreciate creativity before criticizing, deliver criticism gently"
            }
        },
        "with_anchor": {
            "id": {
                "dynamic": "Objektivitas bertemu empati - keseimbangan yang baik",
                "strength": "Analyst memberikan perspektif objektif, Anchor memberikan kehangatan",
                "challenge": "Analyst bisa terlihat dingin, Anchor bisa terlihat terlalu sensitif",
                "tip": "Tunjukkan kepedulian secara verbal, jangan hanya lewat tindakan"
            },
            "en": {
                "dynamic": "Objectivity meets empathy - a good balance",
                "strength": "Analyst provides objective perspective, Anchor provides warmth",
                "challenge": "Analyst may seem cold, Anchor may seem too sensitive",
                "tip": "Show care verbally, not just through actions"
            }
        },
        "with_analyst": {
            "id": {
                "dynamic": "Dua pemikir bertemu - sangat intelektual tapi bisa kering",
                "strength": "Diskusi mendalam, saling memahami proses berpikir",
                "challenge": "Bisa terlalu fokus pada logika, mengabaikan emosi",
                "tip": "Jadwalkan waktu untuk koneksi emosional, tidak hanya intelektual"
            },
            "en": {
                "dynamic": "Two thinkers meet - very intellectual but can be dry",
                "strength": "Deep discussions, mutual understanding of thought processes",
                "challenge": "May focus too much on logic, ignoring emotions",
                "tip": "Schedule time for emotional connection, not just intellectual"
            }
        }
    }
}
