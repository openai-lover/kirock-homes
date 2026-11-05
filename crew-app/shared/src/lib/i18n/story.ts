import type { Locale } from './locales';

type Panel = { title: string; narration: string; speaker: string; line: string; image: string };
type StoryCopy = {
  button: string; title: string; close: string; previous: string; next: string;
  pages: readonly [Panel, Panel, Panel, Panel];
};

// Introductory fiction only. This copy is never evidence or a case snapshot.
const stories: Record<Locale, StoryCopy> = {
  en: {
    button: 'Story', title: 'The biscuit incident', close: 'Close story', previous: 'Back', next: 'Next panel',
    pages: [
      { title: 'A very small crime.', narration: 'Midnight. One biscuit missing. Three objects suddenly very awake.', speaker: 'The cup', line: 'Before you ask, I only handle drinks.', image: 'A cup, lamp and keyboard discover an empty biscuit plate on a moonlit desk.' },
      { title: 'Objection! And another objection.', narration: 'The cup protests. The keyboard would like to file a complaint about the protesting.', speaker: 'The keyboard', line: 'Can we press Undo on this evening?', image: 'The cup gestures dramatically, the keyboard looks unimpressed and the lamp leans into their argument.' },
      { title: 'Enter Kirock.', narration: 'Hear three official statements. Only the culprit’s is false. Question them and compare their replies.', speaker: 'Kirock', line: 'Less finger-pointing. More evidence.', image: 'Kirock, a little ghost detective in a deerstalker, arrives with his magnifying glass.' },
      { title: 'Your room is next.', narration: 'Try the sample, or add a photo and choose three objects. Listen, question, then accuse once.', speaker: 'The cup', line: 'Must we call it a mugshot?', image: 'Kirock offers a magnifying glass beside a phone showing a room with three talking objects.' },
    ],
  },
  ko: {
    button: '스토리', title: '비스킷 실종 사건', close: '스토리 닫기', previous: '이전', next: '다음 컷',
    pages: [
      { title: '아주 작은 범죄.', narration: '자정. 비스킷 하나가 사라졌다. 물건 셋이 갑자기 눈을 떴다.', speaker: '컵', line: '미리 말하는데, 전 음료 담당이에요.', image: '달빛이 비치는 책상에서 컵, 스탠드, 키보드가 빈 비스킷 접시를 발견한다.' },
      { title: '이의 있어요! 저도요!', narration: '컵은 항의했다. 키보드는 그 항의에 항의하고 싶어졌다.', speaker: '키보드', line: '오늘 밤도 실행 취소가 되나요?', image: '컵은 과장되게 손짓하고 키보드는 시큰둥하다. 스탠드가 둘의 말다툼에 끼어든다.' },
      { title: '그때, 킬록 등장.', narration: '공식 증언은 세 개. 범인의 증언만 거짓이다. 반론을 듣고 서로 비교해 보자.', speaker: '킬록', line: '손가락질은 그만. 증거를 봅시다.', image: '탐정 모자를 쓴 작은 유령 킬록이 돋보기를 들고 등장한다.' },
      { title: '다음 현장은 당신의 방.', narration: '샘플로 시작하거나 사진에서 물건 셋을 고르세요. 듣고, 질문하고, 딱 한 번 지목!', speaker: '컵', line: '제 얼굴은 손잡이 쪽이 잘 나와요.', image: '킬록이 돋보기를 건넨다. 옆의 휴대폰에는 말하는 물건 세 개가 있는 방 사진이 보인다.' },
    ],
  },
  es: {
    button: 'Historia', title: 'El caso de la galleta', close: 'Cerrar historia', previous: 'Atrás', next: 'Siguiente viñeta',
    pages: [
      { title: 'Un crimen diminuto.', narration: 'Medianoche. Falta una galleta. Tres objetos se despiertan de golpe.', speaker: 'La taza', line: 'Antes de que preguntes: solo me ocupo de las bebidas.', image: 'Una taza, una lámpara y un teclado descubren un plato de galletas vacío bajo la luz de la luna.' },
      { title: '¡Protesto! ¡Y yo también!', narration: 'La taza protesta. El teclado quiere presentar una queja por tantas protestas.', speaker: 'El teclado', line: '¿Podemos deshacer esta noche?', image: 'La taza gesticula, el teclado no se inmuta y la lámpara se acerca a la discusión.' },
      { title: 'Entra Kirock.', narration: 'Escucha tres declaraciones oficiales. Solo la del culpable es falsa. Interroga y compara las respuestas.', speaker: 'Kirock', line: 'Menos acusaciones. Más pruebas.', image: 'Kirock, un pequeño detective fantasma con gorra, aparece con su lupa.' },
      { title: 'Tu habitación será la próxima.', narration: 'Prueba el ejemplo o sube una foto y elige tres objetos. Escucha, interroga y acusa una sola vez.', speaker: 'La taza', line: 'Para la foto, mi lado bueno es el del asa.', image: 'Kirock ofrece una lupa junto a un móvil con una foto de una habitación y tres objetos que hablan.' },
    ],
  },
  fr: {
    button: 'Histoire', title: 'L’affaire du biscuit', close: 'Fermer l’histoire', previous: 'Retour', next: 'Case suivante',
    pages: [
      { title: 'Un tout petit crime.', narration: 'Minuit. Un biscuit a disparu. Trois objets se réveillent en sursaut.', speaker: 'La tasse', line: 'Je précise : je ne m’occupe que des boissons.', image: 'Une tasse, une lampe et un clavier découvrent une assiette à biscuits vide au clair de lune.' },
      { title: 'Objection ! Moi aussi !', narration: 'La tasse proteste. Le clavier veut porter plainte contre toutes ces protestations.', speaker: 'Le clavier', line: 'On peut annuler cette soirée ?', image: 'La tasse gesticule, le clavier reste blasé et la lampe se penche sur leur dispute.' },
      { title: 'Kirock entre en scène.', narration: 'Écoutez trois dépositions officielles. Seule celle du coupable est fausse. Interrogez et comparez les réponses.', speaker: 'Kirock', line: 'Moins d’accusations. Plus de preuves.', image: 'Kirock, petit détective fantôme coiffé d’une casquette, arrive avec sa loupe.' },
      { title: 'La prochaine scène, chez vous.', narration: 'Essayez l’exemple ou ajoutez une photo et choisissez trois objets. Écoutez, interrogez, puis accusez une seule fois.', speaker: 'La tasse', line: 'Pour la photo, mon meilleur profil est côté anse.', image: 'Kirock tend une loupe près d’un téléphone montrant une pièce avec trois objets qui parlent.' },
    ],
  },
  de: {
    button: 'Geschichte', title: 'Der Keksfall', close: 'Geschichte schließen', previous: 'Zurück', next: 'Nächstes Bild',
    pages: [
      { title: 'Ein winziges Verbrechen.', narration: 'Mitternacht. Ein Keks fehlt. Drei Gegenstände sind plötzlich hellwach.', speaker: 'Die Tasse', line: 'Bevor jemand fragt: Ich bin nur für Getränke zuständig.', image: 'Tasse, Lampe und Tastatur entdecken im Mondlicht einen leeren Keksteller.' },
      { title: 'Einspruch! Von mir auch!', narration: 'Die Tasse protestiert. Die Tastatur möchte sich über das Protestieren beschweren.', speaker: 'Die Tastatur', line: 'Können wir diesen Abend rückgängig machen?', image: 'Die Tasse gestikuliert, die Tastatur bleibt unbeeindruckt und die Lampe beugt sich zum Streit.' },
      { title: 'Auftritt Kirock.', narration: 'Höre drei offizielle Aussagen. Nur die des Täters ist falsch. Stelle Fragen und vergleiche die Antworten.', speaker: 'Kirock', line: 'Weniger Anschuldigungen. Mehr Beweise.', image: 'Der kleine Geisterdetektiv Kirock erscheint mit Detektivmütze und Lupe.' },
      { title: 'Dein Zimmer ist als Nächstes dran.', narration: 'Teste das Beispiel oder lade ein Foto hoch und wähle drei Dinge. Zuhören, nachfragen, einmal beschuldigen.', speaker: 'Die Tasse', line: 'Meine Schokoladenseite ist die mit dem Henkel.', image: 'Kirock reicht eine Lupe neben einem Handy mit einem Zimmerfoto und drei sprechenden Gegenständen.' },
    ],
  },
  pt: {
    button: 'História', title: 'O caso do biscoito', close: 'Fechar história', previous: 'Voltar', next: 'Próximo quadrinho',
    pages: [
      { title: 'Um crime bem pequeno.', narration: 'Meia-noite. Um biscoito sumiu. Três objetos acordaram de repente.', speaker: 'A caneca', line: 'Antes que perguntem: eu só cuido das bebidas.', image: 'Uma caneca, uma luminária e um teclado encontram um prato de biscoitos vazio ao luar.' },
      { title: 'Eu protesto! Eu também!', narration: 'A caneca protesta. O teclado quer registrar uma reclamação sobre tantos protestos.', speaker: 'O teclado', line: 'Dá para desfazer esta noite?', image: 'A caneca gesticula, o teclado não se impressiona e a luminária se inclina para a discussão.' },
      { title: 'Kirock entra em cena.', narration: 'Ouça três depoimentos oficiais. Só o do culpado é falso. Faça perguntas e compare as respostas.', speaker: 'Kirock', line: 'Menos acusações. Mais provas.', image: 'Kirock, um pequeno detetive fantasma de boné, aparece com sua lupa.' },
      { title: 'O próximo cenário é o seu quarto.', narration: 'Teste o exemplo ou envie uma foto e escolha três objetos. Ouça, questione e acuse uma única vez.', speaker: 'A caneca', line: 'Meu melhor ângulo é o lado da alça.', image: 'Kirock oferece uma lupa ao lado de um celular com a foto de um quarto e três objetos falantes.' },
    ],
  },
  ja: {
    button: 'ストーリー', title: '消えたビスケット事件', close: 'ストーリーを閉じる', previous: '戻る', next: '次のコマ',
    pages: [
      { title: 'とても小さな犯罪。', narration: '真夜中。ビスケットがひとつ消えた。3つの物が突然目を覚ました。', speaker: 'カップ', line: '先に言っておきますが、私は飲み物担当です。', image: '月明かりの机でカップ、ランプ、キーボードが空のビスケット皿を見つける。' },
      { title: '異議あり！こっちも！', narration: 'カップが抗議した。キーボードは、その抗議に抗議したくなった。', speaker: 'キーボード', line: '今夜を「元に戻す」ことはできますか？', image: 'カップは大げさに身振りをし、キーボードは冷めた顔。ランプが言い争いに近づく。' },
      { title: 'キロック登場。', narration: '公式証言は3つ。犯人の証言だけが嘘。質問し、返答を比べてみよう。', speaker: 'キロック', line: '指差すより、証拠を見よう。', image: '探偵帽をかぶった小さなおばけ探偵キロックが虫眼鏡を持って現れる。' },
      { title: '次の現場は、あなたの部屋。', narration: 'サンプルで遊ぶか、写真から3つの物を選ぼう。聞いて、質問して、指名は一度だけ。', speaker: 'カップ', line: '写真は取っ手のある側からお願いします。', image: 'キロックが虫眼鏡を差し出す。隣のスマートフォンには3つの物が話す部屋の写真。' },
    ],
  },
  zh: {
    button: '故事', title: '饼干失踪案', close: '关闭故事', previous: '上一格', next: '下一格',
    pages: [
      { title: '一桩小小的罪案。', narration: '午夜。一块饼干不见了。三个物件突然睁开了眼。', speaker: '杯子', line: '先声明，我只负责饮料。', image: '月光下的书桌上，杯子、台灯和键盘发现饼干盘空了。' },
      { title: '我反对！我也反对！', narration: '杯子提出抗议。键盘想对这份抗议提出抗议。', speaker: '键盘', line: '今晚能不能按一下撤销？', image: '杯子夸张地比画着，键盘一脸淡定，台灯凑近这场争论。' },
      { title: '基洛克登场。', narration: '听取三份正式证词，只有犯人的那份是假的。追问，再对照他们的回答。', speaker: '基洛克', line: '少点指责，多看证据。', image: '戴猎鹿帽的小幽灵侦探基洛克拿着放大镜登场。' },
      { title: '下一个现场：你的房间。', narration: '试玩样例，或上传照片选出三个物件。听证词、提问题，最后只能指认一次。', speaker: '杯子', line: '拍照请拍有把手的那一侧。', image: '基洛克递出放大镜。旁边手机上的房间照片里有三个会说话的物件。' },
    ],
  },
  ar: {
    button: 'القصة', title: 'قضية البسكويت', close: 'إغلاق القصة', previous: 'السابق', next: 'المشهد التالي',
    pages: [
      { title: 'جريمة صغيرة جدًا.', narration: 'منتصف الليل. اختفت قطعة بسكويت. واستيقظت ثلاثة أغراض فجأة.', speaker: 'الكوب', line: 'قبل أن تسألوا: أنا مسؤول عن المشروبات فقط.', image: 'كوب ومصباح ولوحة مفاتيح يكتشفون طبق بسكويت فارغًا على مكتب مضاء بالقمر.' },
      { title: 'أعترض! وأنا أيضًا!', narration: 'احتجّ الكوب. وأرادت لوحة المفاتيح تقديم شكوى بشأن هذه الاحتجاجات.', speaker: 'لوحة المفاتيح', line: 'هل يمكننا التراجع عن هذه الليلة؟', image: 'الكوب يلوّح باحتجاج ولوحة المفاتيح غير منبهرة والمصباح يميل نحو الجدال.' },
      { title: 'يدخل كيروك.', narration: 'استمع إلى ثلاث إفادات رسمية. إفادة المذنب وحدها كاذبة. اطرح الأسئلة وقارن الإجابات.', speaker: 'كيروك', line: 'اتهامات أقل. أدلة أكثر.', image: 'كيروك، المحقق الشبح الصغير، يظهر بقبعة التحري وعدسته المكبرة.' },
      { title: 'المشهد التالي في غرفتك.', narration: 'جرّب المثال أو أضف صورة واختر ثلاثة أغراض. استمع واسأل ثم اتهم مرة واحدة فقط.', speaker: 'الكوب', line: 'عند التصوير، جانبي الأفضل هو جانب المقبض.', image: 'كيروك يقدم عدسة مكبرة بجوار هاتف يعرض صورة غرفة فيها ثلاثة أغراض تتكلم.' },
    ],
  },
  hi: {
    button: 'कहानी', title: 'गायब बिस्कुट का मामला', close: 'कहानी बंद करें', previous: 'पीछे', next: 'अगला चित्र',
    pages: [
      { title: 'एक छोटा-सा जुर्म।', narration: 'आधी रात। एक बिस्कुट गायब। तीन चीज़ें अचानक जाग उठीं।', speaker: 'कप', line: 'पहले ही बता दूँ, मेरा काम सिर्फ़ पेय सँभालना है।', image: 'चाँदनी में मेज़ पर कप, लैंप और कीबोर्ड को बिस्कुट की खाली प्लेट मिलती है।' },
      { title: 'मुझे एतराज़ है! मुझे भी!', narration: 'कप ने विरोध किया। कीबोर्ड उस विरोध के ख़िलाफ़ शिकायत करना चाहता था।', speaker: 'कीबोर्ड', line: 'क्या इस रात को अनडू कर सकते हैं?', image: 'कप नाटकीय ढंग से हाथ हिला रहा है, कीबोर्ड बेपरवाह है और लैंप बहस की ओर झुकता है।' },
      { title: 'किरॉक की एंट्री।', narration: 'तीन आधिकारिक बयान सुनें। सिर्फ़ दोषी का बयान झूठा है। सवाल पूछें और जवाबों की तुलना करें।', speaker: 'किरॉक', line: 'इल्ज़ाम कम। सबूत ज़्यादा।', image: 'जासूसी टोपी पहने छोटा भूत जासूस किरॉक आवर्धक काँच लेकर आता है।' },
      { title: 'अगली बारी आपके कमरे की।', narration: 'नमूना खेलें या फ़ोटो में तीन चीज़ें चुनें। सुनें, सवाल पूछें, फिर सिर्फ़ एक बार आरोप लगाएँ।', speaker: 'कप', line: 'फ़ोटो हैंडल वाली तरफ़ से लेना, वही मेरा अच्छा एंगल है।', image: 'किरॉक आवर्धक काँच आगे बढ़ाता है। पास के फ़ोन पर कमरे की तस्वीर में तीन बोलती चीज़ें हैं।' },
    ],
  },
};

export function getStoryCopy(locale: Locale): StoryCopy { return stories[locale]; }
