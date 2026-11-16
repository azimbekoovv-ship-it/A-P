/* A&P — личный недельный планировщик. Без зависимостей, работает офлайн.
   Языки: болгарский (основной) и русский. */
'use strict';
(function () {

/* =====================================================================
   Константы
   ===================================================================== */
const APP_VERSION = '3.1.1';
const BASE_CATS = [
  { id: 'work', color: '#4f6df5' }, { id: 'gym', color: '#f2894a' }, { id: 'guitar', color: '#9b5de5' },
  { id: 'business', color: '#1fa88a' }, { id: 'it', color: '#e6a817' }, { id: 'practice', color: '#e5517a' },
  { id: 'meeting', color: '#3aa6d8' }, { id: 'rehearsal', color: '#8bb33d' }
];
const BASE_BY_ID = Object.fromEntries(BASE_CATS.map(c => [c.id, c]));
const SWATCHES = ['#e11d48', '#ea580c', '#ca8a04', '#65a30d', '#059669', '#0891b2', '#2563eb', '#7c3aed', '#c026d3', '#64748b'];
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DB_NAME = 'ap-planner', DB_STORE = 'kv', STATE_KEY = 'state', LS_KEY = 'ap_state_v2';
const DEFAULT_PIN = '1234';
const AUTO_LOCK_MS = 5 * 60 * 1000;

/* =====================================================================
   Языки
   ===================================================================== */
const L = {
  bg: {
    catRemoveAria: 'Премахни категория {name}', catRemove: 'Премахни', catHidden: 'Категорията е премахната от списъка', toTrashTitle: 'Преместване в кошчето?', restoredWeek: 'Седмицата е възстановена', purgeTitle: 'Изтриване завинаги?', purged: 'Изтрито завинаги', resetTitle: 'Нулиране на настройките?', resetText: 'Езикът, темата и изгледът се връщат по подразбиране, скритите категории се показват отново. Задачите и архивът не се променят.', wipeTitle: 'Изтриване на всички данни?',
    appSub: 'Седмичен планер',
    tabWeek: 'Седмица', tabArchive: 'Архив', tabMore: 'Още',
    subArchive: 'Архив на седмиците', subMore: 'Настройки и данни',
    weekWord: 'Седмица', activeWeek: 'Активна седмица',
    statTasks: 'Задачи за седмицата', statHours: 'Общо планирани:', statsAria: 'Статистика на седмицата', statHoursAria: 'Общо планирани: {v}',
    viewDay: 'Ден', viewWeek: 'Седмица', viewMode: 'Режим на показване', daysAria: 'Дни от седмицата',
    today: 'днес', noTasks: 'Няма задачи', freeDay: 'Свободен ден. Натиснете „Задача“, за да добавите.', archDayEmpty: 'През този ден нямаше задачи',
    fab: 'Задача', fabAria: 'Добавяне на задача',
    finishWeek: 'Приключи седмицата', finishHint: 'Седмицата се запазва в архива само за преглед. След това можете да създадете нова празна седмица.',
    pdf: 'Свали PDF', pdfSaved: 'PDF файлът е запазен', pdfFail: 'Не успях да създам PDF',
    progress: 'Изпълнени {done} от {total}', doneAria: 'Изпълнена: {title}', editAria: 'Редактиране: {title}, {time}',
    noWeekDone: 'Седмицата е приключена', noWeekNone: 'Няма активна седмица',
    noWeekDoneText: 'Разписанието е запазено в архива. Създайте нова празна седмица и я попълнете със задачи.', noWeekNoneText: 'Създайте нова седмица и добавете задачи.',
    createWeek: 'Създай нова седмица', openLast: 'Отвори последната архивна седмица',
    archTitle: 'Архив на седмиците', 
    archEmptyT: 'Архивът е празен', archEmptyP: 'Когато приключите седмица, тя ще се появи тук с всички задачи и статистика.',
    archDone: 'Приключена {date}', archBadge: 'Архив · само за преглед', archNotice: 'Това е запазена седмица. Задачите в нея не могат да се променят или изтриват.',
    archCats: 'По категории', archBack: 'Архив', archDoneCount: 'изпълнени {n}',
    unitTask: ['задача', 'задачи'], unitHour: ['час', 'часа'], unitH: 'ч', unitMin: 'мин',
    taskNew: 'Нова задача', taskEdit: 'Редактиране на задача', fTitle: 'Име', phTitle: 'Например: Работа', fDay: 'Ден от седмицата', fCat: 'Категория', fStart: 'Начало', fEnd: 'Край',
    dur: 'Продължителност: {v}', durPick: 'Продължителност: посочете часове', durSame: 'Продължителност: началото и краят съвпадат', durNext: '(до следващия ден)',
    errTitle: 'Въведете име на задачата', errTime: 'Посочете начален и краен час', errSame: 'Краят трябва да е различен от началото',
    save: 'Запази', cancel: 'Отказ', del: 'Изтрий задачата', saved: 'Промените са запазени', added: 'Задачата е добавена', deleted: 'Задачата е изтрита',
    delTitle: 'Да изтрия ли задачата?', delOk: 'Изтрий',
    catNew: 'Нова категория', catNewShort: 'Нова', catName: 'Име на категорията', catColor: 'Цвят', catAdd: 'Добави', catErrName: 'Въведете име на категорията', catErrDup: 'Такава категория вече има', catAdded: 'Категорията е добавена',
    nwTitle: 'Нова седмица', nwLabel: 'Всеки ден от нужната седмица', nwRange: 'Седмица: {r}', nwDup: ' (вече има такава в архива)', nwNote: 'Седмицата ще е празна. Задачите добавяте вие.', nwCreate: 'Създай седмицата', errDate: 'Изберете дата', nwCreated: 'Новата седмица е създадена. Добавете задачи.',
    finTitle: 'Да приключа ли седмицата?', finText: '{range}\n{count}, {hours}. Изпълнени: {done}.\n\nСедмицата ще се запази в архива само за преглед. После можете да създадете нова празна седмица.', finOk: 'Приключи седмицата', finToast: 'Седмицата е в архива. Не забравяйте резервното копие!',
    lockSub: 'Въведете PIN код', pinPh: 'PIN код', unlock: 'Отключи', pinWrong: 'Грешен PIN код', pinWait: 'Твърде много опити. Изчакайте {s} с.', pinDefaultHint: 'Начален PIN код: 1234. Сменете го от „Още“.', pinCheckErr: 'PIN кодът не може да се провери. Отворете приложението през https://…',
    lockNow: 'Заключи', theme: 'Смяна на темата', langAria: 'Смяна на езика',
    moreTitle: 'Още', moreSub: 'Език, защита, акаунт, данни и инсталиране.',
    secLang: 'Език', secLangText: 'Основният език е български.', langBg: 'Български', langRu: 'Руски',
    secTheme: 'Външен вид', secThemeText: 'Светла, тъмна или като на устройството.', themeLight: 'Светла', themeDark: 'Тъмна', themeSystem: 'Системна', themeAria: 'Тема',
    secPin: 'Защита с PIN код', secPinText: 'PIN кодът се иска при отваряне на приложението.', reqPin: 'Искай PIN при отваряне', lockBtn: 'Заключи сега',
    secChange: 'Смяна на PIN код', oldPin: 'Стар PIN код', newPin: 'Нов PIN код', confirmPin: 'Потвърдете новия PIN код', pinRule: 'От 4 до 8 цифри', savePin: 'Запази PIN кода',
    errOld: 'Въведете стария PIN код', errOldWrong: 'Старият PIN код е грешен', errNew: 'Новият PIN код трябва да е от 4 до 8 цифри', errNewSame: 'Новият PIN код трябва да е различен от стария', errConfirm: 'Повторете новия PIN код', errMismatch: 'PIN кодовете не съвпадат', pinChanged: 'PIN кодът е сменен',
    pinOffTitle: 'Изключване на PIN кода', pinOffText: 'Потвърдете с PIN кода.', pinOffDone: 'PIN при отваряне е изключен', pinOnDone: 'PIN при отваряне е включен', confirm: 'Потвърди', locked: 'Приложението е заключено',
    secCats: 'Мои категории', secCatsText: 'Категориите, които сте добавили. Нова категория се добавя със знака + при създаване на задача.', noCustomCats: 'Все още няма добавени категории.', catDelete: 'Изтрий', catInUse: 'Категорията се използва в задачи и не може да се изтрие.', catDelTitle: 'Да изтрия ли категорията?', catDeleted: 'Категорията е изтрита',
    secCloud: 'Акаунт и синхронизация', cloudText: 'Влезте с Google, за да се пазят данните в облака и да са достъпни на други устройства.',
    cloudOff: 'Облакът още не е настроен. Добавете ключовете на Firebase във файла firebase-config.js (стъпките са в README).',
    signIn: 'Вход с Google', signOut: 'Изход', syncNow: 'Синхронизирай сега', signedAs: 'Вписан като {email}', syncedAt: 'Синхронизирано: {time}', syncing: 'Синхронизиране…', syncErr: 'Грешка при синхронизация. Ще опитам отново.', syncWait: 'Очаква синхронизация',
    cloudNote: 'Синхронизират се седмиците, архивът и категориите. PIN кодът, езикът и темата остават на всяко устройство.',
    signInErr: 'Входът не успя', cloudLoadErr: 'Не успях да заредя услугата. Проверете интернет връзката.', signedInToast: 'Вписахте се. Данните се синхронизират.', signedOutToast: 'Излязохте от акаунта. Данните остават на това устройство.',
    secBackup: 'Резервно копие', backupText: 'Файл с всички седмици и архива. Пазете го на сигурно място: в облак, на поща или на компютър.',
    lastBackup: 'Последно копие: {date}', noBackup: 'Все още няма копие', btnExport: 'Свали копие', btnImport: 'Възстанови от файл', backupSaved: 'Резервното копие е запазено', saveFail: 'Файлът не може да се запази',
    errNotJson: 'Файлът е повреден или не е резервно копие.', errNotBackup: 'Това не е резервно копие на A&P.', errNoArchive: 'Във файла няма списък с архивни седмици.', readFail: 'Файлът не може да се прочете',
    impTitle: 'Да възстановя ли от файла?', impActive: 'Активна седмица: {r}, {n}.', impNoActive: 'Във файла няма активна седмица.', impArch: 'Архивни седмици: {n}.', impDropped: 'Пропуснати повредени задачи: {n}.', impWarn: 'Всички текущи данни на това устройство ще бъдат заменени. PIN кодът не се променя.', impOk: 'Замени данните', restored: 'Данните са възстановени',
    secInstall: 'Инсталиране на началния екран', installed: 'Приложението е инсталирано и се отваря в отделен прозорец.', installIos: 'На iPhone: натиснете „Споделяне“ в Safari, после „Добавяне към начален екран“.', installAndroid: 'На Android: инсталирайте приложението, за да се отваря в отделен прозорец и да работи без интернет.', installBtn: 'Инсталирай приложението', installHelpT: 'Инсталиране на приложението', installHelp: 'Отворете менюто на браузъра (⋮) и изберете „Инсталиране на приложението“ или „Добавяне към началния екран“. Сайтът трябва да е отворен през HTTPS.', installedToast: 'Приложението е инсталирано',
    secStorage: 'Съхранение на данните', persistOk: 'Хранилището е защитено от автоматично почистване', persistNo: 'Обикновено хранилище', persistChk: 'Проверка на хранилището…', aboutSum: 'Къде се пазят данните и какви са ограниченията',
    about: [
      'Данните се пазят в браузъра на това устройство (IndexedDB със запасно копие в localStorage). Ако влезете с Google, се пази и копие в облака.',
      'Без вход с Google устройствата НЕ се синхронизират: телефонът и компютърът имат отделни разписания. Тогава пренасяйте данните с файл с резервно копие.',
      'Изчистването на данните на сайта, изтриването на приложението или нулирането на браузъра трябва да изтрие разписанието. Сваляйте копие редовно или ползвайте акаунт.',
      'Обикновеният и частният режим пазят данните отделно. Приложението от началния екран и сайтът в раздел на браузъра също може да имат отделни данни (особено на iPhone).',
      'PIN кодът пази само от случайно отваряне и не криптира данните. Не влиза в резервното копие.',
      'Забравен PIN: изчистете данните на сайта в браузъра (PIN кодът пак става 1234). Преди това свалете копие или влезте с Google, за да възстановите данните.'
    ],
    archSub: 'Приключените седмици се пазят тук със статистика. Не можете да ги променяте. Ненужните седмици отиват в кошчето и могат да се възстановят.',
    grpGeneral: 'Общи', grpSecurity: 'Защита', grpCats: 'Категории', grpData: 'Данни и синхронизация', grpApp: 'Приложение', grpReset: 'Нулиране',
    pinChangeSum: 'Смяна на PIN код',
    catsHint: 'Нова категория се добавя със знака + в прозореца за задача, а се премахва с × пред нея.', catsDeleted: 'Изтрити категории', catNoDeleted: 'Няма изтрити категории.',
    catRestore: 'Възстанови', catPurge: 'Изтрий окончателно', catHideTitle: 'Да изтрия ли категорията?', catHideText: 'Категорията „{name}“ ще изчезне от списъка. Задачите с нея остават.', catDelAria: 'Изтрий категорията: {name}', catRestored: 'Категорията е възстановена', catGone: 'Категорията е изтрита', catPurgeText: 'Категорията „{name}“ ще бъде изтрита окончателно.',
    trash: 'Кошче', trashCount: 'Кошче ({n})', trashEmptyT: 'Кошчето е празно', trashEmptyP: 'Тук се показват изтритите архивни седмици. Можете да ги възстановите.', trashHint: 'Изтритите седмици стоят тук, докато не ги изтриете завинаги. Автоматично нищо не се трие.',
    trashed: 'Седмицата е в кошчето', toTrash: 'Премести в кошчето', trashConfirmT: 'Да преместя ли седмицата в кошчето?', trashConfirmText: '{title}\nМожете да я възстановите от кошчето.', toTrashOk: 'Премести',
    restore: 'Възстанови', weekRestored: 'Седмицата е възстановена', purge: 'Изтрий завинаги', purgeT: 'Да изтрия ли завинаги?', purgeText: '{title}\nТова не може да се отмени.', weekPurged: 'Седмицата е изтрита завинаги',
    emptyTrash: 'Изпразни кошчето', emptyTrashT: 'Да изпразня ли кошчето?', emptyTrashText: 'Всички седмици в кошчето ({n}) ще бъдат изтрити завинаги.', trashedOn: 'Изтрита {date}', rowTrash: 'Кошче', rowTrashSub: 'Изтрити архивни седмици: {n}', open: 'Отвори',
    resetSettings: 'Нулирай настройките', resetSettingsText: 'Език, тема, режим на показване, PIN при отваряне и изтритите категории се връщат по подразбиране. Данните и PIN кодът остават.', resetSettingsT: 'Да нулирам ли настройките?', resetOk: 'Нулирай', resetDone: 'Настройките са нулирани',
    wipe: 'Изтрий всички данни', wipeSub: 'Изтрива задачите, архива и кошчето. PIN кодът, настройките и входът с Google остават.', wipeT: 'Да изтрия ли всички данни?',
    wipeText: 'Ще бъдат изтрити задачите, архивът и кошчето. PIN кодът, настройките и входът с Google няма да се променят.\nАко синхронизацията е включена, данните ще се изтрият и от облака, и на другите устройства.\n\nПреди това свалете резервно копие.', wipePin: 'Потвърдете с PIN кода.', wipeOk: 'Изтрий всичко', wipeDone: 'Данните са изтрити',
    pdfReady: 'PDF файлът е готов', pdfSave: 'Запази PDF', pdfOpen: 'Отвори', pdfShare: 'Сподели', close: 'Затвори', pdfHint: 'Ако файлът не се свали сам, натиснете „Запази PDF“. Ако и това не помага, задръжте пръст върху изображението и го запазете.',
    installDesktop: 'На компютър с Windows: инсталирайте приложението от Edge или Chrome. Ще се появи в менюто „Старт“ и ще се отваря в отделен прозорец.',
    version: 'A&P · версия {v}',
    updated: 'Приложението е обновено. Рестартирайте го, за да се приложи.',
    tooManySave: 'Данните не могат да се запазят. Свалете резервно копие!',
    seed_work: 'Работа', seed_gym: 'Тренировка', seed_guitar: 'Китара', seed_business: 'Бизнес', seed_it: 'Учене на IT', seed_practice: 'Практика', seed_meeting: 'Събрание', seed_rehearsal: 'Репетиция',
    cat_work: 'Работа', cat_gym: 'Фитнес', cat_guitar: 'Китара', cat_business: 'Бизнес', cat_it: 'IT', cat_practice: 'Практика', cat_meeting: 'Събрание', cat_rehearsal: 'Репетиция',
    days: ['Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя'],
    daysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
    months: ['яну', 'фев', 'мар', 'апр', 'май', 'юни', 'юли', 'авг', 'сеп', 'окт', 'ное', 'дек'],
    legacyArch: 'Архив от {date}', fallbackWeek: 'Архивна седмица', pdfGen: 'Създадено {date}', pdfDone: 'изпълнени {n}'
  },
  ru: {
    catRemoveAria: 'Убрать категорию {name}', catRemove: 'Убрать', catHidden: 'Категория убрана из списка', toTrashTitle: 'Переместить в корзину?', restoredWeek: 'Неделя восстановлена', purgeTitle: 'Удалить навсегда?', purged: 'Удалено навсегда', resetTitle: 'Сбросить настройки?', resetText: 'Язык, тема и вид вернутся по умолчанию, скрытые категории появятся снова. Занятия и архив не изменятся.', wipeTitle: 'Удалить все данные?',
    appSub: 'Планировщик недели',
    tabWeek: 'Неделя', tabArchive: 'Архив', tabMore: 'Ещё',
    subArchive: 'Архив недель', subMore: 'Настройки и данные',
    weekWord: 'Неделя', activeWeek: 'Активная неделя',
    statTasks: 'Занятий за неделю', statHours: 'Всего запланировано:', statsAria: 'Статистика недели', statHoursAria: 'Всего запланировано: {v}',
    viewDay: 'День', viewWeek: 'Неделя', viewMode: 'Режим просмотра', daysAria: 'Дни недели',
    today: 'сегодня', noTasks: 'Нет занятий', freeDay: 'Свободный день. Нажмите «Занятие», чтобы добавить.', archDayEmpty: 'В этот день занятий не было',
    fab: 'Занятие', fabAria: 'Добавить занятие',
    finishWeek: 'Завершить неделю', finishHint: 'Неделя сохранится в архиве только для просмотра. После этого можно создать новую пустую неделю.',
    pdf: 'Скачать PDF', pdfSaved: 'PDF-файл сохранён', pdfFail: 'Не удалось создать PDF',
    progress: 'Выполнено {done} из {total}', doneAria: 'Выполнено: {title}', editAria: 'Редактировать: {title}, {time}',
    noWeekDone: 'Неделя завершена', noWeekNone: 'Нет активной недели',
    noWeekDoneText: 'Расписание сохранено в архиве. Создайте новую пустую неделю и заполните её занятиями.', noWeekNoneText: 'Создайте новую неделю и добавьте занятия.',
    createWeek: 'Создать новую неделю', openLast: 'Открыть последнюю архивную неделю',
    archTitle: 'Архив недель', 
    archEmptyT: 'Архив пуст', archEmptyP: 'Когда вы завершите неделю, она появится здесь вместе со всеми занятиями и статистикой.',
    archDone: 'Завершена {date}', archBadge: 'Архив · только просмотр', archNotice: 'Это сохранённая неделя. Занятия в ней изменить или удалить нельзя.',
    archCats: 'По категориям', archBack: 'Архив', archDoneCount: 'выполнено {n}',
    unitTask: ['занятие', 'занятия', 'занятий'], unitHour: ['час', 'часа', 'часов'], unitH: 'ч', unitMin: 'мин',
    taskNew: 'Новое занятие', taskEdit: 'Редактировать занятие', fTitle: 'Название', phTitle: 'Например, Работа', fDay: 'День недели', fCat: 'Категория', fStart: 'Начало', fEnd: 'Окончание',
    dur: 'Продолжительность: {v}', durPick: 'Продолжительность: укажите время', durSame: 'Продолжительность: время начала и окончания совпадает', durNext: '(до следующих суток)',
    errTitle: 'Введите название занятия', errTime: 'Укажите время начала и окончания', errSame: 'Время окончания должно отличаться от времени начала',
    save: 'Сохранить', cancel: 'Отмена', del: 'Удалить занятие', saved: 'Изменения сохранены', added: 'Занятие добавлено', deleted: 'Занятие удалено',
    delTitle: 'Удалить занятие?', delOk: 'Удалить',
    catNew: 'Новая категория', catNewShort: 'Новая', catName: 'Название категории', catColor: 'Цвет', catAdd: 'Добавить', catErrName: 'Введите название категории', catErrDup: 'Такая категория уже есть', catAdded: 'Категория добавлена',
    nwTitle: 'Новая неделя', nwLabel: 'Любой день нужной недели', nwRange: 'Неделя: {r}', nwDup: ' (такая неделя уже есть в архиве)', nwNote: 'Неделя откроется пустой. Занятия вы добавите сами.', nwCreate: 'Создать неделю', errDate: 'Выберите дату', nwCreated: 'Новая неделя создана. Добавьте занятия.',
    finTitle: 'Завершить неделю?', finText: '{range}\n{count}, {hours}. Выполнено: {done}.\n\nНеделя будет сохранена в архиве только для просмотра. После этого вы сможете создать новую пустую неделю.', finOk: 'Завершить неделю', finToast: 'Неделя сохранена в архиве. Не забудьте про резервную копию!',
    lockSub: 'Введите PIN-код', pinPh: 'PIN-код', unlock: 'Открыть', pinWrong: 'Неверный PIN-код', pinWait: 'Слишком много попыток. Подождите {s} с.', pinDefaultHint: 'Начальный PIN-код: 1234. Измените его в разделе «Ещё».', pinCheckErr: 'Не удалось проверить PIN. Откройте приложение по адресу https://…',
    lockNow: 'Заблокировать', theme: 'Сменить тему', langAria: 'Сменить язык',
    moreTitle: 'Ещё', moreSub: 'Язык, защита, аккаунт, данные и установка.',
    secLang: 'Язык', secLangText: 'Основной язык — болгарский.', langBg: 'Болгарский', langRu: 'Русский',
    secTheme: 'Внешний вид', secThemeText: 'Светлая, тёмная или как на вашем устройстве.', themeLight: 'Светлая', themeDark: 'Тёмная', themeSystem: 'Системная', themeAria: 'Тема оформления',
    secPin: 'Защита PIN-кодом', secPinText: 'PIN-код запрашивается при открытии приложения.', reqPin: 'Требовать PIN при запуске', lockBtn: 'Заблокировать сейчас',
    secChange: 'Смена PIN-кода', oldPin: 'Старый PIN-код', newPin: 'Новый PIN-код', confirmPin: 'Подтвердите новый PIN-код', pinRule: 'От 4 до 8 цифр', savePin: 'Сохранить PIN-код',
    errOld: 'Введите старый PIN-код', errOldWrong: 'Старый PIN-код неверный', errNew: 'Новый PIN-код должен состоять из 4–8 цифр', errNewSame: 'Новый PIN-код должен отличаться от старого', errConfirm: 'Повторите новый PIN-код', errMismatch: 'PIN-коды не совпадают', pinChanged: 'PIN-код изменён',
    pinOffTitle: 'Отключение PIN-кода', pinOffText: 'Подтвердите PIN-кодом.', pinOffDone: 'PIN при запуске отключён', pinOnDone: 'PIN при запуске включён', confirm: 'Подтвердить', locked: 'Приложение заблокировано',
    secCats: 'Мои категории', secCatsText: 'Категории, которые вы добавили. Новая категория добавляется кнопкой + при создании занятия.', noCustomCats: 'Своих категорий пока нет.', catDelete: 'Удалить', catInUse: 'Категория используется в занятиях, удалить её нельзя.', catDelTitle: 'Удалить категорию?', catDeleted: 'Категория удалена',
    secCloud: 'Аккаунт и синхронизация', cloudText: 'Войдите через Google, чтобы данные хранились в облаке и были доступны на других устройствах.',
    cloudOff: 'Облако ещё не настроено. Добавьте ключи Firebase в файл firebase-config.js (шаги в README).',
    signIn: 'Войти через Google', signOut: 'Выйти', syncNow: 'Синхронизировать сейчас', signedAs: 'Вы вошли как {email}', syncedAt: 'Синхронизировано: {time}', syncing: 'Синхронизация…', syncErr: 'Ошибка синхронизации. Попробую снова.', syncWait: 'Ожидает синхронизации',
    cloudNote: 'Синхронизируются недели, архив и категории. PIN-код, язык и тема остаются на каждом устройстве.',
    signInErr: 'Не удалось войти', cloudLoadErr: 'Не удалось загрузить сервис. Проверьте интернет.', signedInToast: 'Вы вошли. Данные синхронизируются.', signedOutToast: 'Вы вышли из аккаунта. Данные остаются на этом устройстве.',
    secBackup: 'Резервная копия', backupText: 'Файл со всеми неделями и архивом. Храните его в надёжном месте: в облаке, на почте или на компьютере.',
    lastBackup: 'Последняя копия: {date}', noBackup: 'Копий ещё не было', btnExport: 'Скачать копию', btnImport: 'Восстановить из файла', backupSaved: 'Резервная копия сохранена', saveFail: 'Не удалось сохранить файл',
    errNotJson: 'Файл повреждён или не является резервной копией.', errNotBackup: 'Это не резервная копия A&P.', errNoArchive: 'В файле нет списка архивных недель.', readFail: 'Не удалось прочитать файл',
    impTitle: 'Восстановить из файла?', impActive: 'Активная неделя: {r}, {n}.', impNoActive: 'Активной недели в файле нет.', impArch: 'Архивных недель: {n}.', impDropped: 'Пропущено повреждённых занятий: {n}.', impWarn: 'Все текущие данные на этом устройстве будут заменены. PIN-код не изменится.', impOk: 'Заменить данные', restored: 'Данные восстановлены',
    secInstall: 'Установка на главный экран', installed: 'Приложение уже установлено и открыто в отдельном окне.', installIos: 'На iPhone: нажмите «Поделиться» в Safari, затем «На экран “Домой”».', installAndroid: 'На Android: установите приложение — оно откроется в отдельном окне и будет работать без интернета.', installBtn: 'Установить приложение', installHelpT: 'Установка приложения', installHelp: 'Откройте меню браузера (⋮) и выберите «Установить приложение» или «Добавить на главный экран». Для установки сайт должен быть открыт по HTTPS.', installedToast: 'Приложение установлено',
    secStorage: 'О хранении данных', persistOk: 'Хранилище защищено от автоочистки', persistNo: 'Хранилище: обычное', persistChk: 'Проверка хранилища…', aboutSum: 'Где хранятся данные и какие есть ограничения',
    about: [
      'Данные хранятся в браузере на этом устройстве (IndexedDB с запасной копией в localStorage). Если вы вошли через Google, копия хранится ещё и в облаке.',
      'Без входа через Google устройства НЕ синхронизируются: у телефона и компьютера свои расписания. Тогда переносите данные файлом резервной копии.',
      'Очистка данных сайта, удаление приложения или сброс браузера стирают расписание. Скачивайте копию регулярно или используйте аккаунт.',
      'Обычный и приватный режим браузера хранят данные отдельно. Приложение с главного экрана и тот же сайт во вкладке браузера тоже могут иметь разные данные (особенно на iPhone).',
      'PIN-код защищает только от случайного открытия и не шифрует данные. В резервную копию PIN не входит.',
      'Забыли PIN: очистите данные сайта в настройках браузера (PIN снова станет 1234). Заранее скачайте копию или войдите через Google, чтобы восстановить данные.'
    ],
    archSub: 'Завершённые недели хранятся здесь со статистикой. Менять их нельзя. Ненужные недели уходят в корзину, и их можно восстановить.',
    grpGeneral: 'Общие', grpSecurity: 'Защита', grpCats: 'Категории', grpData: 'Данные и синхронизация', grpApp: 'Приложение', grpReset: 'Сброс',
    pinChangeSum: 'Смена PIN-кода',
    catsHint: 'Новая категория добавляется знаком + в окне занятия, а убирается крестиком × перед ней.', catsDeleted: 'Удалённые категории', catNoDeleted: 'Удалённых категорий нет.',
    catRestore: 'Восстановить', catPurge: 'Удалить окончательно', catHideTitle: 'Удалить категорию?', catHideText: 'Категория «{name}» исчезнет из списка. Занятия с ней останутся.', catDelAria: 'Удалить категорию: {name}', catRestored: 'Категория восстановлена', catGone: 'Категория удалена', catPurgeText: 'Категория «{name}» будет удалена окончательно.',
    trash: 'Корзина', trashCount: 'Корзина ({n})', trashEmptyT: 'Корзина пуста', trashEmptyP: 'Здесь показываются удалённые архивные недели. Их можно восстановить.', trashHint: 'Удалённые недели лежат здесь, пока вы не удалите их навсегда. Автоматически ничего не стирается.',
    trashed: 'Неделя перемещена в корзину', toTrash: 'Переместить в корзину', trashConfirmT: 'Переместить неделю в корзину?', trashConfirmText: '{title}\nЕё можно будет восстановить из корзины.', toTrashOk: 'Переместить',
    restore: 'Восстановить', weekRestored: 'Неделя восстановлена', purge: 'Удалить навсегда', purgeT: 'Удалить навсегда?', purgeText: '{title}\nЭто нельзя отменить.', weekPurged: 'Неделя удалена навсегда',
    emptyTrash: 'Очистить корзину', emptyTrashT: 'Очистить корзину?', emptyTrashText: 'Все недели в корзине ({n}) будут удалены навсегда.', trashedOn: 'Удалена {date}', rowTrash: 'Корзина', rowTrashSub: 'Удалённых архивных недель: {n}', open: 'Открыть',
    resetSettings: 'Сбросить настройки', resetSettingsText: 'Язык, тема, режим просмотра, PIN при запуске и удалённые категории вернутся к значениям по умолчанию. Данные и PIN-код останутся.', resetSettingsT: 'Сбросить настройки?', resetOk: 'Сбросить', resetDone: 'Настройки сброшены',
    wipe: 'Удалить все данные', wipeSub: 'Удаляет занятия, архив и корзину. PIN-код, настройки и вход через Google остаются.', wipeT: 'Удалить все данные?',
    wipeText: 'Будут удалены занятия, архив и корзина. PIN-код, настройки и вход через Google не изменятся.\nЕсли синхронизация включена, данные удалятся и из облака, и на других устройствах.\n\nСначала скачайте резервную копию.', wipePin: 'Подтвердите PIN-кодом.', wipeOk: 'Удалить всё', wipeDone: 'Данные удалены',
    pdfReady: 'PDF-файл готов', pdfSave: 'Сохранить PDF', pdfOpen: 'Открыть', pdfShare: 'Поделиться', close: 'Закрыть', pdfHint: 'Если файл не скачался сам, нажмите «Сохранить PDF». Если и это не помогло, задержите палец на изображении и сохраните его.',
    installDesktop: 'На компьютере с Windows: установите приложение из Edge или Chrome. Оно появится в меню «Пуск» и будет открываться в отдельном окне.',
    version: 'A&P · версия {v}',
    updated: 'Приложение обновлено. Перезапустите его, чтобы применить изменения.',
    tooManySave: 'Не удалось сохранить данные. Скачайте резервную копию!',
    seed_work: 'Работа', seed_gym: 'Тренировка', seed_guitar: 'Китара', seed_business: 'Бизнес', seed_it: 'Изучение IT', seed_practice: 'Практика', seed_meeting: 'Собрание', seed_rehearsal: 'Репетиция',
    cat_work: 'Работа', cat_gym: 'Зал', cat_guitar: 'Китара', cat_business: 'Бизнес', cat_it: 'IT', cat_practice: 'Практика', cat_meeting: 'Собрание', cat_rehearsal: 'Репетиция',
    days: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'],
    daysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    months: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
    legacyArch: 'Архив от {date}', fallbackWeek: 'Архивная неделя', pdfGen: 'Создано {date}', pdfDone: 'выполнено {n}'
  }
};
let lang = 'bg';
const t = (k, p) => {
  let s = L[lang][k]; if (s === undefined) s = L.ru[k]; if (s === undefined) return k;
  return p ? String(s).replace(/\{(\w+)\}/g, (_, n) => (p[n] === undefined ? '' : p[n])) : s;
};
const tl = (k) => L[lang][k];
function pl(n, key) {
  const f = L[lang][key];
  if (lang === 'ru') { const a = n % 10, b = n % 100; return (a === 1 && b !== 11) ? f[0] : (a >= 2 && a <= 4 && (b < 10 || b >= 20)) ? f[1] : f[2]; }
  return n === 1 ? f[0] : f[1];
}
const cnt = (n, key) => `${n} ${pl(n, key)}`;

const ICONS = {
  calendar: '<rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  archive: '<rect x="2" y="3" width="20" height="5" rx="1.5"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8M10 12h4"/>',
  more: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  chevR: '<path d="m9 6 6 6-6 6"/>', chevL: '<path d="m15 6-6 6 6 6"/>',
  pencil: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  flag: '<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>',
  download: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"/>',
  upload: '<path d="M12 15V3m0 0L8 7m4-4 4 4M4 21h16"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M11 18h2"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
  cloud: '<path d="M7 18a5 5 0 1 1 1.2-9.9A6 6 0 0 1 19.5 10 4 4 0 0 1 18 18z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  restore: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>'
};
const ic = (n) => `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]}</svg>`;

/* =====================================================================
   Утилиты
   ===================================================================== */
const $ = (s, r = document) => r.querySelector(s);
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const isISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && toISO(parseISO(s)) === s;
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return toISO(d); };
const mondayOf = (s) => { const d = parseISO(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return toISO(d); };
const todayISO = () => toISO(new Date());
const dayLabel = (iso) => { const d = parseISO(iso); return `${d.getDate()} ${tl('months')[d.getMonth()]}`; };
const fmtDateFull = (ts) => { const d = new Date(ts); return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`; };
const fmtTime = (ts) => { const d = new Date(ts); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
function rangeLabel(start) {
  const M = tl('months'), a = parseISO(start), b = parseISO(addDays(start, 6));
  if (a.getFullYear() !== b.getFullYear()) return `${a.getDate()} ${M[a.getMonth()]} ${a.getFullYear()} – ${b.getDate()} ${M[b.getMonth()]} ${b.getFullYear()}`;
  if (a.getMonth() !== b.getMonth()) return `${a.getDate()} ${M[a.getMonth()]} – ${b.getDate()} ${M[b.getMonth()]} ${b.getFullYear()}`;
  return `${a.getDate()}–${b.getDate()} ${M[b.getMonth()]} ${b.getFullYear()}`;
}
const toMin = (x) => { const [h, m] = x.split(':').map(Number); return h * 60 + m; };
function duration(start, end) { let n = toMin(end) - toMin(start); if (n < 0) n += 1440; return n; }
function fmtShort(min) {
  const h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return `${m} ${t('unitMin')}`;
  return m ? `${h} ${t('unitH')} ${m} ${t('unitMin')}` : `${h} ${t('unitH')}`;
}
function fmtLong(min) {
  const h = Math.floor(min / 60), m = min % 60;
  if (min === 0) return `0 ${pl(0, 'unitHour')}`;
  if (h === 0) return `${m} ${t('unitMin')}`;
  return m ? `${h} ${t('unitH')} ${m} ${t('unitMin')}` : `${h} ${pl(h, 'unitHour')}`;
}
const statsOf = (tasks) => ({ count: tasks.length, minutes: tasks.reduce((s, x) => s + duration(x.start, x.end), 0), done: tasks.filter(x => x.done).length });
function byCategory(tasks) {
  const out = {};
  for (const x of tasks) { const o = out[x.cat] || (out[x.cat] = { count: 0, minutes: 0 }); o.count++; o.minutes += duration(x.start, x.end); }
  return out;
}
const sortTasks = (list) => list.slice().sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end));
function canon(v) { // стабильная сериализация (ключи по алфавиту) для сравнения данных
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  return JSON.stringify(v === undefined ? null : v);
}

/* =====================================================================
   Категории
   ===================================================================== */
let state = null;
const customCats = () => (state && state.categories) || [];
const allCats = () => [...BASE_CATS.map(c => ({ id: c.id, name: t('cat_' + c.id), color: c.color })), ...customCats()];
function catInfo(id) {
  if (BASE_BY_ID[id]) return { id, name: t('cat_' + id), color: BASE_BY_ID[id].color };
  const c = customCats().find(x => x.id === id);
  return c || catInfo('work');
}
const catIdSet = (cats) => new Set([...BASE_CATS.map(c => c.id), ...(cats || []).map(c => c.id)]);
function sanitizeCategories(list) {
  const out = [], seen = new Set();
  for (const c of Array.isArray(list) ? list : []) {
    if (!c || typeof c.id !== 'string' || BASE_BY_ID[c.id] || seen.has(c.id)) continue;
    const name = String(c.name == null ? '' : c.name).trim().slice(0, 20);
    if (!name) continue;
    seen.add(c.id); out.push({ id: c.id, name, color: /^#[0-9a-f]{6}$/i.test(c.color) ? c.color : '#64748b' });
  }
  return out;
}

/* =====================================================================
   Проверка данных
   ===================================================================== */
function sanitizeTask(x, ids) {
  if (!x || typeof x !== 'object') return null;
  const day = Number(x.day);
  if (!Number.isInteger(day) || day < 0 || day > 6) return null;
  const title = String(x.title == null ? '' : x.title).trim().slice(0, 60);
  if (!title) return null;
  if (!TIME_RE.test(x.start) || !TIME_RE.test(x.end)) return null;
  return { id: String(x.id == null ? uid() : x.id), day, title, cat: ids.has(x.cat) ? x.cat : 'work', start: x.start, end: x.end, done: !!x.done };
}
function sanitizeTasks(list, ids) {
  const seen = new Set(), out = []; let dropped = 0;
  for (const raw of Array.isArray(list) ? list : []) {
    const x = sanitizeTask(raw, ids);
    if (!x) { dropped++; continue; }
    if (seen.has(x.id)) x.id = uid();
    seen.add(x.id); out.push(x);
  }
  return { tasks: out, dropped };
}
function deepFreeze(o) {
  if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); Object.values(o).forEach(deepFreeze); }
  return o;
}
function makeArchiveEntry(week, extra = {}) {
  const tasks = week.tasks.map(x => ({ ...x }));
  return deepFreeze({
    id: week.id || uid(), startDate: isISO(week.startDate) ? week.startDate : null, label: week.label || null,
    createdAt: week.createdAt || Date.now(), archivedAt: Date.now(), tasks, stats: statsOf(tasks),
    deletedAt: null, purged: false, statusAt: Date.now(), ...extra
  });
}
const sortArchive = (list) => list.sort((x, y) => (y.archivedAt - x.archivedAt) || (x.id < y.id ? -1 : 1));
const activeArchive = () => state.archive.filter(a => !a.deletedAt && !a.purged);
const trashItems = () => state.archive.filter(a => a.deletedAt && !a.purged);
const isCatUsed = (id) => (state.currentWeek ? state.currentWeek.tasks : []).some(x => x.cat === id) || state.archive.some(a => a.tasks.some(x => x.cat === id));
/* Общий разбор содержимого (резервная копия и облако) */
function parseContent(d) {
  if (!d || typeof d !== 'object') throw new Error(t('errNotBackup'));
  const categories = sanitizeCategories(d.categories), ids = catIdSet(categories);
  const hiddenCats = Array.isArray(d.hiddenCats) ? d.hiddenCats.filter(x => typeof x === 'string').slice(0, 60) : [];
  let dropped = 0, currentWeek = null;
  if (d.currentWeek) {
    const r = sanitizeTasks(d.currentWeek.tasks, ids); dropped += r.dropped;
    currentWeek = { id: String(d.currentWeek.id || uid()), startDate: isISO(d.currentWeek.startDate) ? d.currentWeek.startDate : mondayOf(todayISO()), createdAt: Number(d.currentWeek.createdAt) || Date.now(), tasks: r.tasks };
  }
  if (!Array.isArray(d.archive)) throw new Error(t('errNoArchive'));
  const seen = new Set();
  const archive = d.archive.map(a => {
    const purged = !!(a && a.purged);
    const r = purged ? { tasks: [], dropped: 0 } : sanitizeTasks(a && a.tasks, ids); dropped += r.dropped;
    let id = String((a && a.id) || uid()); if (seen.has(id)) id = uid(); seen.add(id);
    return makeArchiveEntry({ id, startDate: isISO(a && a.startDate) ? a.startDate : null, label: (a && typeof a.label === 'string') ? a.label.slice(0, 80) : null, createdAt: Number(a && a.createdAt) || Date.now(), tasks: r.tasks },
      { archivedAt: Number(a && a.archivedAt) || Date.now(), deletedAt: Number(a && a.deletedAt) || null, purged, statusAt: Number(a && a.statusAt) || 0 });
  });
  sortArchive(archive);
  return { currentWeek, archive, categories, hiddenCats, dropped };
}

/* =====================================================================
   Хранилище: IndexedDB + копия в localStorage
   ===================================================================== */
let dbPromise = null;
function idb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!window.indexedDB) return reject(new Error('IndexedDB недоступна'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(DB_STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB blocked'));
  });
  return dbPromise;
}
async function idbGet(key) { const db = await idb(); return new Promise((res, rej) => { const q = db.transaction(DB_STORE).objectStore(DB_STORE).get(key); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); }); }
async function idbSet(key, value) { const db = await idb(); return new Promise((res, rej) => { const tx = db.transaction(DB_STORE, 'readwrite'); tx.objectStore(DB_STORE).put(value, key); tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error); }); }

let saveChain = Promise.resolve(), saveWarned = false;
function save() {
  state.savedAt = Date.now();
  let lsOk = true;
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { lsOk = false; }
  saveChain = saveChain.then(() => idbSet(STATE_KEY, state).then(() => true, () => false)).then(idbOk => {
    if (!idbOk && !lsOk && !saveWarned) { saveWarned = true; toast(t('tooManySave')); }
  });
  return saveChain;
}
/* Изменение содержимого (недели, архив, категории): сохранить локально и отправить в облако */
function saveContent() { state.dataUpdatedAt = Date.now(); const p = save(); schedulePush(); return p; }

/* ---------- PIN ---------- */
async function hashPin(pin, salt, alg) {
  const text = `${salt}:${pin}`;
  if (alg === 'sha256') {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
async function makePin(pin, isDefault) {
  const salt = uid().slice(0, 12), alg = (window.crypto && crypto.subtle) ? 'sha256' : 'fnv';
  return { salt, alg, hash: await hashPin(pin, salt, alg), isDefault: !!isDefault, numeric: /^\d+$/.test(pin) };
}

/* ---------- Начальное состояние ---------- */
function seedTasks() {
  const rows = [
    [0, '07:00', '15:00', 'work'], [0, '16:00', '17:30', 'gym'], [0, '19:00', '21:00', 'business'],
    [1, '07:00', '15:00', 'work'], [1, '16:00', '18:00', 'guitar'], [1, '18:00', '21:00', 'business'], [1, '22:00', '00:00', 'practice'],
    [2, '07:00', '15:00', 'work'], [2, '17:00', '18:30', 'it'], [2, '18:00', '21:00', 'business'], [2, '22:00', '00:00', 'practice'],
    [3, '07:00', '15:00', 'work'], [3, '16:00', '17:30', 'gym'], [3, '19:00', '21:00', 'business'], [3, '22:00', '00:00', 'practice'],
    [4, '07:00', '15:00', 'work'], [4, '16:00', '18:00', 'guitar'], [4, '18:00', '21:00', 'business'], [4, '21:00', '00:00', 'practice'],
    [5, '07:00', '15:00', 'work'], [5, '17:00', '18:30', 'it'], [5, '18:30', '21:00', 'gym'], [5, '22:00', '00:00', 'practice'],
    [6, '09:00', '14:00', 'meeting'], [6, '15:00', '17:00', 'rehearsal'], [6, '17:30', '19:00', 'guitar'], [6, '21:00', '23:00', 'practice']
  ];
  return rows.map(r => ({ id: uid(), day: r[0], title: t('seed_' + r[3]), start: r[1], end: r[2], cat: r[3], done: false }));
}
async function freshState(seed = true) {
  return {
    v: 2, savedAt: 0, dataUpdatedAt: 0, /* 0 = нетронутое начальное расписание: облако имеет приоритет */
    settings: { theme: 'light', lang: 'bg', view: null, lastExportAt: null, requirePin: true, cloud: { enabled: false, lastSync: null }, pin: await makePin(DEFAULT_PIN, true) },
    categories: [], hiddenCats: [],
    currentWeek: { id: uid(), startDate: mondayOf(todayISO()), createdAt: Date.now(), tasks: seed ? seedTasks() : [] },
    archive: []
  };
}
/* Перенос из первой версии (ключи weekly_tasks, ap_week_archives, weekly_pin, weekly_dark) */
async function migrateLegacy() {
  const read = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } };
  let found = false;
  try { found = ['weekly_tasks', 'ap_week_archives', 'weekly_pin', 'weekly_dark'].some(k => localStorage.getItem(k) !== null); } catch { return null; }
  if (!found) return null;
  const s = await freshState(), ids = catIdSet([]);
  const oldTasks = read('weekly_tasks', null);
  if (Array.isArray(oldTasks)) s.currentWeek.tasks = sanitizeTasks(oldTasks, ids).tasks;
  const oldArch = read('ap_week_archives', []);
  if (Array.isArray(oldArch)) {
    s.archive = oldArch.map(a => {
      const tasks = sanitizeTasks(a && a.tasks, ids).tasks, ts = Number(a && a.id) || Date.now();
      return makeArchiveEntry({ id: 'old-' + ts, startDate: null, label: t('legacyArch', { date: fmtDateFull(ts) }), tasks, createdAt: ts }, { archivedAt: ts });
    }).sort((x, y) => y.archivedAt - x.archivedAt);
  }
  const oldPin = read('weekly_pin', DEFAULT_PIN);
  if (typeof oldPin === 'string' && oldPin.length >= 4) s.settings.pin = await makePin(oldPin, oldPin === DEFAULT_PIN);
  s.settings.theme = read('weekly_dark', false) ? 'dark' : 'light';
  const oldLang = read('weekly_lang', null); if (oldLang === 'ru') s.settings.lang = 'ru';
  s.dataUpdatedAt = Date.now();
  return s;
}
function normalize(s) {
  s.v = 2;
  const st = s.settings = s.settings || {};
  if (!['light', 'dark', 'system'].includes(st.theme)) st.theme = 'light';
  if (!['bg', 'ru'].includes(st.lang)) st.lang = 'bg';
  if (!['day', 'week'].includes(st.view)) st.view = null;
  if (typeof st.lastExportAt !== 'number') st.lastExportAt = null;
  if (typeof st.requirePin !== 'boolean') st.requirePin = true;
  st.cloud = { enabled: !!(st.cloud && st.cloud.enabled), lastSync: (st.cloud && st.cloud.lastSync) || null };
  s.categories = sanitizeCategories(s.categories);
  s.hiddenCats = Array.isArray(s.hiddenCats) ? s.hiddenCats.filter(x => typeof x === 'string').slice(0, 60) : [];
  const ids = catIdSet(s.categories);
  if (s.currentWeek) {
    s.currentWeek.tasks = sanitizeTasks(s.currentWeek.tasks, ids).tasks;
    if (!isISO(s.currentWeek.startDate)) s.currentWeek.startDate = mondayOf(todayISO());
    s.currentWeek.id = s.currentWeek.id || uid();
  } else s.currentWeek = null;
  s.archive = sortArchive((Array.isArray(s.archive) ? s.archive : []).map(a => {
    const tasks = a.purged ? [] : sanitizeTasks(a.tasks, ids).tasks;
    return deepFreeze({ ...a, tasks, stats: statsOf(tasks), startDate: isISO(a.startDate) ? a.startDate : null, archivedAt: Number(a.archivedAt) || Date.now(),
      deletedAt: Number(a.deletedAt) || null, purged: !!a.purged, statusAt: Number(a.statusAt) || 0 });
  }));
  s.dataUpdatedAt = typeof s.dataUpdatedAt === 'number' ? s.dataUpdatedAt : Date.now();
  return s;
}
async function loadState() {
  let a = null, b = null;
  try { a = await idbGet(STATE_KEY); } catch { /* ok */ }
  try { const raw = localStorage.getItem(LS_KEY); if (raw) b = JSON.parse(raw); } catch { /* ok */ }
  const valid = (x) => x && typeof x === 'object' && x.v === 2 && x.settings && x.settings.pin;
  const pick = [a, b].filter(valid).sort((x, y) => (y.savedAt || 0) - (x.savedAt || 0))[0];
  if (pick) lang = ['bg', 'ru'].includes(pick.settings.lang) ? pick.settings.lang : 'bg';
  return normalize(pick || (await migrateLegacy()) || (await freshState()));
}

/* =====================================================================
   Состояние интерфейса
   ===================================================================== */
const ui = { tab: 'week', archiveId: null, trash: false, selectedDay: null, view: 'day' };
let locked = false, failCount = 0, lockUntil = 0, hiddenAt = 0;
const weekTitle = (w) => w.startDate ? `${t('weekWord')} ${rangeLabel(w.startDate)}` : (w.label || t('fallbackWeek'));

/* ---------- Тема ---------- */
const darkMq = window.matchMedia ? matchMedia('(prefers-color-scheme: dark)') : null;
const resolvedTheme = () => state.settings.theme === 'system' ? (darkMq && darkMq.matches ? 'dark' : 'light') : state.settings.theme;
function applyTheme() {
  const r = resolvedTheme();
  document.documentElement.dataset.theme = r;
  const meta = $('meta[name="theme-color"]'); if (meta) meta.content = r === 'dark' ? '#0d1222' : '#f4f5fb';
  try { localStorage.setItem('ap_theme', state.settings.theme); } catch { /* ok */ }
}
if (darkMq && darkMq.addEventListener) darkMq.addEventListener('change', () => { if (state && state.settings.theme === 'system') { applyTheme(); renderChrome(); } });
function applyLang() { lang = state.settings.lang; document.documentElement.lang = lang; }

/* ---------- Слои ---------- */
const sheetEl = $('#sheet'), dialogEl = $('#dialog'), lockEl = $('#lock');
let dialogResolve = null;
function syncBodyLock() { document.body.classList.toggle('locked', !!document.querySelector('.layer.open') || !lockEl.hidden); }
function openLayer(el, html, focusSel) {
  $('.panel', el).innerHTML = html; el.classList.add('open'); syncBodyLock();
  const f = focusSel && $(focusSel, el); if (f) setTimeout(() => { f.focus(); if (f.select && f.dataset.selectAll) f.select(); }, 30);
}
function closeLayer(el) { el.classList.remove('open'); syncBodyLock(); }
function finishDialog(value) { closeLayer(dialogEl); const r = dialogResolve; dialogResolve = null; if (r) r(value); }
function confirmDialog({ title, text, okText, danger = false }) {
  return new Promise(resolve => {
    if (dialogResolve) finishDialog(false);
    dialogResolve = resolve;
    openLayer(dialogEl, `<h2>${esc(title)}</h2><p class="dlg-text">${esc(text)}</p>
      <div class="actions"><button type="button" class="btn btn-ghost" data-dlg="cancel">${t('cancel')}</button>
      <button type="button" class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-dlg="ok" id="dlgOk">${esc(okText || t('confirm'))}</button></div>`, '#dlgOk');
  });
}
function messageDialog(title, text) {
  return new Promise(resolve => {
    if (dialogResolve) finishDialog(false);
    dialogResolve = resolve;
    openLayer(dialogEl, `<h2>${esc(title)}</h2><p class="dlg-text">${esc(text)}</p><div class="actions"><button type="button" class="btn btn-primary" data-dlg="ok" id="dlgOk">OK</button></div>`, '#dlgOk');
  });
}
let toastTimer = null;
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2800); }

/* =====================================================================
   PIN: проверка, блокировка при запуске
   ===================================================================== */
async function checkPin(value) {
  const now = Date.now();
  if (now < lockUntil) return { ok: false, wait: Math.ceil((lockUntil - now) / 1000) };
  let ok = false;
  try { const p = state.settings.pin; ok = (await hashPin(value, p.salt, p.alg)) === p.hash; }
  catch { return { ok: false, error: t('pinCheckErr') }; }
  if (ok) { failCount = 0; return { ok: true }; }
  if (++failCount >= 5) { failCount = 0; lockUntil = Date.now() + 30000; return { ok: false, wait: 30 }; }
  return { ok: false };
}
const pinError = (r) => r.wait ? t('pinWait', { s: r.wait }) : (r.error || t('pinWrong'));

function renderLock() {
  $('#lockSub').textContent = t('lockSub');
  const inp = $('#lock-pin'); inp.placeholder = t('pinPh'); inp.setAttribute('aria-label', t('pinPh'));
  inp.inputMode = state.settings.pin.numeric === false ? 'text' : 'numeric';
  $('#lock-hint').textContent = state.settings.pin.isDefault ? t('pinDefaultHint') : '';
  $('#lockSubmit').textContent = t('unlock');
  $('#lockLang').textContent = lang === 'bg' ? 'Русский' : 'Български';
  $('#lockLang').setAttribute('aria-label', t('langAria'));
}
function showLock() {
  locked = true; try { sessionStorage.removeItem('ap_unlocked'); } catch { /* ok */ }
  renderLock(); $('#lock-pin').value = ''; $('#lock-err').textContent = ''; lockEl.hidden = false; syncBodyLock();
  setTimeout(() => $('#lock-pin').focus(), 30);
}
function hideLock() { locked = false; lockEl.hidden = true; $('#lock-pin').value = ''; try { sessionStorage.setItem('ap_unlocked', '1'); } catch { /* ok */ } syncBodyLock(); }
/* Диалог подтверждения PIN-кодом (для отключения защиты) */
function askPin(title, text) {
  return new Promise(resolve => {
    if (dialogResolve) finishDialog(false);
    dialogResolve = resolve;
    openLayer(dialogEl, `
      <form data-form="askpin" novalidate>
        <h2>${esc(title)}</h2><p class="dlg-text">${esc(text)}</p>
        <div class="field" id="ask-field"><label class="lbl" for="ask-pin">${t('pinPh')}</label>
          <input id="ask-pin" type="password" ${state.settings.pin.numeric === false ? '' : 'inputmode="numeric"'} autocomplete="off" maxlength="32">
          <p class="field-error" id="ask-err" role="alert"></p></div>
        <div class="actions"><button type="button" class="btn btn-ghost" data-dlg="cancel">${t('cancel')}</button><button type="submit" class="btn btn-primary">${t('confirm')}</button></div>
      </form>`, '#ask-pin');
  });
}

/* =====================================================================
   Отрисовка
   ===================================================================== */
function renderChrome() {
  const lockBtn = $('#lockBtn');
  lockBtn.hidden = !state.settings.requirePin;
  lockBtn.innerHTML = ic('lock'); lockBtn.setAttribute('aria-label', t('lockNow'));
  $('#themeBtn').innerHTML = ic(resolvedTheme() === 'dark' ? 'sun' : 'moon'); $('#themeBtn').setAttribute('aria-label', t('theme'));
  const lb = $('#langBtn'); lb.textContent = lang === 'bg' ? 'БГ' : 'РУ'; lb.setAttribute('aria-label', t('langAria'));
  const tabs = { week: ['calendar', t('tabWeek')], archive: ['archive', t('tabArchive')], more: ['more', t('tabMore')] };
  for (const [k, [icon, label]] of Object.entries(tabs)) {
    const b = $('#nav-' + k); b.innerHTML = ic(icon) + `<span>${label}</span>`;
    if (ui.tab === k) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
  }
  const w = state.currentWeek, showWeek = ui.tab === 'week' && !!w;
  const fab = $('#fab'); fab.hidden = !showWeek; fab.innerHTML = ic('plus') + `<span>${t('fab')}</span>`; fab.setAttribute('aria-label', t('fabAria'));
  const pr = $('#progress'); pr.hidden = !showWeek;
  if (showWeek) {
    const st = statsOf(w.tasks), pct = st.count ? Math.round(st.done / st.count * 100) : 0;
    $('#pLabel').textContent = t('progress', { done: st.done, total: st.count });
    $('#pPct').textContent = pct + '%';
    $('#pFill').style.width = pct + '%';
    pr.setAttribute('aria-label', `${t('progress', { done: st.done, total: st.count })}, ${pct}%`);
  }
  document.body.classList.toggle('has-progress', showWeek);
  $('.nav').setAttribute('aria-label', 'A&P');
  let sub = t('appSub');
  if (ui.tab === 'week' && w) sub = rangeLabel(w.startDate);
  else if (ui.tab === 'archive') sub = ui.trash ? t('trash') : t('subArchive'); else if (ui.tab === 'more') sub = t('subMore');
  $('#subtitle').textContent = sub;
}

function defaultDay(week, archived) {
  if (!archived && week.startDate) {
    const i = Math.round((parseISO(todayISO()) - parseISO(week.startDate)) / 864e5);
    if (i >= 0 && i <= 6) return i;
  }
  return archived && week.tasks.length ? Math.min(...week.tasks.map(x => x.day)) : 0;
}
function statsHtml(tasks) {
  const st = statsOf(tasks), hours = fmtLong(st.minutes);
  return `
  <section class="stats" aria-label="${t('statsAria')}">
    <div class="card stat"><div class="stat-label">${t('statTasks')}</div><div class="stat-num" id="statCount">${st.count}</div></div>
    <div class="card stat" id="statHoursCard" aria-label="${esc(t('statHoursAria', { v: hours }))}">
      <div class="stat-label">${t('statHours')}</div><div class="stat-num ${hours.length > 8 ? 'long' : ''}" id="statHours">${esc(hours)}</div></div>
  </section>`;
}
function progressInline(tasks) {
  const st = statsOf(tasks), pct = st.count ? Math.round(st.done / st.count * 100) : 0;
  return `<div class="pinline" id="archProgress"><div class="ptxt"><span>${t('progress', { done: st.done, total: st.count })}</span><span>${pct}%</span></div><div class="pbar"><i style="width:${pct}%"></i></div></div>`;
}

function taskRow(x, readOnly) {
  const c = catInfo(x.cat), time = `${x.start}–${x.end}`;
  const inner = `<i class="ebar" style="--c:${c.color}"></i>
    <div class="emain"><div class="etitle">${esc(x.title)}</div><div class="emeta">${esc(x.start)} – ${esc(x.end)} · ${esc(c.name)}</div></div>
    <span class="edur">${fmtShort(duration(x.start, x.end))}</span>`;
  const box = `<span class="box">${x.done ? ic('check') : ''}</span>`;
  if (readOnly) {
    return `<li class="event ${x.done ? 'done' : ''}"><span class="check ${x.done ? 'on' : ''}" role="img" aria-label="${esc(t('doneAria', { title: x.title }))}: ${x.done ? '✓' : '–'}">${box}</span><div class="event-main">${inner}</div></li>`;
  }
  return `<li class="event ${x.done ? 'done' : ''}">
    <button type="button" class="check ${x.done ? 'on' : ''}" role="checkbox" aria-checked="${!!x.done}" aria-label="${esc(t('doneAria', { title: x.title }))}" data-action="toggleDone" data-id="${esc(x.id)}">${box}</button>
    <button type="button" class="event-main" data-action="editTask" data-id="${esc(x.id)}" aria-label="${esc(t('editAria', { title: x.title, time }))}">${inner}${ic('pencil').replace('class="ic"', 'class="ic edit-hint"')}</button>
  </li>`;
}
function dayCard(week, i, archived) {
  const list = sortTasks(week.tasks.filter(x => x.day === i)), st = statsOf(list);
  const iso = week.startDate ? addDays(week.startDate, i) : null;
  const today = !archived && iso === todayISO(), sel = ui.selectedDay === i;
  return `
  <section class="card day ${sel ? 'selected' : ''} ${today ? 'today' : ''}" data-day="${i}">
    <header class="day-head">
      <div><h3>${tl('days')[i]}${today ? `<span class="today-tag">${t('today')}</span>` : ''}</h3>${iso ? `<div class="day-date">${dayLabel(iso)}</div>` : ''}</div>
      <div class="day-sum">${st.count ? `${cnt(st.count, 'unitTask')} · ${fmtShort(st.minutes)}` : t('noTasks')}</div>
    </header>
    ${list.length ? `<ul class="events">${list.map(x => taskRow(x, archived)).join('')}</ul>` : `<p class="empty-day">${archived ? t('archDayEmpty') : t('freeDay')}</p>`}
  </section>`;
}
function weekBody(week, archived) {
  if (ui.selectedDay == null) ui.selectedDay = defaultDay(week, archived);
  const chips = tl('daysShort').map((d, i) => {
    const iso = week.startDate ? addDays(week.startDate, i) : null, has = week.tasks.some(x => x.day === i);
    const today = !archived && iso === todayISO();
    return `<button type="button" class="chip ${today ? 'today' : ''}" role="tab" aria-selected="${ui.selectedDay === i}" data-action="selectDay" data-day="${i}" aria-label="${tl('days')[i]}${iso ? ', ' + dayLabel(iso) : ''}">
      <span class="dn">${d}</span><span class="dd">${iso ? parseISO(iso).getDate() : i + 1}</span>${has ? '<i class="dot"></i>' : ''}</button>`;
  }).join('');
  return `
  <div class="weekbody view-${ui.view}">
    <div class="viewbar"><div class="seg" role="tablist" aria-label="${t('viewMode')}">
      <button type="button" role="tab" aria-selected="${ui.view === 'day'}" data-action="setView" data-view="day">${t('viewDay')}</button>
      <button type="button" role="tab" aria-selected="${ui.view === 'week'}" data-action="setView" data-view="week">${t('viewWeek')}</button>
    </div></div>
    <div class="daystrip" role="tablist" aria-label="${t('daysAria')}">${chips}</div>
    <div class="days">${tl('days').map((_, i) => dayCard(week, i, archived)).join('')}</div>
  </div>`;
}
function categoryCard(tasks) {
  const cats = byCategory(tasks), rows = allCats().filter(c => cats[c.id]).sort((a, b) => cats[b.id].minutes - cats[a.id].minutes);
  if (!rows.length) return '';
  const max = Math.max(...rows.map(c => cats[c.id].minutes)) || 1;
  return `<section class="card cats" aria-label="${t('archCats')}"><h3>${t('archCats')}</h3>
    ${rows.map(c => `<div class="cat-row" style="--c:${c.color}"><span class="cat-name"><i class="cat-dot"></i>${esc(c.name)}</span>
      <span class="cat-val">${cats[c.id].count} · ${fmtShort(cats[c.id].minutes)}</span>
      <div class="bar"><i style="width:${Math.max(4, Math.round(cats[c.id].minutes / max * 100))}%"></i></div></div>`).join('')}</section>`;
}

function weekScreen() {
  const w = state.currentWeek;
  return `
  <div class="week-title"><span class="badge">${t('activeWeek')}</span><h2>${esc(weekTitle(w))}</h2></div>
  ${statsHtml(w.tasks)}
  ${weekBody(w, false)}
  <div class="week-actions">
    <button type="button" class="btn" data-action="exportPdf" id="pdfBtn">${ic('file')}${t('pdf')}</button>
    <button type="button" class="btn btn-ghost" data-action="finishWeek" id="finishBtn">${ic('flag')}${t('finishWeek')}</button>
    <p class="muted small">${t('finishHint')}</p>
  </div>`;
}
function noWeekScreen() {
  const last = activeArchive()[0], had = state.archive.length > 0;
  return `
  <section class="card hero"><div class="hi">${ic('calendar')}</div>
    <h2>${had ? t('noWeekDone') : t('noWeekNone')}</h2><p>${had ? t('noWeekDoneText') : t('noWeekNoneText')}</p>
    <button type="button" class="btn btn-primary" data-action="newWeek" id="newWeekBtn">${ic('plus')}${t('createWeek')}</button>
    ${last ? `<button type="button" class="btn btn-ghost" data-action="openArchive" data-id="${esc(last.id)}">${t('openLast')}</button>` : ''}
  </section>`;
}
function archiveList() {
  const list = activeArchive(), nt = trashItems().length;
  const items = list.map(a => {
    const st = a.stats || statsOf(a.tasks);
    return `<div class="arch-card">
      <button type="button" class="arch-item" data-action="openArchive" data-id="${esc(a.id)}">
        <strong>${esc(weekTitle(a))}</strong><span class="ai-sub">${t('archDone', { date: fmtDateFull(a.archivedAt) })}</span>
        <span class="ai-stats">${cnt(st.count, 'unitTask')} · ${esc(fmtLong(st.minutes))} · ${t('archDoneCount', { n: st.done || 0 })}</span>${ic('chevR')}</button>
      <button type="button" class="icon-btn small arch-del" data-action="trashWeek" data-id="${esc(a.id)}" aria-label="${esc(t('toTrash'))}: ${esc(weekTitle(a))}">${ic('trash')}</button>
    </div>`;
  }).join('');
  return `<div class="page-head"><h2 class="page-title">${t('archTitle')}</h2><button type="button" class="btn small-btn" data-action="openTrash" id="trashBtn">${ic('trash')}${t('trashCount', { n: nt })}</button></div>
    <p class="page-sub">${t('archSub')}</p>
    ${list.length ? `<div class="arch-list">${items}</div>` : `<section class="card hero"><div class="hi">${ic('archive')}</div><h2>${t('archEmptyT')}</h2><p>${t('archEmptyP')}</p></section>`}`;
}
function trashList() {
  const list = trashItems().sort((a, b) => b.deletedAt - a.deletedAt);
  const items = list.map(a => {
    const st = a.stats || statsOf(a.tasks);
    return `<div class="card trash-item">
      <div class="ti-main"><strong>${esc(weekTitle(a))}</strong><span class="ai-sub">${t('trashedOn', { date: fmtDateFull(a.deletedAt) })}</span>
        <span class="ai-stats">${cnt(st.count, 'unitTask')} · ${esc(fmtLong(st.minutes))}</span></div>
      <div class="ti-actions"><button type="button" class="btn" data-action="restoreWeek" data-id="${esc(a.id)}">${ic('restore')}${t('restore')}</button>
        <button type="button" class="btn btn-link-danger" data-action="purgeWeek" data-id="${esc(a.id)}">${t('purge')}</button></div>
    </div>`;
  }).join('');
  return `<button type="button" class="back" data-action="closeTrash">${ic('chevL')}${t('archBack')}</button>
    <div class="page-head"><h2 class="page-title">${t('trash')}</h2>${list.length ? `<button type="button" class="btn small-btn" data-action="emptyTrash" id="emptyTrashBtn">${t('emptyTrash')}</button>` : ''}</div>
    <p class="page-sub">${t('trashHint')}</p>
    ${list.length ? `<div class="arch-list">${items}</div>` : `<section class="card hero"><div class="hi">${ic('trash')}</div><h2>${t('trashEmptyT')}</h2><p>${t('trashEmptyP')}</p></section>`}`;
}
function archiveDetail() {
  const a = activeArchive().find(x => x.id === ui.archiveId);
  if (!a) { ui.archiveId = null; return archiveList(); }
  return `
  <button type="button" class="back" data-action="closeArchive">${ic('chevL')}${t('archBack')}</button>
  <div class="week-title"><span class="badge archived">${t('archBadge')}</span><h2>${esc(weekTitle(a))}</h2><p class="muted small">${t('archDone', { date: fmtDateFull(a.archivedAt) })}</p></div>
  <div class="notice">${ic('lock')}<span>${t('archNotice')}</span></div>
  ${statsHtml(a.tasks)}
  ${progressInline(a.tasks)}
  ${categoryCard(a.tasks)}
  ${weekBody(a, true)}
  <div class="week-actions"><button type="button" class="btn" data-action="exportPdf" id="pdfBtn" data-id="${esc(a.id)}">${ic('file')}${t('pdf')}</button>
    <button type="button" class="btn btn-link-danger" data-action="trashWeek" data-id="${esc(a.id)}" id="trashThisBtn">${ic('trash')}${t('toTrash')}</button></div>`;
}

/* ---------- Раздел «Ещё» ---------- */
function cloudSection() {
  const C = window.APCloud;
  let body;
  if (!C || !C.configured) body = `<div class="notice warn" style="margin:0">${ic('cloud')}<span>${t('cloudOff')}</span></div>`;
  else if (cloudUser) {
    const letter = esc(((cloudUser.name || cloudUser.email || '?')[0] || '?').toUpperCase());
    body = `<div class="account"><span class="avatar" aria-hidden="true">${letter}</span><div class="acc-text"><b>${esc(cloudUser.name || '')}</b><span>${esc(t('signedAs', { email: cloudUser.email || '' }))}</span></div></div>
      <div class="status-line"><span class="pill ${cloudStatus.state === 'ok' ? 'ok' : cloudStatus.state === 'err' ? 'warn' : ''}" id="cloudStatus">${esc(cloudStatusText())}</span></div>
      <div class="row"><button type="button" class="btn btn-primary" data-action="cloudSync" id="syncBtn">${t('syncNow')}</button><button type="button" class="btn" data-action="cloudSignOut" id="signOutBtn">${t('signOut')}</button></div>`;
  } else body = `<button type="button" class="btn btn-primary btn-block" data-action="cloudSignIn" id="signInBtn">${ic('cloud')}${t('signIn')}</button>`;
  return `<div class="srow block" id="cloudSection"><div class="stxt"><b>${t('secCloud')}</b><span>${t('cloudText')}</span></div>${body}<p class="muted small">${t('cloudNote')}</p></div>`;
}
function moreScreen() {
  const th = state.settings.theme, last = state.settings.lastExportAt, stale = !last || (Date.now() - last) > 7 * 864e5;
  const ua = navigator.userAgent, ios = /iphone|ipad|ipod/i.test(ua) && !navigator.standalone, android = /android/i.test(ua), electron = /electron/i.test(ua);
  const standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone || electron;
  const deleted = state.hiddenCats.map(id => allCats().find(c => c.id === id)).filter(Boolean);
  const nTrash = trashItems().length;
  const installText = ios ? t('installIos') : android ? t('installAndroid') : t('installDesktop');
  return `
  <h2 class="page-title">${t('moreTitle')}</h2><p class="page-sub">${t('moreSub')}</p>
  <div class="sections">

    <h3 class="group-title">${t('grpGeneral')}</h3>
    <section class="card group">
      <div class="srow"><div class="stxt"><b>${t('secLang')}</b><span>${t('secLangText')}</span></div>
        <div class="seg compact" role="tablist" aria-label="${t('secLang')}">
          <button type="button" role="tab" aria-selected="${lang === 'bg'}" data-action="setLang" data-lang="bg" id="langBgBtn">${t('langBg')}</button>
          <button type="button" role="tab" aria-selected="${lang === 'ru'}" data-action="setLang" data-lang="ru" id="langRuBtn">${t('langRu')}</button>
        </div></div>
      <div class="srow"><div class="stxt"><b>${t('secTheme')}</b><span>${t('secThemeText')}</span></div>
        <div class="seg compact three" role="tablist" aria-label="${t('themeAria')}">
          <button type="button" role="tab" aria-selected="${th === 'light'}" data-action="setTheme" data-theme="light">${t('themeLight')}</button>
          <button type="button" role="tab" aria-selected="${th === 'dark'}" data-action="setTheme" data-theme="dark">${t('themeDark')}</button>
          <button type="button" role="tab" aria-selected="${th === 'system'}" data-action="setTheme" data-theme="system">${t('themeSystem')}</button>
        </div></div>
    </section>

    <h3 class="group-title">${t('grpSecurity')}</h3>
    <section class="card group">
      <label class="srow switchrow"><div class="stxt"><b>${t('reqPin')}</b><span>${t('secPinText')}</span></div>
        <input type="checkbox" id="reqPin" ${state.settings.requirePin ? 'checked' : ''}><span class="sw" aria-hidden="true"></span></label>
      ${state.settings.requirePin ? `<div class="srow"><button type="button" class="btn btn-block" data-action="lockNow" id="lockNowBtn">${ic('lock')}${t('lockBtn')}</button></div>` : ''}
      <details class="xdet" id="pinDetails"><summary>${t('pinChangeSum')}${ic('chevR')}</summary>
        <form class="xbody" data-form="pin" novalidate autocomplete="off">
          <div class="field" id="f-old"><label class="lbl" for="pin-old">${t('oldPin')}</label><input id="pin-old" type="password" inputmode="numeric" autocomplete="off" maxlength="32"><p class="field-error" id="e-old" role="alert"></p></div>
          <div class="field" id="f-new"><label class="lbl" for="pin-new">${t('newPin')}</label><input id="pin-new" type="password" inputmode="numeric" autocomplete="new-password" maxlength="8"><p class="field-hint">${t('pinRule')}</p><p class="field-error" id="e-new" role="alert"></p></div>
          <div class="field" id="f-confirm"><label class="lbl" for="pin-confirm">${t('confirmPin')}</label><input id="pin-confirm" type="password" inputmode="numeric" autocomplete="new-password" maxlength="8"><p class="field-error" id="e-confirm" role="alert"></p></div>
          <button type="submit" class="btn btn-primary btn-block" id="savePinBtn">${t('savePin')}</button>
        </form></details>
    </section>

    <h3 class="group-title">${t('grpCats')}</h3>
    <section class="card group" id="catSection">
      <div class="srow block"><p class="muted small" style="margin:0">${t('catsHint')}</p></div>
      <div class="srow block"><div class="stxt"><b>${t('catsDeleted')}</b></div>
        ${deleted.length ? `<ul class="catlist">${deleted.map(c => `<li style="--c:${c.color}"><i class="cat-dot"></i><span>${esc(c.name)}</span>
          <button type="button" class="btn small-btn" data-action="restoreCategory" data-id="${esc(c.id)}">${t('catRestore')}</button>
          ${(!BASE_BY_ID[c.id] && !isCatUsed(c.id)) ? `<button type="button" class="icon-btn small" data-action="purgeCategory" data-id="${esc(c.id)}" aria-label="${esc(t('catPurge'))}: ${esc(c.name)}">${ic('trash')}</button>` : ''}</li>`).join('')}</ul>` : `<p class="muted small" style="margin:0">${t('catNoDeleted')}</p>`}
      </div>
    </section>

    <h3 class="group-title">${t('grpData')}</h3>
    <section class="card group">
      ${cloudSection()}
      <div class="srow block"><div class="stxt"><b>${t('secBackup')}</b><span>${t('backupText')}</span></div>
        <div class="status-line"><span class="pill ${stale ? 'warn' : 'ok'}" id="lastBackup">${last ? t('lastBackup', { date: fmtDateFull(last) }) : t('noBackup')}</span></div>
        <div class="row"><button type="button" class="btn btn-primary" data-action="exportBackup" id="exportBtn">${ic('download')}${t('btnExport')}</button>
          <button type="button" class="btn" data-action="importBackup" id="importBtn">${ic('upload')}${t('btnImport')}</button></div></div>
      <div class="srow"><div class="stxt"><b>${t('rowTrash')}</b><span>${t('rowTrashSub', { n: nTrash })}</span></div>
        <button type="button" class="btn small-btn" data-action="openTrash" id="moreTrashBtn">${ic('trash')}${t('open')}</button></div>
    </section>

    <h3 class="group-title">${t('grpApp')}</h3>
    <section class="card group" id="installSection">
      <div class="srow block"><div class="stxt"><b>${t('secInstall')}</b><span>${standalone ? t('installed') : installText}</span></div>
        ${(standalone || ios) ? '' : `<button type="button" class="btn btn-block" data-action="install" id="installBtn">${ic('phone')}${t('installBtn')}</button>`}</div>
      <div class="srow block"><div class="stxt"><b>${t('secStorage')}</b></div>
        <div class="status-line" style="margin:0"><span class="pill" id="persistPill">${t('persistChk')}</span></div>
        <details class="about"><summary>${t('aboutSum')}</summary><ul>${tl('about').map(x => `<li>${esc(x)}</li>`).join('')}</ul></details></div>
    </section>

    <h3 class="group-title">${t('grpReset')}</h3>
    <section class="card group">
      <div class="srow"><div class="stxt"><b>${t('resetSettings')}</b></div><button type="button" class="btn small-btn" data-action="resetSettings" id="resetSettingsBtn">${t('resetOk')}</button></div>
      <div class="srow"><div class="stxt"><b>${t('wipe')}</b><span>${t('wipeSub')}</span></div><button type="button" class="btn btn-danger small-btn" data-action="wipeAll" id="wipeBtn">${t('resetOk')}</button></div>
    </section>
  </div>
  <p class="version">${t('version', { v: APP_VERSION })}</p>`;
}

function render() {
  const el = $('#view'); let html;
  if (ui.tab === 'week') html = state.currentWeek ? weekScreen() : noWeekScreen();
  else if (ui.tab === 'archive') html = ui.trash ? trashList() : ui.archiveId ? archiveDetail() : archiveList();
  else html = moreScreen();
  el.innerHTML = html;
  renderChrome();
  if (ui.tab === 'more') { updatePersistPill(); if (window.APCloud && APCloud.configured) cloudInit().catch(() => { }); }
}
async function updatePersistPill() {
  let text = t('persistNo'), cls = '';
  try { if (navigator.storage && navigator.storage.persisted && await navigator.storage.persisted()) { text = t('persistOk'); cls = 'ok'; } } catch { /* ok */ }
  const el = $('#persistPill'); if (el) { el.textContent = text; el.className = 'pill ' + cls; }
}

/* =====================================================================
   Занятия и категории
   ===================================================================== */
const visibleCats = (sel) => allCats().filter(c => !state.hiddenCats.includes(c.id) || c.id === sel);
function catGridHtml(sel) {
  return visibleCats(sel).map(c => `<span class="catitem" style="--c:${c.color}"><button type="button" class="catdel" data-action="hideCategory" data-id="${esc(c.id)}" aria-label="${esc(t('catRemoveAria', { name: c.name }))}">${ic('x')}</button><input type="radio" name="t-cat" id="cat-${esc(c.id)}" value="${esc(c.id)}" ${c.id === sel ? 'checked' : ''}><label class="catlabel" for="cat-${esc(c.id)}"><i></i>${esc(c.name)}</label></span>`).join('') +
    `<button type="button" class="catadd" id="catAddBtn" data-action="toggleCatForm" aria-label="${t('catNew')}" aria-expanded="false" aria-controls="catForm">${ic('plus')}<span>${t('catNewShort')}</span></button>`;
}
function openEditor(task) {
  const day = task ? task.day : (ui.selectedDay == null ? 0 : ui.selectedDay), cat = task ? task.cat : ((visibleCats().find(c => c.id === 'work') || visibleCats()[0] || { id: 'work' }).id);
  const title = task ? task.title : catInfo(cat).name;
  openLayer(sheetEl, `
  <form data-form="task" novalidate>
    <h2>${task ? t('taskEdit') : t('taskNew')}</h2>
    <input type="hidden" id="t-id" value="${task ? esc(task.id) : ''}">
    <div class="field" id="g-title"><label class="lbl" for="t-title">${t('fTitle')}</label>
      <input id="t-title" type="text" maxlength="60" autocomplete="off" placeholder="${esc(t('phTitle'))}" value="${esc(title)}" ${task ? '' : 'data-select-all="1"'}>
      <p class="field-error" id="e-title" role="alert"></p></div>
    <div class="field"><label class="lbl" for="t-day">${t('fDay')}</label>
      <select id="t-day">${tl('days').map((d, i) => `<option value="${i}" ${i === day ? 'selected' : ''}>${d}</option>`).join('')}</select></div>
    <div class="field"><span class="lbl" id="cat-lbl">${t('fCat')}</span>
      <div class="catgrid" id="catGrid" role="radiogroup" aria-labelledby="cat-lbl">${catGridHtml(cat)}</div>
      <div class="catform" id="catForm" hidden>
        <div class="field" id="g-catname"><label class="lbl" for="c-name">${t('catName')}</label><input id="c-name" type="text" maxlength="20" autocomplete="off"><p class="field-error" id="e-catname" role="alert"></p></div>
        <span class="lbl" id="sw-lbl">${t('catColor')}</span>
        <div class="swatches" role="radiogroup" aria-labelledby="sw-lbl">${SWATCHES.map((c, i) => `<label class="swatch" style="--c:${c}"><input type="radio" name="c-color" value="${c}" ${i === 0 ? 'checked' : ''} aria-label="${c}"><span></span></label>`).join('')}</div>
        <div class="actions"><button type="button" class="btn btn-ghost" data-action="toggleCatForm">${t('cancel')}</button><button type="button" class="btn btn-primary" data-action="addCategory" id="addCatBtn">${t('catAdd')}</button></div>
      </div></div>
    <div class="timerow">
      <div class="field"><label class="lbl" for="t-start">${t('fStart')}</label><input id="t-start" type="time" value="${task ? task.start : '09:00'}"></div>
      <div class="field"><label class="lbl" for="t-end">${t('fEnd')}</label><input id="t-end" type="time" value="${task ? task.end : '10:00'}"></div>
    </div>
    <div class="dur" id="t-dur"></div>
    <p class="field-error" id="e-time" role="alert" style="margin:-6px 0 10px"></p>
    <div class="actions"><button type="button" class="btn btn-ghost" data-action="closeSheet">${t('cancel')}</button><button type="submit" class="btn btn-primary" id="saveTask">${t('save')}</button></div>
    ${task ? `<button type="button" class="btn btn-link-danger btn-block" style="margin-top:8px" data-action="deleteTask" data-id="${esc(task.id)}">${t('del')}</button>` : ''}
  </form>`, '#t-title');
  updateDuration();
}
/* Выбор категории сразу подставляет её название в поле «Название» */
function autoTitle(catId) {
  const inp = $('#t-title'); if (!inp) return;
  const cur = inp.value.trim();
  const known = new Set([...allCats().map(c => c.name), ...BASE_CATS.flatMap(c => [L.bg['cat_' + c.id], L.ru['cat_' + c.id], L.bg['seed_' + c.id], L.ru['seed_' + c.id]])]);
  if (!cur || known.has(cur)) { inp.value = catInfo(catId).name; $('#g-title').classList.remove('invalid'); $('#e-title').textContent = ''; }
}
function updateDuration() {
  const s = $('#t-start'), e = $('#t-end'), out = $('#t-dur'); if (!s || !e || !out) return;
  if (!TIME_RE.test(s.value) || !TIME_RE.test(e.value)) { out.textContent = t('durPick'); return; }
  if (s.value === e.value) { out.textContent = t('durSame'); return; }
  out.textContent = t('dur', { v: fmtShort(duration(s.value, e.value)) }) + (toMin(e.value) < toMin(s.value) ? ' ' + t('durNext') : '');
}
function saveTaskForm() {
  const title = $('#t-title').value.trim(), start = $('#t-start').value, end = $('#t-end').value, id = $('#t-id').value;
  const day = Number($('#t-day').value), cat = ($('input[name="t-cat"]:checked') || {}).value || 'work';
  let ok = true;
  $('#e-title').textContent = ''; $('#e-time').textContent = ''; $('#g-title').classList.remove('invalid');
  if (!title) { $('#e-title').textContent = t('errTitle'); $('#g-title').classList.add('invalid'); ok = false; }
  if (!TIME_RE.test(start) || !TIME_RE.test(end)) { $('#e-time').textContent = t('errTime'); ok = false; }
  else if (start === end) { $('#e-time').textContent = t('errSame'); ok = false; }
  if (!ok) return;
  const w = state.currentWeek; if (!w) return;
  const old = id ? w.tasks.find(x => x.id === id) : null;
  const obj = { id: id || uid(), day, title: title.slice(0, 60), cat, start, end, done: old ? !!old.done : false };
  w.tasks = id ? w.tasks.map(x => x.id === id ? obj : x) : [...w.tasks, obj];
  ui.selectedDay = day; saveContent(); closeLayer(sheetEl); render(); toast(id ? t('saved') : t('added'));
}
async function deleteTask(id) {
  const x = state.currentWeek && state.currentWeek.tasks.find(y => y.id === id); if (!x) return;
  const ok = await confirmDialog({ title: t('delTitle'), text: `«${x.title}», ${tl('days')[x.day].toLowerCase()}, ${x.start}–${x.end}`, okText: t('delOk'), danger: true });
  if (!ok) return;
  state.currentWeek.tasks = state.currentWeek.tasks.filter(y => y.id !== id);
  saveContent(); closeLayer(sheetEl); render(); toast(t('deleted'));
}
function toggleDone(id) {
  const w = state.currentWeek; if (!w) return;
  w.tasks = w.tasks.map(x => x.id === id ? { ...x, done: !x.done } : x);
  saveContent(); render();
  const b = $(`[data-action="toggleDone"][data-id="${CSS.escape(id)}"]`); if (b) b.focus();
}
function toggleCatForm() {
  const f = $('#catForm'); if (!f) return;
  f.hidden = !f.hidden; $('#catAddBtn').setAttribute('aria-expanded', String(!f.hidden));
  if (!f.hidden) { $('#c-name').value = ''; $('#e-catname').textContent = ''; $('#g-catname').classList.remove('invalid'); setTimeout(() => $('#c-name').focus(), 20); }
}
function addCategory() {
  const name = $('#c-name').value.trim(), color = ($('input[name="c-color"]:checked') || {}).value || SWATCHES[0];
  const err = (m) => { $('#e-catname').textContent = m; $('#g-catname').classList.add('invalid'); };
  if (!name) return err(t('catErrName'));
  if (allCats().some(c => c.name.toLowerCase() === name.toLowerCase())) return err(t('catErrDup'));
  const cat = { id: 'c_' + uid().replace(/-/g, '').slice(0, 10), name: name.slice(0, 20), color };
  state.categories = [...state.categories, cat]; saveContent();
  $('#catGrid').innerHTML = catGridHtml(cat.id);
  $('#catForm').hidden = true;
  autoTitle(cat.id); toast(t('catAdded'));
}
async function hideCategory(id) {
  const c = allCats().find(x => x.id === id); if (!c) return;
  if (!(await confirmDialog({ title: t('catHideTitle'), text: t('catHideText', { name: c.name }), okText: t('catRemove'), danger: true }))) return;
  const wasSel = (($('input[name="t-cat"]:checked') || {}).value) === id;
  if (!state.hiddenCats.includes(id)) state.hiddenCats = [...state.hiddenCats, id];
  saveContent();
  let sel = wasSel ? '' : (($('input[name="t-cat"]:checked') || {}).value || '');
  if (!sel) sel = (visibleCats().find(x => x.id !== id) || { id: 'work' }).id;
  $('#catGrid').innerHTML = catGridHtml(sel);
  if (wasSel) autoTitle(sel);
  toast(t('catHidden'));
}
function restoreCategory(id) { state.hiddenCats = state.hiddenCats.filter(x => x !== id); saveContent(); render(); toast(t('catRestored')); }
async function purgeCategory(id) {
  const c = customCats().find(x => x.id === id); if (!c || isCatUsed(id)) return;
  if (!(await confirmDialog({ title: t('catDelTitle'), text: c.name, okText: t('catDelete'), danger: true }))) return;
  state.categories = state.categories.filter(x => x.id !== id); state.hiddenCats = state.hiddenCats.filter(x => x !== id);
  saveContent(); render(); toast(t('catDeleted'));
}

/* ---------- Корзина архива ---------- */
function setStatus(id, patch) {
  state.archive = state.archive.map(a => a.id === id ? Object.freeze({ ...a, ...patch, statusAt: Date.now() }) : a);
  saveContent();
}
async function trashWeek(id) {
  const a = activeArchive().find(x => x.id === id); if (!a) return;
  if (!(await confirmDialog({ title: t('toTrashTitle'), text: `${weekTitle(a)}\n${t('trashHint')}`, okText: t('toTrashOk'), danger: true }))) return;
  setStatus(id, { deletedAt: Date.now() }); ui.archiveId = null; render(); toast(t('trashed'));
}
function restoreWeek(id) { setStatus(id, { deletedAt: null }); render(); toast(t('restoredWeek')); }
async function purgeWeek(id) {
  const a = trashItems().find(x => x.id === id); if (!a) return;
  if (!(await confirmDialog({ title: t('purgeTitle'), text: t('purgeText', { title: weekTitle(a) }), okText: t('purge'), danger: true }))) return;
  setStatus(id, { purged: true, tasks: [], stats: { count: 0, minutes: 0, done: 0 } }); render(); toast(t('purged'));
}
async function emptyTrash() {
  const n = trashItems().length; if (!n) return;
  if (!(await confirmDialog({ title: t('emptyTrashT'), text: t('emptyTrashText', { n }), okText: t('emptyTrash'), danger: true }))) return;
  state.archive = state.archive.map(a => (a.deletedAt && !a.purged) ? Object.freeze({ ...a, purged: true, tasks: [], stats: { count: 0, minutes: 0, done: 0 }, statusAt: Date.now() }) : a);
  saveContent(); render(); toast(t('purged'));
}

/* ---------- Сброс ---------- */
async function resetSettings() {
  if (!(await confirmDialog({ title: t('resetTitle'), text: t('resetText'), okText: t('resetOk') }))) return;
  Object.assign(state.settings, { theme: 'light', lang: 'bg', view: null, requirePin: true });
  state.hiddenCats = []; ui.view = window.innerWidth < 900 ? 'day' : 'week';
  saveContent(); applyLang(); applyTheme(); render(); toast(t('resetDone'));
}
async function wipeAll() {
  if (!(await confirmDialog({ title: t('wipeTitle'), text: t('wipeText'), okText: t('wipeOk'), danger: true }))) return;
  if (state.settings.requirePin && !(await askPin(t('wipeTitle'), t('wipePin')))) return;
  /* Очищаются только занятия, архив и корзина. PIN, язык, тема и вход через Google остаются. */
  const now = Date.now();
  state.archive = state.archive.map(a => a.purged ? a : Object.freeze({ ...a, purged: true, deletedAt: a.deletedAt || now, tasks: [], stats: { count: 0, minutes: 0, done: 0 }, statusAt: now }));
  state.currentWeek = { id: uid(), startDate: mondayOf(todayISO()), createdAt: now, tasks: [] };
  ui.tab = 'more'; ui.archiveId = null; ui.trash = false; ui.selectedDay = null;
  await saveContent(); render(); toast(t('wipeDone'));
}

/* =====================================================================
   Недели и архив
   ===================================================================== */
async function finishWeek() {
  const w = state.currentWeek; if (!w) return;
  const st = statsOf(w.tasks);
  const ok = await confirmDialog({ title: t('finTitle'), text: t('finText', { range: weekTitle(w), count: cnt(st.count, 'unitTask'), hours: fmtLong(st.minutes), done: `${st.done}/${st.count}` }), okText: t('finOk') });
  if (!ok) return;
  state.archive.unshift(makeArchiveEntry(w)); state.currentWeek = null; ui.selectedDay = null;
  saveContent(); render(); window.scrollTo(0, 0); toast(t('finToast'));
}
function defaultNextStart() {
  const thisMonday = mondayOf(todayISO()), last = activeArchive().find(a => a.startDate);
  if (!last) return thisMonday;
  const next = addDays(last.startDate, 7); return next > thisMonday ? next : thisMonday;
}
function newWeek() {
  if (state.currentWeek) return;
  openLayer(sheetEl, `
  <form data-form="newweek" novalidate>
    <h2>${t('nwTitle')}</h2>
    <div class="field"><label class="lbl" for="nw-date">${t('nwLabel')}</label><input id="nw-date" type="date" value="${defaultNextStart()}">
      <p class="field-hint" id="nw-range"></p><p class="field-error" id="nw-err" role="alert"></p></div>
    <p class="muted small" style="margin-bottom:14px">${t('nwNote')}</p>
    <div class="actions"><button type="button" class="btn btn-ghost" data-action="closeSheet">${t('cancel')}</button><button type="submit" class="btn btn-primary" id="createWeekBtn">${t('nwCreate')}</button></div>
  </form>`, '#nw-date');
  updateNewWeekHint();
}
function updateNewWeekHint() {
  const inp = $('#nw-date'), out = $('#nw-range'); if (!inp || !out) return;
  if (!isISO(inp.value)) { out.textContent = ''; return; }
  const mon = mondayOf(inp.value);
  out.textContent = t('nwRange', { r: rangeLabel(mon) }) + (activeArchive().some(a => a.startDate === mon) ? t('nwDup') : '');
}
function createWeek() {
  const v = $('#nw-date').value; if (!isISO(v)) { $('#nw-err').textContent = t('errDate'); return; }
  state.currentWeek = { id: uid(), startDate: mondayOf(v), createdAt: Date.now(), tasks: [] };
  ui.selectedDay = null; saveContent(); closeLayer(sheetEl); render(); window.scrollTo(0, 0); toast(t('nwCreated'));
}

/* =====================================================================
   Сохранение файлов, PDF
   ===================================================================== */
async function saveFile(file) {
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
  if (ios && navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: file.name }); return; }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a'); a.href = url; a.download = file.name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/* Чистый лист А4: только неделя, итоги и список занятий по дням. Рисуется на canvas и вставляется в PDF как изображение. */
function weekToCanvas(week) {
  const W = 1240, A4H = 1754, M = 60, GAP = 44, colW = (W - 2 * M - GAP) / 2;
  const F = (wt, s) => `${wt} ${Math.round(s)}px system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif`;
  const cv = document.createElement('canvas'), ctx = cv.getContext('2d');
  const days = tl('days').map((name, i) => ({ name, i, list: sortTasks(week.tasks.filter(x => x.day === i)) }));
  const rowH = 46, headH = 70, gapH = 34;
  const blockH = (d, s) => (headH + (d.list.length ? d.list.length * rowH : 44) + gapH) * s;
  const headerH = 270, footH = 90;
  let best = { k: 4, max: Infinity };
  for (let k = 1; k < 7; k++) {
    const l = days.slice(0, k).reduce((a, d) => a + blockH(d, 1), 0), r = days.slice(k).reduce((a, d) => a + blockH(d, 1), 0);
    if (Math.max(l, r) < best.max) best = { k, max: Math.max(l, r) };
  }
  const avail = A4H - headerH - footH;
  let s = Math.min(1, avail / best.max); s = Math.max(s, 0.62);
  const colsH = best.max * s, H = Math.max(A4H, Math.ceil(headerH + colsH + footH));
  cv.width = W; cv.height = H;
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.textBaseline = 'alphabetic';
  const st = statsOf(week.tasks);
  ctx.fillStyle = '#111'; ctx.font = F('800', 34); ctx.textAlign = 'left'; ctx.fillText('A&P', M, 96);
  ctx.fillStyle = '#8a8f9c'; ctx.font = F('500', 26); ctx.textAlign = 'right'; ctx.fillText(t('pdfGen', { date: fmtDateFull(Date.now()) }), W - M, 96);
  ctx.fillStyle = '#111'; ctx.font = F('700', 64); ctx.textAlign = 'left'; ctx.fillText(weekTitle(week), M, 178);
  ctx.fillStyle = '#555'; ctx.font = F('500', 30);
  ctx.fillText(`${cnt(st.count, 'unitTask')}  ·  ${fmtLong(st.minutes)}  ·  ${t('pdfDone', { n: `${st.done}/${st.count}` })}`, M, 228);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(M, 252); ctx.lineTo(W - M, 252); ctx.stroke();
  const fit = (text, maxW) => { if (ctx.measureText(text).width <= maxW) return text; let x = text; while (x.length > 1 && ctx.measureText(x + '…').width > maxW) x = x.slice(0, -1); return x + '…'; };
  const drawCol = (list, x0) => {
    let y = headerH;
    for (const d of list) {
      ctx.fillStyle = '#111'; ctx.font = F('700', 33 * s); ctx.textAlign = 'left'; ctx.fillText(d.name, x0, y + 40 * s);
      if (week.startDate) { ctx.fillStyle = '#8a8f9c'; ctx.font = F('500', 25 * s); ctx.textAlign = 'right'; ctx.fillText(dayLabel(addDays(week.startDate, d.i)), x0 + colW, y + 40 * s); }
      ctx.strokeStyle = '#d9dce3'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, y + 54 * s); ctx.lineTo(x0 + colW, y + 54 * s); ctx.stroke();
      y += headH * s;
      if (!d.list.length) { ctx.fillStyle = '#b3b7c2'; ctx.font = F('500', 26 * s); ctx.textAlign = 'left'; ctx.fillText('—', x0, y + 26 * s); y += 44 * s; }
      for (const x of d.list) {
        const bs = 25 * s, by = y + 4 * s;
        ctx.strokeStyle = '#111'; ctx.lineWidth = 2.6 * s; ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(x0 + 1, by, bs, bs, 6 * s); else ctx.rect(x0 + 1, by, bs, bs);
        if (x.done) { ctx.fillStyle = '#111'; ctx.fill(); } ctx.stroke();
        if (x.done) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3.4 * s; ctx.beginPath(); ctx.moveTo(x0 + 1 + bs * .22, by + bs * .54); ctx.lineTo(x0 + 1 + bs * .43, by + bs * .74); ctx.lineTo(x0 + 1 + bs * .78, by + bs * .28); ctx.stroke(); }
        const tx = x0 + 44 * s;
        ctx.fillStyle = '#555'; ctx.font = F('500', 24 * s); ctx.textAlign = 'left'; ctx.fillText(`${x.start}–${x.end}`, tx, y + 27 * s);
        const dur = fmtShort(duration(x.start, x.end));
        ctx.fillStyle = '#8a8f9c'; ctx.textAlign = 'right'; ctx.fillText(dur, x0 + colW, y + 27 * s);
        const dw = ctx.measureText(dur).width;
        ctx.fillStyle = '#111'; ctx.font = F('600', 27 * s); ctx.textAlign = 'left';
        const titleX = tx + 160 * s;
        ctx.fillText(fit(x.title, colW - (titleX - x0) - dw - 14 * s), titleX, y + 27 * s);
        y += rowH * s;
      }
      y += gapH * s;
    }
  };
  drawCol(days.slice(0, best.k), M); drawCol(days.slice(best.k), M + colW + GAP);
  return cv;
}
function buildPdf(jpeg, w, h) {
  const enc = new TextEncoder(), parts = [], offs = []; let pos = 0;
  const push = (x) => { const b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); pos += b.length; };
  const pw = 595.28, ph = +(pw * h / w).toFixed(2);
  push('%PDF-1.4\n');
  const obj = (n, body) => { offs[n] = pos; push(`${n} 0 obj\n`); if (typeof body === 'string') push(body); else body.forEach(push); push('\nendobj\n'); };
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  obj(4, [`<< /Type /XObject /Subtype /Image /Width ${w} /Height ${h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`, jpeg, '\nendstream']);
  const content = `q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`;
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  const xref = pos; push('xref\n0 6\n0000000000 65535 f \n');
  for (let i = 1; i <= 5; i++) push(String(offs[i]).padStart(10, '0') + ' 00000 n \n');
  push(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
  const out = new Uint8Array(pos); let p = 0; for (const b of parts) { out.set(b, p); p += b.length; }
  return out;
}
let lastPdf = null, pdfUrl = null;
function showPdfSheet(file, previewUrl) {
  if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  pdfUrl = URL.createObjectURL(file); lastPdf = file;
  const canShare = !!(navigator.canShare && navigator.canShare({ files: [file] }));
  openLayer(sheetEl, `<div class="pdfsheet"><h2>${t('pdfReady')}</h2>
    <img class="pdf-prev" src="${previewUrl}" alt="${esc(file.name)}">
    <p class="muted small">${t('pdfHint')}</p>
    <div class="actions wrap">
      <a class="btn btn-primary" id="pdfSaveLink" href="${pdfUrl}" download="${esc(file.name)}">${ic('download')}${t('pdfSave')}</a>
      <a class="btn" id="pdfOpenLink" href="${pdfUrl}" target="_blank" rel="noopener">${ic('file')}${t('pdfOpen')}</a>
      ${canShare ? `<button type="button" class="btn" id="pdfShareBtn" data-action="sharePdf">${t('pdfShare')}</button>` : ''}
      <button type="button" class="btn btn-ghost" data-action="closeSheet">${t('close')}</button>
    </div></div>`);
}
async function exportPdf(el) {
  const week = el && el.dataset.id ? state.archive.find(a => a.id === el.dataset.id) : state.currentWeek;
  if (!week) return;
  try {
    const cv = weekToCanvas(week), url = cv.toDataURL('image/jpeg', 0.92), bin = atob(url.split(',')[1]), jpeg = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) jpeg[i] = bin.charCodeAt(i);
    const file = new File([buildPdf(jpeg, cv.width, cv.height)], `ap-week-${week.startDate || todayISO()}.pdf`, { type: 'application/pdf' });
    try { await saveFile(file); } catch (e) { if (e && e.name === 'AbortError') return; }
    showPdfSheet(file, url);
  } catch (e) { console.error(e); toast(t('pdfFail')); }
}
async function sharePdf() { if (lastPdf) { try { await navigator.share({ files: [lastPdf], title: lastPdf.name }); } catch { /* отмена */ } } }

/* =====================================================================
   Резервная копия
   ===================================================================== */
const buildBackup = () => ({ app: 'A&P', format: 2, appVersion: APP_VERSION, exportedAt: new Date().toISOString(),
  data: { currentWeek: state.currentWeek, archive: state.archive, categories: state.categories, hiddenCats: state.hiddenCats, settings: { theme: state.settings.theme, lang: state.settings.lang, view: state.settings.view } } });
async function exportBackup() {
  const file = new File([JSON.stringify(buildBackup(), null, 2)], `ap-backup-${todayISO()}.json`, { type: 'application/json' });
  try { await saveFile(file); } catch (e) { if (e && e.name === 'AbortError') return; toast(t('saveFail')); return; }
  state.settings.lastExportAt = Date.now(); save(); toast(t('backupSaved')); if (ui.tab === 'more') render();
}
function parseBackup(text) {
  let obj; try { obj = JSON.parse(text); } catch { throw new Error(t('errNotJson')); }
  if (!obj || obj.app !== 'A&P' || !obj.data || typeof obj.data !== 'object') throw new Error(t('errNotBackup'));
  const r = parseContent(obj.data), s = obj.data.settings || {};
  r.theme = ['light', 'dark', 'system'].includes(s.theme) ? s.theme : null;
  return r;
}
async function handleImport(file) {
  if (!file) return;
  let parsed;
  try { parsed = parseBackup(await file.text()); } catch (e) { await messageDialog(t('readFail'), e.message); return; }
  const cw = parsed.currentWeek;
  const lines = [cw ? t('impActive', { r: rangeLabel(cw.startDate), n: cnt(cw.tasks.length, 'unitTask') }) : t('impNoActive'), t('impArch', { n: parsed.archive.filter(a => !a.deletedAt && !a.purged).length }),
    parsed.dropped ? t('impDropped', { n: parsed.dropped }) : null, '', t('impWarn')].filter(x => x !== null);
  if (!(await confirmDialog({ title: t('impTitle'), text: lines.join('\n'), okText: t('impOk'), danger: true }))) return;
  state.currentWeek = parsed.currentWeek; state.archive = parsed.archive; state.categories = parsed.categories; state.hiddenCats = parsed.hiddenCats;
  ui.selectedDay = null; ui.archiveId = null;
  await saveContent(); render(); toast(t('restored'));
}

/* =====================================================================
   Облако: вход через Google и синхронизация (Firebase, см. cloud.js)
   ===================================================================== */
let cloudUser = null, cloudStatus = { state: 'off', at: null }, pushTimer = null, cloudHandlers = null;
const cloudStatusText = () => cloudStatus.state === 'syncing' ? t('syncing') : cloudStatus.state === 'err' ? t('syncErr') : cloudStatus.at ? t('syncedAt', { time: fmtTime(cloudStatus.at) }) : t('syncWait');
function setCloudStatus(s, at) {
  cloudStatus = { state: s, at: at || cloudStatus.at };
  const el = $('#cloudStatus'); if (el) { el.textContent = cloudStatusText(); el.className = 'pill ' + (s === 'ok' ? 'ok' : s === 'err' ? 'warn' : ''); }
}
const contentOf = () => ({ currentWeek: state.currentWeek, archive: state.archive, categories: state.categories, hiddenCats: state.hiddenCats, dataUpdatedAt: state.dataUpdatedAt || 0 });
function schedulePush() {
  if (!cloudUser || !window.APCloud) return;
  clearTimeout(pushTimer); setCloudStatus('syncing'); pushTimer = setTimeout(pushNow, 1200);
}
async function pushNow() {
  if (!cloudUser || !window.APCloud) return;
  if (navigator.onLine === false) { setCloudStatus('err'); return; }
  try { await APCloud.push(contentOf()); state.settings.cloud.lastSync = Date.now(); save(); setCloudStatus('ok', Date.now()); }
  catch (e) { console.warn('cloud push', e); setCloudStatus('err'); }
}
/* Слияние: архив объединяется по id, категории тоже, активная неделя берётся из более свежей версии */
function mergeRemote(remote) {
  if (!remote || typeof remote !== 'object') return { changed: false, needPush: true };
  const r = parseContent(remote), rUpd = Number(remote.dataUpdatedAt) || 0, lUpd = state.dataUpdatedAt || 0;
  const hc = (x) => [...x].sort();
  const before = canon({ w: state.currentWeek, a: state.archive, c: state.categories, h: hc(state.hiddenCats) });
  const cats = [...state.categories]; for (const c of r.categories) if (!cats.some(x => x.id === c.id)) cats.push(c);
  const byId = new Map(state.archive.map(a => [a.id, a]));
  for (const a of r.archive) { const l = byId.get(a.id); if (!l || (a.statusAt || 0) > (l.statusAt || 0)) byId.set(a.id, a); }
  const arch = sortArchive([...byId.values()]);
  const hidden = rUpd > lUpd ? r.hiddenCats : state.hiddenCats;
  const inArch = (w) => w && arch.some(a => a.id === w.id);
  const first = rUpd > lUpd ? r.currentWeek : state.currentWeek, second = rUpd > lUpd ? state.currentWeek : r.currentWeek;
  let cw = first; if (inArch(cw)) cw = (second && !inArch(second)) ? second : null;
  const after = canon({ w: cw, a: arch, c: cats, h: hc(hidden) });
  const changed = before !== after;
  if (changed) { state.currentWeek = cw; state.archive = arch; state.categories = cats; state.hiddenCats = [...hidden]; }
  if (rUpd > lUpd) state.dataUpdatedAt = rUpd;
  const remoteCanon = canon({ w: r.currentWeek, a: r.archive, c: r.categories, h: hc(r.hiddenCats) });
  return { changed, needPush: remoteCanon !== after };
}
function onRemote(payload) {
  try {
    const res = mergeRemote(payload ? payload.content : null);
    if (res.changed) { save(); if (!document.querySelector('.layer.open')) render(); }
    if (res.needPush) schedulePush(); else setCloudStatus('ok', Date.now());
  } catch (e) { console.warn('cloud merge', e); setCloudStatus('err'); }
}
function cloudInit() {
  if (!window.APCloud || !APCloud.configured) return Promise.reject(new Error('off'));
  if (!cloudHandlers) cloudHandlers = {
    onUser(u) {
      const was = !!cloudUser; cloudUser = u;
      if (u) { state.settings.cloud.enabled = true; save(); if (!was) setCloudStatus('syncing'); }
      if (ui.tab === 'more' && !document.querySelector('.layer.open') && (!!u !== was)) render();
    },
    onRemote, onError() { setCloudStatus('err'); }
  };
  return APCloud.init(cloudHandlers);
}
window.addEventListener('online', () => { if (cloudUser) schedulePush(); });

/* =====================================================================
   Обработчики
   ===================================================================== */
function setLanguage(l) { state.settings.lang = l; save(); applyLang(); render(); if (locked) renderLock(); }
const actions = {
  tab(el) { ui.tab = el.dataset.tab; ui.trash = false; ui.archiveId = null; ui.selectedDay = null; render(); window.scrollTo(0, 0); },
  toggleLang() { setLanguage(lang === 'bg' ? 'ru' : 'bg'); },
  setLang(el) { setLanguage(el.dataset.lang); },
  lockNow() { showLock(); },
  toggleTheme() { state.settings.theme = resolvedTheme() === 'dark' ? 'light' : 'dark'; save(); applyTheme(); render(); },
  setTheme(el) { state.settings.theme = el.dataset.theme; save(); applyTheme(); render(); },
  setView(el) { ui.view = el.dataset.view; state.settings.view = ui.view; save(); render(); },
  selectDay(el) { ui.selectedDay = Number(el.dataset.day); render(); },
  addTask() { if (state.currentWeek) openEditor(null); },
  editTask(el) { const x = state.currentWeek && state.currentWeek.tasks.find(y => y.id === el.dataset.id); if (x) openEditor(x); },
  toggleDone(el) { toggleDone(el.dataset.id); },
  deleteTask(el) { deleteTask(el.dataset.id); },
  closeSheet() { closeLayer(sheetEl); },
  toggleCatForm, addCategory,
  hideCategory(el) { hideCategory(el.dataset.id); },
  restoreCategory(el) { restoreCategory(el.dataset.id); },
  purgeCategory(el) { purgeCategory(el.dataset.id); },
  trashWeek(el) { trashWeek(el.dataset.id); },
  restoreWeek(el) { restoreWeek(el.dataset.id); },
  purgeWeek(el) { purgeWeek(el.dataset.id); },
  emptyTrash, resetSettings, wipeAll, sharePdf,
  openTrash() { ui.tab = 'archive'; ui.archiveId = null; ui.trash = true; render(); window.scrollTo(0, 0); },
  closeTrash() { ui.trash = false; render(); window.scrollTo(0, 0); },
  finishWeek, newWeek,
  openArchive(el) { ui.tab = 'archive'; ui.trash = false; ui.archiveId = el.dataset.id; ui.selectedDay = null; render(); window.scrollTo(0, 0); },
  closeArchive() { ui.trash = false; ui.archiveId = null; ui.selectedDay = null; render(); window.scrollTo(0, 0); },
  exportPdf, exportBackup,
  importBackup() { $('#importFile').value = ''; $('#importFile').click(); },
  async install() {
    if (installEvent) { installEvent.prompt(); try { await installEvent.userChoice; } catch { /* ok */ } installEvent = null; }
    else await messageDialog(t('installHelpT'), t('installHelp'));
  },
  async cloudSignIn() {
    const btn = $('#signInBtn'); if (btn) btn.disabled = true;
    try { await cloudInit(); await APCloud.signIn(); toast(t('signedInToast')); }
    catch (e) { console.warn(e); toast(e && /load/.test(String(e.message)) ? t('cloudLoadErr') : t('signInErr')); }
    finally { const b2 = $('#signInBtn'); if (b2) b2.disabled = false; }
  },
  async cloudSignOut() {
    try { await APCloud.signOut(); } catch { /* ok */ }
    cloudUser = null; cloudStatus = { state: 'off', at: null }; state.settings.cloud.enabled = false; save(); render(); toast(t('signedOutToast'));
  },
  async cloudSync() { clearTimeout(pushTimer); setCloudStatus('syncing'); await pushNow(); }
};

const forms = {
  async unlock() {
    const inp = $('#lock-pin'), err = $('#lock-err'), r = await checkPin(inp.value);
    if (r.ok) { err.textContent = ''; hideLock(); render(); return; }
    err.textContent = pinError(r); inp.value = ''; inp.focus();
  },
  async askpin() {
    const inp = $('#ask-pin'), r = await checkPin(inp.value);
    if (r.ok) { finishDialog(true); return; }
    $('#ask-field').classList.add('invalid'); $('#ask-err').textContent = pinError(r); inp.value = ''; inp.focus();
  },
  task: saveTaskForm,
  newweek: createWeek,
  async pin() {
    const old = $('#pin-old').value, nw = $('#pin-new').value, cf = $('#pin-confirm').value, errs = {};
    if (!old) errs.old = t('errOld'); else { const r = await checkPin(old); if (!r.ok) errs.old = r.wait ? t('pinWait', { s: r.wait }) : t('errOldWrong'); }
    if (!/^\d{4,8}$/.test(nw)) errs.new = t('errNew'); else if (nw === old) errs.new = t('errNewSame');
    if (!cf) errs.confirm = t('errConfirm'); else if (cf !== nw) errs.confirm = t('errMismatch');
    for (const k of ['old', 'new', 'confirm']) { $('#e-' + k).textContent = errs[k] || ''; $('#f-' + k).classList.toggle('invalid', !!errs[k]); }
    if (Object.keys(errs).length) return;
    state.settings.pin = await makePin(nw, false); await save();
    ['#pin-old', '#pin-new', '#pin-confirm'].forEach(s => { $(s).value = ''; }); toast(t('pinChanged'));
  }
};

document.addEventListener('click', (e) => {
  const dlg = e.target.closest('[data-dlg]');
  if (dlg) { finishDialog(dlg.dataset.dlg === 'ok'); return; }
  if (e.target === dialogEl) { finishDialog(false); return; }
  const el = e.target.closest('[data-action]');
  if (el && actions[el.dataset.action]) actions[el.dataset.action](el);
});
document.addEventListener('submit', (e) => { const f = e.target.closest('[data-form]'); if (f) { e.preventDefault(); forms[f.dataset.form](f); } });
document.addEventListener('input', (e) => {
  if (e.target.id === 't-start' || e.target.id === 't-end') updateDuration();
  if (e.target.id === 'nw-date') updateNewWeekHint();
});
document.addEventListener('change', async (e) => {
  const id = e.target.id;
  if (id === 't-start' || id === 't-end') updateDuration();
  if (id === 'nw-date') updateNewWeekHint();
  if (id === 'importFile') handleImport(e.target.files && e.target.files[0]);
  if (e.target.name === 't-cat') autoTitle(e.target.value);
  if (id === 'reqPin') {
    if (e.target.checked) { state.settings.requirePin = true; save(); render(); toast(t('pinOnDone')); }
    else {
      e.target.checked = true;
      if (await askPin(t('pinOffTitle'), t('pinOffText'))) { state.settings.requirePin = false; save(); try { sessionStorage.setItem('ap_unlocked', '1'); } catch { /* ok */ } render(); toast(t('pinOffDone')); }
      else render();
    }
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.target.id === 'c-name') { e.preventDefault(); addCategory(); return; }
  if (e.key !== 'Escape' || locked) return;
  if (dialogEl.classList.contains('open')) finishDialog(false); else if (sheetEl.classList.contains('open')) closeLayer(sheetEl);
});
document.addEventListener('visibilitychange', () => {
  if (!state) return;
  if (document.hidden) { hiddenAt = Date.now(); return; }
  if (state.settings.requirePin && !locked && hiddenAt && Date.now() - hiddenAt > AUTO_LOCK_MS) { showLock(); return; }
  if (ui.tab !== 'more' && !locked && !document.querySelector('.layer.open')) render();
});

/* =====================================================================
   PWA
   ===================================================================== */
let installEvent = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvent = e; });
window.addEventListener('appinstalled', () => { installEvent = null; toast(t('installedToast')); if (ui.tab === 'more') render(); });
function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  if (!(location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) return;
  const had = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) toast(t('updated')); });
  navigator.serviceWorker.register('./sw.js').catch(() => { /* офлайн-режим недоступен */ });
}

/* =====================================================================
   Запуск
   ===================================================================== */
async function boot() {
  try { state = await loadState(); } catch (e) { console.error(e); state = normalize(await freshState()); }
  applyLang(); applyTheme();
  ui.view = state.settings.view || (window.innerWidth < 900 ? 'day' : 'week');
  render(); save();
  let unlocked = false; try { unlocked = sessionStorage.getItem('ap_unlocked') === '1'; } catch { /* ok */ }
  if (state.settings.requirePin && !unlocked) showLock();
  registerSW();
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch { /* ok */ }
  if (state.settings.cloud.enabled && window.APCloud && APCloud.configured) cloudInit().catch(() => setCloudStatus('err'));
  document.documentElement.dataset.ready = '1';
}
boot();

})();
