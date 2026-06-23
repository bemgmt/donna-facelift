export const APP_MODES = {
  INVESTOR: "investor",
  DRIVE: "drive"
} as const;

export type UserMode = typeof APP_MODES[keyof typeof APP_MODES];
