import type { Locale } from './locales';

/** Decorative opening copy only. These lines never describe case evidence. */
export type OpeningCopy = {
  label: string;
  line: string;
  skip: string;
  replay: string;
  enter: string;
  detective: string;
};

export const OPENING_COPY: Record<Locale, OpeningCopy> = {
  en: {
    label: 'Meet Kirock Homes',
    line: 'Every room has a story. Yours has suspects.',
    skip: 'Skip intro',
    replay: 'Watch the opening',
    enter: 'Begin the story',
    detective: 'Your resident detective',
  },
  ko: {
    label: '킬록 홈즈를 만나보세요',
    line: '방마다 사연은 있지. 자네 방엔 용의자도 있고.',
    skip: '스킵 인트로',
    replay: '오프닝 다시 보기',
    enter: '이야기 시작하기',
    detective: '우리 집 전담 탐정',
  },
  es: {
    label: 'Conoce a Kirock Homes',
    line: 'Cada habitación tiene una historia. La tuya tiene sospechosos.',
    skip: 'Saltar introducción',
    replay: 'Ver la introducción',
    enter: 'Comenzar la historia',
    detective: 'Tu detective de cabecera',
  },
  fr: {
    label: 'Rencontrez Kirock Homes',
    line: 'Chaque pièce a son histoire. La vôtre a ses suspects.',
    skip: 'Passer l’introduction',
    replay: 'Revoir l’introduction',
    enter: 'Commencer l’histoire',
    detective: 'Votre détective à domicile',
  },
  de: {
    label: 'Lerne Kirock Homes kennen',
    line: 'Jedes Zimmer hat seine Geschichte. Deines hat Verdächtige.',
    skip: 'Intro überspringen',
    replay: 'Intro ansehen',
    enter: 'Die Geschichte beginnen',
    detective: 'Dein hauseigener Detektiv',
  },
  pt: {
    label: 'Conheça Kirock Homes',
    line: 'Todo cômodo tem uma história. O seu tem suspeitos.',
    skip: 'Pular introdução',
    replay: 'Ver a abertura',
    enter: 'Começar a história',
    detective: 'Seu detetive de plantão',
  },
  ja: {
    label: 'Kirock Homesとの出会い',
    line: 'どの部屋にも物語がある。君の部屋には、容疑者までいる。',
    skip: 'オープニングをスキップ',
    replay: 'オープニングを見る',
    enter: '物語を始める',
    detective: 'わが家の専属探偵',
  },
  zh: {
    label: '认识 Kirock Homes',
    line: '每个房间都有故事。你的房间，还有嫌疑人。',
    skip: '跳过开场',
    replay: '观看开场',
    enter: '开始故事',
    detective: '你家的专属侦探',
  },
  ar: {
    label: 'تعرّف على Kirock Homes',
    line: 'لكل غرفة حكاية. وفي غرفتك مشتبه بهم أيضًا.',
    skip: 'تخطي المقدمة',
    replay: 'مشاهدة المقدمة',
    enter: 'ابدأ الحكاية',
    detective: 'محققك المقيم',
  },
  hi: {
    label: 'मिलिए Kirock Homes से',
    line: 'हर कमरे की अपनी कहानी होती है। तुम्हारे कमरे में तो संदिग्ध भी हैं।',
    skip: 'परिचय छोड़ें',
    replay: 'शुरुआती दृश्य देखें',
    enter: 'कहानी शुरू करें',
    detective: 'आपके घर का अपना जासूस',
  },
};

export function getOpeningCopy(locale: Locale): OpeningCopy {
  return OPENING_COPY[locale];
}
