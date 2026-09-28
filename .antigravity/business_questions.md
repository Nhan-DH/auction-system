# Câu Hỏi Làm Rõ Nghiệp Vụ — Hệ Thống Đấu Giá

> Trả lời từng câu hỏi bên dưới bằng cách đánh dấu `[x]` vào lựa chọn phù hợp.
> Các quyết định này sẽ ảnh hưởng trực tiếp đến thiết kế UI và logic server.

---

## 🏠 PHÒNG ĐẤU GIÁ & VAI TRÒ

### Q1 — Ai được bán vật phẩm (thêm item vào queue)?

- [ ] **A.** Chỉ chủ phòng (Owner) — Owner vừa quản lý phòng vừa là người bán duy nhất
- [ ] **B.** Tất cả thành viên đều có thể thêm vật phẩm để bán — Owner chỉ quản lý queue (sắp xếp, xóa, bắt đầu đấu giá)

> 💡 Nếu chọn B: UI cần hiện nút "Thêm vật phẩm" cho tất cả thành viên, không chỉ owner.

---

### Q2 — Chủ phòng có được đấu giá trong phòng mình không?

- [ ] **A.** Owner KHÔNG được đặt giá / mua ngay trong phòng mình tạo (chỉ quản lý)
- [ ] **B.** Owner cũng được đặt giá / mua ngay như thành viên bình thường
- [ ] **C.** Owner được đặt giá nhưng KHÔNG được mua ngay

> 💡 Nếu chọn A: UI ẩn bid panel cho owner. Nếu chọn B: owner thấy UI giống member + thêm nút quản lý.

---

### Q3 — Người bán có được tự bid trên vật phẩm mình đang bán?

- [ ] **A.** KHÔNG — người bán bị chặn bid trên item của chính mình (tránh tự đẩy giá)
- [ ] **B.** CÓ — người bán vẫn được đặt giá (tự đẩy giá lên)

> 💡 Nếu chọn A: Server kiểm tra `seller_id != bidder_id`, UI hiện thông báo "Bạn không thể đặt giá trên vật phẩm của mình".

---

### Q4 — Ai được xóa vật phẩm khỏi hàng đợi?

- [ ] **A.** Chỉ chủ phòng mới xóa được bất kỳ item nào
- [ ] **B.** Chủ phòng xóa được tất cả, người bán chỉ xóa được item của mình
- [ ] **C.** Chỉ người bán mới xóa được item mình đăng

> 💡 Chỉ item đang `pending` (chưa đấu giá) mới được xóa. Item đang `active` thì không.

---

### Q5 — Chủ phòng có được rời phòng không?

- [ ] **A.** Owner KHÔNG được rời — phòng tồn tại đến khi owner đóng nó
- [ ] **B.** Owner có thể rời — phòng vẫn hoạt động nhưng không ai quản lý
- [ ] **C.** Owner rời → quyền owner chuyển cho thành viên tiếp theo (hoặc thành viên lâu nhất)

> 💡 Nếu chọn A: UI ẩn nút "Rời phòng" cho owner, thay bằng nút "Đóng phòng".

---

### Q10 — Phòng đấu giá có giới hạn quyền truy cập?

- [ ] **A.** Public — ai đăng nhập cũng thấy và tham gia được
- [ ] **B.** Có thể đặt mật khẩu phòng / phòng private — cần được mời
- [ ] **C.** Chủ phòng có thể kick người khỏi phòng

> 💡 Nếu chọn B/C: cần thêm UI cho mật khẩu khi join và nút kick cho owner.

---

### Q11 — Số người tối đa trong 1 phòng?

- [ ] **A.** Không giới hạn — bao nhiêu người cũng vào được
- [ ] **B.** Có giới hạn (ví dụ: tối đa 20, 50 người) — owner đặt khi tạo phòng

---

## 💰 ĐẤU GIÁ & GIÁ CẢ

### Q7 — Giá hiện tại ban đầu là bao nhiêu khi phiên bắt đầu?

- [ ] **A.** Bằng giá khởi điểm (starting_price) — bid đầu tiên phải >= starting_price + 10.000đ
- [ ] **B.** Bằng giá khởi điểm — bid đầu tiên chỉ cần >= starting_price (không cần +10k)
- [ ] **C.** Bằng 0 — bid đầu tiên phải >= 10.000đ

> 💡 Ảnh hưởng trực tiếp đến text "Giá tối thiểu" hiển thị trong bid panel.

---

### Q8 — Bước nhảy giá có bắt buộc chẵn 10.000đ?

- [ ] **A.** Chỉ cho phép đặt giá theo bội số 10.000đ (ví dụ: +10k, +20k, +50k — nhưng +15k thì lỗi)
- [ ] **B.** Cho phép đặt bất kỳ số nào miễn >= giá hiện tại + 10.000đ (ví dụ: +15.555đ cũng OK)

---

### Q9 — Mua ngay (Buy Now) có điều kiện gì?

- [ ] **A.** Mua ngay có thể thực hiện BẤT KỲ LÚC NÀO khi phiên đang chạy
- [ ] **B.** Mua ngay chỉ được khi CHƯA có ai đặt giá
- [ ] **C.** Mua ngay bị vô hiệu khi giá hiện tại đã vượt quá giá mua ngay

> 💡 Nếu chọn C: UI tự ẩn/disable nút "Mua ngay" khi current_price >= buy_now_price.

---

## ⏱️ TIMER & LUỒNG ĐẤU GIÁ

### Q6 — Sau khi 1 phiên kết thúc, item tiếp theo bắt đầu thế nào?

- [ ] **A.** Tự động lấy item tiếp theo trong queue → bắt đầu luôn (không cần owner bấm)
- [ ] **B.** Chờ chủ phòng bấm "Bắt đầu" thủ công cho item tiếp theo
- [ ] **C.** Hiện confirm dialog hỏi chủ phòng: "Bắt đầu item tiếp theo?"

> 💡 Nếu chọn A: cần delay giữa 2 phiên (ví dụ 10s countdown). Nếu chọn B: UI hiện nút "▶️ Bắt đầu item tiếp theo" cho owner.

---

### Q13 — Thời gian đấu giá có thể custom không?

- [ ] **A.** Chỉ chọn từ list cố định: 3 / 5 / 10 / 15 phút
- [ ] **B.** Cho phép nhập tự do (ví dụ: 7 phút, 20 phút...)

---

### Q14 — Có tạm dừng (pause) phiên đấu giá được không?

- [ ] **A.** KHÔNG — phiên chạy liên tục từ đầu đến kết thúc
- [ ] **B.** CÓ — chủ phòng có thể tạm dừng/tiếp tục phiên

> 💡 Nếu chọn B: cần nút "⏸️ Tạm dừng" / "▶️ Tiếp tục" cho owner, timer freeze khi pause.

---

## 💼 HỆ THỐNG & KHÁC

### Q12 — Hệ thống có quản lý tiền / ví người dùng không?

- [ ] **A.** KHÔNG — chỉ ghi nhận kết quả thắng/thua, không quản lý tiền thật
- [ ] **B.** CÓ — mỗi user có ví/số dư, phải đủ tiền mới được bid/mua ngay

> 💡 Nếu chọn B: cần thêm UI nạp tiền, hiển thị số dư, kiểm tra balance trước khi bid.

---

### Q15 — Khi phiên đấu giá kết thúc mà KHÔNG ai đặt giá?

- [ ] **A.** Item chuyển sang trạng thái "unsold" — có thể đấu giá lại sau
- [ ] **B.** Item tự động quay lại cuối hàng đợi để đấu giá lần sau
- [ ] **C.** Item bị xóa luôn

---

### Q16 — Người dùng bị disconnect giữa chừng thì sao?

- [ ] **A.** Mất kết nối = tự động rời phòng — nếu đang dẫn đầu, bid vẫn còn hiệu lực
- [ ] **B.** Giữ chỗ trong phòng 1 khoảng thời gian (ví dụ 60s) — nếu reconnect thì tiếp tục

---

### Q17 — Chat trong phòng là chức năng bắt buộc hay tùy chọn?

- [ ] **A.** Bắt buộc — phải có ngay từ đầu
- [ ] **B.** Tùy chọn — làm nếu còn thời gian (chức năng nâng cao)

---

## 📝 GHI CHÚ THÊM

> Viết thêm bất kỳ ghi chú hoặc yêu cầu nghiệp vụ nào khác ở đây:
> 
> ...
