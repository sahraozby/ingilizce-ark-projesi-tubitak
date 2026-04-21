# Antonym Wheel — CEFR Tabanlı İngilizce Kelime Çarkı (TR)

Bu proje, CEFR seviyesine göre (A1–C2) kelime seçip çark üzerinden öğretmeye yönelik, **Vanilla JS** ile yazılmış eğitim uygulamasıdır. Çark durunca sadece kelimeyi gösterir; kullanıcı “Anlamları Göster” ile detayları açar ve 2 şıklı mini quiz ile puan/seri kazanır.

## Klasör Yapısı

```
antonym-wheel/
  frontend/
    index.html
    style.css
    script.js
    assets/
  backend/
    backend.cpp
```

## Frontend (Backend Olmadan) Çalıştırma

1. `antonym-wheel/frontend/index.html` dosyasını tarayıcıda aç.
2. Seviye seç → “Çarkı Çevir” → “Anlamları Göster” → doğru anlamı seç.

> Not: Backend çalışmıyorsa uygulama otomatik olarak kendi kelime havuzunu kullanır.

## İnternete (Domain’e) Yayınlama — Herkes Açsın

En pratik yöntem: **statik site** olarak yayınlamak (backend olmadan). Bu şekilde herkes linke tıklayıp açar.

### Seçenek A (Önerilen): Netlify ile 2 dakikada

1. Netlify hesabı aç.
2. “Add new site” → “Deploy manually”.
3. `antonym-wheel/frontend/` klasörünün içindeki dosyaları **zip** yap (zip’in kökünde `index.html` olacak).
4. Zip’i Netlify’a sürükle-bırak.
5. Netlify sana bir link verir. Domain bağlamak için:
   - “Domain settings” → “Add custom domain”
   - Alan adını (ör. `antonymwheel.com`) ekle
   - DNS’te Netlify’ın verdiği kayıtları gir

### Seçenek B: GitHub Pages

1. GitHub’da yeni repo aç (ör. `antonym-wheel`).
2. `frontend/` içeriğini repo köküne koy (Pages için en sorunsuz yöntem).
3. Repo Settings → Pages → Source: `main` / root.
4. Çıkan URL’yi kullan veya “Custom domain” ile domain bağla.

### Seçenek C: Vercel (statik)

1. Vercel’e proje import et.
2. Root’u `frontend` yap (veya dosyaları repo köküne taşı).
3. Deploy → domain bağla.

## Backend (C++) Çalıştırma (Opsiyonel)

Backend endpoint’i:

- `GET /words?level=A1` → seçilen seviyeden 8 rastgele kelime döner.

### Gereken

Bu backend `cpp-httplib` (tek header) kullanır:
- `backend/httplib.h` dosyasını indirip `backend.cpp` ile aynı klasöre koy.

### Çalıştırma

Sunucuyu `http://localhost:8080` üzerinde başlat:

- **MSVC**:
  - `cl /std:c++17 backend.cpp /EHsc`
  - `backend.exe`

- **g++**:
  - `g++ -std=c++17 backend.cpp -O2 -o backend.exe`
  - `backend.exe`

Frontend, backend açıksa otomatik olarak **aynı domain** üzerindeki `/words?level=...` endpoint’ine istek atar.

### Backend’i ayrı bir domaine koyarsan

Frontend URL’ine şu parametreyi ekleyebilirsin:

- `?api=https://api.ornek.com`

Bu durumda frontend istekleri `https://api.ornek.com/words?level=A1` şeklinde atar.

