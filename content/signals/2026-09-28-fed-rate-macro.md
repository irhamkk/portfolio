---
type: ESSAY
title: "Fed Rate, Emas & Bitcoin: Analisis Ekonometrika Multi-Rezim"
title_en: "Fed Rate, Gold & Bitcoin: An Econometric Regime Study"
date: "28 SEP 2026"
date_en: "SEP 28, 2026"
tags: ["Ekonometrika", "Analisis Data", "Makro"]
tags_en: ["Econometrics", "Data Analysis", "Macro"]
summary: "Analisis kuantitatif lintas dekade: bagaimana guncangan suku bunga The Fed memengaruhi dinamika harga emas dan volatilitas Bitcoin dengan pemodelan event study berbasis SQL & Python."
summary_en: "Analyzing multi-decade macroeconomic regimes: how Federal Reserve interest rate shocks propagate to Gold spot prices and Bitcoin returns using SQL, Python, and event study models."
---

Analisis kuantitatif lintas dekade: bagaimana guncangan suku bunga The Fed memengaruhi dinamika harga emas dan volatilitas Bitcoin dengan pemodelan event study berbasis SQL & Python.

### Abstrak & Tesis
Emas secara historis berfungsi sebagai lindung nilai (*hedge*) terhadap suku bunga riil (*real yields*), dengan korelasi negatif yang persisten terhadap imbal hasil obligasi pemerintah AS. Sebaliknya, Bitcoin menunjukkan perilaku ganda: bertindak sebagai aset spekulatif berisiko tinggi (*high-beta tech asset*) dalam jangka pendek ketika likuiditas mengetat, namun secara perlahan mengadopsi karakteristik lindung nilai moneter dalam rezim pelonggaran kuantitatif.

### Metodologi Kuantitatif
1. **Pipeline Data**: Agregasi harga harian spot Gold (XAU), Bitcoin (BTC/USD), Federal Funds Effective Rate (DFF), dan US 10-Year Real Yield (DFII10) periode 2014–2026 menggunakan database SQL terindeks.
2. **Event Study Regression**: Mengukur dampak pengumuman FOMC (*monetary policy shock*) terhadap abnormal return aset dalam jendela t-5 hingga t+15 hari.
3. **Regime Switching Model**: Menguji persistensi korelasi antara rezim suku bunga tinggi (*higher-for-longer*) dan rezim pelonggaran (*rate-cut cycle*).
