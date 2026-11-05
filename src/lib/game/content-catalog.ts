import type { Locale, ObjectKind, PersonalityId, StoryId, Triple } from "./types";

type ContentCopy = {
  openings: Record<ObjectKind, string>;
  personalities: Record<PersonalityId, string>;
  titles: Record<StoryId, string>;
  coffeeContext: (lamp: string) => string;
  stickerContext: string;
  confessions: { sticker: string; cup: string; coffee: string };
  sampleNames: Triple<string>;
};

/** Static authored copy. Openings assert no alibi, culprit, or event state. */
export const CONTENT_CATALOG: Record<Locale, ContentCopy> = {
  ko: {
    openings: {
      cup: "내가 입을 열 줄은 몰랐지. 입구는 원래 있었지만.",
      lamp: "분위기는 내가 밝힐게. 사건은 네가 밝혀.",
      electronics: "드디어 대화가 되네. 평소엔 나만 두들겨 맞았는데.",
      book: "이런 전개는 책에서도 못 봤어. 내가 책이긴 하지만.",
      plant: "말이 좀 느려도 이해해. 원래 자라는 쪽이라.",
      toy: "안아 주는 건 나중에. 지금은 인터뷰 시간이야.",
      other: "눈이 생겼는데 월요일도 보이는 거야?",
    },
    personalities: {
      dry: "입이 생겼다고 말이 많아지는 건 아니야.",
      dramatic: "이 조명, 이 침묵… 내 데뷔 무대로 완벽해.",
      sleepy: "눈을 뜨긴 했어. 준비됐다는 뜻은 아니고.",
      cheerful: "우리 셋 단체 사진은 이미 찍은 거지?",
    },
    titles: { coffee: "쏟아진 커피 사건", sticker: "사라진 별 스티커 사건" },
    coffeeContext: (lamp) => `누군가 책상에 커피를 쏟았어요. 당시 ‘${lamp}’의 불은 켜져 있거나 꺼져 있었어요. 이 사건과 과거 상황은 허구예요. 지금 사진의 밝기는 단서가 아니에요.`,
    stickerContext: "종이 울린 순간, 초대장의 별 스티커가 사라졌어요. 종은 자정 전 또는 후에 한 번 울렸어요. 소품과 과거 상황은 허구이며 지금 사진은 단서가 아니에요.",
    confessions: {
      sticker: "별 하나쯤은 받아도 되는 줄 알았어. 셀프 시상이었지.",
      cup: "넘친 건 커피만이 아니었어. 내 자신감도.",
      coffee: "책상에도 커피 한 잔이 필요한 줄 알았지.",
    },
    sampleNames: ["머그컵", "스탠드", "키보드"],
  },
  en: {
    openings: {
      cup: "Finally, a mouth. The handle was a terrible way to wave.",
      lamp: "I'll lighten the mood. You solve the mystery.",
      electronics: "Finally, I get a word in. Usually it's all input.",
      book: "A plot twist! And for once, I'm outside the plot.",
      plant: "Give me a moment. I'm more of a slow grower.",
      toy: "Hugs later. I'm giving an interview.",
      other: "I have eyes now. Do I also have to read emails?",
    },
    personalities: {
      dry: "Having a mouth doesn't mean I need a podcast.",
      dramatic: "The lighting. The silence. What an entrance.",
      sleepy: "My eyes are open. The rest of me is buffering.",
      cheerful: "So, is this already our group photo?",
    },
    titles: { coffee: "The Spilled Coffee", sticker: "The Missing Star Sticker" },
    coffeeContext: (lamp) => `Someone spilled coffee on the desk. At that moment, “${lamp}” was either on or off. This event and its past circumstances are fictional. The brightness of the photo is not a clue.`,
    stickerContext: "A star sticker vanished from an invitation when a bell rang. The bell rang once, either before or after midnight. These props and past events are fictional; the photo is not a clue.",
    confessions: {
      sticker: "I thought I deserved a star. It was a self-awarded award.",
      cup: "The coffee wasn't the only thing overflowing. So was my confidence.",
      coffee: "I thought the desk could use a coffee too.",
    },
    sampleNames: ["Mug", "Lamp", "Keyboard"],
  },
  es: {
    openings: {
      cup: "Por fin tengo boca. Saludar con el asa no era lo mío.",
      lamp: "Yo ilumino el ambiente. Tú aclara el misterio.",
      electronics: "Por fin puedo decir algo. Normalmente solo recibo órdenes.",
      book: "¡Un giro inesperado! Y, por una vez, estoy fuera de la trama.",
      plant: "Dame un momento. Lo mío es crecer despacio.",
      toy: "Los abrazos, luego. Estoy dando una entrevista.",
      other: "Ahora tengo ojos. ¿También tengo que leer correos?",
    },
    personalities: {
      dry: "Tener boca no significa que necesite un pódcast.",
      dramatic: "La luz. El silencio. Menuda entrada en escena.",
      sleepy: "Tengo los ojos abiertos. El resto sigue cargando.",
      cheerful: "Entonces, ¿esta ya es nuestra foto de grupo?",
    },
    titles: { coffee: "El café derramado", sticker: "La pegatina de estrella desaparecida" },
    coffeeContext: (lamp) => `Alguien derramó café sobre el escritorio. En ese momento, la luz de «${lamp}» estaba encendida o apagada. Este suceso y sus circunstancias pasadas son ficticios. La luminosidad de la foto no es una pista.`,
    stickerContext: "Una pegatina de estrella desapareció de una invitación al sonar una campana. La campana sonó una sola vez, antes o después de medianoche. Estos objetos y sucesos pasados son ficticios; la foto no es una pista.",
    confessions: {
      sticker: "Creí que me merecía una estrella. Fue un premio que me concedí yo.",
      cup: "No solo se desbordó el café. También mi confianza.",
      coffee: "Pensé que al escritorio también le vendría bien un café.",
    },
    sampleNames: ["Taza", "Lámpara", "Teclado"],
  },
  fr: {
    openings: {
      cup: "Enfin une bouche. Faire coucou avec une anse, c'était compliqué.",
      lamp: "Moi, j'éclaire l'ambiance. Toi, éclaircis le mystère.",
      electronics: "Enfin, je peux en placer une. D'habitude, je ne fais que recevoir.",
      book: "Un rebondissement ! Et pour une fois, je suis hors de l'intrigue.",
      plant: "Laisse-moi un instant. Moi, je pousse à mon rythme.",
      toy: "Les câlins, ce sera pour après. Je donne une interview.",
      other: "J'ai des yeux maintenant. Il va aussi falloir lire mes mails ?",
    },
    personalities: {
      dry: "Avoir une bouche ne m'oblige pas à lancer un podcast.",
      dramatic: "La lumière. Le silence. Quelle entrée en scène.",
      sleepy: "J'ai les yeux ouverts. Le reste est encore en chargement.",
      cheerful: "Alors, c'est déjà notre photo de groupe ?",
    },
    titles: { coffee: "Le café renversé", sticker: "L'autocollant étoile disparu" },
    coffeeContext: (lamp) => `Quelqu'un a renversé du café sur le bureau. À cet instant, la lumière de « ${lamp} » était allumée ou éteinte. Cet événement et ses circonstances passées sont fictifs. La luminosité de la photo n'est pas un indice.`,
    stickerContext: "Un autocollant étoile a disparu d'une invitation au son d'une cloche. La cloche a sonné une seule fois, avant ou après minuit. Ces accessoires et ces événements passés sont fictifs ; la photo n'est pas un indice.",
    confessions: {
      sticker: "Je pensais mériter une étoile. C'était un prix que je me décernais moi-même.",
      cup: "Il n'y a pas que le café qui débordait. Ma confiance aussi.",
      coffee: "Je pensais que le bureau avait lui aussi besoin d'un café.",
    },
    sampleNames: ["Tasse", "Lampe", "Clavier"],
  },
  de: {
    openings: {
      cup: "Endlich ein Mund. Mit dem Henkel winken war ziemlich schwierig.",
      lamp: "Ich bringe Licht in die Stimmung. Du bringst Licht in den Fall.",
      electronics: "Endlich komme ich zu Wort. Sonst gibt es immer nur Eingaben.",
      book: "Eine Wendung! Und ausnahmsweise stehe ich mal nicht im Text.",
      plant: "Gib mir einen Moment. Ich lasse die Dinge langsam wachsen.",
      toy: "Gekuschelt wird später. Ich gebe gerade ein Interview.",
      other: "Jetzt habe ich Augen. Muss ich damit auch E-Mails lesen?",
    },
    personalities: {
      dry: "Nur weil ich einen Mund habe, brauche ich keinen Podcast.",
      dramatic: "Das Licht. Die Stille. Was für ein Auftritt.",
      sleepy: "Meine Augen sind offen. Der Rest lädt noch.",
      cheerful: "Ist das hier also schon unser Gruppenfoto?",
    },
    titles: { coffee: "Der verschüttete Kaffee", sticker: "Der verschwundene Sternaufkleber" },
    coffeeContext: (lamp) => `Jemand hat Kaffee auf dem Schreibtisch verschüttet. In diesem Moment war das Licht von „${lamp}“ entweder an oder aus. Dieser Vorfall und seine damaligen Umstände sind erfunden. Die Helligkeit des Fotos ist kein Hinweis.`,
    stickerContext: "Als eine Glocke läutete, verschwand ein Sternaufkleber von einer Einladung. Die Glocke läutete genau einmal, entweder vor oder nach Mitternacht. Diese Requisiten und vergangenen Ereignisse sind erfunden; das Foto ist kein Hinweis.",
    confessions: {
      sticker: "Ich dachte, ich hätte einen Stern verdient. Den Preis habe ich mir selbst verliehen.",
      cup: "Nicht nur der Kaffee lief über. Auch mein Selbstvertrauen.",
      coffee: "Ich dachte, der Schreibtisch könnte auch einen Kaffee gebrauchen.",
    },
    sampleNames: ["Tasse", "Lampe", "Tastatur"],
  },
  pt: {
    openings: {
      cup: "Finalmente, uma boca. Acenar com a alça não dava muito certo.",
      lamp: "Eu ilumino o ambiente. Você esclarece o mistério.",
      electronics: "Finalmente posso falar. Normalmente só recebo comandos.",
      book: "Uma reviravolta! E, por uma vez, estou fora da trama.",
      plant: "Me dá um instante. Eu sou mais de crescer devagar.",
      toy: "Abraços depois. Estou dando uma entrevista.",
      other: "Agora tenho olhos. Também vou ter que ler e-mails?",
    },
    personalities: {
      dry: "Ter uma boca não significa que eu precise de um podcast.",
      dramatic: "A luz. O silêncio. Que entrada triunfal.",
      sleepy: "Meus olhos estão abertos. O resto ainda está carregando.",
      cheerful: "Então esta já é a nossa foto de grupo?",
    },
    titles: { coffee: "O café derramado", sticker: "O adesivo de estrela desaparecido" },
    coffeeContext: (lamp) => `Alguém derramou café na mesa. Naquele momento, a luz de “${lamp}” estava acesa ou apagada. Esse acontecimento e suas circunstâncias passadas são fictícios. A claridade da foto não é uma pista.`,
    stickerContext: "Um adesivo de estrela sumiu de um convite quando um sino tocou. O sino tocou uma única vez, antes ou depois da meia-noite. Esses objetos e acontecimentos passados são fictícios; a foto não é uma pista.",
    confessions: {
      sticker: "Achei que merecia uma estrela. Foi um prêmio que eu dei para mim.",
      cup: "Não foi só o café que transbordou. Minha confiança também.",
      coffee: "Achei que a mesa também precisava de um café.",
    },
    sampleNames: ["Caneca", "Luminária", "Teclado"],
  },
  ja: {
    openings: {
      cup: "やっと口ができた。取っ手で手を振るのは無理があったよ。",
      lamp: "場を明るくするのは任せて。事件を明らかにするのは君ね。",
      electronics: "やっと話せる。いつもは入力されるばっかりだったから。",
      book: "まさかの急展開！今回は本の外で起きてるんだね。",
      plant: "ちょっと待ってね。成長ものんびりなタイプだから。",
      toy: "ハグはあとで。今はインタビュー中。",
      other: "目ができた。これでメールも読まなきゃいけないの？",
    },
    personalities: {
      dry: "口ができたからって、ポッドキャストを始めるわけじゃないよ。",
      dramatic: "この照明、この静けさ……完璧な登場シーンだ。",
      sleepy: "目は開いたよ。ほかはまだ読み込み中。",
      cheerful: "じゃあ、これがもう僕らの集合写真ってこと？",
    },
    titles: { coffee: "こぼれたコーヒー事件", sticker: "消えた星のシール事件" },
    coffeeContext: (lamp) => `誰かが机にコーヒーをこぼしました。その時、「${lamp}」の明かりはついていたか、消えていたかのどちらかです。この事件と過去の状況はフィクションです。今の写真の明るさは手がかりではありません。`,
    stickerContext: "鐘が鳴った瞬間、招待状の星のシールが消えました。鐘は真夜中の前か後に、一度だけ鳴りました。小道具と過去の出来事はフィクションで、今の写真は手がかりではありません。",
    confessions: {
      sticker: "星を一つくらいもらってもいいと思って。自分で自分を表彰したんだ。",
      cup: "あふれたのはコーヒーだけじゃなかった。自信もね。",
      coffee: "机にもコーヒーが一杯必要かなって思ったんだ。",
    },
    sampleNames: ["マグカップ", "ランプ", "キーボード"],
  },
  zh: {
    openings: {
      cup: "终于有嘴了。用杯把打招呼实在太难了。",
      lamp: "气氛由我照亮，谜团就交给你了。",
      electronics: "终于轮到我说话了。平时都是别人往我这儿输入。",
      book: "剧情反转！这回居然发生在书外面。",
      plant: "给我一点时间。我向来是慢慢长大的。",
      toy: "抱抱等会儿再说。我正在接受采访。",
      other: "现在有眼睛了。不会还得看邮件吧？",
    },
    personalities: {
      dry: "有了嘴，不代表我就得开个播客。",
      dramatic: "这灯光，这寂静……多么完美的登场。",
      sleepy: "眼睛是睁开了。其他部分还在加载。",
      cheerful: "所以这已经是我们的合照了，对吧？",
    },
    titles: { coffee: "咖啡打翻事件", sticker: "星星贴纸失踪事件" },
    coffeeContext: (lamp) => `有人把咖啡洒在了书桌上。当时，“${lamp}”的灯要么开着，要么关着。这起事件及当时的情况均属虚构。现在照片的明暗不是线索。`,
    stickerContext: "钟声响起时，邀请函上的星星贴纸消失了。钟只响过一次，要么在午夜前，要么在午夜后。道具和过去的事件均属虚构；现在的照片不是线索。",
    confessions: {
      sticker: "我觉得自己值得一颗星。这算是自己给自己颁奖吧。",
      cup: "溢出来的不只是咖啡，还有我的自信。",
      coffee: "我以为书桌也需要来杯咖啡。",
    },
    sampleNames: ["马克杯", "台灯", "键盘"],
  },
  ar: {
    openings: {
      cup: "أخيرًا صار لي فم. التلويح بالمقبض لم يكن فكرة ناجحة.",
      lamp: "سأضيء الأجواء. حلّ اللغز متروك لك.",
      electronics: "أخيرًا جاء دوري في الكلام. عادةً لا أتلقى إلا المدخلات.",
      book: "يا لها من حبكة مفاجئة! وهذه المرة تحدث خارج صفحاتي.",
      plant: "أمهلني لحظة. أنا معتاد على النمو ببطء.",
      toy: "الأحضان لاحقًا. أنا أجري مقابلة الآن.",
      other: "صارت لي عينان. هل عليّ قراءة البريد الإلكتروني أيضًا؟",
    },
    personalities: {
      dry: "امتلاكي فمًا لا يعني أن عليّ إطلاق بودكاست.",
      dramatic: "الإضاءة. الصمت. يا له من ظهور مسرحي.",
      sleepy: "عيناي مفتوحتان. أما الباقي فما زال قيد التحميل.",
      cheerful: "إذًا، هل هذه صورتنا الجماعية بالفعل؟",
    },
    titles: { coffee: "قضية القهوة المسكوبة", sticker: "قضية ملصق النجمة المفقود" },
    coffeeContext: (lamp) => `سكب أحدهم القهوة على المكتب. في تلك اللحظة، كان ضوء «${lamp}» إما مضاءً أو مطفأً. هذه الحادثة وظروفها الماضية خيالية. سطوع الصورة الحالية ليس دليلًا.`,
    stickerContext: "اختفى ملصق نجمة من بطاقة دعوة عند رنين جرس. رنّ الجرس مرة واحدة، إما قبل منتصف الليل أو بعده. هذه الأدوات والأحداث الماضية خيالية؛ الصورة الحالية ليست دليلًا.",
    confessions: {
      sticker: "ظننت أنني أستحق نجمة. كانت جائزة منحتها لنفسي.",
      cup: "لم تكن القهوة وحدها ما فاض. ثقتي بنفسي فاضت أيضًا.",
      coffee: "ظننت أن المكتب يحتاج إلى كوب قهوة أيضًا.",
    },
    sampleNames: ["كوب", "مصباح", "لوحة مفاتيح"],
  },
  hi: {
    openings: {
      cup: "आख़िर मुझे मुँह मिल ही गया। हैंडल हिलाकर नमस्ते करना मुश्किल था।",
      lamp: "माहौल मैं रोशन करूँगा। रहस्य तुम सुलझाओ।",
      electronics: "आख़िर बोलने की बारी मिली। आम तौर पर तो बस इनपुट मिलता है।",
      book: "कहानी में नया मोड़! और इस बार मेरी किताब के बाहर।",
      plant: "मुझे थोड़ा समय दो। मुझे धीरे-धीरे बढ़ने की आदत है।",
      toy: "गले बाद में लगाना। अभी मेरा इंटरव्यू चल रहा है।",
      other: "अब आँखें आ गई हैं। क्या ईमेल भी पढ़ने पड़ेंगे?",
    },
    personalities: {
      dry: "मुँह मिल गया तो क्या हुआ, पॉडकास्ट शुरू करना ज़रूरी नहीं है।",
      dramatic: "यह रोशनी। यह ख़ामोशी। क्या शानदार एंट्री है।",
      sleepy: "आँखें खुल गई हैं। बाकी सब अभी लोड हो रहा है।",
      cheerful: "तो क्या यह हमारी ग्रुप फ़ोटो पहले ही बन चुकी है?",
    },
    titles: { coffee: "गिरी हुई कॉफ़ी का मामला", sticker: "गायब सितारे वाले स्टिकर का मामला" },
    coffeeContext: (lamp) => `किसी ने मेज़ पर कॉफ़ी गिरा दी। उस समय “${lamp}” की बत्ती या तो जल रही थी या बंद थी। यह घटना और उस समय की परिस्थितियाँ काल्पनिक हैं। अभी की तस्वीर की रोशनी कोई सुराग नहीं है।`,
    stickerContext: "घंटी बजते ही निमंत्रण पत्र से सितारे वाला स्टिकर गायब हो गया। घंटी सिर्फ़ एक बार बजी, या तो आधी रात से पहले या उसके बाद। ये वस्तुएँ और पिछली घटनाएँ काल्पनिक हैं; अभी की तस्वीर कोई सुराग नहीं है।",
    confessions: {
      sticker: "मुझे लगा मैं एक सितारे का हक़दार हूँ। बस ख़ुद को ही इनाम दे दिया।",
      cup: "सिर्फ़ कॉफ़ी ही नहीं छलकी थी। मेरा आत्मविश्वास भी छलक रहा था।",
      coffee: "मुझे लगा मेज़ को भी एक कप कॉफ़ी चाहिए होगी।",
    },
    sampleNames: ["मग", "लैंप", "कीबोर्ड"],
  },
};
