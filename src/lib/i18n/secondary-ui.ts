/**
 * secondary-ui.ts -- Ten-language static catalogue for secondary UI strings.
 *
 * Original Kiro work: hypothesis board (HypothesisBoard.tsx), detective voice
 * (detective-voice.ts), and detective aside (DetectiveAside.tsx) were authored
 * by Kiro CLI 2.37.0 on 2026-10-31 with English and Korean only.
 *
 * Ten-language secondary UI extension: implemented by Kiro in this session
 * (2026-10-31), adding es / fr / de / pt / ja / zh / ar / hi to CrossExamination,
 * HypothesisBoard, and DetectiveAside.
 *
 * The inherited application (engine, Game.tsx, CSS, server routes, sharing) is
 * Codex work and is not modified here.
 *
 * ---------------------------------------------------------------------------
 * Design contract
 * ---------------------------------------------------------------------------
 *
 * 1. All ten locales (en ko es fr de pt ja zh ar hi) cover every required key.
 * 2. Dynamic values use named placeholders: {name}, {remaining}, {total}.
 *    Callers substitute these with plain string values -- NOT as HTML -- so
 *    mixed-script object names are safe against injection.
 * 3. Keys are typed via the `SecondaryUiKey` union type.
 * 4. `t(locale, key)` returns the raw template string.
 * 5. `fill(template, vars)` substitutes named placeholders; it never calls
 *    innerHTML or dangerouslySetInnerHTML.
 * 6. Quotes of official testimony are never stored here; they pass through
 *    verbatim from the snapshot.
 *
 * ---------------------------------------------------------------------------
 * Key inventory (by component)
 * ---------------------------------------------------------------------------
 *
 * CrossExamination
 *   cross-title           -- h2 heading
 *   cross-intro           -- instructional paragraph
 *   cross-hear-rebuttal   -- button; placeholder: {name}
 *   cross-objection       -- "Objection!" label
 *   cross-compare-label   -- strip heading
 *   cross-note-label      -- "Detective's note" label
 *   cross-pin-button      -- save button
 *   cross-pinned-more     -- saved-note status, more suspects remain
 *   cross-pinned-done     -- saved-note status, all three done
 *   cross-dialogue-rule   -- disclaimer
 *   cross-notebook-title  -- notebook summary; placeholders: {remaining} {total}
 *   cross-notebook-intro  -- instructional paragraph
 *   cross-undecided       -- select option
 *   cross-think-true      -- select option
 *   cross-think-false     -- select option
 *   cross-progress        -- progress; placeholder: {remaining}
 *   cross-detective-label -- detective speaker label
 *
 * HypothesisBoard
 *   hyp-board-aria        -- section aria-label
 *   hyp-heading           -- h2
 *   hyp-instruction       -- instructional paragraph
 *   hyp-count             -- count; placeholders: {remaining} {total}
 *   hyp-last-label        -- last-card label
 *   hyp-empty             -- zero-remaining message
 *   hyp-status-possible   -- card status
 *   hyp-status-eliminated -- card status
 *   hyp-reset             -- reset button
 *
 * DetectiveAside
 *   aside-heading         -- aria-label and strong title
 */

import type { Locale } from '@/lib/i18n/locales';

// ---------------------------------------------------------------------------
// Key type
// ---------------------------------------------------------------------------

export type SecondaryUiKey =
  // CrossExamination
  | 'cross-title'
  | 'cross-intro'
  | 'cross-hear-rebuttal'
  | 'cross-objection'
  | 'cross-compare-label'
  | 'cross-note-label'
  | 'cross-pin-button'
  | 'cross-pinned-more'
  | 'cross-pinned-done'
  | 'cross-dialogue-rule'
  | 'cross-notebook-title'
  | 'cross-notebook-intro'
  | 'cross-undecided'
  | 'cross-think-true'
  | 'cross-think-false'
  | 'cross-progress'
  | 'cross-detective-label'
  // HypothesisBoard
  | 'hyp-board-aria'
  | 'hyp-heading'
  | 'hyp-instruction'
  | 'hyp-count'
  | 'hyp-last-label'
  | 'hyp-empty'
  | 'hyp-status-possible'
  | 'hyp-status-eliminated'
  | 'hyp-reset'
  // DetectiveAside
  | 'aside-heading';

// ---------------------------------------------------------------------------
// Catalogue type
// ---------------------------------------------------------------------------

type Catalogue = Record<SecondaryUiKey, string>;

// ---------------------------------------------------------------------------
// All ten catalogues
// ---------------------------------------------------------------------------

const CATALOGUES: Record<Locale, Catalogue> = {
  // ---- English --------------------------------------------------------------
  en: {
    "cross-title": "Wait. That doesn't add up.",
    "cross-intro": "Press them on their statements. The others won't stay quiet.",
    "cross-hear-rebuttal": "Hear {name}'s objection",
    "cross-objection": "Objection!",
    "cross-compare-label": "Compare the official statements",
    "cross-note-label": "Detective's note",
    "cross-pin-button": "Pin this comparison",
    "cross-pinned-more": "Pinned. Question another object.",
    "cross-pinned-done": "All three confrontations are complete. Time for your theory.",
    "cross-dialogue-rule": "The conversation compares the three official statements. It adds no new evidence.",
    "cross-notebook-title": "My detective notebook {remaining}/{total}",
    "cross-notebook-intro": "Which claim feels suspicious? These are your notes, not a verdict. Change them any time.",
    "cross-undecided": "Undecided",
    "cross-think-true": "I think it's true",
    "cross-think-false": "I think it's false",
    "cross-progress": "{remaining}/3",
    "cross-detective-label": "Kirock Homes",
    "hyp-board-aria": "Hypothesis board",
    "hyp-heading": "My hypothesis board",
    "hyp-instruction": "Tap the theories that don't fit the three statements to cross them out. Tap again to restore them.",
    "hyp-count": "Remaining: {remaining} / {total}",
    "hyp-last-label": "My remaining theory",
    "hyp-empty": "All hypotheses eliminated. Use the reset button to restore the cards.",
    "hyp-status-possible": "Possible",
    "hyp-status-eliminated": "Eliminated",
    "hyp-reset": "Reset hypotheses",
    "aside-heading": "Kirock's notebook",
  },

  // ---- Korean ---------------------------------------------------------------
  ko: {
    "cross-title": "잠깐, 말이 안 맞는데?",
    "cross-intro": "진술을 물고 늘어져 보세요. 다른 물건도 가만있지 않을걸요.",
    "cross-hear-rebuttal": "{name}의 반론 듣기",
    "cross-objection": "이의 있어!",
    "cross-compare-label": "대조할 공식 증언",
    "cross-note-label": "추리 노트",
    "cross-pin-button": "노트에 남기기",
    "cross-pinned-more": "노트에 남겼어요. 다른 물건도 추궁해 보세요.",
    "cross-pinned-done": "세 대질을 마쳤어요. 이제 당신의 추리를 정리하세요.",
    "cross-dialogue-rule": "대질은 세 공식 증언을 비교하는 대화입니다. 새 증거가 추가되지는 않아요.",
    "cross-notebook-title": "내 추리 수첩 {remaining}/{total}",
    "cross-notebook-intro": "어느 말이 수상한가요? 메모는 언제든 바꿀 수 있고 정답을 알려주지는 않아요.",
    "cross-undecided": "아직 보류",
    "cross-think-true": "참인 것 같아",
    "cross-think-false": "거짓인 것 같아",
    "cross-progress": "{remaining}/3",
    "cross-detective-label": "킬록 홈즈",
    "hyp-board-aria": "가설 보드",
    "hyp-heading": "내 가설 보드",
    "hyp-instruction": "세 증언과 맞지 않는 가설을 눌러 지워 보세요. 다시 누르면 되돌릴 수 있어요.",
    "hyp-count": "남은 가설: {remaining} / {total}",
    "hyp-last-label": "내가 남긴 가설",
    "hyp-empty": "모든 가설을 제외했어요. 초기화 버튼으로 다시 시작할 수 있어요.",
    "hyp-status-possible": "가능",
    "hyp-status-eliminated": "제외됨",
    "hyp-reset": "가설 초기화",
    "aside-heading": "킬록의 수첩",
  },

  // ---- Spanish --------------------------------------------------------------
  es: {
    "cross-title": "Espera. Eso no cuadra.",
    "cross-intro": "Presiónales sobre sus declaraciones. Los demás no se quedarán callados.",
    "cross-hear-rebuttal": "Escuchar la objeción de {name}",
    "cross-objection": "¡Objeción!",
    "cross-compare-label": "Comparar las declaraciones oficiales",
    "cross-note-label": "Nota del detective",
    "cross-pin-button": "Fijar esta comparación",
    "cross-pinned-more": "Fijado. Interroga a otro objeto.",
    "cross-pinned-done": "Los tres careos están completos. Es hora de formular tu teoría.",
    "cross-dialogue-rule": "La conversación compara las tres declaraciones oficiales. No añade nueva evidencia.",
    "cross-notebook-title": "Mi cuaderno de detective {remaining}/{total}",
    "cross-notebook-intro": "¿Qué afirmación te parece sospechosa? Son tus notas, no un veredicto. Cámbialas cuando quieras.",
    "cross-undecided": "Sin decidir",
    "cross-think-true": "Creo que es verdad",
    "cross-think-false": "Creo que es falso",
    "cross-progress": "{remaining}/3",
    "cross-detective-label": "Kirock Homes",
    "hyp-board-aria": "Panel de hipótesis",
    "hyp-heading": "Mi panel de hipótesis",
    "hyp-instruction": "Toca las teorías que no encajan con las tres declaraciones para descartarlas. Toca de nuevo para restaurarlas.",
    "hyp-count": "Restantes: {remaining} / {total}",
    "hyp-last-label": "Mi teoría restante",
    "hyp-empty": "Todas las hipótesis eliminadas. Usa el botón de reinicio para restaurarlas.",
    "hyp-status-possible": "Posible",
    "hyp-status-eliminated": "Eliminada",
    "hyp-reset": "Reiniciar hipótesis",
    "aside-heading": "El cuaderno de Kirock",
  },

  // ---- French ---------------------------------------------------------------
  fr: {
    "cross-title": "Attends. Ça ne colle pas.",
    "cross-intro": "Interroge-les sur leurs déclarations. Les autres ne resteront pas silencieux.",
    "cross-hear-rebuttal": "Entendre l'objection de {name}",
    "cross-objection": "Objection !",
    "cross-compare-label": "Comparer les déclarations officielles",
    "cross-note-label": "Note du détective",
    "cross-pin-button": "Épingler cette comparaison",
    "cross-pinned-more": "Épinglé. Interroge un autre objet.",
    "cross-pinned-done": "Les trois confrontations sont terminées. À toi de formuler ta théorie.",
    "cross-dialogue-rule": "La conversation compare les trois déclarations officielles. Elle n'ajoute aucune nouvelle preuve.",
    "cross-notebook-title": "Mon carnet de détective {remaining}/{total}",
    "cross-notebook-intro": "Quelle affirmation te semble suspecte ? Ce sont tes notes, pas un verdict. Modifie-les à tout moment.",
    "cross-undecided": "Indécis",
    "cross-think-true": "Je pense que c'est vrai",
    "cross-think-false": "Je pense que c'est faux",
    "cross-progress": "{remaining}/3",
    "cross-detective-label": "Kirock Homes",
    "hyp-board-aria": "Tableau d'hypothèses",
    "hyp-heading": "Mon tableau d'hypothèses",
    "hyp-instruction": "Appuie sur les théories qui ne correspondent pas aux trois déclarations pour les éliminer. Appuie à nouveau pour les restaurer.",
    "hyp-count": "Restantes : {remaining} / {total}",
    "hyp-last-label": "Ma théorie restante",
    "hyp-empty": "Toutes les hypothèses sont éliminées. Utilise le bouton de réinitialisation pour restaurer les cartes.",
    "hyp-status-possible": "Possible",
    "hyp-status-eliminated": "Éliminée",
    "hyp-reset": "Réinitialiser les hypothèses",
    "aside-heading": "Le carnet de Kirock",
  },

  // ---- German ---------------------------------------------------------------
  de: {
    "cross-title": "Moment mal. Das ergibt keinen Sinn.",
    "cross-intro": "Hak bei ihren Aussagen nach. Die anderen werden nicht schweigen.",
    "cross-hear-rebuttal": "Einwand von {name} anhören",
    "cross-objection": "Einspruch!",
    "cross-compare-label": "Die offiziellen Aussagen vergleichen",
    "cross-note-label": "Detektivnotiz",
    "cross-pin-button": "Vergleich merken",
    "cross-pinned-more": "Gemerkt. Befrage ein anderes Objekt.",
    "cross-pinned-done": "Alle drei Konfrontationen abgeschlossen. Zeit für deine Theorie.",
    "cross-dialogue-rule": "Das Gespräch vergleicht die drei offiziellen Aussagen. Es fügt keine neuen Beweise hinzu.",
    "cross-notebook-title": "Mein Detektivnotizbuch {remaining}/{total}",
    "cross-notebook-intro": "Welche Aussage erscheint dir verdächtig? Das sind deine Notizen, kein Urteil. Ändere sie jederzeit.",
    "cross-undecided": "Unentschieden",
    "cross-think-true": "Ich glaube, es stimmt",
    "cross-think-false": "Ich glaube, es stimmt nicht",
    "cross-progress": "{remaining}/3",
    "cross-detective-label": "Kirock Homes",
    "hyp-board-aria": "Hypothesentafel",
    "hyp-heading": "Meine Hypothesentafel",
    "hyp-instruction": "Tippe auf Theorien, die nicht zu den drei Aussagen passen, um sie zu streichen. Nochmals tippen stellt sie wieder her.",
    "hyp-count": "Verbleibend: {remaining} / {total}",
    "hyp-last-label": "Meine verbleibende Theorie",
    "hyp-empty": "Alle Hypothesen eliminiert. Nutze den Zurücksetzen-Knopf, um die Karten wiederherzustellen.",
    "hyp-status-possible": "Möglich",
    "hyp-status-eliminated": "Eliminiert",
    "hyp-reset": "Hypothesen zurücksetzen",
    "aside-heading": "Kirocks Notizbuch",
  },

  // ---- Portuguese -----------------------------------------------------------
  pt: {
    "cross-title": "Espera. Isso não bate.",
    "cross-intro": "Pressione-os sobre as declarações. Os outros não ficarão quietos.",
    "cross-hear-rebuttal": "Ouvir a objeção de {name}",
    "cross-objection": "Objeção!",
    "cross-compare-label": "Comparar as declarações oficiais",
    "cross-note-label": "Nota do detetive",
    "cross-pin-button": "Fixar esta comparação",
    "cross-pinned-more": "Fixado. Questione outro objeto.",
    "cross-pinned-done": "Os três confrontos estão concluídos. Hora de formular sua teoria.",
    "cross-dialogue-rule": "A conversa compara as três declarações oficiais. Não adiciona novas evidências.",
    "cross-notebook-title": "Meu caderno de detetive {remaining}/{total}",
    "cross-notebook-intro": "Qual afirmação parece suspeita? São suas anotações, não um veredicto. Altere-as a qualquer momento.",
    "cross-undecided": "Indeciso",
    "cross-think-true": "Acho que é verdade",
    "cross-think-false": "Acho que é falso",
    "cross-progress": "{remaining}/3",
    "cross-detective-label": "Kirock Homes",
    "hyp-board-aria": "Painel de hipóteses",
    "hyp-heading": "Meu painel de hipóteses",
    "hyp-instruction": "Toque nas teorias que não se encaixam nas três declarações para eliminá-las. Toque novamente para restaurá-las.",
    "hyp-count": "Restantes: {remaining} / {total}",
    "hyp-last-label": "Minha teoria restante",
    "hyp-empty": "Todas as hipóteses eliminadas. Use o botão de redefinição para restaurar as cartas.",
    "hyp-status-possible": "Possível",
    "hyp-status-eliminated": "Eliminada",
    "hyp-reset": "Redefinir hipóteses",
    "aside-heading": "O caderno de Kirock",
  },

  // ---- Japanese -------------------------------------------------------------
  ja: {
    "cross-title": "ちょっと待って。辻褄が合わない。",
    "cross-intro": "証言をとことん追及しましょう。他のものたちも黙っていませんよ。",
    "cross-hear-rebuttal": "{name}の異議を聞く",
    "cross-objection": "異議あり！",
    "cross-compare-label": "公式証言を照合する",
    "cross-note-label": "探偵メモ",
    "cross-pin-button": "この比較をメモする",
    "cross-pinned-more": "メモしました。別のものも追及してみましょう。",
    "cross-pinned-done": "三つの対質が完了しました。いよいよ推理をまとめましょう。",
    "cross-dialogue-rule": "この会話は三つの公式証言を比較するものです。新たな証拠は加わりません。",
    "cross-notebook-title": "推理ノート {remaining}/{total}",
    "cross-notebook-intro": "どの発言が怪しいですか？これはあなたのメモであり、判決ではありません。いつでも変更できます。",
    "cross-undecided": "未定",
    "cross-think-true": "本当だと思う",
    "cross-think-false": "嘘だと思う",
    "cross-progress": "{remaining}/3",
    "cross-detective-label": "Kirock Homes",
    "hyp-board-aria": "仮説ボード",
    "hyp-heading": "仮説ボード",
    "hyp-instruction": "三つの証言に合わない仮説をタップして除外しましょう。もう一度タップすると元に戻せます。",
    "hyp-count": "残り: {remaining} / {total}",
    "hyp-last-label": "残った仮説",
    "hyp-empty": "すべての仮説を除外しました。リセットボタンで元に戻せます。",
    "hyp-status-possible": "可能性あり",
    "hyp-status-eliminated": "除外済み",
    "hyp-reset": "仮説をリセット",
    "aside-heading": "Kirockのノート",
  },

  // ---- Chinese (Simplified) -------------------------------------------------
  zh: {
    "cross-title": "等一下，这说不通。",
    "cross-intro": "追问他们的证词。其他物件也不会袖手旁观。",
    "cross-hear-rebuttal": "听{name}的异议",
    "cross-objection": "异议！",
    "cross-compare-label": "对比官方证词",
    "cross-note-label": "侦探笔记",
    "cross-pin-button": "记录这次对比",
    "cross-pinned-more": "已记录。再审问另一个物件吧。",
    "cross-pinned-done": "三次对质全部完成。是时候整理你的推理了。",
    "cross-dialogue-rule": "此对话用于比较三条官方证词，不会添加新的证据。",
    "cross-notebook-title": "我的侦探笔记本 {remaining}/{total}",
    "cross-notebook-intro": "哪条说法让你觉得可疑？这是你的笔记，不是判决，随时可以修改。",
    "cross-undecided": "未决定",
    "cross-think-true": "我认为是真的",
    "cross-think-false": "我认为是假的",
    "cross-progress": "{remaining}/3",
    "cross-detective-label": "Kirock Homes",
    "hyp-board-aria": "假说面板",
    "hyp-heading": "我的假说面板",
    "hyp-instruction": "点击与三条证词不符的假说将其划去，再次点击可以恢复。",
    "hyp-count": "剩余：{remaining} / {total}",
    "hyp-last-label": "我保留的假说",
    "hyp-empty": "所有假说已排除。使用重置按钮恢复卡片。",
    "hyp-status-possible": "可能",
    "hyp-status-eliminated": "已排除",
    "hyp-reset": "重置假说",
    "aside-heading": "Kirock的笔记本",
  },

  // ---- Arabic ---------------------------------------------------------------
  ar: {
    "cross-title": "لحظة. هذا لا يستقيم.",
    "cross-intro": "اضغط عليهم بشأن شهاداتهم. الآخرون لن يصمتوا.",
    "cross-hear-rebuttal": "استمع إلى اعتراض {name}",
    "cross-objection": "اعتراض!",
    "cross-compare-label": "قارن الشهادات الرسمية",
    "cross-note-label": "ملاحظة المحقق",
    "cross-pin-button": "تثبيت هذه المقارنة",
    "cross-pinned-more": "تم التثبيت. استجوب كائناً آخر.",
    "cross-pinned-done": "اكتملت المواجهات الثلاث. حان وقت صياغة نظريتك.",
    "cross-dialogue-rule": "تقارن هذه المحادثة الشهادات الرسمية الثلاث فقط، ولا تضيف أدلة جديدة.",
    "cross-notebook-title": "دفتر ملاحظات المحقق {remaining}/{total}",
    "cross-notebook-intro": "أي ادعاء يبدو مريباً؟ هذه ملاحظاتك الخاصة وليست حكماً. غيّرها في أي وقت.",
    "cross-undecided": "غير محدد",
    "cross-think-true": "أعتقد أنه صحيح",
    "cross-think-false": "أعتقد أنه خاطئ",
    "cross-progress": "{remaining}/3",
    "cross-detective-label": "Kirock Homes",
    "hyp-board-aria": "لوحة الفرضيات",
    "hyp-heading": "لوحة فرضياتي",
    "hyp-instruction": "اضغط على الفرضيات التي لا تتوافق مع الشهادات الثلاث لاستبعادها. اضغط مرة أخرى لاستعادتها.",
    "hyp-count": "المتبقي: {remaining} / {total}",
    "hyp-last-label": "فرضيتي الأخيرة",
    "hyp-empty": "تم استبعاد جميع الفرضيات. استخدم زر إعادة الضبط لاستعادة البطاقات.",
    "hyp-status-possible": "محتمل",
    "hyp-status-eliminated": "مستبعد",
    "hyp-reset": "إعادة ضبط الفرضيات",
    "aside-heading": "دفتر Kirock",
  },

  // ---- Hindi ----------------------------------------------------------------
  hi: {
    "cross-title": "रुकिए। यह बात मेल नहीं खाती।",
    "cross-intro": "इनके बयानों पर सवाल उठाइए। दूसरे भी चुप नहीं रहेंगे।",
    "cross-hear-rebuttal": "{name} की आपत्ति सुनें",
    "cross-objection": "आपत्ति!",
    "cross-compare-label": "आधिकारिक बयानों की तुलना करें",
    "cross-note-label": "जासूस की टिप्पणी",
    "cross-pin-button": "यह तुलना नोट करें",
    "cross-pinned-more": "नोट कर लिया। किसी और वस्तु से पूछताछ करें।",
    "cross-pinned-done": "तीनों आमने-सामने हो गए। अब अपनी थ्योरी तैयार करें।",
    "cross-dialogue-rule": "यह बातचीत तीन आधिकारिक बयानों की तुलना करती है। इसमें कोई नया सबूत नहीं जुड़ता।",
    "cross-notebook-title": "मेरी जासूसी नोटबुक {remaining}/{total}",
    "cross-notebook-intro": "कौन सा दावा संदिग्ध लगता है? ये आपके नोट हैं, कोई फैसला नहीं। जब चाहें बदलें।",
    "cross-undecided": "अनिर्णीत",
    "cross-think-true": "मुझे लगता है यह सच है",
    "cross-think-false": "मुझे लगता है यह झूठ है",
    "cross-progress": "{remaining}/3",
    "cross-detective-label": "Kirock Homes",
    "hyp-board-aria": "परिकल्पना बोर्ड",
    "hyp-heading": "मेरा परिकल्पना बोर्ड",
    "hyp-instruction": "जो परिकल्पनाएं तीन बयानों से मेल नहीं खातीं उन्हें टैप करके हटाएं। वापस लाने के लिए फिर से टैप करें।",
    "hyp-count": "शेष: {remaining} / {total}",
    "hyp-last-label": "मेरी बची हुई परिकल्पना",
    "hyp-empty": "सभी परिकल्पनाएं हटा दी गई हैं। कार्ड वापस लाने के लिए रीसेट बटन दबाएं।",
    "hyp-status-possible": "संभव",
    "hyp-status-eliminated": "हटाया गया",
    "hyp-reset": "परिकल्पनाएं रीसेट करें",
    "aside-heading": "Kirock की नोटबुक",
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Look up a raw template string for the given locale and key.
 *
 * The string may contain named placeholders {name}, {remaining}, or {total}.
 * Use `fill()` to substitute them before rendering.
 */
export function t(locale: Locale, key: SecondaryUiKey): string {
  return CATALOGUES[locale][key];
}

/**
 * Substitute named placeholders in a template string with plain-text values.
 *
 * Values are treated as raw strings -- NOT as HTML. This is the only safe way
 * to inject user-supplied or mixed-script object names.
 *
 * @example
 *   fill(t('en', 'cross-hear-rebuttal'), { name: 'Lamp <script>' })
 *   // => "Hear Lamp <script>'s objection"  (no HTML parsing)
 */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => {
    const value = vars[key];
    return value !== undefined ? String(value) : match;
  });
}
