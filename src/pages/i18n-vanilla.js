/**
 * i18n-vanilla.js
 * A simple, dependency-free internationalization library.
 */

const translations = {
    en: {
        "nav_home": "Home",
        "nav_login": "Login",
        "nav_signup": "Sign Up",
        "btn_submit": "Submit",
        "welcome": "Welcome Student",
        "signup_title": "Create an account",
        "signup_subtitle": "Join the ASTBA platform to follow your training.",
        "label_name": "Full Name",
        "placeholder_name": "Ex: John Doe",
        "label_email": "Email Address",
        "placeholder_email": "name@example.com",
        "label_role": "Role",
        "select_role": "Select your role",
        "role_student": "Student",
        "role_instructor": "Instructor",
        "role_admin": "Administrator",
        "label_password": "Password",
        "label_confirm_password": "Confirm Password",
        "btn_register": "Register",
        "login_link_text": "Already have an account?",
        "login_link_action": "Login",
        "footer_support": "Support",
        "footer_policies": "Policies",
        "footer_compliance": "Compliance"
    },
    fr: {
        "nav_home": "Accueil",
        "nav_login": "Connexion",
        "nav_signup": "Inscription",
        "btn_submit": "Valider",
        "welcome": "Bienvenue Élève",
        "signup_title": "Créer un compte",
        "signup_subtitle": "Rejoignez la plateforme ASTBA pour suivre votre formation.",
        "label_name": "Nom complet",
        "placeholder_name": "Ex: Jean Dupont",
        "label_email": "Adresse e-mail",
        "placeholder_email": "nom@exemple.com",
        "label_role": "Rôle",
        "select_role": "Sélectionnez votre rôle",
        "role_student": "Étudiant",
        "role_instructor": "Formateur",
        "role_admin": "Administrateur",
        "label_password": "Mot de passe",
        "label_confirm_password": "Confirmer le mot de passe",
        "btn_register": "S'inscrire",
        "login_link_text": "Déjà un compte ?",
        "login_link_action": "Se connecter",
        "footer_support": "Support",
        "footer_policies": "Politiques",
        "footer_compliance": "Conformité"
    },
    ar: {
        "nav_home": "الرئيسية",
        "nav_login": "تسجيل الدخول",
        "nav_signup": "تسجيل",
        "btn_submit": "إرسال",
        "welcome": "مرحباً بالطالب",
        "signup_title": "إنشاء حساب",
        "signup_subtitle": "انضم إلى منصة ASTBA لمتابعة تدريبك.",
        "label_name": "الاسم الكامل",
        "placeholder_name": "مثال: أحمد محمد",
        "label_email": "البريد الإلكتروني",
        "placeholder_email": "name@example.com",
        "label_role": "الدور",
        "select_role": "اختر دورك",
        "role_student": "طالب",
        "role_instructor": "مدرب",
        "role_admin": "مسؤول",
        "label_password": "كلمة المرور",
        "label_confirm_password": "تأكيد كلمة المرور",
        "btn_register": "تسجيل",
        "login_link_text": "هل لديك حساب بالفعل؟",
        "login_link_action": "تسجيل الدخول",
        "footer_support": "الدعم",
        "footer_policies": "السياسات",
        "footer_compliance": "الامتثال"
    }
};

function changeLanguage(lang) {
    // 1. Validate language
    if (!translations[lang]) {
        console.warn(`Language '${lang}' not found, falling back to 'en'.`);
        lang = 'en';
    }

    // 2. Set Document Direction (RTL/LTR)
    if (lang === 'ar') {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
    } else {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', lang);
    }

    // 3. Update Text Content
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(element => {
        const key = element.getAttribute('data-i18n');

        // Handle nested keys if needed, but for now simple keys
        const text = translations[lang][key];

        if (text) {
            // Check if input/placeholder or regular text
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                if (element.hasAttribute('placeholder')) {
                    element.setAttribute('placeholder', text);
                }
            } else {
                element.textContent = text;
            }
        }
    });

    // 4. Update Select Options specifically if they use data-i18n
    // (The generic selector above handles options if they have the attribute, 
    // but sometimes options are dynamic. Here we assume static options have data-i18n)

    // 5. Save Preference
    localStorage.setItem('i18n_lang', lang);

    console.log(`Language changed to: ${lang}`);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('i18n_lang') || 'en';
    changeLanguage(savedLang);
});
