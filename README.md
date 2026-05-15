# anh-an

## Chạy bằng Docker Compose

Khởi động toàn bộ stack bằng một lệnh:

```bash
docker compose up --build
```

Sau khi lên xong:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

Để dừng hệ thống:

```bash
docker compose down
```

## Nâng cấp chức năng đã bổ sung

Hệ thống hiện đã lưu trữ dữ liệu thực tế trên MongoDB cho các nghiệp vụ chính trong lĩnh vực quản lý đất đai:

- Quản lý bất động sản/đất (`/api/lands`):
	- Tạo, sửa, xóa, xem chi tiết.
	- Lọc theo trạng thái (`available`, `sold`, `pending`).
	- Tìm kiếm theo tiêu đề/mô tả/vị trí.
	- Lọc theo khoảng giá và diện tích.
	- Phân trang + sắp xếp (hỗ trợ `created_at`, `price`, `area`, `title`, `status`).

- Quản lý giao dịch (`/api/transactions`):
	- Tạo giao dịch bán/cho thuê có validation.
	- Cập nhật trạng thái tài sản theo nghiệp vụ (`sold`, `pending`).
	- Danh sách giao dịch có phân trang + join sang thông tin tài sản.

- Báo cáo (`/api/reports/stats`):
	- Tổng số tài sản theo trạng thái.
	- Tổng doanh thu.
	- Thống kê doanh thu theo tháng (6 tháng gần nhất).
	- Danh sách giao dịch gần đây để hiển thị dashboard.

## Cải thiện hiệu năng

Đã thêm index MongoDB khi backend khởi động:

- `users`: unique index cho `username`, `email`.
- `lands`: index theo `status + created_at`, `price`, `area`.
- `transactions`: index theo `land_id + date`, `status + date`, `type + date`.

Các index trên giúp tăng tốc truy vấn danh sách, lọc, thống kê và truy vấn giao dịch theo thời gian.
