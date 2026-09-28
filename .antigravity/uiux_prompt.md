# Prompt Tạo UI/UX — Hệ Thống Đấu Giá Trực Tuyến

> Copy toàn bộ nội dung từ dòng "Thiết kế giao diện..." trở xuống để paste vào Stitch.

---

## PROMPT

Thiết kế giao diện UI/UX **hoàn chỉnh** cho một **Hệ Thống Đấu Giá Trực Tuyến (Online Auction System)** theo phong cách **modern, premium, dark mode**. Hệ thống phải đáp ứng **đầy đủ tất cả 12 chức năng** được liệt kê — **không được bỏ sót bất kỳ chức năng nào**.

---

### 📋 DANH SÁCH 12 CHỨC NĂNG BẮT BUỘC — MỖI CHỨC NĂNG PHẢI CÓ UI TƯƠNG ỨNG

| # | Chức năng | UI phải có |
|---|-----------|-----------|
| 1 | **Quản lý người dùng** — đăng ký, đăng nhập, đăng xuất | Trang Login, Register, Navbar (nút logout) |
| 2 | **Tạo phòng đấu giá** | Trang Room List + Modal tạo phòng |
| 3 | **Tham gia phòng** — mỗi người chỉ 1 phòng/lần. Phải rời phòng cũ trước khi join phòng mới | Badge "📍 Đang trong phòng [X]" trên navbar + confirm dialog khi join phòng khác |
| 4 | **Bán vật phẩm** — thông tin, giá khởi điểm, thời gian đấu giá, giá bán ngay | Modal thêm vật phẩm (đủ 4 field bắt buộc) |
| 5 | **Xem vật phẩm 3 trạng thái** — đã đấu giá, đang đấu giá, sẽ đấu giá — theo từng phòng | 3 tabs trong trang phòng: "Sắp đấu giá / Đang diễn ra / Đã kết thúc" |
| 6 | **Tìm kiếm** theo khung giờ hoặc thông tin vật phẩm → **cho phép join phòng** ngay từ kết quả | Trang Search: mỗi kết quả có nút "Tham gia phòng" |
| 7 | **Thống kê** phiên đấu giá đã tham gia + kết quả | Trang Stats: cards + biểu đồ + bảng lịch sử |
| 8 | **Quản lý hàng đợi** — sắp xếp thứ tự, vật phẩm lần lượt được **giới thiệu** trước khi đấu giá | Queue UI: drag reorder + item preview phase |
| 9 | **Đặt giá** — server kiểm tra >= giá hiện tại + 10.000đ, thông báo giá mới đến tất cả | Bid Panel: input + hiện giá tối thiểu + validation |
| 10 | **Cảnh báo 30s** khi sắp hết giờ + **Reset timer về 30s** khi có bid mới trong 30s cuối | Countdown Timer: đỏ nhấp nháy + flash reset animation |
| 11 | **Mua ngay (Buy Now)** — nếu có người mua với giá bán ngay, vật phẩm được bán mà KHÔNG qua đấu giá | Nút "⚡ MUA NGAY" nổi bật + confirm + kết thúc phiên ngay lập tức |
| 12 | **Chức năng nâng cao** — giao diện đồ họa đẹp, chat, upload hình, biểu đồ giá, xếp hạng | Chat panel, image upload, price chart, user badges |

---

### 🎨 PHONG CÁCH THIẾT KẾ

- **Theme**: Dark mode chủ đạo
- **Color palette**:
  - Primary: Gradient tím-xanh (`#7C3AED` → `#3B82F6`)
  - Accent/Tiền: Vàng gold `#F59E0B`
  - Success: `#10B981` | Danger: `#F43F5E`
  - Background: `#0F172A` | Surface: `#1E293B`
- **Typography**: Inter hoặc Plus Jakarta Sans
- **Border radius**: 12–16px
- **Effects**: Glassmorphism, glow cho giá tiền, micro-animations
- **Icons**: Lucide icons

---

### 📄 CÁC TRANG CẦN THIẾT KẾ (7 trang + 2 modal)

---

#### 1. Trang Đăng Nhập (`/login`) — Chức năng #1
- Form: username, password
- Nút "Đăng nhập" gradient primary
- Link "Chưa có tài khoản? Đăng ký ngay"
- Background: gradient blur hoặc animated particles
- Logo trên cùng
- Validation inline (lỗi ngay dưới input)

---

#### 2. Trang Đăng Ký (`/register`) — Chức năng #1
- Form: username, password, xác nhận password, tên hiển thị, email
- Password strength indicator
- Cùng style background với login

---

#### 3. Trang Danh Sách Phòng (`/rooms`) — Chức năng #2, #3

**Navbar** (hiện trên mọi trang sau login):
- Logo trái | Navigation: Phòng | Tìm Kiếm | Thống Kê | giữa
- Phải: avatar user + tên + dropdown (Đăng xuất)
- ⚡ **Badge phòng đang tham gia**: Nếu user đang ở 1 phòng → hiện chip "📍 Đang trong: [Tên phòng]" trên navbar — click để quay lại phòng

**Nội dung trang:**
- **Nút "➕ Tạo Phòng Mới"** nổi bật (primary gradient)
- **Thanh tìm kiếm phòng**
- **Grid cards** (3 cột desktop, 2 tablet, 1 mobile), mỗi card:
  - Tên phòng (heading lớn)
  - Mô tả (max 2 dòng, truncate)
  - Chủ phòng (owner)
  - Badge: "🟢 Đang hoạt động" hoặc "⚫ Đã đóng"
  - Số thành viên online (👤 + số)
  - Vật phẩm đang đấu giá (nếu có): tên + giá hiện tại
  - **Nút "Tham Gia"**
  - ⚠️ Nếu đang ở phòng khác → confirm: "Bạn đang ở phòng [X]. Rời phòng đó và tham gia phòng này?"
- Empty state: "Chưa có phòng nào. Tạo phòng đầu tiên!"

**Modal Tạo Phòng** — Chức năng #2:
- Tên phòng (bắt buộc) + Mô tả (textarea) + Nút "Tạo phòng" + "Hủy"

---

#### 4. Trang Phòng Đấu Giá — TRANG CHÍNH (`/room/:id`) ⭐ — Chức năng #3, #4, #5, #8, #9, #10, #11, #12

Chia **3 khu vực**:

##### 🔹 SIDEBAR TRÁI (25%) — Chức năng #3, #5, #8

**Thông tin phòng:**
- Tên phòng + mô tả + chủ phòng (👑)
- Nút "🚪 Rời phòng" (đỏ nhạt)

**Danh sách thành viên:**
- Avatar + tên + 🟢 online indicator
- Tổng: "5 thành viên online"

**3 TABS VẬT PHẨM — Chức năng #5** (⚠️ BẮT BUỘC đủ 3 tabs):

| Tab | Nội dung | Badge |
|-----|----------|-------|
| **Sắp đấu giá** | Hàng đợi items xếp thứ tự 1, 2, 3... | Số pending |
| **Đang diễn ra** | Item đang đấu giá hiện tại (1 item) | "🔴 LIVE" nhấp nháy |
| **Đã kết thúc** | Items đã xong: giá bán, người thắng, hoặc "Không ai mua" | Số lượng |

**Tab "Sắp đấu giá" — Quản lý hàng đợi — Chức năng #8:**
- Mỗi item: số thứ tự, tên, giá khởi điểm, thời gian đấu giá
- **Chủ phòng** có thể:
  - 🔃 Drag & drop sắp xếp lại thứ tự
  - 🗑️ Xóa item khỏi queue
  - ➕ Nút "Thêm vật phẩm" → mở modal
  - ▶️ Nút "Bắt đầu đấu giá item tiếp theo"
- **Người tham gia khác**: chỉ xem, không thao tác

**Chat Panel — Chức năng #12 (nâng cao):**
- Tab "💬 Chat" ở dưới sidebar
- Input nhắn tin + danh sách tin (tên, giờ, nội dung)
- Auto-scroll khi tin mới

##### 🔹 KHU VỰC GIỮA — MAIN (50%) — Chức năng #8, #9, #10, #11

**Khi chưa có phiên đấu giá:**
- Empty state: illustration + "Chờ chủ phòng bắt đầu đấu giá"

**Giai đoạn 1: GIỚI THIỆU VẬT PHẨM — Chức năng #8:**
> Khi chủ phòng bấm "Bắt đầu", hiển thị thông tin item TRƯỚC KHI timer chạy:
- Hình ảnh lớn + tên + mô tả chi tiết
- Giá khởi điểm, giá mua ngay, thời gian đấu giá
- Text: "🎤 Đang giới thiệu vật phẩm... Phiên đấu giá sắp bắt đầu"
- Sau vài giây → chuyển sang đấu giá

**Giai đoạn 2: ĐANG ĐẤU GIÁ (LIVE):**
- **Hình ảnh vật phẩm** lớn (hoặc placeholder)
- **Tên** (font lớn, bold) + **Mô tả** + **Người bán** (avatar + tên)
- **Giá khởi điểm**: nhỏ, xám
- **💰 GIÁ HIỆN TẠI** — font 32px+, vàng gold `#F59E0B`, **pulse/glow animation** khi thay đổi + counting-up effect
- **🏆 Người dẫn đầu**: avatar + tên (highlight nếu là chính mình)
- **Giá mua ngay**: hiển thị nếu item có buy_now_price

- **⏱️ COUNTDOWN TIMER — Chức năng #10:**
  - Dạng vòng tròn (circular progress) HOẶC thanh ngang lớn
  - Format: **MM:SS**
  - Bình thường: xanh dương/tím
  - **Khi ≤ 30s**: chuyển **đỏ + nhấp nháy** + text "⚠️ Sắp hết giờ!"
  - **Khi reset** (bid mới trong 30s cuối): **flash sáng** + "⏰ Timer reset về 30s!" + animation quay lại

- **Trạng thái**: "⏳ Chờ" (xám) | "🔴 LIVE" (xanh lá, dot nhấp nháy) | "✅ Kết thúc"

**Biểu đồ diễn biến giá — Chức năng #12 (nâng cao):**
- Line chart nhỏ: trục X = thời gian, trục Y = giá
- Realtime update khi có bid mới

**Khi đấu giá kết thúc:**
- 🎉 Confetti + banner kết quả
- Người thắng + Giá cuối + Tên item
- Không ai mua: "Không có người mua"
- Mua ngay: "⚡ [Tên] đã mua ngay với giá [xxx]đ!"

##### 🔹 PANEL PHẢI (25%) — Chức năng #9, #11

**Panel đặt giá — Chức năng #9:**
- **Input giá** (auto-format VNĐ: 1.500.000)
- **"💡 Giá tối thiểu: [giá hiện tại + 10.000]đ"** — hiển thị rõ
- **Quick bid**: nút +10.000 | +50.000 | +100.000
- **Nút "🔨 ĐẶT GIÁ"** lớn, gradient. Giá < tối thiểu → lỗi inline đỏ
- Khi không có phiên: panel disabled/greyed out

**Nút MUA NGAY — Chức năng #11:**
- **"⚡ MUA NGAY — [giá]đ"** — vàng gold, nổi bật, RIÊNG BIỆT
- Chỉ hiện khi item có giá bán ngay
- Click → confirm: "Mua ngay với giá [xxx]đ? Phiên đấu giá sẽ kết thúc ngay lập tức, vật phẩm được bán mà KHÔNG qua đấu giá."
- Sau mua: broadcast "⚡ [Tên] đã mua ngay!" → phiên kết thúc

**Lịch sử đặt giá (Bid History):**
- Scrollable, bid mới nhất trên cùng
- Mỗi dòng: HH:MM:SS | tên | số tiền VNĐ
- **Slide-in animation** cho bid mới
- **Highlight bid của mình** (background tím nhạt)
- Badge "⚡ Mua ngay" / "🏆 Thắng"

**Nút chủ phòng** (chỉ owner thấy):
- "▶️ Bắt đầu đấu giá item tiếp theo"

**Toast Notifications** (góc trên phải):
- 🟢 "[Tên] tham gia/rời phòng"
- 🔵 "[Tên] đặt giá [xxx]đ"
- 🟡 "⚠️ Còn 30 giây!"
- 🔴 "⏰ Timer reset về 30s!"
- 🎉 "Đấu giá kết thúc! [Tên] thắng [xxx]đ"
- ⚡ "[Tên] mua ngay [xxx]đ — phiên kết thúc!"
- Auto-dismiss 5s

---

#### 5. Modal Thêm Vật Phẩm — Chức năng #4

Form **đủ 4 thông tin bắt buộc**:

| Field | Bắt buộc | Ghi chú |
|-------|----------|---------|
| Tên vật phẩm | ✅ | Max 200 ký tự |
| Mô tả | ❌ | Textarea |
| Hình ảnh | ❌ | Upload hoặc URL, preview sau chọn |
| **Giá khởi điểm** | ✅ | Currency VNĐ, > 0 |
| **Giá bán ngay (Buy Now)** | ❌ | Phải > giá khởi điểm |
| **Thời gian đấu giá** | ✅ | Dropdown: 3 / 5 / 10 / 15 phút |

- **Preview card** bên phải form
- Nút "Thêm vào hàng đợi" + "Hủy"
- Validation inline

---

#### 6. Trang Tìm Kiếm (`/search`) — Chức năng #6

> ⚠️ BẮT BUỘC: Kết quả phải có nút **"Tham gia phòng"** để join trực tiếp

**Thanh tìm kiếm** lớn (style Google)

**Bộ lọc:**
- **Từ khóa** — tìm theo tên/mô tả vật phẩm
- **Khung giờ** (date-time range picker): Từ — Đến
- **Trạng thái**: Tất cả | Đang đấu giá | Đã bán | Chưa bán | Sắp đấu giá
- Nút "🔍 Tìm" + "Xóa bộ lọc"

**Kết quả** — bảng hoặc grid, mỗi item:
- Tên vật phẩm
- **Tên phòng đấu giá**
- Giá: khởi điểm / hiện tại / bán cuối (tùy trạng thái)
- Badge: 🟢 Đang đấu giá | 🟡 Sắp | 🔵 Đã bán | ⚫ Không bán được
- Nếu đang live → "🔴 LIVE" nhấp nháy
- Người bán / Người thắng
- **🚀 Nút "Tham gia phòng"** — join phòng chứa item. Đang ở phòng khác → confirm dialog

**Pagination** + Empty state

---

#### 7. Trang Thống Kê (`/stats`) — Chức năng #7

**4 Cards tổng quan** (glassmorphism):
- 🏷️ Tổng phiên tham gia | 🏆 Tổng lần thắng | 💰 Tổng chi tiêu VNĐ | 📊 Tỷ lệ thắng %

**Biểu đồ** (Recharts):
- Bar chart: Thắng vs Thua theo tháng
- Line chart: Chi tiêu theo thời gian
- Pie chart: Phân bổ theo phòng

**Bảng lịch sử:**
- Cột: Thời gian | Hành động | Chi tiết
- Filter + Pagination + Nút "📥 Export CSV"

---

### 🧩 COMPONENTS CHUNG

1. **Navbar**: Logo | Nav links | Badge phòng đang tham gia | User dropdown
2. **Sidebar**: Collapsible → drawer trên mobile
3. **Toast Notifications**: Stack, auto-dismiss 5s
4. **Loading**: Skeleton loading
5. **Empty States**: Illustration + text
6. **Confirm Dialogs**: Rời phòng, xóa item, mua ngay, join phòng khi đang ở phòng khác
7. **Badges**: Active/Closed/Sold/Pending/LIVE
8. **Currency Input**: Auto-format VNĐ
9. **Tab Component**: 3 tabs vật phẩm
10. **Chat Component**: Input + message list

---

### 🔔 ANIMATIONS

- Giá mới: pulse/glow vàng + counting-up
- Timer ≤ 30s: nhấp nháy đỏ
- Timer reset: flash + ⏰ + quay lại 30s
- Kết thúc: confetti 🎉
- Mua ngay: flash vàng gold
- Bid mới: slide-in trong history
- Card hover: scale 1.02 + shadow
- Queue drag-drop: smooth reorder
- LIVE badge: animated dot
- Chat: tin mới slide-in

---

### 📐 RESPONSIVE

- **Desktop** ≥1280px: 3 cột
- **Tablet** 768–1279px: Sidebar → drawer, 2 cột
- **Mobile** <768px: 1 cột, bid panel → bottom sheet

---

### 🛠 TECH STACK

- React + Vite | Vanilla CSS | Lucide React | Recharts | React Hot Toast | WebSocket

---

### ✅ CHECKLIST — UI PHẢI CÓ ĐẦY ĐỦ:

- [ ] Đăng ký / Đăng nhập / Đăng xuất
- [ ] Tạo phòng (modal)
- [ ] Danh sách phòng + nút Tham Gia
- [ ] **Badge navbar hiển thị phòng đang tham gia**
- [ ] **Confirm dialog khi join phòng mới mà đang ở phòng khác (1 phòng/lần)**
- [ ] Nút Rời phòng
- [ ] Modal thêm vật phẩm (đủ: tên, mô tả, hình, giá khởi điểm, giá mua ngay, thời gian)
- [ ] **3 tabs: Sắp đấu giá / Đang diễn ra / Đã kết thúc**
- [ ] **Hàng đợi: drag-drop sắp xếp + xóa (chủ phòng)**
- [ ] **Giới thiệu item trước khi đấu giá**
- [ ] Bid panel: input + giá tối thiểu >= hiện tại + 10.000đ + validation
- [ ] Quick bid (+10k, +50k, +100k)
- [ ] **Nút MUA NGAY — mua xong phiên kết thúc, KHÔNG qua đấu giá**
- [ ] Bid history realtime
- [ ] **Countdown timer: cảnh báo đỏ 30s + reset 30s animation**
- [ ] Kết quả (thắng/thua/mua ngay/không ai mua)
- [ ] **Tìm kiếm theo keyword + khung giờ + trạng thái**
- [ ] **Nút "Tham gia phòng" trong kết quả tìm kiếm**
- [ ] Thống kê: cards + biểu đồ + bảng + Export CSV
- [ ] Toast notifications mọi sự kiện
- [ ] Chat trong phòng (nâng cao)
- [ ] Biểu đồ giá realtime (nâng cao)

**Không được bỏ sót bất kỳ mục nào.**
