/** Local copies of media from Tilda (see public/assets). Videos stream from Publit.io. */

const img = (name: string) => `/assets/images/${name}`;

const publitioVideo = (file: string) =>
  `https://media.publit.io/file/Lifehacks/freelifehacks/${file}`;

// Hero image sources (dmitryvasin.com, block rec763916279):
// hero-badge  → tild3036-3331-4037-b461-343735353861/_11.png
// hero-portrait → tild6435-6136-4361-a462-343962356236/_2.png
// contact-photo → tild3361-3131-4162-b730-303738663962/_2-1.png

export const assets = {
  ogPhoto: img("og-photo.png"),
  favicon32: img("favicon-32x32.png"),
  favicon180: img("favicon-180.png"),
  heroBadge: img("hero-badge.png"),
  heroStar: img("hero-star.svg"),
  heroPortrait: img("hero-portrait.png"),
  heroArrow: img("hero-arrow.png"),
  courseMask: img("course-mask.png"),
  contactPhoto: img("contact-photo.png"),
  servicesGroup: img("services-group.png"),
  servicesChoreography: img("services-choreography.png"),
  lifehacks: {
    interaction: {
      image: img("lifehack-interaction.png"),
      video: publitioVideo(
        "Lifehack-Interaction-What-is-Cadencia-Nr-1-1-003-02-27-05-2024.mp4",
      ),
    },
    variability: {
      image: img("lifehack-variability.png"),
      video: publitioVideo(
        "Lifehack-Variability-Shoulder-and-foot-rotation-Nr-1-1-004-04-27-05-2024.mp4",
      ),
    },
    musicality: {
      image: img("lifehack-musicality.png"),
      video: publitioVideo(
        "Lifehack-Musicality-4beats-Nr-1-1-002-01-27-05-2024.mp4",
      ),
    },
    technique: {
      image: img("lifehack-technique.png"),
      video: publitioVideo(
        "Lifehack-Technique-Impulse-from-the-supporting-leg-Nr-1-1-001-03-27-05-2024.mp4",
      ),
    },
  },
  reviews: [
    img("review-1.png"),
    img("review-2.png"),
    img("review-3.png"),
    img("review-4.png"),
    img("review-5.png"),
  ],
  social: {
    instagram: img("social-instagram.png"),
    telegram: img("social-telegram.png"),
    vk: img("social-vk.png"),
    facebook: img("social-facebook.png"),
    youtube: img("social-youtube.png"),
    whatsapp: img("social-whatsapp.png"),
    email: img("social-email.png"),
  },
} as const;
