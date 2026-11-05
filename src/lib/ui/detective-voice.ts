/**
 * detective-voice.ts — Stage-scoped guidance copy for the DetectiveAside component.
 *
 * Original authorship: Kiro (2026-10-31). English and Korean.
 * Ten-language extension: Kiro (2026-10-31). Added es / fr / de / pt / ja / zh / ar / hi.
 *
 * This module is a pure data/logic layer with no React, DOM, randomness, solver,
 * case, suspect, answer, server, storage, or AI dependency. The selection depends
 * only on locale and stage.
 *
 * Attribution note: The inherited application (engine, Game.tsx, CSS, server routes)
 * is Codex work. The hypothesis board (hypothesis.ts, HypothesisBoard.tsx, related
 * specs) is prior Kiro CLI work. The original detective-voice.ts and DetectiveAside.tsx
 * are prior Kiro CLI work. The ten-language extension is new Kiro work in this session.
 */

import type { Locale } from '@/lib/i18n/locales';

// ---------------------------------------------------------------------------
// Stage type
// ---------------------------------------------------------------------------

/** The six investigative stages that the aside tracks. */
export type DetectiveStage =
  | 'casting'
  | 'awakening'
  | 'listening'
  | 'confronting'
  | 'deducing'
  | 'reveal';

// ---------------------------------------------------------------------------
// Copy record
// ---------------------------------------------------------------------------

/**
 * A single stage's localized guidance line.
 * Readonly so consumers cannot accidentally mutate the shared static copy object.
 */
export type StageCopy = Readonly<{
  /** Short instruction, ~1–2 sentences, ≤ 25 English words. */
  line: string;
}>;

// ---------------------------------------------------------------------------
// Full ten-locale × six-stage copy dictionary
// ---------------------------------------------------------------------------

/**
 * All sixty stage lines (six stages × ten locales).
 *
 * Per-stage copy constraints (from spec):
 * - listening: must state the three official statements are the only evidence.
 * - confronting: must explain another object objects; must direct player to compare
 *   the two quoted statements side by side and note findings.
 * - deducing: must explain hypotheses can be crossed out and restored, and that
 *   the final accusation is once only.
 * - reveal: must be worded identically regardless of accusation outcome.
 *
 * All lines: ≤ ~25 English words. No invented evidence, suspect guilt, motives,
 * or result-specific reactions.
 */
const VOICE_COPY: Record<DetectiveStage, Record<Locale, StageCopy>> = {
  casting: {
    en: { line: 'Pick three objects and place their faces. Every good case starts with a proper suspect list.' },
    ko: { line: '사진 속 물건 셋을 골라 눈을 붙여 주세요. 탐정의 첫 번째 임무는 용의자 확보입니다.' },
    es: { line: 'Elige tres objetos y coloca sus caras. Todo buen caso comienza con una lista de sospechosos.' },
    fr: { line: 'Choisis trois objets et place leurs visages. Chaque bonne affaire commence par une liste de suspects.' },
    de: { line: 'Wähle drei Objekte und platziere ihre Gesichter. Jeder gute Fall beginnt mit einer ordentlichen Verdächtigenliste.' },
    pt: { line: 'Escolha três objetos e posicione seus rostos. Todo bom caso começa com uma lista de suspeitos.' },
    ja: { line: '三つのものを選んで顔を置きましょう。よい事件はいつも容疑者リストから始まります。' },
    zh: { line: '选择三个物件并放置它们的面孔。每个好案子都从一份嫌疑人名单开始。' },
    ar: { line: 'اختر ثلاثة أشياء وضع وجوهها. كل قضية جيدة تبدأ بقائمة مشتبه بهم.' },
    hi: { line: 'तीन वस्तुएँ चुनें और उनके चेहरे लगाएँ। हर अच्छी जांच एक संदिग्धों की सूची से शुरू होती है।' },
  },
  awakening: {
    en: { line: "Give them a moment. Waking up is hard enough without being immediately questioned." },
    ko: { line: '방이 깨어나는 중입니다. 아직 아무것도 할 필요 없어요 — 지켜만 보세요.' },
    es: { line: 'Dales un momento. Despertar ya es difícil sin que te interroguen de inmediato.' },
    fr: { line: 'Laisse-leur un moment. Se réveiller est déjà assez difficile sans être immédiatement interrogé.' },
    de: { line: 'Lass ihnen einen Moment. Aufwachen ist schon schwer genug, ohne sofort befragt zu werden.' },
    pt: { line: 'Dê-lhes um momento. Acordar já é difícil sem ser interrogado imediatamente.' },
    ja: { line: '少し待ってあげてください。目を覚ましたばかりでいきなり尋問はきつすぎます。' },
    zh: { line: '让他们缓一缓。刚醒来就被盘问，实在为难。' },
    ar: { line: 'امنحهم لحظة. الاستيقاظ وحده أمر صعب، فكيف مع الاستجواب الفوري.' },
    hi: { line: 'इन्हें एक पल दें। उठते ही पूछताछ शुरू करना थोड़ा कठोर है।' },
  },
  listening: {
    en: { line: 'Hear all three official statements. Those three statements are the only evidence in this case.' },
    ko: { line: '세 물건의 공식 증언을 모두 들어 주세요. 이 세 마디가 이번 사건의 증거 전부입니다.' },
    es: { line: 'Escucha las tres declaraciones oficiales. Esas tres declaraciones son la única evidencia del caso.' },
    fr: { line: 'Écoute les trois déclarations officielles. Ces trois déclarations sont les seules preuves de cette affaire.' },
    de: { line: 'Höre alle drei offiziellen Aussagen. Diese drei Aussagen sind die einzigen Beweise in diesem Fall.' },
    pt: { line: 'Ouça as três declarações oficiais. Essas três declarações são as únicas evidências neste caso.' },
    ja: { line: '三つの公式証言をすべて聞きましょう。この事件の証拠はその三つだけです。' },
    zh: { line: '听完三条官方证词。这三条证词是本案唯一的证据。' },
    ar: { line: 'استمع إلى الشهادات الرسمية الثلاث جميعها. هذه الشهادات الثلاث هي الدليل الوحيد في هذه القضية.' },
    hi: { line: 'तीनों आधिकारिक बयान सुनें। यही तीन बयान इस मामले के एकमात्र सबूत हैं।' },
  },
  confronting: {
    en: { line: "Question each object — another will object. Compare the two quoted statements side by side and note what you find." },
    ko: { line: '각 물건을 추궁하면 다른 물건이 반론합니다. 두 인용문을 나란히 놓고 직접 메모해 두세요.' },
    es: { line: 'Interroga a cada objeto: otro pondrá objeciones. Compara las dos citas lado a lado y anota lo que encuentres.' },
    fr: { line: 'Interroge chaque objet — un autre protestera. Compare les deux citations côte à côte et note ce que tu trouves.' },
    de: { line: 'Befrage jedes Objekt — ein anderes wird widersprechen. Vergleiche die zwei Zitate nebeneinander und notiere deine Beobachtungen.' },
    pt: { line: 'Questione cada objeto — outro vai objetar. Compare as duas citações lado a lado e anote o que encontrar.' },
    ja: { line: '一つ一つのものに問いただしましょう。別のものが異議を唱えます。二つの引用を並べて比較し、気づいたことをメモしてください。' },
    zh: { line: '逐一追问每个物件，另一个会提出异议。将两句引言并排比较，记下你发现的问题。' },
    ar: { line: 'استجوب كل كائن — سيعترض آخر. قارن الاقتباسين جنبًا إلى جنب وسجّل ما تلاحظه.' },
    hi: { line: 'हर वस्तु से पूछताछ करें — दूसरी आपत्ति जताएगी। दोनों उद्धरणों की साथ-साथ तुलना करें और जो देखें नोट करें।' },
  },
  deducing: {
    en: { line: 'Cross out hypotheses that don\'t fit — tap again to restore any. Your accusation is one-time only, so take your time.' },
    ko: { line: '맞지 않는 가설을 눌러 지우고, 다시 누르면 되살릴 수 있어요. 지목은 딱 한 번이니 신중하게.' },
    es: { line: 'Tacha las hipótesis que no encajan — toca de nuevo para restaurarlas. Tu acusación es única, así que tómate tu tiempo.' },
    fr: { line: 'Barre les hypothèses qui ne collent pas — réappuie pour les restaurer. Ton accusation est définitive, prends ton temps.' },
    de: { line: 'Streiche Hypothesen, die nicht passen — nochmals tippen stellt sie wieder her. Deine Anklage ist einmalig, also lass dir Zeit.' },
    pt: { line: 'Risque as hipóteses que não se encaixam — toque novamente para restaurá-las. Sua acusação é única, então não se apresse.' },
    ja: { line: '当てはまらない仮説を除外しましょう——もう一度タップで元に戻せます。告発は一度きりなのでじっくり考えてください。' },
    zh: { line: '划去不符合的假说——再次点击可恢复。你只有一次指控机会，请慎重。' },
    ar: { line: 'اشطب الفرضيات غير المناسبة — اضغط مرة أخرى لاستعادتها. اتهامك مرة واحدة فقط، فلا تتسرع.' },
    hi: { line: 'जो परिकल्पनाएँ सही नहीं लगतीं उन्हें हटाएँ — वापस लाने के लिए फिर से टैप करें। आरोप केवल एक बार लगाया जा सकता है, इसलिए सोच-समझकर करें।' },
  },
  reveal: {
    en: { line: "Case closed. Read the explanation to see how the three statements fit together." },
    ko: { line: '사건이 마무리됐습니다. 해설을 읽으면 세 증언이 어떻게 이어지는지 확인할 수 있어요.' },
    es: { line: 'Caso cerrado. Lee la explicación para ver cómo encajan las tres declaraciones.' },
    fr: { line: "Affaire classée. Lis l'explication pour voir comment les trois déclarations s'articulent." },
    de: { line: 'Fall abgeschlossen. Lies die Erklärung, um zu sehen, wie die drei Aussagen zusammenpassen.' },
    pt: { line: 'Caso encerrado. Leia a explicação para ver como as três declarações se encaixam.' },
    ja: { line: '事件解決。解説を読んで、三つの証言がどうつながるか確かめましょう。' },
    zh: { line: '案件结束。阅读解释，看看三条证词是如何拼在一起的。' },
    ar: { line: 'أُغلقت القضية. اقرأ التفسير لترى كيف تتلاءم الشهادات الثلاث.' },
    hi: { line: 'मामला बंद। तीनों बयान किस तरह जुड़ते हैं यह जानने के लिए स्पष्टीकरण पढ़ें।' },
  },
};

// ---------------------------------------------------------------------------
// Accessor
// ---------------------------------------------------------------------------

/**
 * Returns the localized guidance copy for the given stage and locale.
 *
 * Deterministic: the same (stage, locale) pair always yields the same copy.
 * No randomness, no external I/O.
 */
export function getDetectiveVoice(stage: DetectiveStage, locale: Locale): StageCopy {
  return VOICE_COPY[stage][locale];
}
