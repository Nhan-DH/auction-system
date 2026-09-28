# Prompt Tạo UI/UX — Hệ Thống Đấu Giá Trực Tuyến

> Copy toàn bộ nội dung bên dưới để gửi cho công cụ thiết kế UI/UX (Stitch, v0, Figma AI, v.v.)

---

## PROMPT

Thiết kế giao diện UI/UX **hoàn chỉnh** cho một **Hệ Thống Đấu Giá Trực Tuyến (Online Auction System)** theo phong cách **modern, premium, dark mode** với các yêu cầu chi tiết sau:

---

### 🎨 PHONG CÁCH THIẾT KẾ

- **Theme**: Dark mode làm chủ đạo, có thể toggle sang light mode
- **Color palette**: 
  - Primary: Gradient tím-xanh dương (Purple `#7C3AED` → Blue `#3B82F6`)
  - Accent: Vàng gold `#F59E0B` (cho giá tiền, highlight chiến thắng)
  - Success: Emerald `#10B981`
  - Danger/Warning: Rose `#F43F5E` 
  - Background: Slate `#0F172A` (dark), Surface: `#1E293B`
- **Typography**: Font Inter hoặc Plus Jakarta Sans, clean và dễ đọc
- **Border radius**: 12px–16px, bo tròn mềm mại
- **Effects**: Glassmorphism cho cards, subtle glow effects cho các phần tử quan trọng, micro-animations cho hover/click
- **Icons**: Lucide icons hoặc Phosphor icons
- **Layout**: Responsive — Desktop first, hỗ trợ tablet và mobile

---

### 📄 CÁC TRANG CẦN THIẾT KẾ (7 trang)

#### 1. Trang Đăng Nhập (`/login`)
- Form đăng nhập gồm: username, password
- Nút "Đăng nhập" với gradient primary
- Link "Chưa có tài khoản? Đăng ký ngay" 
- Background: hiệu ứng gradient blur hoặc animated particles
- Logo hệ thống ở trên cùng
- Validation inline (hiển thị lỗi ngay dưới input)

#### 2. Trang Đăng Ký (`/register`)
- Form gồm: username, password, xác nhận password, display name, email
- Nút "Đăng ký" 
- Link quay lại trang đăng nhập
- Password strength indicator (thanh hiển thị độ mạnh mật khẩu)
- Cùng style background với trang login

#### 3. Trang Danh Sách Phòng Đấu Giá (`/rooms`)
- **Navbar** trên cùng gồm: Logo, tên người dùng đang đăng nhập, nút đăng xuất, avatar
- **Nút "Tạo Phòng Mới"** nổi bật (primary gradient)
- **Danh sách phòng** dạng grid cards (3 cột desktop, 2 cột tablet, 1 cột mobile), mỗi card gồm:
  - Tên phòng (tiêu đề lớn)
  - Mô tả ngắn
  - Chủ phòng (owner)
  - Trạng thái: badge "Đang hoạt động" (xanh) hoặc "Đã đóng" (xám)
  - Số thành viên đang online (icon người + số)
  - Số vật phẩm đang đấu giá
  - Nút "Tham Gia" 
- **Modal tạo phòng**: popup form gồm tên phòng, mô tả
- Thanh tìm kiếm phòng ở trên grid
- Empty state khi chưa có phòng nào

#### 4. Trang Phòng Đấu Giá — TRANG CHÍNH (`/room/:id`) ⭐
Đây là trang **quan trọng nhất**, chia làm 3 khu vực chính:

**Khu vực trái (Sidebar — 25% width):**
- Tên phòng + mô tả
- Danh sách thành viên online (avatar + tên, có indicator online/offline)
- Nút "Rời phòng"
- **Hàng đợi vật phẩm (Item Queue)**: Danh sách các vật phẩm chờ đấu giá, hiển thị theo thứ tự, item đang đấu giá được highlight
- Nút "Thêm vật phẩm" (chỉ hiện cho chủ phòng)

**Khu vực giữa (Main — 50% width):**
- **Vật phẩm đang đấu giá** (item hiện tại):
  - Hình ảnh vật phẩm lớn (placeholder nếu không có ảnh)
  - Tên vật phẩm (font lớn, bold)
  - Mô tả chi tiết
  - Người bán
  - Giá khởi điểm
  - **Giá hiện tại** (font rất lớn, màu vàng gold, có animation khi giá thay đổi — pulse/glow effect)
  - **Người dẫn đầu** (tên + avatar người đang thắng)
  - **Giá mua ngay** (Buy Now Price) — nếu có
- **Đồng hồ đếm ngược (Countdown Timer)**:
  - Hiển thị dạng vòng tròn (circular progress) hoặc thanh ngang
  - Hiển thị phút:giây (MM:SS)
  - Khi còn ≤30 giây: chuyển sang màu đỏ, animation nhấp nháy/pulse
  - Khi timer reset (có bid mới trong 30s cuối): hiệu ứng flash + text "⏰ Timer Reset!"
- **Trạng thái phiên đấu giá**: 
  - "Chờ bắt đầu" (xám)
  - "Đang diễn ra" (xanh lá, animated dot)
  - "Đã kết thúc" (đỏ)
- Khi chưa có phiên đấu giá: hiển thị empty state "Chờ chủ phòng bắt đầu đấu giá"
- Khi kết thúc: hiển thị kết quả (người thắng, giá cuối) với confetti animation

**Khu vực phải (Panel — 25% width):**
- **Panel đặt giá (Bid Panel)**:
  - Input nhập số tiền (có format tiền VNĐ, ví dụ: 1.500.000)
  - Hiển thị "Giá tối thiểu: xxx" (= giá hiện tại + 10.000)
  - Nút "ĐẶT GIÁ" lớn, gradient, có hover effect
  - Nút "MUA NGAY" (màu vàng gold, chỉ hiện khi item có buy_now_price)
  - Quick bid buttons: +10.000, +50.000, +100.000 (tăng nhanh so với giá hiện tại)
- **Lịch sử đặt giá (Bid History)**:
  - Danh sách cuộn (scroll) hiển thị: thời gian, tên người đặt, số tiền
  - Bid mới nhất ở trên cùng, có animation slide-in
  - Highlight bid của chính mình (màu khác)
  - Badge "Mua ngay" cho bid mua trực tiếp
- **Nút "Bắt đầu đấu giá"** (chỉ hiện cho chủ phòng, nút lớn màu xanh lá)

**Notifications/Toasts:**
- Toast popup góc trên phải khi:
  - Có người vào/rời phòng
  - Có bid mới
  - Cảnh báo sắp hết giờ (30s)
  - Đấu giá kết thúc
  - Mua ngay thành công
- Toast có icon, màu sắc theo loại (info/success/warning), auto-dismiss sau 5s

#### 5. Modal Thêm Vật Phẩm
- Form popup (modal overlay) gồm:
  - Tên vật phẩm (bắt buộc)
  - Mô tả (textarea)
  - Hình ảnh (upload hoặc URL)
  - Giá khởi điểm (bắt buộc, format tiền VNĐ)
  - Giá mua ngay (tùy chọn)
  - Thời gian đấu giá: dropdown chọn (3 phút, 5 phút, 10 phút, 15 phút)
- Preview card vật phẩm bên phải form (xem trước trước khi submit)
- Nút "Thêm vào hàng đợi" và "Hủy"

#### 6. Trang Tìm Kiếm Vật Phẩm (`/search`)
- Thanh tìm kiếm lớn ở trên cùng (giống Google)
- Bộ lọc:
  - Từ khóa (keyword)
  - Khoảng thời gian (date range picker: từ ngày — đến ngày)
  - Trạng thái: tất cả / đang đấu giá / đã bán / chưa bán
- Kết quả hiển thị dạng bảng (table) hoặc grid cards:
  - Tên vật phẩm
  - Phòng đấu giá
  - Giá khởi điểm / Giá bán (nếu đã bán)
  - Trạng thái (badge màu)
  - Người bán / Người mua
  - Thời gian
- Pagination hoặc infinite scroll
- Empty state: "Không tìm thấy vật phẩm nào"

#### 7. Trang Thống Kê Cá Nhân (`/stats`)
- **Cards tổng quan** (4 cards hàng ngang):
  - Tổng phiên đấu giá đã tham gia
  - Tổng lần thắng
  - Tổng chi tiêu (format tiền VNĐ)
  - Tỷ lệ thắng (%)
- **Biểu đồ**:
  - Bar chart: Thống kê thắng/thua theo tháng
  - Line chart: Tổng chi tiêu theo thời gian
  - Pie chart: Phân bổ theo phòng đấu giá
- **Bảng lịch sử hoạt động** (Activity Log):
  - Cột: Thời gian, Hành động (đăng nhập, đặt giá, thắng, tạo phòng...), Chi tiết
  - Có filter theo loại hành động
  - Pagination
- Có thể export dữ liệu (nút Export CSV)

---

### 🧩 COMPONENTS CHUNG

1. **Navbar**: Logo bên trái, navigation links (Phòng, Tìm kiếm, Thống kê) ở giữa, user avatar + dropdown (Profile, Đăng xuất) bên phải
2. **Sidebar**: Collapsible trên mobile
3. **Toast Notifications**: Góc trên phải, stack multiple toasts, auto-dismiss
4. **Loading States**: Skeleton loading cho cards và tables
5. **Empty States**: Illustration + text mô tả khi không có dữ liệu
6. **Confirmation Dialogs**: Modal xác nhận cho các hành động quan trọng (rời phòng, xóa vật phẩm, mua ngay)
7. **Badges**: Cho trạng thái (Active, Closed, Sold, Pending) với màu tương ứng
8. **Currency Input**: Input có format tự động (1000000 → 1.000.000 VNĐ)

---

### 🔔 MICRO-INTERACTIONS & ANIMATIONS

- **Bid mới**: Giá hiện tại pulse/glow khi cập nhật
- **Timer warning**: Đồng hồ nhấp nháy đỏ khi ≤30s
- **Timer reset**: Flash effect + icon ⏰ khi timer reset về 30s
- **Đấu giá kết thúc**: Confetti animation + modal hiển thị kết quả
- **User join/leave**: Subtle slide animation trong danh sách thành viên
- **Card hover**: Scale up nhẹ (1.02) + shadow tăng
- **Button click**: Ripple effect
- **Page transitions**: Fade/slide transitions giữa các trang
- **Number counting**: Animate số tiền khi thay đổi (counting up effect)

---

### 📐 RESPONSIVE BREAKPOINTS

- **Desktop**: ≥1280px — Layout 3 cột cho trang đấu giá
- **Tablet**: 768px–1279px — Sidebar collapse thành drawer, main + panel 2 cột
- **Mobile**: <768px — Single column, bottom sheet cho bid panel, hamburger menu

---

### 🛠 TECH STACK (cho reference)

- Frontend: **React + Vite**
- Styling: **Vanilla CSS** (không dùng Tailwind)
- Icons: **Lucide React**
- Charts: **Recharts**
- Notifications: **React Hot Toast**
- Real-time: **WebSocket** (kết nối qua proxy đến C server)

---

Hãy thiết kế đầy đủ tất cả 7 trang trên với đầy đủ các trạng thái (empty, loading, active, error) và đảm bảo trải nghiệm người dùng mượt mà, trực quan. Ưu tiên trang Phòng Đấu Giá (`/room/:id`) vì đây là trang cốt lõi của hệ thống.
