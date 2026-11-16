export const INSTRUMENTS = ["violin", "piano", "drums"] as const;
export type Instrument = (typeof INSTRUMENTS)[number];

export const ROLES = ["student", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
export type Weekday = (typeof WEEKDAYS)[number];

/** All class times are stored and shown in India Standard Time (UTC+5:30, no DST). */
export const IST_OFFSET_MINUTES = 330;
