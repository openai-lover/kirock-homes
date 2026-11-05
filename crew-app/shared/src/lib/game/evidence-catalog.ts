import type { Locale } from './types';

/** Authored evidence templates. Every pair is ordered false, true. */
type Pair = readonly [string, string];
type EvidenceText = {
  coffeeAccusation: string; stickerAccusation: string;
  coffeeSelf: Pair; coffeeOther: Pair; bellClaim: Pair;
  coffeeFact: Pair; bellFact: Pair; coffeeLabels: Pair; bellLabels: Pair;
  proof: readonly [string, string, string];
};

/** Single-pass substitution: a player's name is data, never another template. */
export function fill(template: string, values: Readonly<Record<string, string>>): string {
  return template.replace(/\{([a-z]+)\}/g, (_, key: string) => {
    if (!(key in values)) throw new Error(`Missing authored text value: ${key}`);
    return values[key];
  });
}

export const EVIDENCE_TEXT: Record<Locale, EvidenceText> = {
  en: {
    coffeeAccusation: '“{target}” spilled the coffee.', stickerAccusation: '“{target}” removed the star sticker.',
    coffeeSelf: ['When the coffee spilled, I was off.', 'When the coffee spilled, I was on.'],
    coffeeOther: ['When the coffee spilled, “{target}” was off.', 'When the coffee spilled, “{target}” was on.'],
    bellClaim: ['The bell rang before midnight.', 'The bell rang after midnight.'],
    coffeeFact: ['At the time, “{target}” was off.', 'At the time, “{target}” was on.'],
    bellFact: ['The bell rang before midnight.', 'The bell rang after midnight.'],
    coffeeLabels: ['{target} was off', '{target} was on'], bellLabels: ['Bell before midnight', 'Bell after midnight'],
    proof: ['“{first}” and “{second}” make opposite claims about the same fact, so exactly one of them is false.', 'Only one statement is false, so “{third}” tells the truth and identifies “{culprit}” as the culprit.', 'Therefore “{culprit}” is guilty. The culprit\'s statement about the event is false. {fact}'],
  },
  ko: {
    coffeeAccusation: '커피를 쏟은 범인은 ‘{target}’야.', stickerAccusation: '별 스티커를 뗀 범인은 ‘{target}’야.',
    coffeeSelf: ['커피가 쏟아질 때 나는 꺼져 있었어.', '커피가 쏟아질 때 나는 켜져 있었어.'],
    coffeeOther: ['커피가 쏟아질 때 ‘{target}’의 불은 꺼져 있었어.', '커피가 쏟아질 때 ‘{target}’의 불은 켜져 있었어.'],
    bellClaim: ['종이 울린 건 자정 전였어.', '종이 울린 건 자정 후였어.'],
    coffeeFact: ['당시 ‘{target}’의 불은 꺼져 있었어요.', '당시 ‘{target}’의 불은 켜져 있었어요.'],
    bellFact: ['종은 자정 전에 울렸어요.', '종은 자정 후에 울렸어요.'],
    coffeeLabels: ['{target}의 불이 꺼져 있음', '{target}의 불이 켜져 있음'], bellLabels: ['종이 자정 전에 울림', '종이 자정 후에 울림'],
    proof: ['‘{first}’와 ‘{second}’의 말은 같은 사실에 대한 반대 주장이라, 둘 중 정확히 하나가 거짓이에요.', '거짓 증언은 하나뿐이므로 ‘{third}’의 말은 참이에요. 그 증언이 ‘{culprit}’를 범인으로 지목해요.', '따라서 범인은 ‘{culprit}’예요. 범인의 상태 증언이 거짓이므로 {fact}'],
  },
  es: {
    coffeeAccusation: '“{target}” derramó el café.', stickerAccusation: '“{target}” quitó la pegatina de estrella.',
    coffeeSelf: ['Cuando se derramó el café, mi luz estaba apagada.', 'Cuando se derramó el café, mi luz estaba encendida.'],
    coffeeOther: ['Cuando se derramó el café, la luz de “{target}” estaba apagada.', 'Cuando se derramó el café, la luz de “{target}” estaba encendida.'],
    bellClaim: ['La campana sonó antes de medianoche.', 'La campana sonó después de medianoche.'],
    coffeeFact: ['En ese momento, la luz de “{target}” estaba apagada.', 'En ese momento, la luz de “{target}” estaba encendida.'],
    bellFact: ['La campana sonó antes de medianoche.', 'La campana sonó después de medianoche.'],
    coffeeLabels: ['Luz de {target} apagada', 'Luz de {target} encendida'], bellLabels: ['Campana antes de medianoche', 'Campana después de medianoche'],
    proof: ['“{first}” y “{second}” hacen afirmaciones opuestas sobre el mismo hecho; exactamente una es falsa.', 'Solo un testimonio es falso, así que “{third}” dice la verdad e identifica a “{culprit}” como responsable.', 'Por tanto, “{culprit}” es responsable. Su afirmación sobre el estado del suceso es falsa. {fact}'],
  },
  fr: {
    coffeeAccusation: '« {target} » a renversé le café.', stickerAccusation: '« {target} » a retiré l’autocollant étoile.',
    coffeeSelf: ['Quand le café a été renversé, ma lumière était éteinte.', 'Quand le café a été renversé, ma lumière était allumée.'],
    coffeeOther: ['Quand le café a été renversé, la lumière de « {target} » était éteinte.', 'Quand le café a été renversé, la lumière de « {target} » était allumée.'],
    bellClaim: ['La cloche a sonné avant minuit.', 'La cloche a sonné après minuit.'],
    coffeeFact: ['À ce moment-là, la lumière de « {target} » était éteinte.', 'À ce moment-là, la lumière de « {target} » était allumée.'],
    bellFact: ['La cloche a sonné avant minuit.', 'La cloche a sonné après minuit.'],
    coffeeLabels: ['Lumière de {target} éteinte', 'Lumière de {target} allumée'], bellLabels: ['Cloche avant minuit', 'Cloche après minuit'],
    proof: ['« {first} » et « {second} » affirment deux choses opposées sur le même fait : exactement une est fausse.', 'Un seul témoignage est faux. « {third} » dit donc la vérité et désigne « {culprit} » comme coupable.', 'Le coupable est donc « {culprit} ». Son affirmation sur l’état lors de l’événement est fausse. {fact}'],
  },
  de: {
    coffeeAccusation: '„{target}“ hat den Kaffee verschüttet.', stickerAccusation: '„{target}“ hat den Sternaufkleber entfernt.',
    coffeeSelf: ['Als der Kaffee verschüttet wurde, war mein Licht aus.', 'Als der Kaffee verschüttet wurde, war mein Licht an.'],
    coffeeOther: ['Als der Kaffee verschüttet wurde, war das Licht von „{target}“ aus.', 'Als der Kaffee verschüttet wurde, war das Licht von „{target}“ an.'],
    bellClaim: ['Die Glocke läutete vor Mitternacht.', 'Die Glocke läutete nach Mitternacht.'],
    coffeeFact: ['Zu diesem Zeitpunkt war das Licht von „{target}“ aus.', 'Zu diesem Zeitpunkt war das Licht von „{target}“ an.'],
    bellFact: ['Die Glocke läutete vor Mitternacht.', 'Die Glocke läutete nach Mitternacht.'],
    coffeeLabels: ['Licht von {target} aus', 'Licht von {target} an'], bellLabels: ['Glocke vor Mitternacht', 'Glocke nach Mitternacht'],
    proof: ['„{first}“ und „{second}“ behaupten Gegensätzliches über dieselbe Tatsache. Genau eine der Aussagen ist also falsch.', 'Nur eine Aussage ist falsch. Daher sagt „{third}“ die Wahrheit und nennt „{culprit}“ als schuldigen Gegenstand.', 'Also ist „{culprit}“ schuldig. Die Aussage dieses Gegenstands über den Zustand beim Ereignis ist falsch. {fact}'],
  },
  pt: {
    coffeeAccusation: '“{target}” derramou o café.', stickerAccusation: '“{target}” tirou o adesivo de estrela.',
    coffeeSelf: ['Quando o café foi derramado, minha luz estava apagada.', 'Quando o café foi derramado, minha luz estava acesa.'],
    coffeeOther: ['Quando o café foi derramado, a luz de “{target}” estava apagada.', 'Quando o café foi derramado, a luz de “{target}” estava acesa.'],
    bellClaim: ['O sino tocou antes da meia-noite.', 'O sino tocou depois da meia-noite.'],
    coffeeFact: ['Naquele momento, a luz de “{target}” estava apagada.', 'Naquele momento, a luz de “{target}” estava acesa.'],
    bellFact: ['O sino tocou antes da meia-noite.', 'O sino tocou depois da meia-noite.'],
    coffeeLabels: ['Luz de {target} apagada', 'Luz de {target} acesa'], bellLabels: ['Sino antes da meia-noite', 'Sino depois da meia-noite'],
    proof: ['“{first}” e “{second}” fazem afirmações opostas sobre o mesmo fato. Exatamente uma delas é falsa.', 'Só um depoimento é falso. Portanto, “{third}” diz a verdade e aponta “{culprit}” como responsável.', 'Logo, “{culprit}” é responsável. Sua afirmação sobre o estado no momento do evento é falsa. {fact}'],
  },
  ja: {
    coffeeAccusation: 'コーヒーをこぼしたのは「{target}」だよ。', stickerAccusation: '星のシールをはがしたのは「{target}」だよ。',
    coffeeSelf: ['コーヒーがこぼれたとき、私の明かりは消えていたよ。', 'コーヒーがこぼれたとき、私の明かりはついていたよ。'],
    coffeeOther: ['コーヒーがこぼれたとき、「{target}」の明かりは消えていたよ。', 'コーヒーがこぼれたとき、「{target}」の明かりはついていたよ。'],
    bellClaim: ['鐘が鳴ったのは午前0時より前だったよ。', '鐘が鳴ったのは午前0時より後だったよ。'],
    coffeeFact: ['そのとき、「{target}」の明かりは消えていました。', 'そのとき、「{target}」の明かりはついていました。'],
    bellFact: ['鐘は午前0時より前に鳴りました。', '鐘は午前0時より後に鳴りました。'],
    coffeeLabels: ['{target}の明かりが消えていた', '{target}の明かりがついていた'], bellLabels: ['鐘は午前0時より前', '鐘は午前0時より後'],
    proof: ['「{first}」と「{second}」は同じ事実について正反対のことを述べています。したがって、ちょうど一方が嘘です。', '嘘の証言は一つだけなので、「{third}」の証言は本当です。その証言は「{culprit}」を犯人に挙げています。', 'よって犯人は「{culprit}」です。犯人の事件当時の状態に関する証言は嘘なので、{fact}'],
  },
  zh: {
    coffeeAccusation: '是“{target}”打翻了咖啡。', stickerAccusation: '是“{target}”揭走了星星贴纸。',
    coffeeSelf: ['咖啡被打翻时，我的灯是关着的。', '咖啡被打翻时，我的灯是开着的。'],
    coffeeOther: ['咖啡被打翻时，“{target}”的灯是关着的。', '咖啡被打翻时，“{target}”的灯是开着的。'],
    bellClaim: ['钟是在午夜之前响的。', '钟是在午夜之后响的。'],
    coffeeFact: ['当时，“{target}”的灯是关着的。', '当时，“{target}”的灯是开着的。'],
    bellFact: ['钟是在午夜之前响的。', '钟是在午夜之后响的。'],
    coffeeLabels: ['{target}的灯关着', '{target}的灯开着'], bellLabels: ['午夜之前响钟', '午夜之后响钟'],
    proof: ['“{first}”和“{second}”对同一事实的说法完全相反，因此恰好有一句是假话。', '只有一份证词是假话，所以“{third}”说的是真话。这份证词指出“{culprit}”是犯人。', '因此，犯人是“{culprit}”。犯人对事发时状态的证词是假话。{fact}'],
  },
  ar: {
    coffeeAccusation: '«{target}» هو من سكب القهوة.', stickerAccusation: '«{target}» هو من نزع ملصق النجمة.',
    coffeeSelf: ['عندما انسكبت القهوة، كان ضوئي مطفأً.', 'عندما انسكبت القهوة، كان ضوئي مضاءً.'],
    coffeeOther: ['عندما انسكبت القهوة، كان ضوء «{target}» مطفأً.', 'عندما انسكبت القهوة، كان ضوء «{target}» مضاءً.'],
    bellClaim: ['رن الجرس قبل منتصف الليل.', 'رن الجرس بعد منتصف الليل.'],
    coffeeFact: ['في تلك اللحظة، كان ضوء «{target}» مطفأً.', 'في تلك اللحظة، كان ضوء «{target}» مضاءً.'],
    bellFact: ['رن الجرس قبل منتصف الليل.', 'رن الجرس بعد منتصف الليل.'],
    coffeeLabels: ['ضوء {target} مطفأ', 'ضوء {target} مضاء'], bellLabels: ['الجرس قبل منتصف الليل', 'الجرس بعد منتصف الليل'],
    proof: ['يقدم «{first}» و«{second}» قولين متعاكسين عن الحقيقة نفسها، لذا فإن واحدًا منهما فقط كاذب.', 'شهادة واحدة فقط كاذبة، لذا فإن شهادة «{third}» صادقة وتحدد «{culprit}» بوصفه الفاعل.', 'إذن الفاعل هو «{culprit}». شهادته عن الحالة وقت الحادث كاذبة. {fact}'],
  },
  hi: {
    coffeeAccusation: 'कॉफ़ी “{target}” ने गिराई थी।', stickerAccusation: 'तारे वाला स्टिकर “{target}” ने हटाया था।',
    coffeeSelf: ['जब कॉफ़ी गिरी, तब मेरी रोशनी बंद थी।', 'जब कॉफ़ी गिरी, तब मेरी रोशनी चालू थी।'],
    coffeeOther: ['जब कॉफ़ी गिरी, तब “{target}” की रोशनी बंद थी।', 'जब कॉफ़ी गिरी, तब “{target}” की रोशनी चालू थी।'],
    bellClaim: ['घंटी आधी रात से पहले बजी थी।', 'घंटी आधी रात के बाद बजी थी।'],
    coffeeFact: ['उस समय “{target}” की रोशनी बंद थी।', 'उस समय “{target}” की रोशनी चालू थी।'],
    bellFact: ['घंटी आधी रात से पहले बजी थी।', 'घंटी आधी रात के बाद बजी थी।'],
    coffeeLabels: ['{target} की रोशनी बंद', '{target} की रोशनी चालू'], bellLabels: ['घंटी आधी रात से पहले', 'घंटी आधी रात के बाद'],
    proof: ['“{first}” और “{second}” ने एक ही तथ्य के बारे में विपरीत बातें कही हैं, इसलिए ठीक एक बात झूठ है।', 'केवल एक बयान झूठा है, इसलिए “{third}” का बयान सच है और वह “{culprit}” को दोषी बताता है।', 'इसलिए दोषी “{culprit}” है। घटना के समय की स्थिति के बारे में उसका बयान झूठ है। {fact}'],
  },
};
