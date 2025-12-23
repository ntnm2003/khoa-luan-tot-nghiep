BÀI TẬP CUỐI KHÓA CAO HỌC K35-36 – CNTT
(Thực hiện theo nhóm: 3 học viên, 30 giờ)
Hạn nộp bài 05/01/2026. Nộp trên hệ thống http://lms.hnue.edu.vn
TS. Nguyễn Duy Hải
Trường Đại học Sư phạm Hà Nội
Yêu cầu cần đạt:
✓ Hiểu sâu các mô hình cơ sở dữ liệu hiện đại: NoSQL, Distributed Database
Systems.
✓ Vận dụng kiến thức về phân mảnh dữ liệu, sao chép (replication), cân bằng tải
(load balancing) trong thiết kế hệ thống phân tán.
✓ Thiết kế mô hình dữ liệu đa chi nhánh (multi-site) đảm bảo tính nhất quán, sẵn
sàng, chịu lỗi theo định lý CAP.
✓ Cài đặt thử nghiệm hệ thống cơ sở dữ liệu NoSQL (MongoDB) với API Web để
thao tác dữ liệu phân tán.
✓ Trình bày mô hình và đánh giá hiệu năng, độ tin cậy và tính mở rộng (scalability)
của hệ thống.
Bối cảnh
Trường Đại học Sư phạm Hà Nội triển khai hệ thống “Học liệu mở – SmartLearn”,
hỗ trợ giảng viên và học viên truy cập, lưu trữ và chia sẻ học liệu số tại nhiều cơ sở đào
tạo khác nhau (Hà Nội, Đà Nẵng, Tp.HCM). (Học viên/Nhóm có thể lựa chọn các bài
toán khác trong danh sách ở Phụ lục I và phân tích các bảng/thực thể dữ liệu cần phân
tán)
Hệ thống cần đảm bảo:
•Truy cập nhanh từ các địa điểm khác nhau.
•Dữ liệu đồng bộ giữa các node khu vực.
•Khi một node gặp sự cố, hệ thống vẫn hoạt động bình thường (high availability).
•Hỗ trợ thống kê học liệu, người dùng và hoạt động học tập theo thời gian thực.
Yêu cầu bài tập
1. Thiết kế cơ sở dữ liệu NoSQL
   • Chọn MongoDB để xây dựng mô hình dữ liệu học liệu:
        users (người dùng: giảng viên, học viên)
        courses (khóa học/môn học)
        materials (học liệu / tài nguyên số)
        activities (lịch sử truy cập, lượt tải, lượt xem)
   •Phân tích mối quan hệ giữa các collection/table.
   •Đề xuất mô hình truy vấn tối ưu (indexing, sharding key, partition key).
   •Tạo dataset mẫu (~500–1000 bản ghi).
2. Xây dựng mô hình phân tán
   •Triển khai tối thiểu 3 node MongoDB (2 node chi nhánh + 1 node trung tâm)
   trên Docker hoặc máy ảo.
   •Thực hiện:
   •
   oReplication: đảm bảo sao chép dữ liệu tự động.
   oSharding: phân chia dữ liệu học liệu theo Khoa hoặc Cơ sở đào tạo.
   oFailover test: kiểm tra khi 1 node ngắt kết nối, hệ thống vẫn phục vụ
   được truy vấn.
   Minh họa bằng sơ đồ kiến trúc mạng phân tán (Network Topology Diagram).
3. Phát triển hệ thống Web/API
   •
   Xây dựng API hoặc ứng dụng web (Node.js, PHP, hoặc Python
   Flask/FastAPI) cho các chức năng:
   oĐăng nhập và phân quyền (admin/giảng viên/học viên).
   oQuản lý học liệu: thêm, sửa, xóa, tìm kiếm, lọc theo khóa học.
   oGhi log hoạt động vào collection activities.
   oThống kê số lượt tải/tương tác theo ngày hoặc người dùng.
   •API thao tác trực tiếp với các node NoSQL qua driver hoặc ORM tương ứng.
   •Triển khai giao diện báo cáo (Dashboard) hiển thị thống kê bằng Chart.js hoặc
   tương tự.
   •Mã hóa mật khẩu người dùng (bcrypt hoặc password_hash).
   •Sử dụng JWT (JSON Web Token) cho xác thực người dùng.
5. Báo cáo kết quả
   Báo cáo gồm các phần:
   1.Giới thiệu vấn đề và mục tiêu thiết kế.
   2.Phân tích mô hình dữ liệu NoSQL.
   3.Kiến trúc hệ thống phân tán (sơ đồ + mô tả).
   4.Các truy vấn mẫu (insert, update, aggregate, map-reduce, API calls).
   25.Kết quả kiểm thử & đánh giá hiệu năng.
   6.Kết luận và hướng phát triển.
   Tệp nộp gồm:
   1.Mã nguồn ứng dụng (Web/API + cấu hình CSDL).
   2.File dataset mẫu (.json hoặc script tạo dữ liệu).
   3.Báo cáo PDF (15–20 trang).
   4.Ảnh chụp màn hình demo.
   5.Link video demo (tùy chọn).
6. Tiêu chí đánh giá kết quả xem tại Phụ lục II.
   
Phụ lục II. RUBRIC ĐÁNH GIÁ BÀI TẬP CUỐI KỲ
   Tiêu chí đánh giá
   Mô tả yêu cầu
   Điểm tối đa
- Mô hình dữ liệu logic + physical đầy đủ.- Lựa chọn key, partition key, shard key hợp lý.
1. Thiết kế mô hình
   CSDL NoSQL
- Thể hiện mối quan hệ và chiến lược truy vấn tối ưu.
  20 điểm
- Dataset mẫu đa dạng (≥ 500 bản ghi).
- Cấu hình ≥ 3 node (2 chi nhánh + 1 trung tâm).
2. Triển khai hệ
   thống CSDL phân
   tán
- Triển khai replication/sharding đúng chuẩn.
- Test failover và mô tả kết quả.
  20 điểm
- Sơ đồ kiến trúc phân tán rõ ràng.
- Tối thiểu 4 nhóm chức năng CRUD hoàn chỉnh.
3. Xây dựng API/Web
   kết nối NoSQL
- API chạy ổn định, trả kết quả đúng.
  15 điểm
- Có thống kê/aggregation pipeline.
- Giao diện thân thiện (nếu có).
- Sử dụng đúng và hiệu quả các truy vấn: aggregation, index, map-reduce hoặc equivalent.
4. Xử lý truy vấn và
   tính toán nâng cao
- Minh chứng tối ưu hóa truy vấn.
  15 điểm
- So sánh hiệu năng khi sharding.
  6Tiêu chí đánh giá
  Mô tả yêu cầu
  Điểm tối đa
- Áp dụng session/JWT.
5. Bảo mật và phân
   quyền
- Hash mật khẩu đúng chuẩn.
  10 điểm
- Kiểm soát truy cập theo vai trò (RBAC).
- Xử lý lỗi bảo mật cơ bản (SQL/NoSQL injection, brute-force).
- Chạy thử nghiệm thực tế với dataset lớn.
6. Hiệu năng & đánh
   giá hệ thống
- Báo cáo latency, throughput, replication lag.
  10 điểm
- Phân tích ưu/nhược điểm mô hình.
- Trình bày mạch lạc, khoa học.
7. Báo cáo cuối kỳ
   (PDF)
- Có đầy đủ: mô hình CSDL, kiến trúc phân tán, truy vấn, API, ảnh demo.
  5 điểm
- Có phân tích, tự đánh giá, hướng phát triển.
8. Demo & trả lời vấn
   đáp
- Demo mượt, đầy đủ chức năng.
- Trả lời rõ ràng các câu hỏi về thiết kế, hiệu năng, mô hình phân tán.
  Tổng điểm
  5 điểm
  100 điểm
  78