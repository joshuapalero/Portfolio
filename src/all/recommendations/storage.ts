/**
 * Storage & Data Access Façade for Recommendations
 *
 * Delegates to the Multi-Tier `recommendationRepository`, which pulls data dynamically
 * from external sources (Remote API / Cloudflare Worker / `/data/recommendations.json`),
 * ensuring ZERO hardcoded recommendations in application code.
 */
export {
  BROADCAST_CHANNEL,
  getRecommendationsApiUrl,
  getSketchAvatarIndex,
  getCommentAvatarUri,
  getAvatarDataUri,
  SKETCH_AVATARS,
  getBleachAvatarMeta,
  BLEACH_AVATARS_META,
  recommendationRepository,
  loadRecommendations,
  addRecommendation,
  clearAllStoredRecommendations,
} from './repository';
