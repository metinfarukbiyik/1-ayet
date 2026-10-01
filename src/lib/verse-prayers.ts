import type { DailyVerse } from '@/lib/daily-verse';

export type VersePrayer = {
  prayer: string;
  theme: string;
};

// Doğrudan Kur'an-ı Kerim'de yer alan meşhur dua ayetlerine özel yakarışlar
const SPECIFIC_PRAYERS: Record<string, VersePrayer> = {
  // Fatiha Suresi
  '1:5': {
    theme: 'İbadet ve İstiane',
    prayer:
      'Allah’ım! Yalnız Sana kulluk eder, her ihtiyacımızda yalnız Senden yardım dileriz. Bizi nefsimizin ve başkalarının acizliğine bırakma. Âmin.',
  },
  '1:6': {
    theme: 'Hidayet ve Sırat-ı Müstakim',
    prayer:
      'Rabbimiz! Bizi sırât-ı müstakîme, rızana ve sevgine ulaştıran dosdoğru yola ilet; adımlarımızı bu yolda sabit kıl. Âmin.',
  },
  // Bakara Suresi
  '2:128': {
    theme: 'Teslimiyet ve Salih Nesil',
    prayer:
      'Rabbimiz! Bizi Sana teslim olmuş kimselerden eyle, neslimizden de Sana itaatkar bir ümmet var et; tevbelerimizi kabul buyur. Âmin.',
  },
  '2:201': {
    theme: 'Dünya ve Ahiret İyiliği',
    prayer:
      'Rabbimiz! Bize dünyada da iyilik ve güzellik ver, ahirette de iyilik ve güzellik ver; bizi cehennem azabından koru. Âmin.',
  },
  '2:250': {
    theme: 'Sabır ve Metanet',
    prayer:
      'Rabbimiz! Üzerimize sabır ve metanet yağdır, zorluklar karşısında ayaklarımızı sabit kıl ve hak yolunda bize zafer nasip eyle. Âmin.',
  },
  '2:255': {
    theme: 'Tevhid ve Sığınma',
    prayer:
      'Ey Hayy ve Kayyûm olan Allah’ım! Yüce kudretin hürmetine bizi, ailemizi ve sevdiklerimizi her türlü şerden, gafletten ve vesveseden muhafaza eyle. Âmin.',
  },
  '2:286': {
    theme: 'Af ve Mağfiret',
    prayer:
      'Rabbimiz! Unutur veya yanılırsak bizi sorumlu tutma. Bize gücümüzün yetmeyeceği yükü taşıtma; bizi affet, bizi bağışla, bize merhamet et. Sen bizim Mevlâmızsın. Âmin.',
  },
  // Âl-i İmrân
  '3:8': {
    theme: 'Kalp İstikameti',
    prayer:
      'Rabbimiz! Bizi doğru yola eriştirdikten sonra kalplerimizi saptırma; bize katından sonsuz bir rahmet bağışla. Şüphesiz lütfu en bol olan Sensin. Âmin.',
  },
  '3:16': {
    theme: 'İman ve Korunma',
    prayer:
      'Rabbimiz! Şüphesiz biz iman ettik; günahlarımızı bağışla ve bizi ateşin azabından koru. Âmin.',
  },
  '3:26': {
    theme: 'Kudret ve İzzet',
    prayer:
      'Ey mülkün mutlak sahibi olan Allah’ım! Dilediğine izzet, dilediğine zillet verirsin. Bütün hayırlar Senin elindedir. Bize hayır ve rızana uygun bir ömür nasip et. Âmin.',
  },
  '3:193': {
    theme: 'Hüsn-i Hatime (Güzel Son)',
    prayer:
      'Rabbimiz! Günahlarımızı bağışla, kötülüklerimizi ört ve ruhumuzu iyilerle, salihlerle birlikte huzuruna al. Âmin.',
  },
  // İbrâhîm Suresi
  '14:40': {
    theme: 'Namaz ve Salih Nesil',
    prayer:
      'Rabbim! Beni ve neslimi namazı dosdoğru kılanlardan eyle. Rabbimiz! Yakarışımızı ve dualarımızı kabul buyur. Âmin.',
  },
  '14:41': {
    theme: 'Anne-Baba ve Müminler İçin Mağfiret',
    prayer:
      'Rabbimiz! Hesabın görüleceği günde beni, ana-babamı ve bütün inananları bağışla. Âmin.',
  },
  // İsrâ Suresi
  '17:24': {
    theme: 'Anne-Babaya Merhamet',
    prayer:
      'Rabbim! Onlar beni küçükken nasıl şefkatle büyütüp yetiştirdilerse, Sen de onlara öylece merhamet et, rahmetini üzerlerinden eksik etme. Âmin.',
  },
  '17:80': {
    theme: 'Hayırlı Başlangıç ve Sonuç',
    prayer:
      'Rabbim! Gireceğim yere doğrulukla girmemi, çıkacağım yerden de doğrulukla çıkmamı nasip eyle; katından bana yardımcı bir güç ver. Âmin.',
  },
  // Kehf Suresi
  '18:10': {
    theme: 'İlahi Rahmet ve Kurtuluş',
    prayer:
      'Rabbimiz! Bize katından bir rahmet ihsan eyle ve içinde bulunduğumuz durumdan bize bir kurtuluş ve hayırlı bir çıkış yolu lütfet. Âmin.',
  },
  // Tâhâ Suresi
  '20:25': {
    theme: 'Gönül Ferahlığı',
    prayer:
      'Rabbim! Gönlüme ferahlık ver, sadrımı genişlet; işimi bana kolaylaştır, dilimdeki düğümü çöz. Âmin.',
  },
  '20:114': {
    theme: 'İlim ve İrfan',
    prayer: 'Rabbim! İlmimi, anlayışımı ve basiretimi artır. Âmin.',
  },
  // Enbiyâ Suresi
  '21:87': {
    theme: 'Yunus (a.s.) Duası & Sıkıntıdan Kurtuluş',
    prayer:
      'Senden başka hiçbir ilah yoktur; Seni her türlü eksiklikten tenzih ederim. Gerçekten ben kendi nefsine zulmedenlerden oldum. Bizi her türlü darlık ve hüzünden halas eyle. Âmin.',
  },
  '21:89': {
    theme: 'Hayırlı Nesil',
    prayer:
      'Rabbim! Beni yapayalnız bırakma; şüphesiz varislerin en hayırlısı Sensin. Âmin.',
  },
  // Mü'minûn Suresi
  '23:118': {
    theme: 'Bağışlanma ve Merhamet',
    prayer:
      'Rabbim! Bağışla ve merhamet et; Sen merhametlilerin en hayırlısısın. Âmin.',
  },
  // Furkân Suresi
  '25:74': {
    theme: 'Göz Aydınlığı Yuva ve Salih Nesil',
    prayer:
      'Rabbimiz! Bize göz aydınlığı olacak eşler ve evlatlar bahşet ve bizi takva sahiplerine rehber kıl. Âmin.',
  },
  // Neml Suresi
  '27:19': {
    theme: 'Nimete Şükür',
    prayer:
      'Rabbim! Bana ve ana-babama lütfettiğin nimetlere şükretmemi ve razı olacağın salih ameller işlememi nasip eyle; rahmetinle beni salih kullarının arasına kat. Âmin.',
  },
  // Kasas Suresi
  '28:24': {
    theme: 'Musa (a.s.) İhtiyaç Duası',
    prayer:
      'Rabbim! Doğrusu bana indireceğin her hayra ve lütfa öylesine muhtacım ki... Kapından bizi boş çevirme. Âmin.',
  },
  // Ahkâf Suresi
  '46:15': {
    theme: 'Ömür ve Nesil Bereketine Şükür',
    prayer:
      'Rabbim! Bana ve ebeveynime verdiğin nimetlerin şükrünü eda edebilmeyi, neslimi de ıslah eylemeni dilerim. Doğrusu ben Sana yöneldim ve teslim oldum. Âmin.',
  },
  // Haşr Suresi
  '59:10': {
    theme: "Kardeşlik ve Kin'den Arınma",
    prayer:
      'Rabbimiz! Bizi ve bizden önce iman etmiş kardeşlerimizi bağışla; kalplerimizde iman edenlere karşı hiçbir kin ve haset bırakma. Şüphesiz Sen çok şefkatlisin, çok merhametlisin. Âmin.',
  },
};

/**
 * Ayetin içeriğine ve temasına göre derinlikli, kalbe dokunan tefekkür duasını belirler.
 */
export function getPrayerForVerse(verse: DailyVerse): VersePrayer {
  const key = `${verse.surahNumber}:${verse.ayahNumber}`;

  // 1. Doğrudan özel dua ayetlerinden biri mi?
  if (SPECIFIC_PRAYERS[key]) {
    return SPECIFIC_PRAYERS[key];
  }

  const text = verse.meaning.toLowerCase();

  // 2. Af, bağışlanma, tevbe teması
  if (
    text.includes('bağışla') ||
    text.includes('tövbe') ||
    text.includes('tevbe') ||
    text.includes('günah') ||
    text.includes('merhamet') ||
    text.includes('gafûr') ||
    text.includes('rahîm')
  ) {
    return {
      theme: 'Mağfiret & İltica',
      prayer:
        'Allah’ım! Hata ve kusurlarımızı sonsuz merhametinle bağışla. Kalbimizi günahtan arındır, tevbesi kabul olunan ve rızana eren kullarından eyle. Âmin.',
    };
  }

  // 3. Sabır, zorluk ve imtihan teması
  if (
    text.includes('sabır') ||
    text.includes('sabred') ||
    text.includes('zorluk') ||
    text.includes('imtihan') ||
    text.includes('tasa') ||
    text.includes('hüzün')
  ) {
    return {
      theme: 'Sabır & Metanet',
      prayer:
        'Rabbimiz! Hayatın getirdiği tüm güçlüklerde yüreğimize inşirah ve sabır ihsan eyle. İmtihanlarımızı hayra tebdil et, Sana olan tevekkülümüzü sarsılmaz kıl. Âmin.',
    };
  }

  // 4. Şükür, rızık ve nimet teması
  if (
    text.includes('nimet') ||
    text.includes('şükür') ||
    text.includes('şükred') ||
    text.includes('rızık') ||
    text.includes('lütuf') ||
    text.includes('kazan')
  ) {
    return {
      theme: 'Şükür & Bereket',
      prayer:
        'Allah’ım! Bize lütfettiğin maddi ve manevi her nimet için Sana hamdolsun. Kazancımızı helal ve bereketli kıl, bizi şükrünü eda edebilenlerden eyle. Âmin.',
    };
  }

  // 5. İlim, akıl, tefekkür ve hikmet teması
  if (
    text.includes('akıl') ||
    text.includes('ilim') ||
    text.includes('bilgi') ||
    text.includes('düşün') ||
    text.includes('öğüt') ||
    text.includes('ibret')
  ) {
    return {
      theme: 'Basiret & Tefekkür',
      prayer:
        'Rabbim! Bize hakkı hak bilip ona uymayı, batılı batıl bilip ondan sakınmayı nasip et. Basiretimizi ve idrakimizi ilminle nurlandır. Âmin.',
    };
  }

  // 6. Ahiret, cennet, cehennem ve hesap günü
  if (
    text.includes('ahiret') ||
    text.includes('cennet') ||
    text.includes('cehennem') ||
    text.includes('kıyamet') ||
    text.includes('hesap') ||
    text.includes('ölüm')
  ) {
    return {
      theme: 'Ebedi Kurtuluş & Havf-Reca',
      prayer:
        'Rabbimiz! Bizi dünyada salih amellerle yaşat, emanetini son nefeste hüsn-i hatime ile teslim edebilmeyi ve hesap gününde yüzü ak çıkanlardan olmayı lütfeyle. Âmin.',
    };
  }

  // 7. İman, takva ve kulluk teması
  if (
    text.includes('iman') ||
    text.includes('mümin') ||
    text.includes('takva') ||
    text.includes('namaz') ||
    text.includes('ibadet') ||
    text.includes('zikir')
  ) {
    return {
      theme: 'Halis İbadet & Takva',
      prayer:
        'Allah’ım! Sana layık kul, Habibine (s.a.v.) layık ümmet olabilmeyi bizlere nasip eyle. İbadetlerimizi samimiyet ve ihlasla taçlandır. Âmin.',
    };
  }

  // 8. İyilik, infak, adalet ve güzel ahlak
  if (
    text.includes('adalet') ||
    text.includes('infak') ||
    text.includes('iyilik') ||
    text.includes('ihsan') ||
    text.includes('yetim') ||
    text.includes('fakir') ||
    text.includes('hayır')
  ) {
    return {
      theme: 'İhsan & Güzel Ahlak',
      prayer:
        'Rabbimiz! Gönlümüzü cimrilik ve bencillikten uzak tut. Bizi insanlara faydalı olan, hakkı gözeten ve güzel ahlakıyla örnek olanlardan eyle. Âmin.',
    };
  }

  // 9. Genel Kur'an Rehberliği ve Huzur
  return {
    theme: 'Huzur & İlahi Rehberlik',
    prayer:
      `Rabbimiz! ${verse.surahName} Suresi’nin bu ayetinde bildirdiğin hakikatleri kalbimize nakşeyle. Kelamını ömrümüze rehber kıl ve bizi her iki cihanda da selamete erdir. Âmin.`,
  };
}
