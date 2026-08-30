import { SauceArchetype } from '../types';

export const SAUCE_PRESETS: SauceArchetype[] = [
  {
    id: 'universal_brown_sauce',
    title: 'Универсальный Коричневый Соус (Wanzhi / Brown Sauce)',
    chineseTitle: '万能碗汁 / 经典红烧酱汁',
    pinyin: 'Wànnéng Wǎnzhī / Jīngdiǎn Hóngshāo Jiàngzhī',
    category: 'wanzhi_brown',
    subtitle: 'Краеугольный камень кантонской и домашней китайской кухни (по канонам Chinese Cooking Demystified)',
    summary: 'Сбалансированная предварительно смешанная миска-соус (碗汁 Wanzhi). При выливании в раскаленный вок моментально клейстеризуется крахмалом, обволакивая продукты зеркальной умами-пленкой.',
    scientificBreakdown: 'Максимальный охват рецепторов: Глутамат из светлого соуса + Аденилат (AMP) из устричного + Инозинат/Гуанилат (I+G) из Цзицзин Taitaile. Крахмал снижает диффузию соуса, продлевая контакт с языком.',
    targetProteins: ['Фучжу', 'Сейтан', 'Доупи', 'Картофель', 'Морковь'],
    defaultPortions: 2,
    ingredients: [
      { ingredientId: 'light_soy', amount: 15, unit: 'ml', stage: 'seasoning_mix', notes: '1 ст. л. — глутаматный каркас' },
      { ingredientId: 'dark_soy', amount: 5, unit: 'ml', stage: 'seasoning_mix', notes: '1 ч. л. — цвет и глубина меланоидинов' },
      { ingredientId: 'oyster_sauce', amount: 1, unit: 'tbsp', stage: 'seasoning_mix', notes: '1 ст. л. — моллюсковый аденилат (AMP) и тело' },
      { ingredientId: 'shaoxing_wine', amount: 15, unit: 'ml', stage: 'seasoning_mix', notes: '1 ст. л. — сложные эфиры и аромат' },
      { ingredientId: 'sugar', amount: 0.5, unit: 'tsp', stage: 'seasoning_mix', notes: '1/2 ч. л. — смягчение солевых пиков' },
      { ingredientId: 'taitaile_jijing', amount: 0.5, unit: 'tsp', stage: 'seasoning_mix', notes: '1/2 ч. л. — бустер I+G (синергия x1218)' },
      { ingredientId: 'white_pepper', amount: 0.25, unit: 'tsp', stage: 'seasoning_mix', notes: 'Щепотка — фоновый пипериновый жар' },
      { ingredientId: 'potato_starch', amount: 1, unit: 'tsp', stage: 'slurry_gouqian', notes: '1 ч. л. — клейстеризация 65°C' },
      { ingredientId: 'water_stock', amount: 60, unit: 'ml', stage: 'liquid_base', notes: '4 ст. л. — гидрофильный растворитель' },
      { ingredientId: 'garlic', amount: 2, unit: 'cloves', stage: 'baoguo_aromatics', notes: 'Измельчить для Baoguo' },
      { ingredientId: 'ginger', amount: 5, unit: 'g', stage: 'baoguo_aromatics', notes: 'Тонкие пластинки' },
      { ingredientId: 'scallion', amount: 10, unit: 'g', stage: 'baoguo_aromatics', notes: 'Белая часть в вок, зеленая на финиш' },
      { ingredientId: 'sesame_oil', amount: 0.5, unit: 'tsp', stage: 'finish_mingyou', notes: 'Финишный блеск Mingyou' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Сборка чаши Wanzhi (碗汁)',
        chineseTerm: '调配碗汁 (Tiáopèi Wǎnzhī)',
        tempLevel: 'cold',
        duration: '1 мин',
        instruction: 'В небольшой миске соедините воду, светлый и темный соевый соус, устричный соус, шаосинское вино, сахар, цзицзин Taitaile, белый перец и картофельный крахмал. Тщательно взбейте до полного растворения крахмала.',
        biochemicalAction: 'Крахмальные гранулы взвешиваются в водной фазе вместе с солями и глутаматом, предотвращая комкование при термическом ударе.'
      },
      {
        stepNumber: 2,
        title: 'Ароматический взрыв (Baoguo)',
        chineseTerm: '热油爆锅 (Rèyóu Bàoguō)',
        tempLevel: 'high_wok_blast',
        duration: '15-20 сек',
        instruction: 'Сильно разогрейте вок с 1 ст. л. растительного масла. Забросьте нарезанный чеснок, имбирь и белую часть зеленого лука. Непрерывно перемешивайте 15 секунд до сильного аромата.',
        biochemicalAction: 'Аллицин и джинджеролы переходят в горячий липидный слой, формируя базовый ароматический профиль китайского вока.'
      },
      {
        stepNumber: 3,
        title: 'Обжарка белка / овощей',
        chineseTerm: '煸炒主料 (Biānchǎo Zhǔliào)',
        tempLevel: 'high_wok_blast',
        duration: '1-2 мин',
        instruction: 'Добавьте подготовленный белок (нарезанный сейтан, отжатый фучжу или тофу-листы доупи) и овощи. Обжаривайте на высоком жаре до легких подпалин.',
        biochemicalAction: 'Реакция Майяра на поверхности пористого белка создает дополнительные ароматические гетероциклы.'
      },
      {
        stepNumber: 4,
        title: 'Ввод Wanzhi и клейстеризация (Gouqian)',
        chineseTerm: '泼汁勾芡 (Pōzhī Gōuqiàn)',
        tempLevel: 'high_wok_blast',
        duration: '30-45 сек',
        instruction: 'Еще раз взболтайте миску Wanzhi со дна (крахмал оседает) и вылейте по центру вока. Соус мгновенно закипит и начнет густеть. Энергично перемешивайте 30 секунд.',
        biochemicalAction: 'При температуре выше 65°C амилопектин крахмала мгновенно впитывает жидкость и набухает, захватывая молекулы глутамата и нуклеотидов в вязкую эмульсию.'
      },
      {
        stepNumber: 5,
        title: 'Финишное глянцевание (Mingyou)',
        chineseTerm: '淋明油 (Lín Míngyóu)',
        tempLevel: 'off_heat',
        duration: '5 сек',
        instruction: 'Снимите вок с огня. Влейте 1/2 ч. л. кунжутного масла и посыпьте зеленью лука. Сделайте финальный бросок вока.',
        biochemicalAction: 'Липидная пленка кунжутного масла запечатывает ароматические летучие соединения и придает соусу ресторанный зеркальный глянец.'
      }
    ],
    proTips: [
      'Всегда перемешивайте Wanzhi перед выливанием — тяжелые гранулы картофельного крахмала оседают за 15 секунд.',
      'Если соус кажется слишком густым, добавьте 1 ст. л. горячей воды или бульона по краю вока.',
      'Темный соус добавляйте строго каплями: его задача — цвет Red Cooking, а не соленость.'
    ],
    literatureReference: 'Chinese Cooking Demystified: "WTF is Chinese Brown Sauce", Substack 2023 & Yamaguchi J. Nutr. 2000.'
  },
  {
    id: 'sichuan_mala_douban',
    title: 'Сычуаньский Острый Умами-Соус (Mala Douban)',
    chineseTitle: '川味麻辣豆瓣汁',
    pinyin: 'Chuānwèi Málà Dòubànzhī',
    category: 'sichuan_spicy',
    subtitle: 'Аутентичный сычуаньский профиль: ферментированная паста Писянь + вибрация Хуацзяо + Lao Gan Ma',
    summary: 'Глубокий огненно-ароматический соус с шелковистой текстурой. Основан на раскрытии писяньского доубанцзяна в горячем масле и синергии соевого глутамата с гуанилатом шиитаке.',
    scientificBreakdown: 'Взрывная связка: глутамат длительной ферментации бобов (1100 мг/100г) + гуанилат шиитаке (GMP) + активация TRPV1 (капсаицин) и механорецепторов (саншул 50Гц).',
    targetProteins: ['Сейтан', 'Фучжу', 'Доупи', 'Картофель'],
    defaultPortions: 2,
    ingredients: [
      { ingredientId: 'pixian_doubanjiang', amount: 1, unit: 'tbsp', stage: 'baoguo_aromatics', notes: 'Мелко порубить перед жаркой' },
      { ingredientId: 'lao_gan_ma', amount: 1, unit: 'tsp', stage: 'baoguo_aromatics', notes: 'Текстура хрустящего чили и доучи' },
      { ingredientId: 'sichuan_pepper', amount: 0.5, unit: 'tsp', stage: 'baoguo_aromatics', notes: 'Хуацзяо — эффект онемения (Ma)' },
      { ingredientId: 'chili_flakes', amount: 0.5, unit: 'tsp', stage: 'baoguo_aromatics', notes: 'Для экстракции красного масла' },
      { ingredientId: 'garlic', amount: 3, unit: 'cloves', stage: 'baoguo_aromatics', notes: 'Мелко нарубленный' },
      { ingredientId: 'ginger', amount: 8, unit: 'g', stage: 'baoguo_aromatics', notes: 'Мелкий кубик' },
      { ingredientId: 'light_soy', amount: 10, unit: 'ml', stage: 'seasoning_mix', notes: '2 ч. л. — глутаматный буфер' },
      { ingredientId: 'shaoxing_wine', amount: 15, unit: 'ml', stage: 'seasoning_mix', notes: '1 ст. л. — деглазирование' },
      { ingredientId: 'sugar', amount: 1, unit: 'tsp', stage: 'seasoning_mix', notes: 'Обязательно для баланса остроты и солености пасты' },
      { ingredientId: 'shiitake_powder', amount: 0.5, unit: 'tsp', stage: 'seasoning_mix', notes: 'Гуанилатный мультипликатор GMP' },
      { ingredientId: 'taitaile_jijing', amount: 0.5, unit: 'tsp', stage: 'seasoning_mix', notes: 'Финальная умами-яркость' },
      { ingredientId: 'potato_starch', amount: 1, unit: 'tsp', stage: 'slurry_gouqian', notes: 'Для нежного обволакивания' },
      { ingredientId: 'water_stock', amount: 80, unit: 'ml', stage: 'liquid_base', notes: 'Бульонная среда' },
      { ingredientId: 'sesame_oil', amount: 0.5, unit: 'tsp', stage: 'finish_mingyou', notes: 'Финиш' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Подготовка пасты и специй',
        chineseTerm: '剁豆瓣 (Duò Dòubàn)',
        tempLevel: 'cold',
        duration: '1 мин',
        instruction: 'Пасту Писянь доубанцзян мелко порубите ножом на доске (цельные бобы хуже отдают масло и цвет). В чаше смешайте воду, соевый соус, сахар, вино, шиитаке и крахмал.',
        biochemicalAction: 'Измельчение разрушает клеточные стенки конских бобов, многократно увеличивая площадь контакта с раскаленным маслом.'
      },
      {
        stepNumber: 2,
        title: 'Экстракция красного масла (Chao Hongyou)',
        chineseTerm: '炒出红油 (Chǎo Chū Hóngyóu)',
        tempLevel: 'low_warm',
        duration: '40-60 сек',
        instruction: 'Нагрейте в воке 1.5 ст. л. масла на СРЕДНЕМ/НИЗКОМ огне. Добавьте сычуаньский перец и нарубленный доубанцзян с Lao Gan Ma. Обжаривайте, помешивая, пока масло не станет прозрачно-рубиновым.',
        biochemicalAction: 'При 130-140°C жирорастворимые каротиноиды и капсаицин чили растворяются в триглицеридах масла, рождая фирменный красный сычуаньский цвет.'
      },
      {
        stepNumber: 3,
        title: 'Ввод ароматики и деглазирование',
        chineseTerm: '下姜蒜 料酒烹锅',
        tempLevel: 'high_wok_blast',
        duration: '20 сек',
        instruction: 'Увеличьте огонь до максимума. Забросьте чеснок и имбирь, обжарьте 10 сек. Плесните шаосинское вино по раскаленным стенкам вока.',
        biochemicalAction: 'Пары этанола уносят резкие летучие фракции и вызывают карамелизацию сахаров вина.'
      },
      {
        stepNumber: 4,
        title: 'Тушение и сборка соуса',
        chineseTerm: '合汁勾芡 (Hézhī Gōuqiàn)',
        tempLevel: 'high_wok_blast',
        duration: '45 сек',
        instruction: 'Добавьте сейтан/фучжу, перемешайте, влейте подготовленную жидкую основу с крахмалом и шиитаке. Тушите 45 секунд, пока соус не станет блестящим и густым.',
        biochemicalAction: 'Высокая концентрация ионов Na+ и глутамата проникает в поры сейтана под действием осмотического давления.'
      }
    ],
    proTips: [
      'Никогда не жарьте доубанцзян на максимальном огне — он моментально сгорит и станет горьким.',
      'Сахар в этом соусе обязателен: он не делает соус сладким, а "округляет" жгучий писяньский профиль.'
    ],
    literatureReference: 'Sichuan Culinary Science / Yamaguchi & Takahashi (1984b) Hedonic interaction of salt and amino-compounds.'
  },
  {
    id: 'imperial_braised_doupi_seitan',
    title: 'Императорская Глазурь для Доупи и Сейтана (Hongshao Mianjin)',
    chineseTitle: '红烧面筋豆皮酱汁',
    pinyin: 'Hóngshāo Miànjīn Dòupí Jiàngzhī',
    category: 'braising_glaze',
    subtitle: 'Насыщенный сладко-соленый соус глубокого томления с пастой Haday и темным соевым соусом',
    summary: 'Специализированная глазурь для растительных белков (тофу-листы Доупи, Фучжу, Сейтан). Пористые белки жадно впитывают концентрированный соево-карамельный умами-бульон.',
    scientificBreakdown: 'Тройной соевый союз: цельнобобовая паста Haday + светлый соус + темный карамельный соус. При варке с шиитаке образуется густой соус с пролонгированным послевкусием (>160 сек).',
    targetProteins: ['Доупи', 'Сейтан', 'Фучжу', 'Морковь'],
    defaultPortions: 2,
    ingredients: [
      { ingredientId: 'haday_huangdoujiang', amount: 1, unit: 'tbsp', stage: 'baoguo_aromatics', notes: 'Неострая соевая паста — основа тела' },
      { ingredientId: 'light_soy', amount: 15, unit: 'ml', stage: 'seasoning_mix', notes: '1 ст. л. — соль и глутамат' },
      { ingredientId: 'dark_soy', amount: 8, unit: 'ml', stage: 'seasoning_mix', notes: '1/2 ст. л. — глубокий рубиновый цвет' },
      { ingredientId: 'shaoxing_wine', amount: 20, unit: 'ml', stage: 'seasoning_mix', notes: 'Для расщепления соевого запаха' },
      { ingredientId: 'sugar', amount: 1.5, unit: 'tsp', stage: 'seasoning_mix', notes: 'Карамельная глазурь' },
      { ingredientId: 'shiitake_powder', amount: 1, unit: 'tsp', stage: 'seasoning_mix', notes: 'Высокий гуанилат для растительного белка' },
      { ingredientId: 'american_chef_chicken', amount: 0.5, unit: 'tsp', stage: 'seasoning_mix', notes: 'Плотный бульонный фон' },
      { ingredientId: 'coriander_seeds', amount: 0.5, unit: 'tsp', stage: 'baoguo_aromatics', notes: 'Пряные древесные ноты' },
      { ingredientId: 'ginger', amount: 10, unit: 'g', stage: 'baoguo_aromatics', notes: 'Пластинки' },
      { ingredientId: 'garlic', amount: 2, unit: 'cloves', stage: 'baoguo_aromatics', notes: 'Раздавить плоской стороной ножа' },
      { ingredientId: 'water_stock', amount: 120, unit: 'ml', stage: 'liquid_base', notes: 'Жидкость для тушения' },
      { ingredientId: 'potato_starch', amount: 1, unit: 'tsp', stage: 'slurry_gouqian', notes: 'Финальная подтяжка соуса' },
      { ingredientId: 'sesame_oil', amount: 0.5, unit: 'tsp', stage: 'finish_mingyou', notes: 'Блеск' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Обжарка пасты Haday и специй',
        chineseTerm: '爆香黄豆酱 (Bàoxiāng Huángdòujiàng)',
        tempLevel: 'medium_gentle',
        duration: '30 сек',
        instruction: 'В воке прогрейте 1 ст. л. масла. Добавьте раздавленный чеснок, имбирь, семена кинзы и пасту Haday Huangdoujiang. Обжаривайте 30 секунд до карамельного аромата.',
        biochemicalAction: 'Пептиды и сахара пасты Haday вступают в мягкую реакцию Майяра при температуре 120°C.'
      },
      {
        stepNumber: 2,
        title: 'Ввод жидкостей и белковой матрицы',
        chineseTerm: '下料焖煮 (Xiàliào Mènzhǔ)',
        tempLevel: 'medium_gentle',
        duration: '3-4 мин',
        instruction: 'Влейте вино, соевые соусы, воду, сахар, пудру шиитаке и порошок American Chef. Заложите нарезанный сейтан или свернутые рулеты доупи. Накройте крышкой и тушите 3 минуты.',
        biochemicalAction: 'Поры сейтана и слои доупи набухают, абсорбируя до 150% своего веса в концентрированном глутаматно-гуанилатном бульоне.'
      },
      {
        stepNumber: 3,
        title: 'Редукция и крахмальная фиксация',
        chineseTerm: '收汁勾薄芡 (Shōuzhī Gōubáoqiàn)',
        tempLevel: 'high_wok_blast',
        duration: '1 мин',
        instruction: 'Снимите крышку, увеличьте огонь до максимума, выпарите соус до 1/3 объема. Влейте тонкую крахмальную суспензию, перемешайте до глазирования.',
        biochemicalAction: 'Выпаривание повышает концентрацию солей и сахаров до идеального диапазона Brix 12-14%.'
      }
    ],
    proTips: [
      'Перед тушением обжарьте сейтан на сухой сковороде или во фритюре — корочка сохранит упругость внутри соуса.',
      'Рулеты из доупи (Doupi Juan) перевяжите нитью или проткните шпажкой.'
    ],
    literatureReference: 'Traditional Jiangnan Red-Cooking Science / Kuninaka (1964) Guanylate synergy.'
  },
  {
    id: 'golden_superior_broth',
    title: 'Прозрачный Золотой Бульон (Gao Tang / Hangjiao Base)',
    chineseTitle: '清醇高汤 / 鲜香汤底',
    pinyin: 'Qīngchún Gāotāng / Xiānxiāng Tāngdǐ',
    category: 'superior_broth',
    subtitle: 'Чистый питьевой и суповой бульон с эталонной 1:1 синергией глутамата и инозината/гуанилата',
    summary: 'Кристально чистый, золотистый бульон для отваривания лапши, вонтонов, фучжу или сейтана. Без замутнения, с глубоким многослойным послевкусием.',
    scientificBreakdown: 'В соответствии с графиком Yamaguchi (Figure 1), максимальный коэффициент синергии достигается при равном присутствии глутамата и нуклеотидов. Достигается комбинацией Taitaile + American Chef + Шиитаке.',
    targetProteins: ['Фучжу', 'Доупи', 'Сейтан', 'Морковь', 'Картофель'],
    defaultPortions: 2,
    ingredients: [
      { ingredientId: 'water_stock', amount: 450, unit: 'ml', stage: 'liquid_base', notes: 'Чистая фильтрованная вода' },
      { ingredientId: 'american_chef_chicken', amount: 1, unit: 'tsp', stage: 'liquid_base', notes: 'Мясная куриная глубина IMP' },
      { ingredientId: 'taitaile_jijing', amount: 0.5, unit: 'tsp', stage: 'liquid_base', notes: 'Высокий глутамат и I+G' },
      { ingredientId: 'shiitake_powder', amount: 0.25, unit: 'tsp', stage: 'liquid_base', notes: 'Микро-доза гуанилата GMP' },
      { ingredientId: 'light_soy', amount: 5, unit: 'ml', stage: 'seasoning_mix', notes: '1 ч. л. — легкий золотистый оттенок' },
      { ingredientId: 'shaoxing_wine', amount: 10, unit: 'ml', stage: 'seasoning_mix', notes: 'Очистка вкуса' },
      { ingredientId: 'white_pepper', amount: 0.25, unit: 'tsp', stage: 'seasoning_mix', notes: 'Деликатное тепло' },
      { ingredientId: 'ginger', amount: 8, unit: 'g', stage: 'baoguo_aromatics', notes: '2 тонких ломтика' },
      { ingredientId: 'scallion', amount: 15, unit: 'g', stage: 'baoguo_aromatics', notes: 'Стебли целиком' },
      { ingredientId: 'sesame_oil', amount: 0.25, unit: 'tsp', stage: 'finish_mingyou', notes: 'Пара капель ароматического купола' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Экстракция ароматики в кипящей воде',
        chineseTerm: '慢火浸香 (Mànhuǒ Jìnxiāng)',
        tempLevel: 'low_warm',
        duration: '4-5 мин',
        instruction: 'В сотейнике соедините 450 мл воды, ломтики имбиря и стебли лука. Доведите до тихого кипения на медленном огне (90°C), не допуская бурного бурления.',
        biochemicalAction: 'Щадящая термообработка предотвращает разрушение нежных летучих терпенов имбиря и лука.'
      },
      {
        stepNumber: 2,
        title: 'Ввод умами-матрицы',
        chineseTerm: '精准调鲜 (Jīngzhǔn Tiáoxiān)',
        tempLevel: 'low_warm',
        duration: '1 мин',
        instruction: 'Удалите имбирь и лук. Введите American Chef, Taitaile цзицзин, микродозу порошка шиитаке, светлый соевый соус, шаосинское вино и белый перец. Размешайте до полной прозрачности.',
        biochemicalAction: 'Ионы L-глутамата и нуклеотидов гидратируются в горячей воде, создавая оптически чистый раствор с пиковой биодоступностью для рецепторов.'
      },
      {
        stepNumber: 3,
        title: 'Финальная подача',
        chineseTerm: '点油出锅 (Diǎnyóu Chūguō)',
        tempLevel: 'off_heat',
        duration: '10 сек',
        instruction: 'Снимите с огня, добавьте 2-3 капли кунжутного масла. Используйте как основу для супа с фучжу/доупи или как бульон для питья.',
        biochemicalAction: 'Микропленка кунжутного масла задерживает испарение ароматических веществ.'
      }
    ],
    proTips: [
      'Никогда не кипятите бульон бурно: высокая температура ускоряет окисление тонких вкусовых молекул.',
      'Для веганского варианта увеличьте долю шиитаке и светлого соуса, исключив куриные гранулы.'
    ],
    literatureReference: 'Yamaguchi & Ninomiya (2000) Table 1 & 2: Natural occurrence of ribonucleotides in stocks.'
  },
  {
    id: 'sweet_sour_tangcu_umami',
    title: 'Черно-уксусный Танцу с Умами-каркасом (Tangcu Glaze)',
    chineseTitle: '糖醋陈醋鲜汁',
    pinyin: 'Tángcù Chéncù Xiānzhī',
    category: 'sweet_sour',
    subtitle: 'Аутентичный кисло-сладкий баланс на черном Чжэньцзянском уксусе с глутаматным противовесом',
    summary: 'Благородный глянцевый соус в стиле Сучжоу/Ханчжоу. В отличие от западного кисло-сладкого соуса на кетчупе, строится на дымном ферментированном уксусе, сахаре и умами-синергии.',
    scientificBreakdown: 'Взаимодействие 4 базовых вкусов: глутамат + янтарная кислота уксуса + сахароза + соль. Согласно исследованию Steiner (1987), сочетание глутамата со сладостью вызывает наивысший гедонический отклик.',
    targetProteins: ['Сейтан', 'Фучжу', 'Картофель', 'Морковь'],
    defaultPortions: 2,
    ingredients: [
      { ingredientId: 'black_vinegar', amount: 20, unit: 'ml', stage: 'seasoning_mix', notes: 'Чжэньцзянский уксус — дымная кислотность' },
      { ingredientId: 'sugar', amount: 3, unit: 'tsp', stage: 'seasoning_mix', notes: '1 ст. л. — сладкий баланс (Brix ~18%)' },
      { ingredientId: 'light_soy', amount: 10, unit: 'ml', stage: 'seasoning_mix', notes: '2 ч. л. — минеральная соленость и умами' },
      { ingredientId: 'shaoxing_wine', amount: 10, unit: 'ml', stage: 'seasoning_mix', notes: 'Ферментированный рисовый тон' },
      { ingredientId: 'taitaile_jijing', amount: 0.5, unit: 'tsp', stage: 'seasoning_mix', notes: 'Умами-стабилизатор' },
      { ingredientId: 'potato_starch', amount: 1.5, unit: 'tsp', stage: 'slurry_gouqian', notes: 'Плотная глянцевая пленка' },
      { ingredientId: 'water_stock', amount: 50, unit: 'ml', stage: 'liquid_base', notes: 'Растворитель' },
      { ingredientId: 'ginger', amount: 5, unit: 'g', stage: 'baoguo_aromatics', notes: 'Мелкая соломка' },
      { ingredientId: 'garlic', amount: 2, unit: 'cloves', stage: 'baoguo_aromatics', notes: 'Лепестки' },
      { ingredientId: 'sesame_oil', amount: 0.5, unit: 'tsp', stage: 'finish_mingyou', notes: 'Финишный блеск' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Смешивание соуса Танцу',
        chineseTerm: '调糖醋汁 (Tiáo Tángcùzhī)',
        tempLevel: 'cold',
        duration: '1 мин',
        instruction: 'В миске взбейте черный уксус, сахар, соевый соус, вино, цзицзин, воду и картофельный крахмал до полного растворения кристаллов сахара.',
        biochemicalAction: 'Сахароза и уксусная кислота формируют устойчивый буферный раствор с pH ~3.8.'
      },
      {
        stepNumber: 2,
        title: 'Ароматизация и карамелизация',
        chineseTerm: '热油激香 (Rèyóu Jīxiāng)',
        tempLevel: 'high_wok_blast',
        duration: '20 сек',
        instruction: 'В сильно разогретом воке на 1 ст. л. масла обжарьте чеснок и имбирь 10 секунд. Влейте подготовленную смесь Танцу.',
        biochemicalAction: 'Высокая температура карамелизует сахара на стенках вока, рождая ноты жженого тростника.'
      },
      {
        stepNumber: 3,
        title: 'Глазирование белков',
        chineseTerm: '包汁出锅 (Bāozhī Chūguō)',
        tempLevel: 'high_wok_blast',
        duration: '30 сек',
        instruction: 'Как только соус закипит крупными пузырями и станет кристально-прозрачным, всыпьте обжаренный хрустящий сейтан или фучжу. Быстро перемешайте 20 секунд и снимите с огня.',
        biochemicalAction: 'Крахмальный гель высокой плотности плотно облегает хрустящую корочку сейтана, не размягчая ее раньше времени.'
      }
    ],
    proTips: [
      'Золотая пропорция Танцу: 3 части сахара на 4 части черного уксуса и 2 части соевого соуса.',
      'Закладывайте жареный сейтан в последний момент, чтобы сохранить хруст.'
    ],
    literatureReference: 'Steiner (1987) Gustatory response to sweet and umami blends.'
  },
  {
    id: 'neo_sichuan_pickle_brine',
    title: 'Нео-сычуаньский Соус на Рассоле (Suancai Umami Fusion)',
    chineseTitle: '泡菜汁风味鲜汁 / 新派酸菜酱',
    pinyin: 'Pàocàizhī Fēngwèi Xiānzhī',
    category: 'pickle_fermented',
    subtitle: 'Авангардная ферментация: огуречный молочнокислый рассол + Доубанцзян + свежий чеснок',
    summary: 'Инновационный шефский соус в стиле кухни Чэнду. Использование огуречного рассола вводит натуральную молочную кислоту (Lactic acid), которая звучит в соусе намного мягче уксуса и создает глубокий союз с писяньской пастой.',
    scientificBreakdown: 'Молочнокислые лактобациллы рассола + глутамат бобов доубанцзяна + инозинат куриного экстракта. Молочная кислота не угнетает рецепторы языка, в отличие от высокой дозы уксусной.',
    targetProteins: ['Сейтан', 'Фучжу', 'Доупи', 'Картофель'],
    defaultPortions: 2,
    ingredients: [
      { ingredientId: 'pickle_brine', amount: 50, unit: 'ml', stage: 'liquid_base', notes: 'Ферментированный огуречный рассол' },
      { ingredientId: 'pickled_cucumber', amount: 20, unit: 'g', stage: 'baoguo_aromatics', notes: 'Мелкий хрустящий кубик' },
      { ingredientId: 'pixian_doubanjiang', amount: 1, unit: 'tsp', stage: 'baoguo_aromatics', notes: 'Острая бобовая основа' },
      { ingredientId: 'garlic', amount: 3, unit: 'cloves', stage: 'baoguo_aromatics', notes: 'Много нарубленного чеснока' },
      { ingredientId: 'ginger', amount: 6, unit: 'g', stage: 'baoguo_aromatics', notes: 'Свежий имбирь' },
      { ingredientId: 'white_pepper', amount: 0.5, unit: 'tsp', stage: 'seasoning_mix', notes: 'Обязательно для стиля Суаньцай' },
      { ingredientId: 'taitaile_jijing', amount: 0.5, unit: 'tsp', stage: 'seasoning_mix', notes: 'Усилитель умами' },
      { ingredientId: 'sugar', amount: 1, unit: 'tsp', stage: 'seasoning_mix', notes: 'Баланс молочной кислоты' },
      { ingredientId: 'potato_starch', amount: 1, unit: 'tsp', stage: 'slurry_gouqian', notes: 'Загуститель' },
      { ingredientId: 'sesame_oil', amount: 0.5, unit: 'tsp', stage: 'finish_mingyou', notes: 'Финиш' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Обжарка чеснока, доубанцзяна и кубиков огурца',
        chineseTerm: '爆炒泡菜料 (Bàochǎo Pàocàiliào)',
        tempLevel: 'high_wok_blast',
        duration: '30 сек',
        instruction: 'В воке на 1 ст. л. масла обжарьте чеснок, имбирь, 1 ч. л. писяньской пасты и кубики соленого огурца до сильного жарено-пряного аромата.',
        biochemicalAction: 'Молочнокислые соли огурца при контакте с горячим маслом карамелизуются, отдавая специфический сложный ферментативный букет.'
      },
      {
        stepNumber: 2,
        title: 'Ввод рассола и редукция',
        chineseTerm: '下泡菜水 (Xià Pàocàishuǐ)',
        tempLevel: 'high_wok_blast',
        duration: '40 сек',
        instruction: 'Влейте огуречный рассол, сахар, белый перец и цзицзин Taitaile. Проварите 40 секунд.',
        biochemicalAction: 'Ионы калия и натрия рассола синергируют с глутаматом, снижая потребность в дополнительной поваренной соли.'
      },
      {
        stepNumber: 3,
        title: 'Загущение и покрытие продуктов',
        chineseTerm: '勾芡出锅 (Gōuqiàn Chūguō)',
        tempLevel: 'high_wok_blast',
        duration: '20 сек',
        instruction: 'Влейте крахмальную суспензию, забросьте фучжу или сейтан и прогрейте 20 секунд до бархатистого блеска.',
        biochemicalAction: 'Крахмал связывает молочную кислоту и глутамат в единую эмульсию.'
      }
    ],
    proTips: [
      'Поскольку рассол уже соленый, дополнительную соль добавлять не нужно.',
      'Идеально подходит для блюд с отварным картофелем и соевой спаржей.'
    ],
    literatureReference: 'Sichuan Fermentation Chemistry / Yamaguchi & Takahashi (1984a) Clear soup palatability model.'
  }
];
