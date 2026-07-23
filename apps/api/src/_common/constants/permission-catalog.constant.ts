import { PERMISSION_RESOURCE, PERMISSION_SCOPE } from '@vinaup-platform/permission';
import type { PermissionResource } from '@vinaup-platform/permission';

export interface PermissionCatalogDisplay {
  resource: PermissionResource;
  scope: string; // '' = the whole resource; 'SELL'/'BUY' = a scoped cell
  group: string;
  label: string;
}

// Display metadata for the role-matrix catalog — the ONLY place labels/grouping live.
// The client renders exactly what the catalog endpoint returns (zero permission knowledge).
export const PERMISSION_CATALOG_DISPLAY_LIST: PermissionCatalogDisplay[] = [
  { resource: PERMISSION_RESOURCE.ORGANIZATION_MEMBER, scope: '', group: 'Tổ chức', label: 'Thành viên' },
  { resource: PERMISSION_RESOURCE.ORGANIZATION_CUSTOMER, scope: '', group: 'Tổ chức', label: 'Khách hàng' },
  { resource: PERMISSION_RESOURCE.ORGANIZATION_ROLE, scope: '', group: 'Tổ chức', label: 'Vai trò' },
  { resource: PERMISSION_RESOURCE.PROJECT, scope: '', group: 'Tài chính', label: 'Dự án' },
  { resource: PERMISSION_RESOURCE.PROJECT_CATEGORY, scope: '', group: 'Tài chính', label: 'Danh mục dự án' },
  { resource: PERMISSION_RESOURCE.INVOICE, scope: PERMISSION_SCOPE.INVOICE.SELL, group: 'Tài chính', label: 'Hoá đơn bán hàng' },
  { resource: PERMISSION_RESOURCE.INVOICE, scope: PERMISSION_SCOPE.INVOICE.BUY, group: 'Tài chính', label: 'Hoá đơn mua hàng' },
  { resource: PERMISSION_RESOURCE.RECEIPT_PAYMENT, scope: '', group: 'Tài chính', label: 'Phiếu thu chi' },
  { resource: PERMISSION_RESOURCE.RECEIPT_PAYMENT_CATEGORY, scope: '', group: 'Tài chính', label: 'Danh mục thu chi' },
  { resource: PERMISSION_RESOURCE.TOUR, scope: '', group: 'Tour', label: 'Tour' },
  { resource: PERMISSION_RESOURCE.TOUR_CALCULATION, scope: '', group: 'Tour', label: 'Tính giá tour' },
  { resource: PERMISSION_RESOURCE.TOUR_IMPLEMENTATION, scope: '', group: 'Tour', label: 'Thực hiện tour' },
  { resource: PERMISSION_RESOURCE.TOUR_SETTLEMENT, scope: '', group: 'Tour', label: 'Quyết toán tour' },
  { resource: PERMISSION_RESOURCE.BOOKING, scope: '', group: 'Vận hành', label: 'Booking' },
  { resource: PERMISSION_RESOURCE.TRIP, scope: '', group: 'Vận hành', label: 'Chuyến đi' },
  { resource: PERMISSION_RESOURCE.CAR, scope: '', group: 'Vận hành', label: 'Xe' },
  { resource: PERMISSION_RESOURCE.SOCIAL_LINK, scope: '', group: 'Vận hành', label: 'Liên kết mạng xã hội' },
  { resource: PERMISSION_RESOURCE.ATTENDANCE_RECORD, scope: '', group: 'Chấm công', label: 'Chấm công' },
  { resource: PERMISSION_RESOURCE.ATTENDANCE_CONCLUSION, scope: '', group: 'Chấm công', label: 'Kết luận chấm công' },
];
