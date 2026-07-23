export interface PermissionRule {
  action: string;
  resource: string;
  // '' or absent = the whole resource; 'SELL'/'BUY' = the scoped subset.
  scope?: string | null;
}
