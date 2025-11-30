// Lista delle principali città italiane per VolantinoFacile
// Formato: { name: "Nome Città", code: "xx-citta-cap" }

export const ITALIAN_CITIES = [
    // Lombardia
    { name: "Bergamo", code: "bg-bergamo-24121" },
    { name: "Brescia", code: "bs-brescia-25121" },
    { name: "Como", code: "co-como-22100" },
    { name: "Cremona", code: "cr-cremona-26100" },
    { name: "Lecco", code: "lc-lecco-23900" },
    { name: "Lodi", code: "lo-lodi-26900" },
    { name: "Mantova", code: "mn-mantova-46100" },
    { name: "Milano", code: "mi-milano-20121" },
    { name: "Monza", code: "mb-monza-20900" },
    { name: "Pavia", code: "pv-pavia-27100" },
    { name: "Sondrio", code: "so-sondrio-23100" },
    { name: "Varese", code: "va-varese-21100" },

    // Emilia-Romagna
    { name: "Bologna", code: "bo-bologna-40121" },
    { name: "Ferrara", code: "fe-ferrara-44121" },
    { name: "Forlì", code: "fc-forli-47121" },
    { name: "Cesena", code: "fc-cesena-47521" },
    { name: "Modena", code: "mo-modena-41121" },
    { name: "Parma", code: "pr-parma-43121" },
    { name: "Piacenza", code: "pc-piacenza-29121" },
    { name: "Ravenna", code: "ra-ravenna-48122" },
    { name: "Reggio Emilia", code: "re-reggio-emilia-42121" },
    { name: "Rimini", code: "rn-rimini-47921" },

    // Piemonte
    { name: "Alessandria", code: "al-alessandria-15121" },
    { name: "Asti", code: "at-asti-14100" },
    { name: "Biella", code: "bi-biella-13900" },
    { name: "Cuneo", code: "cn-cuneo-12100" },
    { name: "Novara", code: "no-novara-28100" },
    { name: "Torino", code: "to-torino-10121" },
    { name: "Verbania", code: "vb-verbania-28900" },
    { name: "Vercelli", code: "vc-vercelli-13100" },

    // Veneto
    { name: "Belluno", code: "bl-belluno-32100" },
    { name: "Padova", code: "pd-padova-35122" },
    { name: "Rovigo", code: "ro-rovigo-45100" },
    { name: "Treviso", code: "tv-treviso-31100" },
    { name: "Venezia", code: "ve-venezia-30122" },
    { name: "Verona", code: "vr-verona-37121" },
    { name: "Vicenza", code: "vi-vicenza-36100" },

    // Lazio
    { name: "Frosinone", code: "fr-frosinone-03100" },
    { name: "Latina", code: "lt-latina-04100" },
    { name: "Rieti", code: "ri-rieti-02100" },
    { name: "Roma", code: "rm-roma-00118" },
    { name: "Viterbo", code: "vt-viterbo-01100" },

    // Toscana
    { name: "Arezzo", code: "ar-arezzo-52100" },
    { name: "Firenze", code: "fi-firenze-50121" },
    { name: "Grosseto", code: "gr-grosseto-58100" },
    { name: "Livorno", code: "li-livorno-57122" },
    { name: "Lucca", code: "lu-lucca-55100" },
    { name: "Massa", code: "ms-massa-54100" },
    { name: "Pisa", code: "pi-pisa-56122" },
    { name: "Pistoia", code: "pt-pistoia-51100" },
    { name: "Prato", code: "po-prato-59100" },
    { name: "Siena", code: "si-siena-53100" },

    // Campania
    { name: "Avellino", code: "av-avellino-83100" },
    { name: "Benevento", code: "bn-benevento-82100" },
    { name: "Caserta", code: "ce-caserta-81100" },
    { name: "Napoli", code: "na-napoli-80121" },
    { name: "Salerno", code: "sa-salerno-84121" },

    // Sicilia
    { name: "Agrigento", code: "ag-agrigento-92100" },
    { name: "Caltanissetta", code: "cl-caltanissetta-93100" },
    { name: "Catania", code: "ct-catania-95121" },
    { name: "Enna", code: "en-enna-94100" },
    { name: "Messina", code: "me-messina-98122" },
    { name: "Palermo", code: "pa-palermo-90133" },
    { name: "Ragusa", code: "rg-ragusa-97100" },
    { name: "Siracusa", code: "sr-siracusa-96100" },
    { name: "Trapani", code: "tp-trapani-91100" },

    // Puglia
    { name: "Bari", code: "ba-bari-70121" },
    { name: "Barletta", code: "bt-barletta-76121" },
    { name: "Brindisi", code: "br-brindisi-72100" },
    { name: "Foggia", code: "fg-foggia-71121" },
    { name: "Lecce", code: "le-lecce-73100" },
    { name: "Taranto", code: "ta-taranto-74121" },

    // Altri
    { name: "Ancona", code: "an-ancona-60121" },
    { name: "Aosta", code: "ao-aosta-11100" },
    { name: "Bari", code: "ba-bari-70121" },
    { name: "Cagliari", code: "ca-cagliari-09121" },
    { name: "Campobasso", code: "cb-campobasso-86100" },
    { name: "Catanzaro", code: "cz-catanzaro-88100" },
    { name: "Genova", code: "ge-genova-16121" },
    { name: "L'Aquila", code: "aq-laquila-67100" },
    { name: "Perugia", code: "pg-perugia-06121" },
    { name: "Pescara", code: "pe-pescara-65122" },
    { name: "Potenza", code: "pz-potenza-85100" },
    { name: "Sassari", code: "ss-sassari-07100" },
    { name: "Teramo", code: "te-teramo-64100" },
    { name: "Trento", code: "tn-trento-38122" },
    { name: "Trieste", code: "ts-trieste-34121" },
    { name: "Udine", code: "ud-udine-33100" },
]
