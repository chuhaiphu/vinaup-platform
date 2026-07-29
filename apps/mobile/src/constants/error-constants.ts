// Unknown codes fall back to `_FALLBACK_`. The first block is synthesized by fetchwire itself,
// never by our backend — see the errorCode table in the fetchwire README.
export const ERROR_MESSAGES_MAP_VN: Record<string, string> = {
  _FALLBACK_: 'Đã xảy ra lỗi, vui lòng thử lại sau.',
  // No HTTP exchange happened at all: DNS, TLS, refused, timeout, abort.
  NETWORK_ERROR: 'Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng.',
  // The exchange completed but the payload is unusable — same user-facing advice: retry.
  EMPTY_BODY: 'Máy chủ phản hồi thiếu dữ liệu. Vui lòng kiểm tra kết nối và thử lại.',
  INVALID_JSON: 'Máy chủ phản hồi thiếu dữ liệu. Vui lòng kiểm tra kết nối và thử lại.',
  EMPTY_RESPONSE: 'Máy chủ phản hồi thiếu dữ liệu. Vui lòng kiểm tra kết nối và thử lại.',

  // ─── Auth ────────────────────────────────────────────────────────────────
  TOKEN_INVALID: 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.',
  AUTH_INVALID_CREDENTIALS: 'Email hoặc mật khẩu không chính xác.',
  AUTH_PROVIDER_NOT_FOUND: 'Tài khoản không hỗ trợ cách đăng nhập này.',
  AUTH_ACCOUNT_EXISTED: 'Email này đã được đăng ký. Vui lòng dùng email khác hoặc đăng nhập.',

  // ─── User ────────────────────────────────────────────────────────────────
  USER_NOT_FOUND: 'Không tìm thấy tài khoản.',

  // ─── Organization ────────────────────────────────────────────────────────
  ORGANIZATION_NOT_FOUND: 'Không tìm thấy tổ chức.',
  ORGANIZATION_MEMBER_NOT_FOUND: 'Không tìm thấy thành viên trong tổ chức.',
  ORGANIZATION_CUSTOMER_NOT_FOUND: 'Không tìm thấy khách hàng của tổ chức.',
  ORGANIZATION_ROLE_NOT_FOUND: 'Không tìm thấy vai trò trong tổ chức.',
  ORGANIZATION_NOT_MEMBER: 'Bạn không phải thành viên của tổ chức này.',
  ORGANIZATION_MEMBER_LOCKED: 'Tài khoản của bạn đang bị khoá trong tổ chức này.',
  ORGANIZATION_PERMISSION_DENIED: 'Bạn không có quyền thực hiện thao tác này.',
  ORGANIZATION_MEMBER_ALREADY_LINKED: 'Thành viên này đã được liên kết với một tài khoản khác.',
  ORGANIZATION_MEMBER_DELETE_FORBIDDEN: 'Không thể xoá thành viên thuộc tổ chức khác.',

  // ─── Car ─────────────────────────────────────────────────────────────────
  CAR_NOT_FOUND: 'Không tìm thấy xe.',
  CAR_MAINTENANCE_LOG_NOT_FOUND: 'Không tìm thấy nhật ký bảo dưỡng.',
  CAR_ASSIGNMENT_MEMBER_NOT_FOUND: 'Thành viên được ghép không thuộc tổ chức của xe.',

  // ─── Trip ────────────────────────────────────────────────────────────────
  TRIP_NOT_FOUND: 'Không tìm thấy chuyến.',
  TRIP_ASSIGNMENT_NOT_FOUND: 'Không tìm thấy lượt phân công trong chuyến.',
  TRIP_ASSIGNMENT_CAR_NOT_FOUND: 'Xe không thuộc tổ chức của chuyến.',
  TRIP_ASSIGNMENT_MEMBER_NOT_FOUND: 'Thành viên không thuộc tổ chức của chuyến.',
  TRIP_ASSIGNMENT_CAR_ALREADY_IN_TRIP: 'Không thể phân công lại xe trong cùng một chuyến.',

  // ─── Project ─────────────────────────────────────────────────────────────
  PROJECT_NOT_FOUND: 'Không tìm thấy dự án.',
  PROJECT_CATEGORY_NOT_FOUND: 'Không tìm thấy phân loại dự án.',

  // ─── Booking ─────────────────────────────────────────────────────────────
  BOOKING_NOT_FOUND: 'Không tìm thấy Booking.',
  BOOKING_COMPLETED_IMMUTABLE: 'Booking đã hoàn thành, không thể thay đổi.',

  // ─── Invoice ─────────────────────────────────────────────────────────────
  INVOICE_NOT_FOUND: 'Không tìm thấy hoá đơn.',
  INVOICE_TYPE_NOT_FOUND: 'Không tìm thấy loại hoá đơn.',

  // ─── Wage ────────────────────────────────────────────────────────────────
  WAGE_NOT_FOUND: 'Không tìm thấy bảng tiền công.',

  // ─── Receipt-Payment ─────────────────────────────────────────────────────
  RECEIPT_PAYMENT_NOT_FOUND: 'Không tìm thấy khoản thu/chi.',
  RECEIPT_PAYMENT_CATEGORY_NOT_FOUND: 'Không tìm thấy phân loại thu/chi.',
  RECEIPT_PAYMENT_CATEGORY_SYSTEM_READONLY: 'Phân loại hệ thống không thể sửa hoặc xoá.',
  RECEIPT_PAYMENT_TOUR_IMPLEMENTATION_ACCESS_DENIED:
    'Bạn không tham gia điều hành tour này nên không thể thao tác thu/chi.',

  // ─── Tour ────────────────────────────────────────────────────────────────
  TOUR_NOT_FOUND: 'Không tìm thấy tour.',
  TOUR_CALCULATION_NOT_FOUND: 'Không tìm thấy bảng tính giá.',
  TOUR_CALCULATION_CANCEL_LOG_NOT_FOUND: 'Không tìm thấy nhật ký huỷ tính giá.',
  TOUR_IMPLEMENTATION_NOT_FOUND: 'Không tìm thấy phần điều hành tour.',
  TOUR_IMPLEMENTATION_ACCESS_DENIED: 'Bạn không phụ trách điều hành tour này.',
  TOUR_IMPLEMENTATION_CANNOT_REMOVE_SELF: 'Bạn không thể tự xoá mình khỏi điều hành tour.',
  TOUR_IMPLEMENTATION_CANNOT_REMOVE_CREATOR: 'Không thể xoá người tạo khỏi điều hành tour.',
  TOUR_IMPLEMENTATION_ASSIGNED_USER_NOT_FOUND: 'Không tìm thấy người được mời vào điều hành tour.',
  TOUR_IMPLEMENTATION_ASSIGNMENT_NOT_FOUND: 'Không tìm thấy nhóm phân công của điều hành tour.',
  TOUR_SETTLEMENT_NOT_FOUND: 'Không tìm thấy bảng quyết toán.',
  TOUR_SETTLEMENT_CANCEL_LOG_NOT_FOUND: 'Không tìm thấy nhật ký huỷ quyết toán.',

  // ─── Signature ───────────────────────────────────────────────────────────
  SIGNATURE_NOT_FOUND: 'Không tìm thấy yêu cầu ký.',
  SIGNATURE_ALREADY_SIGNED: 'Tài liệu đã được ký rồi.',
  SIGNATURE_NOT_AUTHORIZED: 'Bạn không có quyền ký hoặc chỉnh sửa chữ ký này.',
  SIGNATURE_RECEIVER_BEFORE_SENDER: 'Bên nhận không thể ký trước bên gửi.',
  SIGNATURE_RECEIVER_INCLUDES_SENDER: 'Danh sách bên nhận không được bao gồm bên gửi.',
  SIGNATURE_UNSUPPORTED_DOCUMENT_TYPE: 'Loại tài liệu này chưa hỗ trợ ký.',
  SIGNATURE_BOOKING_COMPLETED_IMMUTABLE: 'Booking đã hoàn thành, không thể huỷ ký.',
  SIGNATURE_BOOKING_RECEIVER_ORG_MISSING: 'Booking chưa có bên nhận thuộc tổ chức để ký.',
  SIGNATURE_NOT_RECEIVING_ORG_MEMBER: 'Bạn không thuộc tổ chức bên nhận của tài liệu này.',

  // ─── Social-Link ─────────────────────────────────────────────────────────
  SOCIAL_LINK_NOT_FOUND: 'Không tìm thấy liên kết mạng xã hội.',
  SOCIAL_LINK_OWNER_REQUIRED: 'Liên kết mạng xã hội phải thuộc về một tài khoản hoặc tổ chức.',

  // ─── Fuel-Price ──────────────────────────────────────────────────────────
  FUEL_PRICE_FETCH_FAILED: 'Không lấy được giá nhiên liệu từ nguồn dữ liệu. Vui lòng thử lại sau.',

  // ─── Upload ──────────────────────────────────────────────────────────────
  UPLOAD_FILE_REQUIRED: 'Vui lòng chọn tệp để tải lên.',
  UPLOAD_INVALID_FILE_TYPE: 'Định dạng tệp không được hỗ trợ.',
  UPLOAD_FILE_TOO_LARGE: 'Tệp tải lên vượt quá dung lượng cho phép.',
  UPLOAD_PATH_REQUIRED: 'Thiếu đường dẫn lưu tệp.',
  UPLOAD_FILE_NOT_FOUND: 'Không tìm thấy tệp tải lên.',

  // ─── Attendance ──────────────────────────────────────────────────────────
  ATTENDANCE_RECORD_NOT_FOUND: 'Không tìm thấy lượt chấm công.',
  ATTENDANCE_RECORD_NOT_OWNER: 'Bạn chỉ có thể thay đổi lượt chấm công của chính mình.',
  ATTENDANCE_HAS_OPEN_RECORD:
    'Bạn đang có một lượt chấm công chưa check out. Vui lòng check out trước.',
  ATTENDANCE_NO_OPEN_RECORD: 'Không có lượt chấm công nào đang mở để check out.',
  ATTENDANCE_DAY_LOCKED: 'Ngày công này đã được chốt nên không thể thay đổi.',
  ATTENDANCE_CONCLUSION_NOT_FOUND: 'Không tìm thấy bảng chốt công.',
  ATTENDANCE_CONCLUSION_ALREADY_EXISTS: 'Ngày công này đã có bảng chốt công.',
  ATTENDANCE_CONCLUSION_LOCKED: 'Bảng chốt công đã hoàn tất, cần mở lại trước khi thay đổi.',

  // ─── Document (signing lock) ─────────────────────────────────────────────
  DOCUMENT_LOCKED_AFTER_SIGN: 'Tài liệu đã có chữ ký nên không thể chỉnh sửa hoặc xoá.',

  // ─── System ──────────────────────────────────────────────────────────────
  INTERNAL_SERVER_ERROR: 'Hệ thống đang gặp sự cố, vui lòng thử lại sau.',
};
