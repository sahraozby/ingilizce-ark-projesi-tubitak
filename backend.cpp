// Antonym Wheel - Minimal C++ backend
// Endpoint: GET /words?level=A1  -> returns 8 random words filtered by level
//
// This file uses the single-header library "cpp-httplib" for a tiny HTTP server:
//   https://github.com/yhirose/cpp-httplib
//
// Setup (Windows / MinGW or MSVC):
// 1) Download httplib.h and place next to this file (backend/httplib.h)
// 2) Build:
//    - MSVC (Developer Prompt):
//        cl /std:c++17 backend.cpp /EHsc
//    - g++:
//        g++ -std=c++17 backend.cpp -O2 -o backend.exe
// 3) Run:
//      backend.exe
//    Server listens on http://localhost:8080
//
// If you don't want to run a backend, the frontend will automatically fall back
// to its built-in word pool.

#include <algorithm>
#include <chrono>
#include <cstdint>
#include <random>
#include <string>
#include <vector>

#include "httplib.h"

struct Word {
  std::string english;
  std::string antonym;
  std::string turkish;
  std::string antonym_turkish;
  std::string level;
  std::vector<std::string> synonyms;
  std::vector<std::string> meaning_options; // size 2
  int correct_option = 0;                   // 0 or 1
};

static std::string json_escape(const std::string &s) {
  std::string out;
  out.reserve(s.size() + 8);
  for (unsigned char c : s) {
    switch (c) {
      case '\\': out += "\\\\"; break;
      case '"': out += "\\\""; break;
      case '\n': out += "\\n"; break;
      case '\r': out += "\\r"; break;
      case '\t': out += "\\t"; break;
      default:
        // For UTF-8 bytes (Turkish letters), keep as-is.
        out.push_back(static_cast<char>(c));
        break;
    }
  }
  return out;
}

static std::string json_arr(const std::vector<std::string> &xs) {
  std::string out = "[";
  for (size_t i = 0; i < xs.size(); i++) {
    if (i) out += ",";
    out += "\"";
    out += json_escape(xs[i]);
    out += "\"";
  }
  out += "]";
  return out;
}

static std::string word_to_json(const Word &w) {
  std::string out;
  out.reserve(256);
  out += "{";
  out += "\"english\":\"" + json_escape(w.english) + "\",";
  out += "\"antonym\":\"" + json_escape(w.antonym) + "\",";
  out += "\"turkish\":\"" + json_escape(w.turkish) + "\",";
  out += "\"antonym_turkish\":\"" + json_escape(w.antonym_turkish) + "\",";
  out += "\"level\":\"" + json_escape(w.level) + "\",";
  out += "\"synonyms\":" + json_arr(w.synonyms) + ",";
  out += "\"meaning_options\":" + json_arr(w.meaning_options) + ",";
  out += "\"correct_option\":" + std::to_string(w.correct_option);
  out += "}";
  return out;
}

static std::vector<Word> seed_words() {
  std::vector<Word> W = {
    // A1
    {"happy", "sad", "mutlu", "üzgün", "A1", {"glad", "cheerful"}, {"mutlu", "temiz"}, 0},
    {"big", "small", "büyük", "küçük", "A1", {"large", "huge"}, {"büyük", "hızlı"}, 0},
    {"hot", "cold", "sıcak", "soğuk", "A1", {"warm"}, {"sıcak", "yeni"}, 0},
    {"fast", "slow", "hızlı", "yavaş", "A1", {"quick", "rapid"}, {"hızlı", "yumuşak"}, 0},
    {"new", "old", "yeni", "eski", "A1", {"fresh"}, {"yeni", "güçlü"}, 0},
    {"clean", "dirty", "temiz", "kirli", "A1", {"tidy"}, {"temiz", "pahalı"}, 0},
    {"open", "closed", "açık", "kapalı", "A1", {"unlocked"}, {"açık", "uzak"}, 0},
    {"up", "down", "yukarı", "aşağı", "A1", {"above"}, {"yukarı", "erken"}, 0},
    {"early", "late", "erken", "geç", "A1", {"soon"}, {"erken", "dar"}, 0},
    {"strong", "weak", "güçlü", "zayıf", "A1", {"powerful"}, {"güçlü", "dolu"}, 0},

    // A2
    {"cheap", "expensive", "ucuz", "pahalı", "A2", {"inexpensive", "low-cost"}, {"ucuz", "sıkıcı"}, 0},
    {"easy", "difficult", "kolay", "zor", "A2", {"simple"}, {"kolay", "gürültülü"}, 0},
    {"noisy", "quiet", "gürültülü", "sessiz", "A2", {"loud"}, {"gürültülü", "kibar"}, 0},
    {"empty", "full", "boş", "dolu", "A2", {"vacant"}, {"boş", "ıslak"}, 0},
    {"near", "far", "yakın", "uzak", "A2", {"close"}, {"yakın", "geniş"}, 0},
    {"busy", "free", "meşgul", "boş (müsait)", "A2", {"occupied"}, {"meşgul", "kuru"}, 0},
    {"safe", "dangerous", "güvenli", "tehlikeli", "A2", {"secure"}, {"güvenli", "yavaş"}, 0},
    {"healthy", "sick", "sağlıklı", "hasta", "A2", {"well"}, {"sağlıklı", "kalabalık"}, 0},
    {"polite", "rude", "kibar", "kaba", "A2", {"courteous"}, {"kibar", "eski"}, 0},
    {"wet", "dry", "ıslak", "kuru", "A2", {"damp"}, {"ıslak", "mutlu"}, 0},

    // B1
    {"increase", "decrease", "artmak / artırmak", "azalmak / azaltmak", "B1", {"raise", "grow"}, {"artmak / artırmak", "karar vermek"}, 0},
    {"accept", "refuse", "kabul etmek", "reddetmek", "B1", {"agree", "approve"}, {"kabul etmek", "unutmak"}, 0},
    {"arrive", "depart", "varmak", "ayrılmak", "B1", {"reach"}, {"varmak", "şaşırmak"}, 0},
    {"borrow", "lend", "ödünç almak", "ödünç vermek", "B1", {"take as a loan"}, {"ödünç almak", "davet etmek"}, 0},
    {"support", "oppose", "desteklemek", "karşı çıkmak", "B1", {"back", "help"}, {"desteklemek", "incelemek"}, 0},
    {"improve", "worsen", "gelişmek / iyileştirmek", "kötüleşmek", "B1", {"enhance"}, {"gelişmek / iyileştirmek", "saklamak"}, 0},
    {"manage", "fail", "başarmak / yönetmek", "başarısız olmak", "B1", {"handle"}, {"başarmak / yönetmek", "tahmin etmek"}, 0},
    {"reduce", "expand", "azaltmak", "genişletmek", "B1", {"cut down"}, {"azaltmak", "kırmak"}, 0},
    {"include", "exclude", "dahil etmek", "hariç tutmak", "B1", {"contain"}, {"dahil etmek", "yasaklamak"}, 0},
    {"discover", "hide", "keşfetmek", "gizlemek", "B1", {"find out"}, {"keşfetmek", "başvurmak"}, 0},

    // B2
    {"significant", "insignificant", "önemli", "önemsiz", "B2", {"important", "notable"}, {"önemli", "geleneksel"}, 0},
    {"efficient", "inefficient", "verimli", "verimsiz", "B2", {"productive"}, {"verimli", "karmaşık"}, 0},
    {"reluctant", "eager", "isteksiz", "hevesli", "B2", {"unwilling"}, {"isteksiz", "uygun"}, 0},
    {"maintain", "neglect", "sürdürmek / korumak", "ihmal etmek", "B2", {"preserve"}, {"sürdürmek / korumak", "geliştirmek"}, 0},
    {"predict", "doubt", "tahmin etmek", "şüphe etmek", "B2", {"forecast"}, {"tahmin etmek", "geri çekilmek"}, 0},
    {"complicated", "straightforward", "karmaşık", "kolay / anlaşılır", "B2", {"complex"}, {"karmaşık", "geçici"}, 0},
    {"recommend", "discourage", "önermek", "vazgeçirmek", "B2", {"suggest"}, {"önermek", "denetlemek"}, 0},
    {"approve", "reject", "onaylamak", "reddetmek", "B2", {"authorize"}, {"onaylamak", "azaltmak"}, 0},
    {"withdraw", "advance", "geri çekilmek", "ilerlemek", "B2", {"pull back"}, {"geri çekilmek", "göz ardı etmek"}, 0},
    {"increase (costs)", "cut (costs)", "artırmak (maliyet)", "azaltmak (maliyet)", "B2", {"raise"}, {"artırmak (maliyet)", "açıklamak"}, 0},

    // C1
    {"ambiguity", "clarity", "belirsizlik", "açıklık", "C1", {"uncertainty", "vagueness"}, {"belirsizlik", "iyileştirme"}, 0},
    {"constrain", "liberate", "kısıtlamak", "özgürleştirmek", "C1", {"restrict", "limit"}, {"kısıtlamak", "kanıtlamak"}, 0},
    {"subtle", "obvious", "ince / belli belirsiz", "bariz", "C1", {"delicate", "nuanced"}, {"ince / belli belirsiz", "anlaşmazlık"}, 0},
    {"coherent", "incoherent", "tutarlı", "tutarsız", "C1", {"consistent"}, {"tutarlı", "geçerli"}, 0},
    {"justify", "condemn", "haklı göstermek / gerekçelendirmek", "kınamak", "C1", {"explain", "defend"}, {"haklı göstermek / gerekçelendirmek", "uyarlamak"}, 0},
    {"mitigate", "aggravate", "hafifletmek", "ağırlaştırmak", "C1", {"alleviate"}, {"hafifletmek", "göç etmek"}, 0},
    {"resilient", "fragile", "dayanıklı", "kırılgan", "C1", {"robust"}, {"dayanıklı", "aşırı"}, 0},
    {"incentive", "deterrent", "teşvik", "caydırıcı", "C1", {"motivation"}, {"teşvik", "yansızlık"}, 0},
    {"inevitable", "avoidable", "kaçınılmaz", "kaçınılabilir", "C1", {"unavoidable"}, {"kaçınılmaz", "yetersiz"}, 0},
    {"compliance", "resistance", "uyum / riayet", "direniş", "C1", {"adherence"}, {"uyum / riayet", "yakınlık"}, 0},

    // C2
    {"meticulous", "careless", "titiz", "dikkatsiz", "C2", {"thorough", "scrupulous"}, {"titiz", "rastgele"}, 0},
    {"pervasive", "rare", "yaygın", "nadir", "C2", {"widespread", "ubiquitous"}, {"yaygın", "düzensiz"}, 0},
    {"reconcile", "alienate", "uzlaştırmak", "yabancılaştırmak", "C2", {"settle", "harmonize"}, {"uzlaştırmak", "baltalamak"}, 0},
    {"exacerbate", "ease", "kötüleştirmek / şiddetlendirmek", "hafifletmek", "C2", {"worsen", "intensify"}, {"kötüleştirmek / şiddetlendirmek", "yatıştırmak"}, 0},
    {"imperative", "optional", "zorunlu / çok önemli", "isteğe bağlı", "C2", {"essential", "crucial"}, {"zorunlu / çok önemli", "kaygan"}, 0},
    {"candid", "guarded", "açık sözlü", "ketum", "C2", {"frank"}, {"açık sözlü", "tüketici"}, 0},
    {"obsolete", "current", "modası geçmiş", "güncel", "C2", {"outdated"}, {"modası geçmiş", "kapsamlı"}, 0},
    {"scrutinize", "overlook", "didik didik incelemek", "göz ardı etmek", "C2", {"examine", "inspect"}, {"didik didik incelemek", "karşı koymak"}, 0},
    {"conspicuous", "inconspicuous", "göze çarpan", "göze çarpmayan", "C2", {"noticeable"}, {"göze çarpan", "uysal"}, 0},
    {"altruistic", "selfish", "özgeci", "bencil", "C2", {"selfless"}, {"özgeci", "zengin"}, 0},
  };
  return W;
}

static std::vector<Word> pick_8_random(const std::vector<Word> &pool) {
  std::vector<Word> copy = pool;
  std::random_device rd;
  std::mt19937 rng(rd());
  std::shuffle(copy.begin(), copy.end(), rng);
  if (copy.size() > 8) copy.resize(8);
  return copy;
}

int main() {
  httplib::Server svr;
  const auto ALL = seed_words();

  svr.Get("/words", [&](const httplib::Request &req, httplib::Response &res) {
    std::string level = "A1";
    if (req.has_param("level")) level = req.get_param_value("level");

    std::vector<Word> pool;
    pool.reserve(32);
    for (const auto &w : ALL) {
      if (w.level == level) pool.push_back(w);
    }

    auto picked = pick_8_random(pool);
    std::string body = "[";
    for (size_t i = 0; i < picked.size(); i++) {
      if (i) body += ",";
      body += word_to_json(picked[i]);
    }
    body += "]";

    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
    res.set_content(body, "application/json; charset=utf-8");
  });

  svr.Options("/words", [&](const httplib::Request &, httplib::Response &res) {
    res.set_header("Access-Control-Allow-Origin", "*");
    res.set_header("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.set_header("Access-Control-Allow-Headers", "Content-Type");
    res.status = 204;
  });

  // Basic health check
  svr.Get("/", [&](const httplib::Request &, httplib::Response &res) {
    res.set_content("Antonym Wheel backend OK. Try /words?level=A1", "text/plain; charset=utf-8");
  });

  // Listen
  const char *host = "0.0.0.0";
  const int port = 8080;
  if (!svr.listen(host, port)) {
    return 1;
  }
  return 0;
}

