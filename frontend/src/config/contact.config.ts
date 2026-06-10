// frontend/src/config/contact.config.ts

export const CONTACT_INFO = {
  organization: {
    name: "Y-MaD",
    fullName: "Young for Madagascar Development",
    mission: "Plateforme web de gestion des offres d'emplois pour les jeunes malgaches",
    tagline: "Young for Madagascar Development"
  },
  address: {
    street: "Carion",
    city: "Antananarivo",
    country: "Madagascar",
    full: "Carion, Antananarivo, Madagascar"
  },
  phone: {
    primary: "+261 32 04 856 97",
    formatted: "+261320485697",
    raw: "261320485697"
  },
  email: {
    general: "ymad.mg@gmail.com",
    support: "ymad.mg@gmail.com",
    jobs: "ymad.mg@gmail.com"
  },
  hours: {
    schedule: "Lun-Ven: 8h-17h",
    mondayToFriday: "08:00 - 17:00",
    saturday: "Ferme",
    sunday: "Ferme"
  },
  legal: {
    copyright: `(c) ${new Date().getFullYear()} Y-MaD - Young for Madagascar Development`,
    allRightsReserved: "Tous droits reserves"
  }
};

export default CONTACT_INFO;