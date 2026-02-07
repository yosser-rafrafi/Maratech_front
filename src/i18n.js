// Internationalization configuration
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    fr: {
        translation: {
            "sidebar": {
                "principal": "Principal",
                "personnel": "Personnel",
                "dashboard": "Tableau de bord",
                "calendar": "Calendrier Global",
                "profile": "Mon Profil",
                "logout": "Déconnexion",
                "admin": "Administrateur",
                "formateur": "Formateur",
                "responsable": "Responsable",
                "student": "Élève"
            },
            "common": {
                "loading": "Chargement...",
                "back": "Retour",
                "save": "Enregistrer",
                "cancel": "Annuler",
                "edit": "Modifier",
                "delete": "Supprimer",
                "approve": "Approuver",
                "reject": "Rejeter",
                "suspend": "Suspendre",
                "reactivate": "Réactiver",
                "search": "Rechercher...",
                "actions": "Actions",
                "status": "Statut",
                "role": "Rôle",
                "name": "Nom",
                "email": "Email",
                "password": "Mot de passe",
                "description": "Description",
                "title": "Titre",
                "date": "Date",
                "time": "Heure",
                "save_all": "Enregistrer tout",
                "user": "Utilisateur",
                "all_statuses": "Tous les statuts",
                "all_roles": "Tous les rôles",
                "new": "Nouveau",
                "enroll": "S'inscrire",
                "saving": "Enregistrement..."
            },
            "dashboards": {
                "admin_title": "Espace Administratif",
                "resp_title": "Espace Responsable",
                "form_title": "Espace Formateur",
                "part_title": "Espace Apprenant",
                "overview": "Vue d'ensemble",
                "formations": "Formations",
                "users": "Utilisateurs",
                "eleves": "Élèves",
                "certifications": "Certifications",
                "users_management": "Gestion des Utilisateurs",
                "stats": {
                    "total_users": "Utilisateurs Totaux",
                    "pending_users": "En Attente",
                    "active_formations": "Formations Actives",
                    "certificates": "Certificats",
                    "attended_sessions": "Sessions Suivies",
                    "missed_sessions": "Séances Manquées",
                    "success_rate": "Taux de Réussite",
                    "students_followed": "Élèves Suivis",
                    "total_hours": "Heures Totales"
                }
            },
            "auth": {
                "login_title": "Connexion à ASTBA",
                "signup_title": "Créer un compte",
                "signup_welcome": "Rejoignez la plateforme ASTBA pour suivre votre formation.",
                "email_placeholder": "votre@email.com",
                "password_placeholder": "••••••••",
                "name_placeholder": "Ex: Jean Dupont",
                "confirm_password": "Confirmer le mot de passe",
                "role_select": "Sélectionnez votre rôle",
                "remember_me": "Se souvenir de moi",
                "forgot_password": "Mot de passe oublié ?",
                "no_account": "Pas encore de compte ?",
                "has_account": "Déjà inscrit ?",
                "register": "S'inscrire",
                "login_btn": "Se connecter",
                "hello": "Bonjour !",
                "login_welcome": "Bienvenue sur le portail ASTBA.",
                "password_mismatch": "Les mots de passe ne correspondent pas",
                "roles": {
                    "formateur": "Formateur",
                    "responsable": "Responsable de formation (Entreprise)",
                    "admin": "Membre administratif"
                }
            },
            "attendance": {
                "title": "Gestion des Présences",
                "present": "Présent",
                "absent": "Absent",
                "late": "Retard",
                "total_validated": "Total validé",
                "search_student": "Rechercher un élève...",
                "save_success": "Présences enregistrées avec succès",
                "save_error": "Erreur lors de l'enregistrement",
                "not_found": "Séance introuvable",
                "error_loading": "Erreur lors du chargement des données"
            }
        }
    },
    en: {
        translation: {
            "sidebar": {
                "principal": "Main",
                "personnel": "Personnel",
                "dashboard": "Dashboard",
                "calendar": "Global Calendar",
                "profile": "My Profile",
                "logout": "Logout",
                "admin": "Administrator",
                "formateur": "Trainer",
                "responsable": "Manager",
                "student": "Student"
            },
            "common": {
                "loading": "Loading...",
                "back": "Back",
                "save": "Save",
                "cancel": "Cancel",
                "edit": "Edit",
                "delete": "Delete",
                "approve": "Approve",
                "reject": "Reject",
                "suspend": "Suspend",
                "reactivate": "Reactivate",
                "search": "Search...",
                "actions": "Actions",
                "status": "Status",
                "role": "Role",
                "name": "Name",
                "email": "Email",
                "password": "Password",
                "description": "Description",
                "title": "Title",
                "date": "Date",
                "time": "Time",
                "save_all": "Save All",
                "user": "User",
                "all_statuses": "All Statuses",
                "all_roles": "All Roles",
                "new": "New",
                "enroll": "Enroll",
                "saving": "Saving..."
            },
            "dashboards": {
                "admin_title": "Admin Space",
                "resp_title": "Manager Space",
                "form_title": "Trainer Space",
                "part_title": "Student Space",
                "overview": "Overview",
                "formations": "Courses",
                "users": "Users",
                "eleves": "Students",
                "certifications": "Certifications",
                "users_management": "User Management",
                "stats": {
                    "total_users": "Total Users",
                    "pending_users": "Pending",
                    "active_formations": "Active Courses",
                    "certificates": "Certificates",
                    "attended_sessions": "Attended Sessions",
                    "missed_sessions": "Missed Sessions",
                    "success_rate": "Success Rate",
                    "students_followed": "Students Followed",
                    "total_hours": "Total Hours"
                }
            },
            "auth": {
                "login_title": "Sign in to ASTBA",
                "signup_title": "Create an account",
                "signup_welcome": "Join the ASTBA platform to follow your training.",
                "email_placeholder": "your@email.com",
                "password_placeholder": "••••••••",
                "name_placeholder": "Ex: John Doe",
                "confirm_password": "Confirm password",
                "role_select": "Select your role",
                "remember_me": "Remember me",
                "forgot_password": "Forgot password?",
                "no_account": "Don't have an account?",
                "has_account": "Already registered?",
                "register": "Register",
                "login_btn": "Sign in",
                "hello": "Hello !",
                "login_welcome": "Welcome back to the ASTBA Portal.",
                "password_mismatch": "Passwords do not match",
                "roles": {
                    "formateur": "Trainer",
                    "responsable": "Training Manager (Company)",
                    "admin": "Administrative Member"
                }
            },
            "attendance": {
                "title": "Attendance Management",
                "present": "Present",
                "absent": "Absent",
                "late": "Late",
                "total_validated": "Total validated",
                "search_student": "Search student...",
                "save_success": "Attendance saved successfully",
                "save_error": "Error during saving",
                "not_found": "Session not found",
                "error_loading": "Error loading data"
            }
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
