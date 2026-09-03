import { ProteinMatrixItem, ProteinCategory } from '../types';

export const PROTEIN_CATEGORIES: { id: ProteinCategory; label: string; iconLabel: string; desc: string }[] = [
  { id: 'meat', label: 'Мясо', iconLabel: '🥩', desc: 'Говядина, свинина, баранина (высокий IMP, бархатирование)' },
  { id: 'poultry', label: 'Птица', iconLabel: '🍗', desc: 'Курица, утка (нежные волокна, термошок)' },
  { id: 'eggs', label: 'Яйца', iconLabel: '🍳', desc: 'Куриные яйца Hua Dan, Пидань, соленые желтки' },
  { id: 'seafood', label: 'Морепродукты & Рыба', iconLabel: '🦐', desc: 'Креветки, кальмары, рыба (высокий глицин и IMP)' },
  { id: 'plant_soy_gluten', label: 'Соя & Сейтан', iconLabel: '🌱', desc: 'Тофу, пуфы, доупи, фучжу, сейтан, темпе' },
  { id: 'fungi', label: 'Грибы (Микопротеин)', iconLabel: '🍄', desc: 'Шиитаке, эринги, древесные ушки (рекордсмены по GMP)' }
];

export const PROTEIN_MATRIX_ITEMS: ProteinMatrixItem[] = [
  // ==================== МЯСО (MEAT) ====================
  {
    id: 'beef_flank',
    name: 'Говядина (Фланк / Пашина / Вырезка)',
    chineseName: '牛肉片 / 牛柳',
    pinyin: 'Niúròupiàn / Niúlǐu',
    category: 'meat',
    absorptionArchetype: 'fibrous',
    absorptionLabel: 'Волокнистая с внешней крахмальной защитой',
    physicsDescription: 'Плотные мышечные пучки с низким проникновением соуса внутрь. При нарезке поперек волокон и бархатировании Shang Jiang образует микроскопический гелевый барьер, запирающий миоглобин и сок.',
    baselineGlutamateMg: 85,
    baselineImpMg: 185,
    baselineGmpMg: 4,
    dominantNucleotide: 'IMP',
    moistureTendency: 'releases_water',
    prepTechnique: {
      chineseTerm: '上浆 (Shang Jiang)',
      name: 'Бархатирование с содой и крахмалом',
      marinade: 'Щепотка соды (NaHCO₃) на 5 мин, затем соевый соус (5 мл), шаосинское вино (5 мл), яичный белок (1/2 шт), кукурузный крахмал (5 г), запечатать маслом (5 мл).',
      thermalWokTime: '20-30 сек в раскаленном масле (180-200°C) до полуготовности (Guoyou)',
      biochemicalGoal: 'Слабая щелочная среда повышает pH мяса выше изоэлектрической точки белков актомиозина, удерживая до 25% больше связанной воды.'
    },
    sauceAdjustment: {
      starchDeltaG: 1.5,
      liquidDeltaMl: 0,
      recommendedSauceCategory: 'wanzhi_brown',
      chefNotes: 'Соус должен мгновенно глазировать каждый ломтик (Baoguo/Baozhi). Увеличьте крахмал на 1.5 г, чтобы соус цеплялся за бархатистую пленку и не стекал на дно.'
    },
    culinaryPairings: ['Зеленый лук (Cong Bao)', 'Сладкий перец', 'Шиитаке', 'Чесночные стрелки'],
    scientificNotes: 'Высокое содержание свободного инозинмонофосфата (185 мг/100г) создает синергетический взрыв при контакте с глутаматом светлого соевого соуса (коэффициент Ямагути возрастает в 6-8 раз).'
  },
  {
    id: 'pork_belly',
    name: 'Свиная грудинка (Хуншао / Хуэйгожоу)',
    chineseName: '五花肉',
    pinyin: 'Wǔhuāròu',
    category: 'meat',
    absorptionArchetype: 'fibrous',
    absorptionLabel: 'Слоисто-жировая с гидролизом коллагена',
    physicsDescription: 'Чередование мышечной ткани и прослоек сала. При длительном томлении коллаген соединительной ткани превращается в желатин, который эмульгирует соус и придает естественный глянец.',
    baselineGlutamateMg: 70,
    baselineImpMg: 160,
    baselineGmpMg: 3,
    dominantNucleotide: 'IMP',
    moistureTendency: 'emulsifies',
    prepTechnique: {
      chineseTerm: '焯水 & 炒糖色 (Chao Tangse)',
      name: 'Бланширование и карамелизация тростниковым сахаром',
      marinade: 'Бланширование в воде с имбирем и вином (10 мин). Обжарка в растопленном леденцовом сахаре до янтарного блеска.',
      thermalWokTime: '40-60 мин медленного томления при 90-95°C',
      biochemicalGoal: 'Тепловой гидролиз коллагена в желатин + реакция карамелизации сахарозы с образованием мальтола и фуранонов.'
    },
    sauceAdjustment: {
      starchDeltaG: -1.5,
      liquidDeltaMl: 50,
      recommendedSauceCategory: 'braising_glaze',
      chefNotes: 'Свиная грудинка выделяет собственный желатин. Дополнительный крахмал почти не нужен (-1.5 г), соус загустеет сам при выпаривании до зеркальной глазури.'
    },
    culinaryPairings: ['Фучжу', 'Чеснок целиком', 'Бадьян', 'Кассия (корица)'],
    scientificNotes: 'В сочетании с выдержанным темным соевым соусом и шаосинским вином продукты пиролиза сахара маскируют сернистые запахи свинины.'
  },
  {
    id: 'pork_tenderloin',
    name: 'Свиная вырезка соломкой (Юйсян / Чаожоуси)',
    chineseName: '猪里脊肉丝',
    pinyin: 'Zhū Lǐjǐ Ròusī',
    category: 'meat',
    absorptionArchetype: 'silk_coating',
    absorptionLabel: 'Шелковистая глазурованная соломка',
    physicsDescription: 'Нежнейшая постная мышца с минимальным количеством коллагена. При перегреве мгновенно отдает влагу и становится сухой («деревянной»). Требует тончайшей нарезки и нежного крахмального слоя.',
    baselineGlutamateMg: 65,
    baselineImpMg: 175,
    baselineGmpMg: 2,
    dominantNucleotide: 'IMP',
    moistureTendency: 'releases_water',
    prepTechnique: {
      chineseTerm: '滑油 (Hua You)',
      name: 'Холодное бархатирование и прогон через теплое масло',
      marinade: 'Соль (1 г), шаосинское вино (5 мл), крахмал (4 г), 1 ст. л. холодной воды, взбить пальцами до впитывания влаги, покрыть растительным маслом.',
      thermalWokTime: '15-20 сек в масле при 140-150°C',
      biochemicalGoal: 'Крахмал с водой образует термообратимый гель, запечатывающий волокна без термического сжатия.'
    },
    sauceAdjustment: {
      starchDeltaG: 2.0,
      liquidDeltaMl: -10,
      recommendedSauceCategory: 'sichuan_spicy',
      chefNotes: 'Для знаменитого соуса Юйсян (рыбный аромат) требуется четкая крахмальная пленка (+2 г крахмала), которая соединит кисло-сладкую базу соломки с пастой Паоцзяо.'
    },
    culinaryPairings: ['Древесные ушки (Муэр)', 'Соломка бамбука', 'Сычуаньский соленый перец'],
    scientificNotes: 'Быстрый тепловой контакт активирует инозинат свинины, который гармонизирует кислотность черного чжэньцзянского уксуса.'
  },
  {
    id: 'pork_mince',
    name: 'Рубленый свиной фарш (Мапо / Даньдань)',
    chineseName: '肉末 / 猪肉馅',
    pinyin: 'Ròumò / Zhūròuxiàn',
    category: 'meat',
    absorptionArchetype: 'emulsion_oil',
    absorptionLabel: 'Микрогранулы с масляной экстракцией умами',
    physicsDescription: 'Максимальная площадь контакта с соусом и жиром. При выжаривании в воке до хруста (Су / Сяо Су) становится умами-концентратом, отдающим жир и впитывающим чили-масло.',
    baselineGlutamateMg: 80,
    baselineImpMg: 190,
    baselineGmpMg: 5,
    dominantNucleotide: 'IMP',
    moistureTendency: 'releases_water',
    prepTechnique: {
      chineseTerm: '煸干 / 炒酥 (Bian Gan / Chao Su)',
      name: 'Выжаривание влаги до хрустящей сухости',
      marinade: 'Шаосинское вино (5 мл), светлый соевый соус (5 мл), щепотка белого перца.',
      thermalWokTime: '2-3 мин на среднем огне до прозрачного масла и золотистого хруста',
      biochemicalGoal: 'Полное удаление свободной воды, интенсивная реакция Майяра на поверхности фарша, делающая его микропористым носителем ароматов.'
    },
    sauceAdjustment: {
      starchDeltaG: 0,
      liquidDeltaMl: 20,
      recommendedSauceCategory: 'sichuan_spicy',
      chefNotes: 'Фарш распределяется по соусу в виде дискретных умами-частиц. Идеален для Мапо Тофу: соус связывает нежный тофу и хрустящие гранулы мяса.'
    },
    culinaryPairings: ['Нежный тофу', 'Сычуаньский перец шихуань', 'Писянь Доубаньцзян', 'Лапша'],
    scientificNotes: 'Фарш служит донором IMP в вегетарианские матрицы (например, в тофу), запуская колоссальный скачок суммарного умами блюда.'
  },

  // ==================== ПТИЦА (POULTRY) ====================
  {
    id: 'chicken_breast',
    name: 'Куриное филе кубиком (Гунбао / Дин)',
    chineseName: '鸡胸肉丁',
    pinyin: 'Jīxiōng Ròudīng',
    category: 'poultry',
    absorptionArchetype: 'silk_coating',
    absorptionLabel: 'Гладкая нежная сфера (Coating)',
    physicsDescription: 'Однородные параллельные миофибриллы, практически лишенные внутримышечного жира. При температуре выше 68°C денатурирует и сжимается, выдавливая до 20% клеточного сока.',
    baselineGlutamateMg: 55,
    baselineImpMg: 210,
    baselineGmpMg: 3,
    dominantNucleotide: 'IMP',
    moistureTendency: 'releases_water',
    prepTechnique: {
      chineseTerm: '抓水上浆 (Zhua Shui Shang Jiang)',
      name: 'Насыщение водой с последующим крахмальным панцирем',
      marinade: 'Вбить 15 мл воды/бульона на 150 г мяса до полного впитывания. Затем соль (1 г), вино (5 мл), белок (1 ст. л.), картофельный крахмал (5 г), масло (5 мл).',
      thermalWokTime: '30-45 сек при 180°C',
      biochemicalGoal: 'Насильственная гидратация белка с запечатыванием крахмальной капсулой предотвращает сжатие миофибрилл.'
    },
    sauceAdjustment: {
      starchDeltaG: 1.0,
      liquidDeltaMl: 0,
      recommendedSauceCategory: 'sweet_sour',
      chefNotes: 'В классическом Гунбао соус Huiguan (возвратный соус) должен образовывать тончайшую зеркальную глазурь без капель на дне тарелки.'
    },
    culinaryPairings: ['Жареный арахис', 'Сушеный чили Сычуань', 'Сычуаньский перец', 'Зеленый лук'],
    scientificNotes: 'Куриная грудка обладает рекордным содержанием IMP (до 210 мг/100г), превосходя большинство видов красного мяса.'
  },
  {
    id: 'chicken_thigh',
    name: 'Куриные бёдрышки (Санбэйцзи / Хруст)',
    chineseName: '去骨鸡腿肉',
    pinyin: 'Qùgǔ Jītǐuròu',
    category: 'poultry',
    absorptionArchetype: 'fibrous',
    absorptionLabel: 'Сочная волокнистая с карамелизацией кожи',
    physicsDescription: 'Богата миоглобином, коллагеном и подкожным жиром. Не пересыхает при длительном нагреве в воке, великолепно удерживает густые редуцированные соусы с высоким содержанием сахара.',
    baselineGlutamateMg: 60,
    baselineImpMg: 195,
    baselineGmpMg: 4,
    dominantNucleotide: 'IMP',
    moistureTendency: 'balanced',
    prepTechnique: {
      chineseTerm: '生炒煎皮 (Jian Pi)',
      name: 'Обжарка кожей вниз до вытапливания жира',
      marinade: 'Шаосинское вино (10 мл), светлый соевый соус (5 мл), имбирный сок.',
      thermalWokTime: '3-4 мин обжарки + 3-4 мин редукции соуса Sanbei',
      biochemicalGoal: 'Термический липолиз подкожного жира дает хруст и ароматические альдегиды, соединяющиеся с кунжутным маслом.'
    },
    sauceAdjustment: {
      starchDeltaG: -0.5,
      liquidDeltaMl: 15,
      recommendedSauceCategory: 'wanzhi_brown',
      chefNotes: 'Для Санбэйцзи крахмал часто не добавляют вовсе: соус загущается выпариванием сахара, соевого соуса и рисового вина.'
    },
    culinaryPairings: ['Тайский базилик (Цзюцэнси)', 'Чеснок зубчиками', 'Имбирь кружками', 'Кунжутное масло'],
    scientificNotes: 'Соединение серных летучих веществ кунжутного масла и глутамата сои дает комплексный мясной аромат высокой плотности.'
  },
  {
    id: 'duck_breast',
    name: 'Утиное филе / грудка (Пекинский стиль / Слива)',
    chineseName: '鸭胸肉',
    pinyin: 'Yāxiōng Ròudīng',
    category: 'poultry',
    absorptionArchetype: 'fibrous',
    absorptionLabel: 'Плотная темная мышечная ткань с мощным ароматом',
    physicsDescription: 'Темное мясо с высоким уровнем внутримышечных липидов и железа. Требует ярких кисло-сладких или ферментированных пастовых соусов (Тяньмяньцзян, сливовый соус).',
    baselineGlutamateMg: 75,
    baselineImpMg: 180,
    baselineGmpMg: 3,
    dominantNucleotide: 'IMP',
    moistureTendency: 'emulsifies',
    prepTechnique: {
      chineseTerm: '快炒抱汁 (Baozhi)',
      name: 'Быстрая обжарка с мгновенным глазированием',
      marinade: 'Вино (10 мл), соль, соевый соус, картофельный крахмал (3 г).',
      thermalWokTime: '45-60 сек на сильном огне (Wok Hei)',
      biochemicalGoal: 'Быстрая карамелизация наружного слоя при сохранении сочной сердцевины розового цвета.'
    },
    sauceAdjustment: {
      starchDeltaG: 1.0,
      liquidDeltaMl: 0,
      recommendedSauceCategory: 'braising_glaze',
      chefNotes: 'Идеален соус на сладкой бобовой пасте Тяньмяньцзян или сливовом соусе с добавлением Чжэньцзянского уксуса.'
    },
    culinaryPairings: ['Зеленый лук соломкой', 'Огурец соломкой', 'Сладкая бобовая паста Тяньмяньцзян'],
    scientificNotes: 'Утиный жир имеет низкую температуру плавления (14°C), поэтому легко эмульгирует с соусом прямо в воке.'
  },

  // ==================== ЯЙЦА (EGGS) ====================
  {
    id: 'eggs_wok',
    name: 'Куриные яйца (Вок-омлет Hua Dan)',
    chineseName: '滑蛋 / 炒鸡蛋',
    pinyin: 'Huádàn / Chǎojīdàn',
    category: 'eggs',
    absorptionArchetype: 'emulsion_oil',
    absorptionLabel: 'Воздушная масляная губка (поглощение до 40% масла)',
    physicsDescription: 'Коагуляция овальбумина и липопротеинов желтка образует рыхлую пористую пену при контакте с горячим маслом. Яйца работают как губка для жидких соусов и ароматического масла.',
    baselineGlutamateMg: 45,
    baselineImpMg: 15,
    baselineGmpMg: 1,
    dominantNucleotide: 'none',
    moistureTendency: 'absorbs_liquid',
    prepTechnique: {
      chineseTerm: '滑蛋法 (Hua Dan Fa)',
      name: 'Шелковые волны в обильном масле',
      marinade: 'Яйца (3 шт), шаосинское вино (5 мл), соль (1 г), крахмальная вода (1 ч. л. крахмала + 1 ст. л. воды), масло (1 ч. л.).',
      thermalWokTime: '15-20 сек на среднем огне с непрерывным сдвиганием лопаткой от краев к центру',
      biochemicalGoal: 'Добавление крахмальной суспензии разделяет белковые цепочки овальбумина, предотвращая их жесткое сцепление и отсечение сыворотки.'
    },
    sauceAdjustment: {
      starchDeltaG: 1.0,
      liquidDeltaMl: 30,
      recommendedSauceCategory: 'sweet_sour',
      chefNotes: 'В легендарных томатах с яйцами (Fanqie Chaodan) соус на томатном соке должен быть достаточно обильным (+30 мл), так как яйца моментально впитывают влагу.'
    },
    culinaryPairings: ['Спелые томаты', 'Креветки', 'Зеленый лук', 'Белый молотый перец'],
    scientificNotes: 'Желток яйца содержит природный эмульгатор лецитин, который связывает свободный жир соуса с водной фазой соевого соуса в устойчивый крем.'
  },
  {
    id: 'pidan_century',
    name: 'Столетние яйца (Пидань)',
    chineseName: '皮蛋 / 松花蛋',
    pinyin: 'Pídàn / Sōnghuādàn',
    category: 'eggs',
    absorptionArchetype: 'gel_cellular',
    absorptionLabel: 'Щелочной протеиновый гель с кремовым желтком',
    physicsDescription: 'В результате щелочной ферментации (известь, зола, соль) белок превращается в янтарное упругое желе, а желток становится кремовым, насыщенным сульфидами и свободным глутаматом.',
    baselineGlutamateMg: 180,
    baselineImpMg: 20,
    baselineGmpMg: 2,
    dominantNucleotide: 'none',
    moistureTendency: 'balanced',
    prepTechnique: {
      chineseTerm: '凉拌 (Liangban)',
      name: 'Холодная заправка с нейтрализацией щелочи',
      marinade: 'Нарезка дольками смоченным в масле ножом или нитью.',
      thermalWokTime: 'Без термической обработки (либо 10 сек прогрев в соусе)',
      biochemicalGoal: 'Чжэньцзянский темный уксус нейтрализует остаточную щелочность (аммиачный фон) и раскрывает богатый вкус аминокислот.'
    },
    sauceAdjustment: {
      starchDeltaG: -1.0,
      liquidDeltaMl: 0,
      recommendedSauceCategory: 'pickle_fermented',
      chefNotes: 'Подается с шелковым тофу (Pidan Doufu). Требует соуса на основе черного уксуса, чеснока, чили-масла и светлого соевого соуса.'
    },
    culinaryPairings: ['Шелковый тофу', 'Маринованный имбирь', 'Кинза', 'Чили-масло'],
    scientificNotes: 'Ферментация разрушает белки на пептиды и свободный глутамат (до 180 мг/100г), создавая один из самых мощных природных источников умами среди яичных продуктов.'
  },

  // ==================== МОРЕПРОДУКТЫ & РЫБА (SEAFOOD & FISH) ====================
  {
    id: 'shrimp_prawn',
    name: 'Тигровые / Королевские креветки (Кристальный вок)',
    chineseName: '水晶虾仁',
    pinyin: 'Shuǐjīng Xiārén',
    category: 'seafood',
    absorptionArchetype: 'silk_coating',
    absorptionLabel: 'Упругая глянцевая сфера (Хрустящий хрящевой укус Q-弹)',
    physicsDescription: 'Мышечные волокна креветок богаты глицином (сладость) и инозинатом. При правильной обработке щелочью/солью белок образует плотный хрустящий тургор (текстура Cuikou/Q-tan).',
    baselineGlutamateMg: 40,
    baselineImpMg: 120,
    baselineGmpMg: 8,
    dominantNucleotide: 'IMP',
    moistureTendency: 'releases_water',
    prepTechnique: {
      chineseTerm: '碱水洗 & 上蛋清浆 (Shuijing Jiang)',
      name: 'Промывка содой со льдом и белковое бархатирование',
      marinade: 'Промыть со льдом и содой (5 мин), обсушить полотенцем насухо. Добавить соль (1 г), яичный белок (1/2 шт), крахмал (4 г). Выдержать в холоде 2 часа.',
      thermalWokTime: '15-20 сек в масле при 130-140°C до полупрозрачного розового цвета',
      biochemicalGoal: 'Растворение поверхностных белков миозина в солевом растворе образует хрустящую прозрачную оболочку («кристальные креветки»).'
    },
    sauceAdjustment: {
      starchDeltaG: 1.5,
      liquidDeltaMl: -10,
      recommendedSauceCategory: 'velvet_white',
      chefNotes: 'Креветки требуют легкого прозрачного белого соуса (Bailan) или быстрого чесночного соуса. Соус должен держаться тонкой вуалью без потемнения цвета креветок.'
    },
    culinaryPairings: ['Чай Лунцзин (Лунцзин Сяжэнь)', 'Зеленый горошек', 'Чеснок', 'Шаосинское вино'],
    scientificNotes: 'Высокая концентрация свободного глицина (до 1000 мг/100г) в сочетании с глутаматом соевого соуса создает сложный сладковато-умами профиль.'
  },
  {
    id: 'squid_huadao',
    name: 'Кальмар с надсечкой цветком (Юйсян / Мала)',
    chineseName: '鱿鱼花',
    pinyin: 'Yóuyú Huā',
    category: 'seafood',
    absorptionArchetype: 'gel_cellular',
    absorptionLabel: 'Спиральные лепестки с микрокарманами для соуса',
    physicsDescription: 'Перекрестная диагональная надсечка с внутренней стороны мантии. При нагреве коллагеновые слои сжимаются с разной скоростью, сворачивая ломтик в «шишку» или «цветок», образуя сотни ячеек для удержания соуса.',
    baselineGlutamateMg: 50,
    baselineImpMg: 140,
    baselineGmpMg: 6,
    dominantNucleotide: 'IMP',
    moistureTendency: 'releases_water',
    prepTechnique: {
      chineseTerm: '花刀 & 焯水 (Huadao & Feishui)',
      name: 'Глубокая надсечка сеткой 45° и бланширование 5 секунд',
      marinade: 'Бланшировать в кипящей воде с имбирем и вином 5-8 сек до сворачивания в цветок, немедленно охладить.',
      thermalWokTime: '20 сек в раскаленном воке на максимальном огне',
      biochemicalGoal: 'Тепловой шок мгновенно удаляет до 30% поверхностной влаги, предотвращая разжижение соуса в воке.'
    },
    sauceAdjustment: {
      starchDeltaG: 2.0,
      liquidDeltaMl: 0,
      recommendedSauceCategory: 'sichuan_spicy',
      chefNotes: 'Цветки кальмара работают как механический капкан для соуса. Соус должен быть достаточно густым (+2 г крахмала), чтобы застрять в надсечках.'
    },
    culinaryPairings: ['Сельдерей соломкой', 'Сычуаньский соленый чили', 'Чеснок', 'Имбирь'],
    scientificNotes: 'Быстрый обжиг сохраняет белок парамиозин от перехода в резиновую фазу жесткости.'
  },
  {
    id: 'white_fish',
    name: 'Филе белой рыбы (Судак / Минтай / Тилапия)',
    chineseName: '鱼片 (水煮鱼 / 糟溜鱼片)',
    pinyin: 'Yúpiàn',
    category: 'seafood',
    absorptionArchetype: 'silk_coating',
    absorptionLabel: 'Хрупкие лепестки миотомов (требует бережной глазури)',
    physicsDescription: 'Короткие W-образные мышечные пласты (миотомы), соединенные нежным коллагеном. При малейшем механическом воздействии распадаются на хлопья. Требует прочного крахмального слоя и деликатного движения вока.',
    baselineGlutamateMg: 45,
    baselineImpMg: 165,
    baselineGmpMg: 4,
    dominantNucleotide: 'IMP',
    moistureTendency: 'releases_water',
    prepTechnique: {
      chineseTerm: '上浆 & 滑油/氽水 (Shang Jiang & Chuan Shui)',
      name: 'Плотное бархатирование белком и винным осадком',
      marinade: 'Соль (2 г), белое вино (5 мл), яичный белок, крахмал (6 г), вымешивать до липкости.',
      thermalWokTime: '30-45 сек бережного прогрева в горячем бульоне или масле при 90°C',
      biochemicalGoal: 'Коагулированный белок с крахмалом склеивает хрупкие миотомы, не позволяя рыбе разорваться.'
    },
    sauceAdjustment: {
      starchDeltaG: 1.5,
      liquidDeltaMl: 20,
      recommendedSauceCategory: 'velvet_white',
      chefNotes: 'В сычуаньском Шуйчжу Юй рыба плавает в обильном остром бульоне. В шанхайском Дзаолю Юйпянь соус из винного осадка обволакивает каждый лепесток зеркальной пленкой.'
    },
    culinaryPairings: ['Ростки сои', 'Винный осадок (Цзюнян)', 'Древесные ушки', 'Сычуаньский перец'],
    scientificNotes: 'Рыбный инозинмонофосфат в сочетании с глутаматом соевого соуса или бульона дает чистейший, прозрачный вкус моря.'
  },

  // ==================== СОЯ, ТОФУ & СЕЙТАН (PLANT / SOY / GLUTEN) ====================
  {
    id: 'tofu_firm',
    name: 'Твердый тофу (Lao Doufu / Домашний стиль)',
    chineseName: '老豆腐 / 北豆腐',
    pinyin: 'Lǎo Dòufu',
    category: 'plant_soy_gluten',
    absorptionArchetype: 'sponge',
    absorptionLabel: 'Умеренная губка с капиллярной сеткой',
    physicsDescription: 'Створоженная коагулянтом (сульфатом кальция или нигари) соевая белковая сетка. Обладает достаточной плотностью для нарезки и обжарки, впитывает соус через капилляры при тушении.',
    baselineGlutamateMg: 35,
    baselineImpMg: 0,
    baselineGmpMg: 0,
    dominantNucleotide: 'none',
    moistureTendency: 'absorbs_liquid',
    prepTechnique: {
      chineseTerm: '盐水焯 & 煎金黄 (Yan Shui Chuan)',
      name: 'Бланширование в подсоленной воде и обжарка до корочки',
      marinade: 'Отварить 2 мин в соленой воде (удаляет запах бобов и уплотняет белок глицинин). Обжарить с двух сторон до корочки.',
      thermalWokTime: '2 мин обжарки + 3-4 мин тушения в соусе',
      biochemicalGoal: 'Ионы натрия замещают воду в наружном слое тофу, предотвращая прилипание к воку и разрушение формы.'
    },
    sauceAdjustment: {
      starchDeltaG: 0,
      liquidDeltaMl: 40,
      recommendedSauceCategory: 'wanzhi_brown',
      chefNotes: 'Тофу не содержит собственных нуклеотидов (IMP/GMP). Соус ОБЯЗАН нести глутамат и нуклеотиды (бульон, сушеные грибы, устричный соус или ферментированные бобы).'
    },
    culinaryPairings: ['Древесные ушки', 'Чесночные стрелки', 'Свиной фарш', 'Писянь Доубаньцзян'],
    scientificNotes: 'Пористый глицининовый каркас действует как молекулярное сито, поглощая глутамат из жидкой фазы соуса.'
  },
  {
    id: 'tofu_soft',
    name: 'Мягкий / Шелковый тофу (Nen Doufu / Мапо)',
    chineseName: '嫩豆腐 / 南豆腐',
    pinyin: 'Nèn Dòufu',
    category: 'plant_soy_gluten',
    absorptionArchetype: 'silk_coating',
    absorptionLabel: 'Хрупкий гидрогель (требует обволакивающего Baoguo)',
    physicsDescription: 'Высокое содержание свободной воды (до 88%), нежнейший гелевый матрикс на основе ГДЛ (глюконо-дельта-лактона). Соус внутрь не проходит — он должен плотно покрывать кубики тофу снаружи.',
    baselineGlutamateMg: 25,
    baselineImpMg: 0,
    baselineGmpMg: 0,
    dominantNucleotide: 'none',
    moistureTendency: 'releases_water',
    prepTechnique: {
      chineseTerm: '温盐水浸泡 (Wen Yanshui)',
      name: 'Выдерживание в теплом солевом растворе',
      marinade: 'Нарезать кубиками 1.5 см, замочить в теплой воде с 1 ч. л. соли на 5 мин.',
      thermalWokTime: '3-4 мин томления при легком покачивании вока без лопатки',
      biochemicalGoal: 'Осмотическое давление солевого раствора слегка вытягивает поверхностную воду, предотвращая растрескивание кубиков при кипении.'
    },
    sauceAdjustment: {
      starchDeltaG: 2.5,
      liquidDeltaMl: 30,
      recommendedSauceCategory: 'sichuan_spicy',
      chefNotes: 'Требует трехкратного внесения крахмала (San Ci Gouqian) — по мере выделения воды из тофу крахмал добавляется порциями, образуя глянцевую суспензию.'
    },
    culinaryPairings: ['Сычуаньский перец (молотый порошок)', 'Зеленый лук кусочками', 'Писянь Доубаньцзян'],
    scientificNotes: 'Идеальный контраст текстур: холодная гладкая шелковистость соевого гидрогеля и обжигающая маслянистая капсаициновая глазурь.'
  },
  {
    id: 'you_dofu_puffs',
    name: 'Тофу-пуфы / жареные пончики (You Dofu)',
    chineseName: '油豆腐 / 豆腐泡',
    pinyin: 'Yóu Dòufu / Dòufupào',
    category: 'plant_soy_gluten',
    absorptionArchetype: 'sponge',
    absorptionLabel: 'Максимальная губка (впитывает до 250% собственного веса)',
    physicsDescription: 'Внутренняя структура представляет собой открытую паутину пустот, образованную взрывным испарением влаги во фритюре. Втягивает соус со скоростью промокашки.',
    baselineGlutamateMg: 45,
    baselineImpMg: 0,
    baselineGmpMg: 0,
    dominantNucleotide: 'none',
    moistureTendency: 'absorbs_liquid',
    prepTechnique: {
      chineseTerm: '挤水开孔 (Jī Shuǐ Kāi Kǒng)',
      name: 'Надрезание или сдавливание для открытия полостей',
      marinade: 'Проколоть зубочисткой или надрезать крест-накрест. Ошпарить кипятком для удаления поверхностного фритюрного масла.',
      thermalWokTime: '2-3 мин тушения в соусе',
      biochemicalGoal: 'Удаление окисленного поверхностного жира освобождает гидрофильные каналы для проникновения соуса.'
    },
    sauceAdjustment: {
      starchDeltaG: -1.0,
      liquidDeltaMl: 60,
      recommendedSauceCategory: 'braising_glaze',
      chefNotes: 'ВНИМАНИЕ: увеличьте объем жидкой базы (+60 мл) и уменьшите крахмал (-1 г)! Если соус будет слишком густым, он не сможет проникнуть внутрь полостей.'
    },
    culinaryPairings: ['Грибы шиитаке', 'Сельдерей', 'Свиная грудинка', 'Соевый соус'],
    scientificNotes: 'Капиллярное всасывание по закону Жюрена: узкие поры тофу удерживают до 30 мл соуса на каждые 50 г продукта.'
  },
  {
    id: 'doupi_sheets',
    name: 'Листы Доупи / Соевая пенка',
    chineseName: '豆皮 / 油豆皮',
    pinyin: 'Dòupí',
    category: 'plant_soy_gluten',
    absorptionArchetype: 'sponge',
    absorptionLabel: 'Многослойная капиллярная микропленка',
    physicsDescription: 'Тонкие листы, образующиеся на поверхности кипящего соевого молока. Богаты соевыми липидами и белками. Мгновенно адсорбируют соус межслойными зазорами.',
    baselineGlutamateMg: 60,
    baselineImpMg: 0,
    baselineGmpMg: 0,
    dominantNucleotide: 'none',
    moistureTendency: 'absorbs_liquid',
    prepTechnique: {
      chineseTerm: '温水浸发 (Wen Shui Jin Fa)',
      name: 'Короткое замачивание и нарезка широкой лапшой',
      marinade: 'Замочить на 5-10 мин в теплой воде, отжать, нарезать лентами 2 см.',
      thermalWokTime: '1-2 мин быстрой обжарки в соусе',
      biochemicalGoal: 'Равномерная гидратация без потери упругости.'
    },
    sauceAdjustment: {
      starchDeltaG: 0,
      liquidDeltaMl: 30,
      recommendedSauceCategory: 'wanzhi_brown',
      chefNotes: 'Доупи великолепно связывается с коричневым соусом Wanzhi. Требует чуть больше жидкости (+30 мл), так как быстро забирает соус.'
    },
    culinaryPairings: ['Чеснок', 'Острый перец', 'Кинза', 'Кунжутное масло'],
    scientificNotes: 'Высокое содержание белка (до 45%) делает листы доупи великолепным носителем глутамата соевого соуса.'
  },
  {
    id: 'fuzhu_yuba',
    name: 'Фучжу / Соевая спаржа Юба',
    chineseName: '腐竹',
    pinyin: 'Fǔzhú',
    category: 'plant_soy_gluten',
    absorptionArchetype: 'sponge',
    absorptionLabel: 'Трубчатый пористый жгут (глубокое томление)',
    physicsDescription: 'Собранная в складки и высушенная соевая пенка. После гидратации образует плотный эластичный жгут с продольными микроканалами. Идеальна для томления (Hongshao/Lu).',
    baselineGlutamateMg: 75,
    baselineImpMg: 0,
    baselineGmpMg: 0,
    dominantNucleotide: 'none',
    moistureTendency: 'absorbs_liquid',
    prepTechnique: {
      chineseTerm: '冷水慢泡 (Leng Shui Man Pao)',
      name: 'Длительное замачивание в холодной подсоленной воде',
      marinade: 'Замачивать 4-6 часов в холодной воде с щепоткой соли (не использовать кипяток, иначе середина останется твердой, а края расползутся).',
      thermalWokTime: '5-8 мин томления в воке под крышкой',
      biochemicalGoal: 'Равномерная гидратация белково-липидного комплекса по всему сечению палочки.'
    },
    sauceAdjustment: {
      starchDeltaG: -0.5,
      liquidDeltaMl: 40,
      recommendedSauceCategory: 'braising_glaze',
      chefNotes: 'Фучжу должна пропитаться соусом до сердцевины. Добавьте больше бульона и томите на медленном огне до редукции соуса.'
    },
    culinaryPairings: ['Свиная грудинка', 'Древесные ушки', 'Шиитаке', 'Бадьян'],
    scientificNotes: 'Высушенная фучжу концентрирует соевый глутамат (до 75 мг/100г), создавая прочную умами-базу.'
  },
  {
    id: 'seitan_mianjin',
    name: 'Сейтан / Пшеничный глютен (Мяньцзинь / Каофу)',
    chineseName: '面筋 / 烤麸',
    pinyin: 'Miànjīn / Kǎofū',
    category: 'plant_soy_gluten',
    absorptionArchetype: 'sponge',
    absorptionLabel: 'Эластичная полимерная губка',
    physicsDescription: 'Трехмерная сетка ковалентно и дисульфидно связанных белков глиадина и глютенина. Обладает высочайшей эластичностью и микропорами, удерживающими густые крахмальные соусы.',
    baselineGlutamateMg: 110,
    baselineImpMg: 0,
    baselineGmpMg: 0,
    dominantNucleotide: 'none',
    moistureTendency: 'absorbs_liquid',
    prepTechnique: {
      chineseTerm: '炸透去生 (Zha Tou Qu Sheng)',
      name: 'Обжарка во фритюре или на сухом воке до пузырей',
      marinade: 'Нарезать кубиками или ломтиками. Обжарить с 1 ч. л. масла до золотистой пузырчатой корочки.',
      thermalWokTime: '2-3 мин интенсивного прогрева в соусе',
      biochemicalGoal: 'Тепловая фиксация пор глютена предотвращает его превращение в клейкую резину при тушении.'
    },
    sauceAdjustment: {
      starchDeltaG: 1.0,
      liquidDeltaMl: 30,
      recommendedSauceCategory: 'wanzhi_brown',
      chefNotes: 'Сейтан любит густые темные соусы с сахаром, соевыми соусами и ароматическим маслом. Крахмал помогает запечатать соус в порах.'
    },
    culinaryPairings: ['Шиитаке', 'Арахис', 'Лилейник (Хуанхуацай)', 'Бадьян'],
    scientificNotes: 'Пшеничный белок исключительно богат глутаминовой кислотой (до 35% аминокислотного состава), часть которой высвобождается при термообработке.'
  },
  {
    id: 'tempeh',
    name: 'Темпе (Ферментированные соевые бобы)',
    chineseName: '丹贝',
    pinyin: 'Dānbèi',
    category: 'plant_soy_gluten',
    absorptionArchetype: 'fibrous',
    absorptionLabel: 'Мицелиально-бобовый блок с ореховым профилем',
    physicsDescription: 'Цельные соевые бобы, проросшие мицелием гриба Rhizopus oligosporus. Плотная структура, требующая предварительной нарезки и обжарки для образования хрустящей корочки.',
    baselineGlutamateMg: 90,
    baselineImpMg: 0,
    baselineGmpMg: 5,
    dominantNucleotide: 'none',
    moistureTendency: 'balanced',
    prepTechnique: {
      chineseTerm: '煎香入味 (Jian Xiang)',
      name: 'Обжарка тонкими ломтиками до ореховой корочки',
      marinade: 'Шаосинское вино (5 мл), чеснок, щепотка соли.',
      thermalWokTime: '2-3 мин обжарки на среднем огне',
      biochemicalGoal: 'Ферментативный гидролиз белков создает свободные аминокислоты, которые при обжарке дают интенсивную реакцию Майяра.'
    },
    sauceAdjustment: {
      starchDeltaG: 0.5,
      liquidDeltaMl: 10,
      recommendedSauceCategory: 'sichuan_spicy',
      chefNotes: 'Прекрасно сочетается с острыми соусами Мала или сладковатым соусом Гунбао.'
    },
    culinaryPairings: ['Стручковая фасоль', 'Сычуаньский перец', 'Имбирь', 'Чеснок'],
    scientificNotes: 'В процессе ферментации грибной мицелий синтезирует свободные пептиды и ферменты, повышающие перевариваемость и глубину умами.'
  },

  // ==================== ГРИБЫ / МИКОПРОТЕИН (FUNGI / MUSHROOMS) ====================
  {
    id: 'shiitake',
    name: 'Грибы Шиитаке (Сушеные / Свежие Xianggu)',
    chineseName: '香菇 / 冬菇',
    pinyin: 'Xiānggū / Dōnggū',
    category: 'fungi',
    absorptionArchetype: 'sponge',
    absorptionLabel: 'Клеточная губка — чемпион по гуанилату (GMP)',
    physicsDescription: 'Гифы грибного мицелия образуют плотную губку. При сушке и последующей регидратации происходит ферментативный распад РНК с образованием огромного количества свободного гуанилата (GMP).',
    baselineGlutamateMg: 130,
    baselineImpMg: 0,
    baselineGmpMg: 150,
    dominantNucleotide: 'GMP',
    moistureTendency: 'absorbs_liquid',
    prepTechnique: {
      chineseTerm: '温水泡发 & 留原汤 (Pao Fa)',
      name: 'Замачивание в теплой воде с сахаром, использование грибного настоя',
      marinade: 'Замочить сушеные шиитаке в теплой воде (40°C) с 1/2 ч. л. сахара на 30 мин. Настой процедить и использовать как жидкую базу для соуса!',
      thermalWokTime: '2-3 мин обжарки до золотистого края',
      biochemicalGoal: 'Теплая вода (40°C) активирует фермент нуклеазу, расщепляющий РНК гриба на молекулы 5-гуанилата (GMP).'
    },
    sauceAdjustment: {
      starchDeltaG: 0.5,
      liquidDeltaMl: 20,
      recommendedSauceCategory: 'superior_broth',
      chefNotes: 'Грибы отдают соусу натуральный нуклеотидный усилитель. В сочетании с глутаматом соевого соуса синергия возрастает до x12-x16!'
    },
    culinaryPairings: ['Птица', 'Свинина', 'Тофу', 'Бок-чой'],
    scientificNotes: 'Гуанилат (GMP) в шиитаке обладает синергетическим потенциалом в 2.3 раза превосходящим инозинат (IMP) мяса.'
  },
  {
    id: 'eryngii',
    name: 'Королевские вешенки (Эринги)',
    chineseName: '杏鲍菇',
    pinyin: 'Xìngbàogū',
    category: 'fungi',
    absorptionArchetype: 'fibrous',
    absorptionLabel: 'Плотные мясные волокна с высокой отдачей влаги',
    physicsDescription: 'Твердая плотная ножка с текстурой, напоминающей морской гребешок или мясо птицы. При первичном нагреве выделяет много клеточного сока, затем впитывает соус.',
    baselineGlutamateMg: 90,
    baselineImpMg: 0,
    baselineGmpMg: 45,
    dominantNucleotide: 'GMP',
    moistureTendency: 'releases_water',
    prepTechnique: {
      chineseTerm: '干煸出水 (Gan Bian)',
      name: 'Сухая обжарка без масла для удаления сока',
      marinade: 'Нарезать шайбами с надсечкой крест-накрест или соломкой. Обжарить на сухом горячем воке до выделения и испарения влаги.',
      thermalWokTime: '2 мин сухой обжарки + 1 мин в соусе',
      biochemicalGoal: 'Удаление избытка клеточного сока предотвращает превращение вок-соуса в водянистый суп.'
    },
    sauceAdjustment: {
      starchDeltaG: 1.0,
      liquidDeltaMl: -15,
      recommendedSauceCategory: 'wanzhi_brown',
      chefNotes: 'Уменьшите жидкость в соусе (-15 мл), так как эринги отдадут собственный сок, богатый натуральным глутаматом.'
    },
    culinaryPairings: ['Сладкий перец', 'Говядина соломкой', 'Устричный соус', 'Чеснок'],
    scientificNotes: 'Упругие полисахариды хитин и бета-глюкан придают грибу эринги феноменальную термостойкость и упругий укус.'
  },
  {
    id: 'wood_ear',
    name: 'Древесные ушки (Муэр)',
    chineseName: '木耳 / 黑木耳',
    pinyin: 'Mù\'ěr',
    category: 'fungi',
    absorptionArchetype: 'gel_cellular',
    absorptionLabel: 'Хрящевой хрустящий гидроколлоид (Q-弾)',
    physicsDescription: 'Желатинистый базидиомицет, богатый растворимыми полисахаридами. Не впитывает соус внутрь, но соус должен зацепляться за волнистые края шляпок. Дает хруст и текстурный контраст.',
    baselineGlutamateMg: 40,
    baselineImpMg: 0,
    baselineGmpMg: 20,
    dominantNucleotide: 'GMP',
    moistureTendency: 'balanced',
    prepTechnique: {
      chineseTerm: '焯水沥干 (Chuan Shui Li Gan)',
      name: 'Бланширование и тщательное обсушивание',
      marinade: 'Замочить в холодной воде на 1-2 часа, промыть от песка, бланшировать в кипятке 1 мин, тщательно обсушить.',
      thermalWokTime: '30-45 сек быстрой обжарки (остерегайтесь хлопков/стрельбы масла!)',
      biochemicalGoal: 'Бланширование дезинфицирует и стабилизирует упругий тургор полисахаридов.'
    },
    sauceAdjustment: {
      starchDeltaG: 1.5,
      liquidDeltaMl: 0,
      recommendedSauceCategory: 'sichuan_spicy',
      chefNotes: 'Муэр скользкий: чтобы соус не стекал, требуется крахмал высокой клейстеризации (+1.5 г) и интенсивное перемешивание.'
    },
    culinaryPairings: ['Свинина соломкой (Юйсян)', 'Огурец', 'Яйца', 'Тофу'],
    scientificNotes: 'Полисахариды муэра обладают высокой гидроколлоидной емкостью, стабилизируя суспензию крахмала в воке.'
  }
];

export const getProteinById = (id: string): ProteinMatrixItem | undefined => {
  return PROTEIN_MATRIX_ITEMS.find(p => p.id === id);
};
