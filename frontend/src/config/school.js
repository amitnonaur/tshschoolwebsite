// Central school configuration — edit this single file to update school
// details, session information, contact data and admission status everywhere.

export const SCHOOL = {
  name: "The Study Home School",
  brand: "The Study Home",
  tagline: "Building Minds, Shaping Values.",
  promise: "Strong Academics. Confident English Communication. Digital Capability. Practical Intelligence.",
  session: "2027–28",
  sessionLabel: "Academic Session 2027–28",
  classes: ["Class 1", "Class 2", "Class 3", "Class 4", "Class 5"],
  city: "Arrah, Bhojpur, Bihar",
  address: "South Bhelai Road, Krishna Nagar, Zero Mile, Arrah, Bihar",
  phone: "+91 70116 15622",
  phoneHref: "tel:+917011615622",
  email: "thestudyhomeschool@gmail.com",
  emailHref: "mailto:thestudyhomeschool@gmail.com",
  // WhatsApp assumed to be the school phone number — change here if different.
  whatsappNumber: "917011615622",
  whatsappConfigured: true,
  // ONE SWITCH: change "planning" to "open" when admissions formally open.
  // The announcement bar and Admissions page wording update automatically.
  admissionStatus: "planning",
  announcement: "Planning for Academic Session 2027–28 | The Study Home School",
  plannedCapacity: "approximately 100 students",
  plannedPremises: "eight rooms plus a play area",
};

export const IMAGES = {
  heroClassroom: {
    src: "https://images.unsplash.com/photo-1719159381916-062fa9f435a6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwyfHxJbmRpYW4lMjBwcmltYXJ5JTIwc2Nob29sJTIwY2hpbGRyZW4lMjBjbGFzc3Jvb20lMjBsZWFybmluZ3xlbnwwfHx8fDE3OTM0NjI0NzJ8MA&ixlib=rb-4.1.0&q=85",
    alt: "Primary school children learning together in a bright classroom (illustrative photograph)",
  },
  studentsReading: {
    src: "https://images.unsplash.com/flagged/photo-1574097656146-0b43b7660cb6?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBwcmltYXJ5JTIwc2Nob29sJTIwY2hpbGRyZW4lMjBjbGFzc3Jvb20lMjBsZWFybmluZ3xlbnwwfHx8fDE3OTM0NjI0NzJ8MA&ixlib=rb-4.1.0&q=85",
    alt: "Young students reading books in a classroom (illustrative photograph)",
  },
  studentsUniform: {
    src: "https://images.unsplash.com/photo-1572847748080-bac263fae977?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzR8MHwxfHNlYXJjaHwzfHxJbmRpYW4lMjBwcmltYXJ5JTIwc2Nob29sJTIwY2hpbGRyZW4lMjBjbGFzc3Jvb20lMjBsZWFybmluZ3xlbnwwfHx8fDE3OTM0NjI0NzJ8MA&ixlib=rb-4.1.0&q=85",
    alt: "Primary school students engaged in a classroom activity (illustrative photograph)",
  },
  computerLab: {
    src: "https://images.unsplash.com/photo-1778489769184-45868633c527?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwxfHxJbmRpYW4lMjBzdHVkZW50cyUyMGNvbXB1dGVyJTIwbGFiJTIwbGVhcm5pbmd8ZW58MHx8fHwxNzkzNDYyNDcyfDA&ixlib=rb-4.1.0&q=85",
    alt: "Children learning on computers in a school computer room (illustrative photograph)",
  },
  computerLabAlt: {
    src: "https://images.unsplash.com/photo-1719159381981-1327b22aff9b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA3MDR8MHwxfHNlYXJjaHwzfHxJbmRpYW4lMjBzdHVkZW50cyUyMGNvbXB1dGVyJTIwbGFiJTIwbGVhcm5pbmd8ZW58MHx8fHwxNzkzNDYyNDcyfDA&ixlib=rb-4.1.0&q=85",
    alt: "A student practising computer skills with guidance (illustrative photograph)",
  },
  sportsPlayground: {
    src: "https://images.unsplash.com/photo-1779418567660-6ebe9f68e315?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHw0fHxJbmRpYW4lMjBjaGlsZHJlbiUyMHNwb3J0cyUyMG91dGRvb3IlMjBwbGF5Z3JvdW5kJTIwYWN0aXZpdHl8ZW58MHx8fHwxNzkzNDYyNDcyfDA&ixlib=rb-4.1.0&q=85",
    alt: "Children playing an outdoor team game in a school ground (illustrative photograph)",
  },
  sportsActivity: {
    src: "https://images.unsplash.com/photo-1779418567644-9de0deb440c2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwzfHxJbmRpYW4lMjBjaGlsZHJlbiUyMHNwb3J0cyUyMG91dGRvb3IlMjBwbGF5Z3JvdW5kJTIwYWN0aXZpdHl8ZW58MHx8fHwxNzkzNDYyNDcyfDA&ixlib=rb-4.1.0&q=85",
    alt: "Primary-age children taking part in an outdoor physical activity (illustrative photograph)",
  },
};

export const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
