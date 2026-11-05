# Sherlock-inspired local typography

Added on 2026-10-31 for the Kirock Homes interface redesign. These files were downloaded by Codex from the official Google Fonts repository; they are third-party font assets, not generated images or Kiro-authored work.

| Local file | Family / style | CSS weight | Bytes | License |
| --- | --- | --- | ---: | --- |
| `public/fonts/CormorantGaramond-Variable.ttf` | Cormorant Garamond, normal variable | `300 700` | 1,195,560 | SIL OFL 1.1; `public/fonts/CormorantGaramond-OFL.txt` |
| `public/fonts/NanumMyeongjo-Regular.ttf` | Nanum Myeongjo, normal regular | `400` | 3,058,408 | SIL OFL 1.1; `public/fonts/NanumMyeongjo-OFL.txt` |

Total new font payload: **4,253,968 bytes** (about 4.06 MiB), before HTTP compression. Nanum Myeongjo Bold was not added because the regular and bold Korean files alone total more than 6 MB. Use the supplied regular weight for Korean literary headings instead of pretending a bold file is present.

Cormorant Garamond's variable weight axis was checked directly in its `fvar` table: minimum 300, default 300, maximum 700. Both downloads have valid TrueType SFNT headers. Both accompanying license texts contain SIL Open Font License version 1.1. No font outlines or naming tables were modified; the Cormorant file was given a bracket-free filename for convenient local paths.

These local files allow font rendering without a runtime Google Fonts request. Cormorant provides Latin, Latin Extended, Cyrillic and Vietnamese coverage according to its upstream metadata. Nanum Myeongjo supplies Korean. Keep appropriate system fallbacks for other scripts supported by the game; these two files are not claimed to cover every game language.

## Official sources

- [Cormorant Garamond directory](https://github.com/google/fonts/tree/main/ofl/cormorantgaramond)
- [Cormorant Garamond font file](https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf)
- [Cormorant Garamond metadata](https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/METADATA.pb)
- [Cormorant Garamond OFL license](https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/OFL.txt)
- [Nanum Myeongjo directory](https://github.com/google/fonts/tree/main/ofl/nanummyeongjo)
- [Nanum Myeongjo Regular font file](https://raw.githubusercontent.com/google/fonts/main/ofl/nanummyeongjo/NanumMyeongjo-Regular.ttf)
- [Nanum Myeongjo OFL license](https://raw.githubusercontent.com/google/fonts/main/ofl/nanummyeongjo/OFL.txt)

Copyright acknowledgements are preserved in the bundled license files: the Cormorant Project Authors and NHN Corporation respectively. Nanum has reserved font names; the bundled original remains unmodified.

## Download verification

SHA-256 values calculated from the saved files:

```text
b20b7d9626dd956b2c5e558692ad328b1f19e3275e2782db4fa07670d83f35e0  CormorantGaramond-Variable.ttf
7ed9e8653a8ed04285d51dc343ffea6eb3d9c73afc27383ea8929ee4ffd03205  NanumMyeongjo-Regular.ttf
```

Font acquisition does not itself verify final browser typography; that belongs to the interface's visual verification after the CSS is integrated.
