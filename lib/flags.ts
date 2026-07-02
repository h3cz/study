/** Feature flags. Set to true to enable a feature. */
export const FLAGS = {
  // Teams/cohorts (study-group leaderboards) — hidden for now. Flip to true to
  // bring back the Teams tab, create/join flow, and invite-link auto-join on
  // /leaderboard.
  cohorts: false,
  leaderboard: true,
} as const;
