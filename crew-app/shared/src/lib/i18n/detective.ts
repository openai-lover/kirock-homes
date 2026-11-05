import type { SuspectId, Triple } from '../game/types';
import type { Locale } from './locales';

/** Interface and character flavour only. Never use these lines as case evidence. */
export type DetectiveCopy = {
  agency: string;
  invitation: string;
  caseFile: string;
  sampleCase: string;
  yourCase: string;
  inspect: string;
  previewHint: string;
  sampleAction: string;
  uploadAction: string;
  suspects: string;
  collected: string;
  investigated: string;
  assistant: string;
  evidence: string;
  objection: string;
};

export const DETECTIVE_COPY: Record<Locale, DetectiveCopy> = {
  en: {
    agency: 'Consulting detective, household cases',
    invitation: 'Come in. You bring the curiosity. I’ll bring the hat.',
    caseFile: 'Case file',
    sampleCase: 'The desk incident',
    yourCase: 'Your friend’s case',
    inspect: 'Meet the suspects',
    previewHint: 'Tap a suspect. They have something to say.',
    sampleAction: 'Open the case',
    uploadAction: 'Bring your own mystery',
    suspects: 'Suspects',
    collected: 'Statements heard',
    investigated: 'Confrontations complete',
    assistant: 'Your detective',
    evidence: 'Official statement',
    objection: 'Objection!',
  },
  ko: {
    agency: '가정 내 미스터리 전문 자문 탐정',
    invitation: '어서 오게. 호기심은 자네가, 탐정 모자는 내가 준비하지.',
    caseFile: '사건 파일',
    sampleCase: '책상 위의 사건',
    yourCase: '친구가 남긴 사건',
    inspect: '용의자 만나기',
    previewHint: '용의자를 눌러보게. 다들 할 말이 있다네.',
    sampleAction: '사건 펼치기',
    uploadAction: '내 방의 미스터리 가져오기',
    suspects: '용의자',
    collected: '청취한 증언',
    investigated: '완료한 대질',
    assistant: '자네의 탐정',
    evidence: '공식 증언',
    objection: '이의 있소!',
  },
  es: {
    agency: 'Detective consultor, misterios domésticos',
    invitation: 'Adelante. Tú trae la curiosidad. Yo traeré el sombrero.',
    caseFile: 'Expediente',
    sampleCase: 'El incidente del escritorio',
    yourCase: 'El caso de tu amigo',
    inspect: 'Conoce a los sospechosos',
    previewHint: 'Toca un sospechoso. Tiene algo que decir.',
    sampleAction: 'Abrir el caso',
    uploadAction: 'Trae tu propio misterio',
    suspects: 'Sospechosos',
    collected: 'Declaraciones escuchadas',
    investigated: 'Careos completados',
    assistant: 'Tu detective',
    evidence: 'Declaración oficial',
    objection: '¡Objeción!',
  },
  fr: {
    agency: 'Détective conseil, mystères domestiques',
    invitation: 'Entrez donc. Apportez votre curiosité. Je prends mon chapeau.',
    caseFile: 'Dossier',
    sampleCase: 'L’incident du bureau',
    yourCase: 'L’affaire de votre ami',
    inspect: 'Rencontrer les suspects',
    previewHint: 'Touchez un suspect. Il a quelque chose à dire.',
    sampleAction: 'Ouvrir le dossier',
    uploadAction: 'Apporter votre mystère',
    suspects: 'Suspects',
    collected: 'Dépositions recueillies',
    investigated: 'Confrontations terminées',
    assistant: 'Votre détective',
    evidence: 'Déposition officielle',
    objection: 'Objection !',
  },
  de: {
    agency: 'Beratender Detektiv für Fälle im eigenen Heim',
    invitation: 'Nur herein. Du bringst die Neugier mit. Ich den Hut.',
    caseFile: 'Fallakte',
    sampleCase: 'Der Vorfall am Schreibtisch',
    yourCase: 'Der Fall deines Freundes',
    inspect: 'Die Verdächtigen kennenlernen',
    previewHint: 'Tippe auf einen Verdächtigen. Es gibt Gesprächsbedarf.',
    sampleAction: 'Die Akte öffnen',
    uploadAction: 'Dein eigenes Rätsel mitbringen',
    suspects: 'Verdächtige',
    collected: 'Angehörte Aussagen',
    investigated: 'Abgeschlossene Konfrontationen',
    assistant: 'Dein Detektiv',
    evidence: 'Offizielle Aussage',
    objection: 'Einspruch!',
  },
  pt: {
    agency: 'Detetive consultor, mistérios domésticos',
    invitation: 'Entre. Você traz a curiosidade. Eu trago o chapéu.',
    caseFile: 'Dossiê',
    sampleCase: 'O incidente da escrivaninha',
    yourCase: 'O caso do seu amigo',
    inspect: 'Conheça os suspeitos',
    previewHint: 'Toque em um suspeito. Ele tem algo a dizer.',
    sampleAction: 'Abrir o caso',
    uploadAction: 'Traga seu próprio mistério',
    suspects: 'Suspeitos',
    collected: 'Depoimentos ouvidos',
    investigated: 'Acareações concluídas',
    assistant: 'Seu detetive',
    evidence: 'Depoimento oficial',
    objection: 'Objeção!',
  },
  ja: {
    agency: 'ご家庭の謎を扱う顧問探偵',
    invitation: 'ようこそ。好奇心は君が、探偵帽は私が用意しよう。',
    caseFile: '事件ファイル',
    sampleCase: '机の上の事件',
    yourCase: '友達から届いた事件',
    inspect: '容疑者に会う',
    previewHint: '容疑者をタップ。みんな言いたいことがあるようだ。',
    sampleAction: '事件ファイルを開く',
    uploadAction: 'わが家の謎を持ち込む',
    suspects: '容疑者',
    collected: '聞いた証言',
    investigated: '完了した対質',
    assistant: '君の探偵',
    evidence: '正式な証言',
    objection: '異議あり！',
  },
  zh: {
    agency: '专办居家悬案的顾问侦探',
    invitation: '请进。你带上好奇心，我带上侦探帽。',
    caseFile: '案件档案',
    sampleCase: '书桌上的事件',
    yourCase: '朋友留下的案件',
    inspect: '认识嫌疑人',
    previewHint: '点一下嫌疑人。他们都有话要说。',
    sampleAction: '打开案件',
    uploadAction: '带来你家的谜案',
    suspects: '嫌疑人',
    collected: '已听取的证词',
    investigated: '已完成的对质',
    assistant: '你的专属侦探',
    evidence: '正式证词',
    objection: '我有异议！',
  },
  ar: {
    agency: 'محقق استشاري للألغاز المنزلية',
    invitation: 'تفضّل. أحضر فضولك، وسأحضر أنا القبعة.',
    caseFile: 'ملف القضية',
    sampleCase: 'حادثة المكتب',
    yourCase: 'قضية صديقك',
    inspect: 'تعرّف على المشتبه بهم',
    previewHint: 'اضغط على أحد المشتبه بهم. لديه ما يقوله.',
    sampleAction: 'افتح القضية',
    uploadAction: 'أحضر لغزك الخاص',
    suspects: 'المشتبه بهم',
    collected: 'الإفادات المسموعة',
    investigated: 'المواجهات المكتملة',
    assistant: 'محققك الخاص',
    evidence: 'إفادة رسمية',
    objection: 'اعتراض!',
  },
  hi: {
    agency: 'घरेलू रहस्यों के सलाहकार जासूस',
    invitation: 'आइए। जिज्ञासा आप लाइए। जासूसी टोपी मैं लाऊँगा।',
    caseFile: 'केस की फ़ाइल',
    sampleCase: 'मेज़ पर हुई घटना',
    yourCase: 'आपके दोस्त का केस',
    inspect: 'संदिग्धों से मिलें',
    previewHint: 'किसी संदिग्ध पर टैप करें। उन्हें कुछ कहना है।',
    sampleAction: 'केस खोलें',
    uploadAction: 'अपना रहस्य लेकर आएँ',
    suspects: 'संदिग्ध',
    collected: 'सुने गए बयान',
    investigated: 'पूरी हुई आमने-सामने की पूछताछ',
    assistant: 'आपके जासूस',
    evidence: 'आधिकारिक बयान',
    objection: 'आपत्ति है!',
  },
};

/** Sample preview order is mug, lamp, keyboard. No line establishes an alibi or a case fact. */
export const PREVIEW_BANTER: Record<Locale, Triple<string>> = {
  en: [
    'I prefer my drama with a handle.',
    'Please, no bright ideas.',
    'I would like to delete this conversation.',
  ],
  ko: [
    '긴장하면 손잡이에 땀이 난다니까.',
    '번뜩이는 아이디어는 내 담당인데.',
    '이 대화, 삭제 키로 지워도 되나요?',
  ],
  es: [
    'Prefiero los dramas con asa.',
    'Por favor, nada de ideas brillantes.',
    'Quisiera borrar esta conversación.',
  ],
  fr: [
    'Je préfère les drames avec une anse.',
    'Pas d’idées lumineuses, je vous prie.',
    'J’aimerais supprimer cette conversation.',
  ],
  de: [
    'Ich mag mein Drama lieber mit Henkel.',
    'Bitte keine Geistesblitze.',
    'Ich möchte dieses Gespräch bitte löschen.',
  ],
  pt: [
    'Prefiro meus dramas com alça.',
    'Por favor, nada de ideias brilhantes.',
    'Eu gostaria de apagar esta conversa.',
  ],
  ja: [
    '緊張すると、取っ手に汗をかくんです。',
    'ひらめき担当は私なんですが。',
    'この会話、削除キーで消せますか？',
  ],
  zh: [
    '一紧张，连杯柄都会冒汗。',
    '灵光一闪这事，该归我管吧。',
    '这段对话，我想按删除键。',
  ],
  ar: [
    'أفضل الدراما بمقبض يسهل الإمساك به.',
    'أرجوكم، بلا أفكار لامعة.',
    'أود حذف هذه المحادثة.',
  ],
  hi: [
    'ड्रामे के साथ एक हैंडल भी हो, तो सँभालना आसान है।',
    'चमकदार सुझाव देना मेरा काम है।',
    'क्या इस बातचीत को डिलीट कर सकते हैं?',
  ],
};

const PREVIEW_INDEX: Record<SuspectId, 0 | 1 | 2> = { s0: 0, s1: 1, s2: 2 };

export function getDetectiveCopy(locale: Locale): DetectiveCopy {
  return DETECTIVE_COPY[locale];
}

export function getPreviewBanter(locale: Locale): Triple<string>;
export function getPreviewBanter(locale: Locale, suspectId: SuspectId): string;
export function getPreviewBanter(locale: Locale, suspectId?: SuspectId): Triple<string> | string {
  return suspectId === undefined ? PREVIEW_BANTER[locale] : PREVIEW_BANTER[locale][PREVIEW_INDEX[suspectId]];
}
