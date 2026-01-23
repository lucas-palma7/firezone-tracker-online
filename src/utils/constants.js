/**
 * Application-wide constants
 * @module utils/constants
 */

/**
 * Local storage keys used throughout the application
 * @constant {Object}
 */
export const STORAGE_KEYS = {
    /** Key for storing user data in localStorage */
    USER: 'fz_user',

    /** Key for storing current room ID in localStorage */
    ROOM_ID: 'fz_current_room_id',

    /** Key for storing current room name in localStorage */
    ROOM_NAME: 'fz_current_room_name',

    /** Key for storing theme preference in localStorage */
    THEME: 'fz_theme',
};

/**
 * View modes for the room screen
 * @constant {Object}
 */
export const VIEW_MODES = {
    /** User's personal tab view */
    MY_TAB: 'minha',

    /** Ranking view showing all users */
    RANKING: 'ranking',
};

/**
 * Framer Motion animation variants for common animations
 * @constant {Object}
 */
export const ANIMATION_VARIANTS = {
    /** Fade in from bottom animation */
    fadeInUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95 },
    },

    /** Fade in animation */
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
};

/**
 * Spring animation configuration for Framer Motion
 * @constant {Object}
 */
export const SPRING_CONFIG = {
    type: "spring",
    stiffness: 300,
    damping: 30,
};
