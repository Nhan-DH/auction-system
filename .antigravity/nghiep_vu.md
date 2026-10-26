1. Đặc tả hệ thống đấu giá sau khi chỉnh sửa
1. Đăng ký, đăng nhập và quản lý phiên làm việc
- User: Có thể đăng ký tài khoản mới và đăng nhập vào hệ thống.
- Khi đăng nhập thành công, server tạo session, gắn kết nối socket với tài khoản và cập nhật trạng thái online.
- Khi đăng xuất, server hủy session và cập nhật trạng thái offline.
- Hệ thống duy trì kết nối TCP Socket liên tục giữa client và server.
- Dữ liệu truyền qua socket phải có cơ chế framing rõ ràng để tránh lỗi dính hoặc tách bản tin TCP.
- Khi client đóng ứng dụng hoặc mất kết nối đột ngột, server phát hiện qua recv() trả về 0, lỗi socket hoặc cơ chế timeout/heartbeat. Server cập nhật trạng thái kết nối và xử lý phiên làm việc tương ứng.
GUI 1: Màn hình đăng ký, đăng nhập và trạng thái kết nối mạng.
2. Tạo phòng đấu giá và quản lý vật phẩm
User có thể tạo phòng đấu giá bằng cách nhập các thông tin:
- Tên phòng đấu giá.
- Tên vật phẩm.
- Hình ảnh và mô tả vật phẩm.
- Giá khởi điểm.
- Bước giá tối thiểu.
- Thời gian bắt đầu và thời lượng đấu giá.
- Giá mua ngay (nếu quyết định giữ chức năng này).
Sau khi tạo phòng thành công, phòng được lưu vào hệ thống và hiển thị trong Lobby theo trạng thái tương ứng.

Quyền của chủ phòng:
- Được tạo và quản lý phòng đấu giá của mình.
- Được xem thông tin và lịch sử đấu giá của vật phẩm do mình đăng bán.
- Không được tham gia tố giá đối với vật phẩm của chính mình.
- Không được tự ý thay đổi giá hiện tại hoặc can thiệp vào kết quả đấu giá.
Vì đã bỏ Admin, hệ thống không còn quy trình chờ duyệt, phê duyệt hoặc từ chối phòng. Nếu cần xử lý nội dung vi phạm, có thể bổ sung tính năng báo cáo ở phiên bản sau.
3. Lobby – Sảnh chờ đấu giá
Sau khi đăng nhập, User được chuyển đến Lobby, nơi hiển thị danh sách các phòng đấu giá hiện có.

Các chức năng chính:
- Xem danh sách phòng đấu giá.
- Tìm kiếm phòng theo tên hoặc ID.
- Xem thông tin vật phẩm, giá khởi điểm, giá hiện tại và thời gian còn lại.
- Phân biệt trạng thái phòng: Sắp diễn ra, Đang đấu giá, Đã kết thúc.
- Chọn phòng để tham gia nếu phòng đang mở và chưa kết thúc.
GUI 2: Giao diện Lobby và danh sách phòng đấu giá.
4. Quyền tham gia và kiểm soát truy cập
Hệ thống áp dụng các quy tắc:
1. Một User chỉ được tham gia tối đa một phòng đấu giá tại một thời điểm.
2. Chủ phòng không được tố giá vật phẩm của chính mình.
3. Người tham gia phòng của người khác chỉ có quyền tham gia đấu giá theo quy tắc hệ thống, không có quyền quản lý hoặc sửa thông tin phòng.
4. User không thể gửi lệnh tố giá nếu chưa tham gia phòng tương ứng.
5. Server phải xác thực quyền của mỗi yêu cầu, không chỉ dựa vào việc ẩn hoặc khóa nút trên giao diện.
Khi User muốn chuyển phòng, họ phải rời phòng hiện tại trước, với điều kiện không vi phạm quy tắc rời phòng trong phiên đấu giá.
5. Tham gia phòng và cập nhật dữ liệu thời gian thực
Khi User tham gia phòng, server thêm kết nối của họ vào danh sách thành viên của phòng và gửi dữ liệu hiện tại, bao gồm:
- Thông tin vật phẩm.
- Giá khởi điểm và giá hiện tại.
- Bước giá tối thiểu.
- Người đang giữ giá cao nhất.
- Thời gian còn lại.
- Danh sách người tham gia đang online.
Khi giá thay đổi, server broadcast mức giá mới đến các thành viên trong phòng để giao diện được cập nhật gần như tức thời.

GUI 3: Màn hình phòng đấu giá, bảng giá realtime, đồng hồ đếm ngược và nút tố giá.
6. Cơ chế tố giá (Bid)
Khi User nhập giá mới hoặc nhấn nút tố giá, client gửi yêu cầu đến server.

Server kiểm tra:
- User đã đăng nhập và đang tham gia đúng phòng.
- Phòng đang ở trạng thái Đang đấu giá.
- User không phải chủ phòng.
- Giá mới đáp ứng mức giá tối thiểu hợp lệ.
Công thức giá tối thiểu:
\[
\text{Giá tối thiểu mới}
=
\text{Giá hiện tại}
+
\text{Bước giá tối thiểu}
\]

Nếu yêu cầu hợp lệ, server cập nhật giá hiện tại, người giữ giá cao nhất và thời điểm đặt giá; sau đó broadcast kết quả đến các thành viên trong phòng.

Nếu không hợp lệ, server trả về thông báo lỗi tương ứng.

Lưu ý kỹ thuật: Việc kiểm tra giá và cập nhật người giữ giá phải được thực hiện như một thao tác nguyên tử ở server để tránh hai User cùng tố giá dựa trên một mức giá cũ.
7. Xử lý khi người giữ giá cao nhất rời phòng hoặc mất kết nối
Theo phương án Nhân đã chọn, hệ thống không rollback giá và không loại bỏ giá đã đặt khi người giữ giá cao nhất mất kết nối.

Quy tắc đề xuất:
- Khi User đang giữ giá cao nhất còn kết nối và phiên đấu giá đang diễn ra, server từ chối yêu cầu rời phòng.
- Khi User cố tình đóng ứng dụng hoặc mất kết nối đột ngột, server đánh dấu họ offline nhưng vẫn giữ nguyên giá đã đặt và thông tin người giữ giá cao nhất.
- User không thể tiếp tục tố giá khi đã mất kết nối.
- Khi phiên đấu giá kết thúc, hệ thống xác định người thắng theo giá hợp lệ cao nhất đã ghi nhận.
- Nếu người thắng mất kết nối, kết quả vẫn được lưu lại. Việc xử lý trường hợp người thắng không thanh toán có thể được xem xét như một tính năng mở rộng.
Điểm quan trọng: Không thể ngăn người dùng ngắt kết nối vật lý khỏi TCP Socket. Server chỉ có thể từ chối yêu cầu rời phòng hợp lệ từ ứng dụng; nếu socket bị ngắt bất ngờ, hệ thống phải xử lý theo quy tắc dự phòng trên.
8. Cơ chế mua ngay (Buy Now)
Nếu giữ chức năng này, chủ phòng được đặt một mức giá mua ngay khi tạo phòng.

Khi User đủ điều kiện chọn mua ngay:
1. Client gửi yêu cầu mua ngay đến server.
2. Server kiểm tra phòng, quyền của User và trạng thái phiên đấu giá.
3. Server xác nhận yêu cầu đầu tiên hợp lệ.
4. Phiên đấu giá kết thúc ngay và ghi nhận người mua cùng giá mua ngay.
5. Server broadcast kết quả đến các thành viên trong phòng.
Nếu muốn giảm khối lượng lập trình cho đồ án Socket C, có thể bỏ chức năng này và chỉ giữ đấu giá theo thời gian.
9. Kiểm soát thời gian và chống bắn tỉa
- Server chịu trách nhiệm quản lý thời gian đấu giá; đồng hồ trên client chỉ hiển thị thời gian nhận được.
- Server gửi thông báo khi thời gian còn lại đạt ngưỡng, ví dụ 10 giây.
- Nếu có lượt tố giá hợp lệ trong khoảng thời gian cuối, server cộng thêm thời gian, ví dụ 15 giây.
- Mỗi lần gia hạn, server gửi thời gian mới đến toàn bộ thành viên.
- Khi hết thời gian, server khóa chức năng tố giá và chuyển phòng sang trạng thái kết thúc.
10. Kết thúc phiên đấu giá và xem lịch sử
Khi phiên đấu giá kết thúc, server:
1. Xác định người giữ giá cao nhất theo dữ liệu hợp lệ đã ghi nhận.
2. Lưu kết quả gồm phòng, vật phẩm, người thắng, giá cuối cùng và thời điểm kết thúc.
3. Chuyển phòng sang trạng thái Đã kết thúc.
4. Broadcast kết quả đến các thành viên.
5. Cho phép chủ phòng xem lịch sử đấu giá của vật phẩm mình đăng bán.
Quyền xem dữ liệu được phân chia như sau:
Đối tượng	Quyền xem
Chủ phòng	Thông tin phòng và lịch sử đấu giá của vật phẩm do mình đăng bán
Người tham gia	Kết quả cuối cùng của phòng
Người không tham gia	Thông tin phòng công khai và trạng thái phòng
Admin	Không có trong phạm vi hệ thống

Hệ thống vẫn nên ghi log nội bộ cho từng phiên đấu giá để hỗ trợ kiểm tra lỗi và đối chiếu kết quả, nhưng không cần xây dựng giao diện quản trị log.

2. Phân chia các chức năng GUI

GUI 1 – Đăng ký và đăng nhập

Đăng ký, đăng nhập, thông báo lỗi và trạng thái kết nối socket.




GUI 2 – Lobby và tạo phòng

Danh sách phòng, tìm kiếm, tạo phòng và xem lịch sử phòng do mình tạo.




GUI 3 – Phòng đấu giá

Thông tin vật phẩm, giá realtime, đồng hồ, tố giá, thông báo và kết quả đấu giá.