import api from "./api";

export interface FooterLink {
  id: string;
  title: string;
  url: string;
  order: number;
}

export interface FooterSection {
  id: string;
  title: string;
  links: FooterLink[];
}

export interface FooterContact {
  id: string;
  type: string;
  value: string;
  icon: string;
}

export interface FooterLegalLink {
  id: string;
  title: string;
  url: string;
}

export interface FooterData {
  sections: FooterSection[];
  contactInfo: FooterContact[];
  legalLinks: FooterLegalLink[];
}

export const footerService = {
  getFooterData: async (): Promise<FooterData> => {
    try {
      const response = await api.get("/footer");
      return response.data;
    } catch (error) {
      console.error("Erreur chargement footer:", error);
      // Données par défaut en cas d'erreur
      return {
        sections: [
          {
            id: "1",
            title: "L'organisation",
            links: [
              { id: "1", title: "Qui sommes-nous", url: "/about", order: 1 },
              { id: "2", title: "Notre équipe", url: "/team", order: 2 },
              { id: "3", title: "Nos valeurs", url: "/values", order: 3 },
              { id: "4", title: "Rapports annuels", url: "/reports", order: 4 },
            ],
          },
          {
            id: "2",
            title: "Nos actions",
            links: [
              { id: "5", title: "Nos projets", url: "/projects", order: 1 },
              { id: "6", title: "Faire un don", url: "/donate", order: 2 },
              { id: "7", title: "Devenir bénévole", url: "/volunteers", order: 3 },
              { id: "8", title: "Partenariats", url: "/partners", order: 4 },
            ],
          },
          {
            id: "3",
            title: "Ressources",
            links: [
              { id: "9", title: "Actualités", url: "/blog", order: 1 },
              { id: "10", title: "Contact", url: "/contact", order: 2 },
              { id: "11", title: "FAQ", url: "/faq", order: 3 },
              { id: "12", title: "Transparence", url: "/transparency", order: 4 },
            ],
          },
        ],
        contactInfo: [
          { id: "1", type: "address", value: "Carion, Madagascar", icon: "📍" },
          { id: "2", type: "phone", value: "+261 32 04 856 97", icon: "📞" },
          { id: "3", type: "email", value: "ymad.mg@gmail.com", icon: "✉️" },
          { id: "4", type: "badge", value: "Reconnue d'utilité publique", icon: "🏛️" },
        ],
        legalLinks: [
          { id: "1", title: "Politique de confidentialité", url: "/privacy" },
          { id: "2", title: "Conditions d'utilisation", url: "/terms" },
          { id: "3", title: "Cookies", url: "/cookies" },
        ],
      };
    }
  },
};

export default footerService;
