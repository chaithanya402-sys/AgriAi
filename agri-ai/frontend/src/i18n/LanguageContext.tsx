import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'en' | 'te' | 'hi'

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: string, fallback?: string) => string
}

const LANG_KEY = 'agriai_lang'

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation groups
    'nav.overview': 'Overview',
    'nav.farm': 'Farm',
    'nav.intelligence': 'Intelligence',
    'nav.business': 'Business',
    'nav.assistance': 'Assistance',

    // Navigation items
    'nav.dashboard': 'Dashboard',
    'nav.farms': 'Farm Management',
    'nav.soil': 'Soil Analysis',
    'nav.crop': 'Crop Recommendation',
    'nav.yield': 'Yield Prediction',
    'nav.irrigation': 'Irrigation',
    'nav.weather': 'Weather',
    'nav.disease': 'Disease Detection',
    'nav.fertilizer': 'Fertilizer',
    'nav.risk': 'Risk',
    'nav.market': 'Market',
    'nav.profit': 'Profit',
    'nav.optimize': 'Optimization',
    'nav.assistant': 'AI Assistant',
    'nav.notifications': 'Notifications',
    'nav.reports': 'Reports',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.logout': 'Log out',
    'nav.menu': 'Menu',

    // Settings Page
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage your profile, preferences and account.',
    'settings.profile': 'Profile',
    'settings.profileDesc': 'Your account details.',
    'settings.active': 'Active',
    'settings.email': 'Email',
    'settings.phone': 'Phone',
    'settings.location': 'Location',
    'settings.preferences': 'Preferences',
    'settings.prefDesc': 'Language and interface settings.',
    'settings.language': 'Language',
    'settings.languageDesc': 'Select your preferred language. Saved instantly on this device.',
    'settings.theme': 'Theme',
    'settings.themeDesc': 'Switch between light, dark, and system color modes.',
    'settings.themeLight': 'Light',
    'settings.themeDark': 'Dark',
    'settings.themeSystem': 'System',
    'settings.selectTheme': 'Select theme',
    'settings.notifications': 'Notifications',
    'settings.notifyDesc': 'Choose which notifications you receive.',
    'settings.enableNotifications': 'Enable notifications',
    'settings.enableNotificationsDesc': 'Receive alerts about weather, disease, risk and market.',
    'settings.account': 'Account',
    'settings.accountDesc': 'Sign out of your AgriAI account.',
    'settings.logout': 'Log out',
    'settings.savedBanner': 'Settings updated successfully',

    // Dashboard
    'dashboard.welcome': 'Welcome back',
    'dashboard.welcomeDesc': 'Here is what is happening across your fields today.',
    'dashboard.emptyTitle': 'No farms yet',
    'dashboard.emptyDesc': 'Create your first farm to get started with AI-powered insights.',
    'dashboard.createFirstFarm': 'Create Your First Farm',
    'dashboard.estYield': 'Est. yield',
    'dashboard.soilScore': 'Soil score',
    'dashboard.waterNeed': 'Water need',
    'dashboard.healthy': 'Healthy',
    'dashboard.recommendedToday': 'Recommended today',
    'dashboard.askAssistant': 'Ask AI assistant anything about this field',
    'dashboard.smartIrrigation': 'Smart irrigation',
    'dashboard.quickActions': 'Quick Actions',
    'dashboard.recentNotifications': 'Recent Notifications',
    'dashboard.viewAll': 'View all',

    // Quick Actions
    'action.soil': 'Soil Analysis',
    'action.soilDesc': 'Test soil health and nutrients',
    'action.crop': 'Crop Recommendations',
    'action.cropDesc': 'Get AI-powered crop suggestions',
    'action.yield': 'Yield Prediction',
    'action.yieldDesc': 'Predict expected crop yield',
    'action.fertilizer': 'Fertilizer Plan',
    'action.fertilizerDesc': 'Optimize fertilizer usage',
    'action.weather': 'Weather Forecast',
    'action.weatherDesc': 'Local weather and alerts',
    'action.disease': 'Disease Detection',
    'action.diseaseDesc': 'Identify crop diseases',
    'action.market': 'Market Prices',
    'action.marketDesc': 'Current crop market prices',
    'action.risk': 'Risk Assessment',
    'action.riskDesc': 'Evaluate farming risks',
  },

  te: {
    // Navigation groups
    'nav.overview': 'అవలోకనం',
    'nav.farm': 'వ్యవసాయం',
    'nav.intelligence': 'ఇంటెలిజెన్స్',
    'nav.business': 'వ్యాపారం',
    'nav.assistance': 'సహాయం',

    // Navigation items
    'nav.dashboard': 'డాష్‌బోర్డ్',
    'nav.farms': 'వ్యవసాయ నిర్వహణ',
    'nav.soil': 'నేల విశ్లేషణ',
    'nav.crop': 'పంట సిఫార్సు',
    'nav.yield': 'దిగుబడి అంచనా',
    'nav.irrigation': 'నీటిపారుదల',
    'nav.weather': 'వాతావరణం',
    'nav.disease': 'తెగుళ్ల గుర్తింపు',
    'nav.fertilizer': 'ఎరువుల ప్రణాళిక',
    'nav.risk': 'ప్రమాద విశ్లేషణ',
    'nav.market': 'మార్కెట్ సమాచారం',
    'nav.profit': 'లాభాల లెక్కింపు',
    'nav.optimize': 'ఆప్టిమైజేషన్',
    'nav.assistant': 'AI సహాయకుడు',
    'nav.notifications': 'నోటిఫికేషన్లు',
    'nav.reports': 'నివేదికలు',
    'nav.profile': 'ప్రొఫైల్',
    'nav.settings': 'సెట్టింగ్‌లు',
    'nav.logout': 'లాగ్ అవుట్',
    'nav.menu': 'మెనూ',

    // Settings Page
    'settings.title': 'సెట్టింగ్‌లు',
    'settings.subtitle': 'మీ ప్రొఫైల్, ప్రాధాన్యతలు మరియు ఖాతాను నిర్వహించండి.',
    'settings.profile': 'ప్రొఫైల్',
    'settings.profileDesc': 'మీ ఖాతా వివరాలు.',
    'settings.active': 'యాక్టివ్',
    'settings.email': 'ఇమెయిల్',
    'settings.phone': 'ఫోన్',
    'settings.location': 'ప్రాంతం',
    'settings.preferences': 'ప్రాధాన్యతలు',
    'settings.prefDesc': 'భాష మరియు ఇంటర్‌ఫేస్ సెట్టింగ్‌లు.',
    'settings.language': 'భాష (Language)',
    'settings.languageDesc': 'మీ ప్రాధాన్య భాషను ఎంచుకోండి. వెంటనే వర్తించబడుతుంది.',
    'settings.theme': 'థీమ్ (రూపం)',
    'settings.themeDesc': 'లైట్, డార్క్ లేదా సిస్టమ్ మోడ్ మధ్య మారండి.',
    'settings.themeLight': 'లైట్ (Light)',
    'settings.themeDark': 'డార్క్ (Dark)',
    'settings.themeSystem': 'సిస్టమ్ (System)',
    'settings.selectTheme': 'థీమ్‌ను ఎంచుకోండి',
    'settings.notifications': 'నోటిఫికేషన్లు',
    'settings.notifyDesc': 'మీరు ఏ నోటిఫికేషన్‌లను పొందాలో ఎంచుకోండి.',
    'settings.enableNotifications': 'నోటిఫికేషన్‌లను ప్రారంభించండి',
    'settings.enableNotificationsDesc': 'వాతావరణం, తెగుళ్లు, రిస్క్ మరియు మార్కెట్ గురించి హెచ్చరికలను అందుకోండి.',
    'settings.account': 'ఖాతా',
    'settings.accountDesc': 'మీ AgriAI ఖాతా నుండి లాగ్ అవుట్ అవ్వండి.',
    'settings.logout': 'లాగ్ అవుట్',
    'settings.savedBanner': 'సెట్టింగ్‌లు విజయవంతంగా నవీకరించబడ్డాయి',

    // Dashboard
    'dashboard.welcome': 'తిరిగి స్వాగతం',
    'dashboard.welcomeDesc': 'ఈరోజు మీ పొలాల్లో తాజా స్థితి వివరాలు.',
    'dashboard.emptyTitle': 'ఇంకా పొలాలు జోడించబడలేదు',
    'dashboard.emptyDesc': 'AI ఆధారిత సమాచారం పొందడానికి మీ మొదటి పొలాన్ని సృష్టించండి.',
    'dashboard.createFirstFarm': 'మీ మొదటి పొలాన్ని సృష్టించండి',
    'dashboard.estYield': 'అంచనా దిగుబడి',
    'dashboard.soilScore': 'నేల స్కోరు',
    'dashboard.waterNeed': 'నీటి అవసరం',
    'dashboard.healthy': 'ఆరోగ్యకరమైనది',
    'dashboard.recommendedToday': 'ఈరోజు సిఫార్సు',
    'dashboard.askAssistant': 'ఈ పొలం గురించి AI సహాయకుడిని ఏదైనా అడగండి',
    'dashboard.smartIrrigation': 'స్మార్ట్ నీటిపారుదల',
    'dashboard.quickActions': 'త్వరిత చర్యలు',
    'dashboard.recentNotifications': 'ఇటీవలి నోటిఫికేషన్లు',
    'dashboard.viewAll': 'అన్నీ చూడండి',

    // Quick Actions
    'action.soil': 'నేల విశ్లేషణ',
    'action.soilDesc': 'నేల ఆరోగ్యం మరియు పోషకాలను పరీక్షించండి',
    'action.crop': 'పంట సిఫార్సులు',
    'action.cropDesc': 'AI ద్వారా ఉత్తమ పంటల సూచనలను పొందండి',
    'action.yield': 'దిగుబడి అంచనా',
    'action.yieldDesc': 'ఆశించిన పంట దిగుబడిని ముందే తెలుసుకోండి',
    'action.fertilizer': 'ఎరువుల ప్రణాళిక',
    'action.fertilizerDesc': 'ఎరువుల సమతుల్య వినియోగాన్ని ఆప్టిమైజ్ చేయండి',
    'action.weather': 'వాతావరణ సూచన',
    'action.weatherDesc': 'స్థానిక వాతావరణం మరియు వర్షపాత హెచ్చరికలు',
    'action.disease': 'తెగుళ్ల గుర్తింపు',
    'action.diseaseDesc': 'పంట తెగుళ్లను ఫోటో ద్వారా గుర్తించండి',
    'action.market': 'మార్కెట్ ధరలు',
    'action.marketDesc': 'లైవ్ పంట మార్కెట్ మరియు మండి ధరలు',
    'action.risk': 'రిస్క్ అసెస్‌మెంట్',
    'action.riskDesc': 'వ్యవసాయ ప్రమాదాలు మరియు నివారణలను అంచనా వేయండి',
  },

  hi: {
    // Navigation groups
    'nav.overview': 'अवलोकन',
    'nav.farm': 'खेत प्रबंधन',
    'nav.intelligence': 'बुद्धिमत्ता',
    'nav.business': 'व्यापार',
    'nav.assistance': 'सहायता',

    // Navigation items
    'nav.dashboard': 'डैशबोर्ड',
    'nav.farms': 'खेत प्रबंधन',
    'nav.soil': 'मिट्टी विश्लेषण',
    'nav.crop': 'फसल अनुशंसा',
    'nav.yield': 'उपज पूर्वानुमान',
    'nav.irrigation': 'सिंचाई',
    'nav.weather': 'मौसम',
    'nav.disease': 'रोग पहचान',
    'nav.fertilizer': 'उर्वरक योजना',
    'nav.risk': 'जोखिम मूल्यांकन',
    'nav.market': 'बाजार भाव',
    'nav.profit': 'लाभ कैलकुलेटर',
    'nav.optimize': 'अनुकूलन',
    'nav.assistant': 'एआई सहायक',
    'nav.notifications': 'सूचनाएं',
    'nav.reports': 'रिपोर्ट्स',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.settings': 'सेटिंग्स',
    'nav.logout': 'लॉग आउट',
    'nav.menu': 'मेनू',

    // Settings Page
    'settings.title': 'सेटिंग्स',
    'settings.subtitle': 'अपनी प्रोफ़ाइल, प्राथमिकताएं और खाता प्रबंधित करें।',
    'settings.profile': 'प्रोफ़ाइल',
    'settings.profileDesc': 'आपके खाते का विवरण।',
    'settings.active': 'सक्रिय',
    'settings.email': 'ईमेल',
    'settings.phone': 'फ़ोन',
    'settings.location': 'स्थान',
    'settings.preferences': 'प्राथमिकताएं',
    'settings.prefDesc': 'भाषा और इंटरफ़ेस सेटिंग्स।',
    'settings.language': 'भाषा (Language)',
    'settings.languageDesc': 'अपनी पसंदीदा भाषा चुनें। यह तुरंत लागू होगी।',
    'settings.theme': 'थीम',
    'settings.themeDesc': 'लाइट, डार्क या सिस्टम मोड के बीच स्विच करें।',
    'settings.themeLight': 'लाइट (Light)',
    'settings.themeDark': 'डार्क (Dark)',
    'settings.themeSystem': 'सिस्टम (System)',
    'settings.selectTheme': 'थीम चुनें',
    'settings.notifications': 'सूचनाएं',
    'settings.notifyDesc': 'चुनें कि आपको कौन सी सूचनाएं प्राप्त हों।',
    'settings.enableNotifications': 'सूचनाएं सक्षम करें',
    'settings.enableNotificationsDesc': 'मौसम, रोग, जोखिम और बाजार अलर्ट प्राप्त करें।',
    'settings.account': 'खाता',
    'settings.accountDesc': 'अपने AgriAI खाते से लॉग आउट करें।',
    'settings.logout': 'लॉग आउट',
    'settings.savedBanner': 'सेटिंग्स सफलतापूर्वक अपडेट की गईं',

    // Dashboard
    'dashboard.welcome': 'वापसी पर स्वागत है',
    'dashboard.welcomeDesc': 'आज आपके खेतों की स्थिति का पूरा विवरण।',
    'dashboard.emptyTitle': 'अभी तक कोई खेत नहीं है',
    'dashboard.emptyDesc': 'एआई-संचालित अंतर्दृष्टि प्राप्त करने के लिए अपना पहला खेत बनाएं।',
    'dashboard.createFirstFarm': 'अपना पहला खेत बनाएं',
    'dashboard.estYield': 'अनुमानित उपज',
    'dashboard.soilScore': 'मिट्टी स्कोर',
    'dashboard.waterNeed': 'पानी की आवश्यकता',
    'dashboard.healthy': 'स्वस्थ',
    'dashboard.recommendedToday': 'आज अनुशंसित',
    'dashboard.askAssistant': 'इस खेत के बारे में एआई सहायक से कुछ भी पूछें',
    'dashboard.smartIrrigation': 'स्मार्ट सिंचाई',
    'dashboard.quickActions': 'त्वरित कार्य',
    'dashboard.recentNotifications': 'हाल की सूचनाएं',
    'dashboard.viewAll': 'सभी देखें',

    // Quick Actions
    'action.soil': 'मिट्टी विश्लेषण',
    'action.soilDesc': 'मिट्टी के स्वास्थ्य और पोषक तत्वों का परीक्षण करें',
    'action.crop': 'फसल अनुशंसाएं',
    'action.cropDesc': 'एआई-संचालित सर्वोत्तम फसल सुझाव प्राप्त करें',
    'action.yield': 'उपज पूर्वानुमान',
    'action.yieldDesc': 'अपेक्षित फसल उपज का पूर्वानुमान लगाएं',
    'action.fertilizer': 'उर्वरक योजना',
    'action.fertilizerDesc': 'उर्वरक के संतुलित उपयोग का अनुकूलन करें',
    'action.weather': 'मौसम पूर्वानुमान',
    'action.weatherDesc': 'स्थानीय मौसम और बारिश के अलर्ट',
    'action.disease': 'रोग पहचान',
    'action.diseaseDesc': 'तस्वीर से फसल रोगों की पहचान करें',
    'action.market': 'बाजार भाव',
    'action.marketDesc': 'लाइव फसल मंडी मूल्य',
    'action.risk': 'जोखिम मूल्यांकन',
    'action.riskDesc': 'खेती के जोखिमों और समाधानों का मूल्यांकन करें',
  },
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANG_KEY) as Language | null
    if (saved === 'en' || saved === 'te' || saved === 'hi') return saved
    return 'en'
  })

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (newLang: Language) => {
    setLangState(newLang)
    localStorage.setItem(LANG_KEY, newLang)
  }

  const t = (key: string, fallback?: string): string => {
    const dict = translations[lang] || translations.en
    if (dict && dict[key]) return dict[key]
    const enDict = translations.en
    if (enDict && enDict[key]) return enDict[key]
    return fallback || key
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
