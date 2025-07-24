export interface QuranVerseData {
  surah: number;
  ayah: number;
  text: string;
  translation: string;
  juz: number;
  revelation: 'Meccan' | 'Medinan';
  category?: 'violence' | 'women' | 'trinity' | 'creation' | 'salvation' | 'contradiction';
  problematic?: boolean;
  notes?: string;
}

export const quranVerses: QuranVerseData[] = [
  // Abrogation principle
  {
    surah: 2,
    ayah: 106,
    text: "مَا نَنسَخْ مِنْ آيَةٍ أَوْ نُنسِهَا نَأْتِ بِخَيْرٍ مِّنْهَا أَوْ مِثْلِهَا",
    translation: "We do not abrogate a verse or cause it to be forgotten except that We bring forth [one] better than it or similar to it.",
    juz: 1,
    revelation: 'Medinan',
    category: 'contradiction',
    problematic: true,
    notes: 'Establishes the principle of abrogation where later verses can cancel earlier ones'
  },

  // Sword verse - violence
  {
    surah: 9,
    ayah: 5,
    text: "فَإِذَا انسَلَخَ الْأَشْهُرُ الْحُرُمُ فَاقْتُلُوا الْمُشْرِكِينَ حَيْثُ وَجَدتُّمُوهُمْ وَخُذُوهُمْ وَاحْصُرُوهُمْ وَاقْعُدُوا لَهُمْ كُلَّ مَرْصَدٍ",
    translation: "And when the sacred months have passed, then kill the polytheists wherever you find them and capture them and besiege them and sit in wait for them at every place of ambush.",
    juz: 10,
    revelation: 'Medinan',
    category: 'violence',
    problematic: true,
    notes: 'Commands killing of polytheists after sacred months'
  },

  // Jizya verse - violence
  {
    surah: 9,
    ayah: 29,
    text: "قَاتِلُوا الَّذِينَ لَا يُؤْمِنُونَ بِاللَّهِ وَلَا بِالْيَوْمِ الْآخِرِ وَلَا يُحَرِّمُونَ مَا حَرَّمَ اللَّهُ وَرَسُولُهُ وَلَا يَدِينُونَ دِينَ الْحَقِّ مِنَ الَّذِينَ أُوتُوا الْكِتَابَ حَتَّىٰ يُعْطُوا الْجِزْيَةَ عَن يَدٍ وَهُمْ صَاغِرُونَ",
    translation: "Fight those who do not believe in Allah or in the Last Day and who do not consider unlawful what Allah and His Messenger have made unlawful and who do not adopt the religion of truth from those who were given the Scripture - [fight] until they give the jizyah willingly while they are humbled.",
    juz: 10,
    revelation: 'Medinan',
    category: 'violence',
    problematic: true,
    notes: 'Commands fighting People of the Book until they pay jizya tax'
  },

  // Behead unbelievers
  {
    surah: 47,
    ayah: 4,
    text: "فَإِذَا لَقِيتُمُ الَّذِينَ كَفَرُوا فَضَرْبَ الرِّقَابِ حَتَّىٰ إِذَا أَثْخَنتُمُوهُمْ فَشُدُّوا الْوَثَاقَ",
    translation: "So when you meet those who disbelieve [in battle], strike [their] necks until, when you have inflicted slaughter upon them, then secure their bonds.",
    juz: 26,
    revelation: 'Medinan',
    category: 'violence',
    problematic: true,
    notes: 'Commands striking necks of disbelievers in battle'
  },

  // Beat wives
  {
    surah: 4,
    ayah: 34,
    text: "الرِّجَالُ قَوَّامُونَ عَلَى النِّسَاءِ بِمَا فَضَّلَ اللَّهُ بَعْضَهُمْ عَلَىٰ بَعْضٍ وَبِمَا أَنفَقُوا مِنْ أَمْوَالِهِمْ ۚ فَالصَّالِحَاتُ قَانِتَاتٌ حَافِظَاتٌ لِّلْغَيْبِ بِمَا حَفِظَ اللَّهُ ۚ وَاللَّاتِي تَخَافُونَ نُشُوزَهُنَّ فَعِظُوهُنَّ وَاهْجُرُوهُنَّ فِي الْمَضَاجِعِ وَاضْرِبُوهُنَّ",
    translation: "Men are in charge of women by [right of] what Allah has given one over the other and what they spend [for maintenance] from their wealth. So righteous women are devoutly obedient, guarding in [the husband's] absence what Allah would have them guard. But those [wives] from whom you fear arrogance - [first] advise them; [then if they persist], forsake them in bed; and [finally], strike them.",
    juz: 4,
    revelation: 'Medinan',
    category: 'women',
    problematic: true,
    notes: 'Allows husbands to beat disobedient wives'
  },

  // Polygamy
  {
    surah: 4,
    ayah: 3,
    text: "وَإِنْ خِفْتُمْ أَلَّا تُقْسِطُوا فِي الْيَتَامَىٰ فَانكِحُوا مَا طَابَ لَكُم مِّنَ النِّسَاءِ مَثْنَىٰ وَثُلَاثَ وَرُبَاعَ",
    translation: "And if you fear that you will not deal justly with the orphan girls, then marry those that please you of [other] women, two or three or four.",
    juz: 4,
    revelation: 'Medinan',
    category: 'women',
    problematic: true,
    notes: 'Allows up to four wives'
  },

  // Inheritance inequality
  {
    surah: 4,
    ayah: 11,
    text: "يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ ۖ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ",
    translation: "Allah instructs you concerning your children: for the male, what is equal to the share of two females.",
    juz: 4,
    revelation: 'Medinan',
    category: 'women',
    problematic: true,
    notes: 'Males inherit twice as much as females'
  },

  // Women as fields
  {
    surah: 2,
    ayah: 223,
    text: "نِسَاؤُكُمْ حَرْثٌ لَّكُمْ فَأْتُوا حَرْثَكُمْ أَنَّىٰ شِئْتُمْ",
    translation: "Your wives are a place of sowing of seed for you, so come to your place of cultivation however you wish.",
    juz: 2,
    revelation: 'Medinan',
    category: 'women',
    problematic: true,
    notes: 'Compares women to fields for cultivation'
  },

  // Don't take Jews/Christians as friends
  {
    surah: 5,
    ayah: 51,
    text: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَتَّخِذُوا الْيَهُودَ وَالنَّصَارَىٰ أَوْلِيَاءَ ۘ بَعْضُهُمْ أَوْلِيَاءُ بَعْضٍ",
    translation: "O you who have believed, do not take the Jews and the Christians as allies. They are [in fact] allies of one another.",
    juz: 6,
    revelation: 'Medinan',
    category: 'salvation',
    problematic: true,
    notes: 'Forbids taking Jews and Christians as allies'
  },

  // Only Islam accepted
  {
    surah: 3,
    ayah: 85,
    text: "وَمَن يَبْتَغِ غَيْرَ الْإِسْلَامِ دِينًا فَلَن يُقْبَلَ مِنْهُ وَهُوَ فِي الْآخِرَةِ مِنَ الْخَاسِرِينَ",
    translation: "And whoever desires other than Islam as religion - never will it be accepted from him, and he, in the Hereafter, will be among the losers.",
    juz: 4,
    revelation: 'Medinan',
    category: 'salvation',
    problematic: true,
    notes: 'Only Islam is accepted as religion'
  },

  // Contradicts 3:85 - Jews and Christians will be saved
  {
    surah: 2,
    ayah: 62,
    text: "إِنَّ الَّذِينَ آمَنُوا وَالَّذِينَ هَادُوا وَالنَّصَارَىٰ وَالصَّابِئِينَ مَنْ آمَنَ بِاللَّهِ وَالْيَوْمِ الْآخِرِ وَعَمِلَ صَالِحًا فَلَهُمْ أَجْرُهُمْ عِندَ رَبِّهِمْ وَلَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ",
    translation: "Indeed, those who believed and those who were Jews or Christians or Sabeans [before Prophet Muhammad] - those [among them] who believed in Allah and the Last Day and did righteousness - will have their reward with their Lord, and no fear will there be concerning them, nor will they grieve.",
    juz: 1,
    revelation: 'Medinan',
    category: 'salvation',
    problematic: true,
    notes: 'Contradicts 3:85 - says Jews and Christians will be saved'
  },

  // Trinity misunderstanding
  {
    surah: 5,
    ayah: 116,
    text: "وَإِذْ قَالَ اللَّهُ يَا عِيسَى ابْنَ مَرْيَمَ أَأَنتَ قُلْتَ لِلنَّاسِ اتَّخِذُونِي وَأُمِّيَ إِلَٰهَيْنِ مِن دُونِ اللَّهِ",
    translation: "And [beware the Day] when Allah will say, 'O Jesus, Son of Mary, did you say to the people, 'Take me and my mother as deities besides Allah?'",
    juz: 7,
    revelation: 'Medinan',
    category: 'trinity',
    problematic: true,
    notes: 'Misunderstands Christian Trinity as God, Jesus, and Mary'
  },

  // God has a son
  {
    surah: 19,
    ayah: 88,
    text: "وَقَالُوا اتَّخَذَ الرَّحْمَٰنُ وَلَدًا",
    translation: "And they say, 'The Most Merciful has taken [for Himself] a son.'",
    juz: 16,
    revelation: 'Meccan',
    category: 'trinity',
    problematic: true,
    notes: 'Condemns saying God has a son'
  },

  // God has no son
  {
    surah: 112,
    ayah: 3,
    text: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
    translation: "He neither begets nor is born.",
    juz: 30,
    revelation: 'Meccan',
    category: 'trinity',
    problematic: true,
    notes: 'Says God has no son'
  },

  // 6-day creation
  {
    surah: 7,
    ayah: 54,
    text: "إِنَّ رَبَّكُمُ اللَّهُ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ فِي سِتَّةِ أَيَّامٍ",
    translation: "Indeed, your Lord is Allah, who created the heavens and the earth in six days.",
    juz: 8,
    revelation: 'Meccan',
    category: 'creation',
    problematic: true,
    notes: 'Says creation took 6 days'
  },

  // 8-day creation
  {
    surah: 41,
    ayah: 9,
    text: "قُلْ أَئِنَّكُمْ لَتَكْفُرُونَ بِالَّذِي خَلَقَ الْأَرْضَ فِي يَوْمَيْنِ",
    translation: "Say, 'Do you indeed disbelieve in He who created the earth in two days?'",
    juz: 24,
    revelation: 'Meccan',
    category: 'creation',
    problematic: true,
    notes: 'Suggests 8-day creation (2+4+2)'
  },

  // No compulsion in religion (abrogated)
  {
    surah: 2,
    ayah: 256,
    text: "لَا إِكْرَاهَ فِي الدِّينِ",
    translation: "There shall be no compulsion in [acceptance of] the religion.",
    juz: 2,
    revelation: 'Medinan',
    category: 'contradiction',
    problematic: true,
    notes: 'Says no compulsion in religion, but abrogated by 9:5'
  },

  // Don't take Jews/Christians as friends (contradicts 2:62)
  {
    surah: 5,
    ayah: 51,
    text: "يَا أَيُّهَا الَّذِينَ آمَنُوا لَا تَتَّخِذُوا الْيَهُودَ وَالنَّصَارَىٰ أَوْلِيَاءَ ۘ بَعْضُهُمْ أَوْلِيَاءُ بَعْضٍ",
    translation: "O you who have believed, do not take the Jews and the Christians as allies. They are [in fact] allies of one another.",
    juz: 6,
    revelation: 'Medinan',
    category: 'salvation',
    problematic: true,
    notes: 'Forbids taking Jews and Christians as allies'
  },

  // Slavery allowed
  {
    surah: 4,
    ayah: 24,
    text: "وَالْمُحْصَنَاتُ مِنَ النِّسَاءِ إِلَّا مَا مَلَكَتْ أَيْمَانُكُمْ",
    translation: "And [also prohibited to you are all] married women except those your right hands possess.",
    juz: 4,
    revelation: 'Medinan',
    category: 'women',
    problematic: true,
    notes: 'Allows sexual relations with female slaves'
  },

  // Kill unbelievers wherever you find them
  {
    surah: 8,
    ayah: 12,
    text: "إِذْ يُوحِي رَبُّكَ إِلَى الْمَلَائِكَةِ أَنِّي مَعَكُمْ فَثَبِّتُوا الَّذِينَ آمَنُوا ۚ سَأُلْقِي فِي قُلُوبِ الَّذِينَ كَفَرُوا الرُّعْبَ فَاضْرِبُوا فَوْقَ الْأَعْنَاقِ وَاضْرِبُوا مِنْهُمْ كُلَّ بَنَانٍ",
    translation: "[Remember] when your Lord inspired to the angels, 'I am with you, so strengthen those who have believed. I will cast terror into the hearts of those who disbelieved, so strike [them] upon the necks and strike from them every fingertip.'",
    juz: 9,
    revelation: 'Medinan',
    category: 'violence',
    problematic: true,
    notes: 'Commands striking necks and fingertips of disbelievers'
  },

  // Fight them until there is no fitnah
  {
    surah: 8,
    ayah: 39,
    text: "وَقَاتِلُوهُمْ حَتَّىٰ لَا تَكُونَ فِتْنَةٌ وَيَكُونَ الدِّينُ كُلُّهُ لِلَّهِ",
    translation: "And fight them until there is no fitnah and [until] the religion, all of it, is for Allah.",
    juz: 9,
    revelation: 'Medinan',
    category: 'violence',
    problematic: true,
    notes: 'Commands fighting until all religion is for Allah'
  },

  // Trinity is three gods
  {
    surah: 4,
    ayah: 171,
    text: "يَا أَهْلَ الْكِتَابِ لَا تَغْلُوا فِي دِينِكُمْ وَلَا تَقُولُوا عَلَى اللَّهِ إِلَّا الْحَقَّ ۚ إِنَّمَا الْمَسِيحُ عِيسَى ابْنُ مَرْيَمَ رَسُولُ اللَّهِ وَكَلِمَتُهُ أَلْقَاهَا إِلَىٰ مَرْيَمَ وَرُوحٌ مِّنْهُ",
    translation: "O People of the Scripture, do not commit excess in your religion or say about Allah except the truth. The Messiah, Jesus, the son of Mary, was but a messenger of Allah and His word which He directed to Mary and a soul [created at a command] from Him.",
    juz: 5,
    revelation: 'Medinan',
    category: 'trinity',
    problematic: true,
    notes: 'Misunderstands Christian Trinity'
  },

  // Three gods
  {
    surah: 5,
    ayah: 73,
    text: "لَقَدْ كَفَرَ الَّذِينَ قَالُوا إِنَّ اللَّهَ ثَالِثُ ثَلَاثَةٍ",
    translation: "They have certainly disbelieved who say that Allah is the third of three.",
    juz: 6,
    revelation: 'Medinan',
    category: 'trinity',
    problematic: true,
    notes: 'Misunderstands Trinity as three separate gods'
  },

  // God is one
  {
    surah: 112,
    ayah: 1,
    text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
    translation: "Say, 'He is Allah, [who is] One.'",
    juz: 30,
    revelation: 'Meccan',
    category: 'trinity',
    problematic: false,
    notes: 'Affirms monotheism'
  },

  // God is eternal
  {
    surah: 112,
    ayah: 2,
    text: "اللَّهُ الصَّمَدُ",
    translation: "Allah, the Eternal Refuge.",
    juz: 30,
    revelation: 'Meccan',
    category: 'trinity',
    problematic: false,
    notes: 'Describes God as eternal'
  },

  // God is unique
  {
    surah: 112,
    ayah: 4,
    text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    translation: "Nor is there to Him any equivalent.",
    juz: 30,
    revelation: 'Meccan',
    category: 'trinity',
    problematic: false,
    notes: 'Says God has no equivalent'
  }
];

export default quranVerses; 