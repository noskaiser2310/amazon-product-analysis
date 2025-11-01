### **BÁO CÁO XỬ LÝ VÀ PHÂN TÍCH CHẤT LƯỢNG DỮ LIỆU: BỘ DỮ LIỆU SẢN PHẨM AMAZON**

---

#### **1. TỔNG QUAN DỰ ÁN**

**1.1. Mục tiêu**

Báo cáo này trình bày chi tiết quy trình xử lý dữ liệu (Data Processing) được thực hiện trên bộ dữ liệu thô "Amazon Product's Ratings and Reviews". Mục tiêu chính là:
*   Tải, làm sạch và tiền xử lý dữ liệu thô.
*   Thực hiện đánh giá và báo cáo chất lượng dữ liệu (Data Quality Report).
*   Biến đổi và làm giàu dữ liệu thông qua kỹ thuật tạo đặc trưng (Feature Engineering).
*   Tạo ra một bộ dữ liệu sạch, có cấu trúc, sẵn sàng cho các giai đoạn phân tích chuyên sâu (EDA), trực quan hóa và xây dựng mô hình (ví dụ: hệ thống gợi ý).

**1.2. Mô tả Bộ dữ liệu**

Bộ dữ liệu gốc chứa thông tin của hơn 1.400 sản phẩm được liệt kê trên Amazon, bao gồm các chi tiết về giá cả, xếp hạng và đánh giá từ người dùng.

**Các thuộc tính (Features) bao gồm:**

*   **`product_id`**: ID định danh duy nhất cho mỗi sản phẩm.
*   **`product_name`**: Tên sản phẩm.
*   **`category`**: Danh mục phân loại sản phẩm.
*   **`discounted_price`**: Giá sau khi đã giảm.
*   **`actual_price`**: Giá gốc của sản phẩm.
*   **`discount_percentage`**: Tỷ lệ phần trăm giảm giá.
*   **`rating`**: Điểm xếp hạng trung bình của sản phẩm.
*   **`rating_count`**: Tổng số lượt đánh giá cho sản phẩm.
*   **`about_product`**: Mô tả chi tiết về sản phẩm.
*   **`user_id`, `user_name`**: ID và tên của người dùng đã viết đánh giá.
*   **`review_id`, `review_title`, `review_content`**: ID, tiêu đề và nội dung chi tiết của bài đánh giá.
*   **`img_link`, `product_link`**: Đường dẫn đến hình ảnh và trang web của sản phẩm.

---

#### **2. BÁO CÁO CHẤT LƯỢNG DỮ LIỆU (DATA QUALITY REPORT)**

Trước khi xử lý, một cuộc kiểm tra toàn diện về chất lượng dữ liệu đã được tiến hành.

**2.1. Đánh giá Ban đầu**

*   **Kích thước (Shape):**
    *   Số dòng: **1,465**
    *   Số cột: **16**
*   **Kiểu dữ liệu (Data Types):**
    *   Tất cả 16 cột đều được đọc vào dưới dạng `object` (chuỗi ký tự). Điều này cho thấy sự cần thiết phải chuyển đổi các cột chứa dữ liệu số (giá, xếp hạng, số lượt đánh giá) sang định dạng số học phù hợp.
*   **Sử dụng Bộ nhớ:** Khoảng **8.86 MB**.

**2.2. Phân tích Giá trị Thiếu (Missing Values)**

*   Một cột duy nhất được phát hiện có giá trị thiếu:
    *   **`rating_count`**: Có **2** giá trị bị thiếu, chiếm **0.1365%** tổng số dòng.
*   **Đánh giá:** Tỷ lệ thiếu rất thấp, không ảnh hưởng nghiêm trọng đến toàn bộ tập dữ liệu nhưng cần được xử lý để đảm bảo tính nhất quán.

**2.3. Phân tích Dữ liệu Trùng lặp**

*   Kiểm tra ban đầu cho thấy **0 dòng bị trùng lặp hoàn toàn** (tức là tất cả các giá trị trên một dòng đều giống hệt một dòng khác).
*   Tuy nhiên, việc kiểm tra sâu hơn về khả năng trùng lặp dựa trên ID sản phẩm sẽ được thực hiện trong giai đoạn làm sạch.

---

#### **3. QUY TRÌNH XỬ LÝ DỮ LIỆU (DATA PROCESSING PIPELINE)**

Dựa trên báo cáo chất lượng, các bước xử lý sau đã được thực hiện tuần tự.

**3.1. Xử lý Giá trị Thiếu**

*   **Hành động:** Điền giá trị thiếu trong cột `rating_count`.
*   **Phương pháp:** Thay thế 2 giá trị `NaN` bằng số `0`.
*   **Lý do:** Giả định rằng một sản phẩm có số lượt đánh giá bị thiếu (null) có nghĩa là nó chưa nhận được lượt đánh giá nào. Do đó, `0` là giá trị thay thế hợp lý nhất.
*   **Kết quả:** Bộ dữ liệu không còn giá trị thiếu.

**3.2. Loại bỏ Dữ liệu Trùng lặp**

*   **Hành động:** Loại bỏ các sản phẩm bị trùng lặp.
*   **Phương pháp:** Xóa các dòng có `product_id` giống nhau, chỉ giữ lại bản ghi xuất hiện đầu tiên.
*   **Kết quả:**
    *   Số dòng trước khi xử lý: 1,465
    *   Số dòng sau khi xử lý: **1,351**
    *   Số dòng đã xóa: **114** (chiếm **7.78%** tổng dữ liệu).
    *   Thao tác này đảm bảo mỗi sản phẩm chỉ xuất hiện một lần, tránh sai lệch trong phân tích.

**3.3. Làm sạch Dữ liệu Văn bản**

*   **Hành động:** Tiêu chuẩn hóa nội dung văn bản trong các cột `review_content`, `review_title`, và `about_product`.
*   **Phương pháp:** Áp dụng một hàm xử lý tùy chỉnh để thực hiện:
    1.  Chuyển đổi toàn bộ văn bản sang chữ thường.
    2.  Loại bỏ các đường dẫn URL (http, https, www).
    3.  Loại bỏ các thẻ HTML.
    4.  Xóa các khoảng trắng thừa.
*   **Kết quả:** Tạo ra 3 cột mới (`review_content_clean`, `review_title_clean`, `about_product_clean`) chứa văn bản đã được làm sạch, sẵn sàng cho các tác vụ xử lý ngôn ngữ tự nhiên (NLP).

**3.4. Chuyển đổi Kiểu dữ liệu**

*   **Hành động:** Chuyển đổi các cột từ kiểu `object` sang kiểu số học phù hợp.
*   **Chi tiết:**
    *   **`discount_percentage`**: Chuyển từ chuỗi (vd: "64%") sang số thực (vd: 0.64).
    *   **`discounted_price`, `actual_price`**: Loại bỏ ký tự tiền tệ '₹' và dấu phẩy, sau đó chuyển sang kiểu `float`. Các giá trị không hợp lệ được điền bằng trung vị (median) của cột.
    *   **`rating`**: Chuyển sang kiểu `float`. Các giá trị không hợp lệ được điền bằng trung vị.
    *   **`rating_count`**: Loại bỏ dấu phẩy và chuyển sang kiểu `int`.
*   **Lý do:** Việc chuyển đổi này là bắt buộc để có thể thực hiện các phép toán, thống kê và xây dựng mô hình.

**3.5. Kỹ thuật Tạo Đặc trưng (Feature Engineering)**

Để làm giàu thông tin và tạo ra các biến số có giá trị hơn cho phân tích, các đặc trưng mới sau đã được tạo ra:

*   **Đặc trưng về độ dài đánh giá:**
    *   `review_length`: Số ký tự trong mỗi bài đánh giá.
    *   `review_word_count`: Số từ trong mỗi bài đánh giá.
*   **Đặc trưng về giá:**
    *   `price_difference`: Chênh lệch giữa giá gốc và giá giảm (`actual_price` - `discounted_price`).
    *   `discount_amount`: Số tiền thực tế được giảm (tương tự `price_difference`).
*   **Đặc trưng về danh mục:**
    *   `category_main`: Trích xuất danh mục chính (cấp cao nhất).
    *   `product_type`: Trích xuất danh mục con/loại sản phẩm (cấp cuối cùng).
*   **Đặc trưng về mức độ phổ biến:**
    *   `is_popular`: Một cờ nhị phân (`1` nếu phổ biến, `0` nếu không). Sản phẩm được coi là "phổ biến" nếu `rating_count` của nó cao hơn 75% các sản phẩm khác (nằm trong top 25%).
*   **Đặc trưng về loại xếp hạng:**
    *   `rating_category`: Phân loại điểm `rating` số thành các nhãn định tính: 'Poor' (0-2), 'Fair' (2-3), 'Good' (3-4), 'Excellent' (4-5).

---

#### **4. KẾT QUẢ VÀ TÓM TẮT**

**4.1. Tóm tắt Quy trình**

| Hạng mục | Trạng thái ban đầu | Các hành động chính | Trạng thái cuối cùng |
| :--- | :--- | :--- | :--- |
| **Số dòng** | 1,465 | - Xóa 114 bản ghi trùng lặp `product_id`. | **1,351** |
| **Số cột** | 16 | - Thêm 11 cột mới từ làm sạch và tạo đặc trưng. | **27** |
| **Giá trị thiếu** | 2 | - Điền bằng 0. | **0** |
| **Kiểu dữ liệu**| Tất cả là `object` | - Chuyển đổi 5 cột sang `float` và `int`. | Dữ liệu có kiểu phù hợp |
| **Chất lượng** | Dữ liệu thô, nhiễu | - Làm sạch văn bản, chuẩn hóa số liệu. | Dữ liệu sạch, nhất quán |

**4.2. Tệp Dữ liệu Đầu ra**

*   Quy trình xử lý đã tạo ra một tệp dữ liệu cuối cùng, được lưu tại:
    `../data/processed/amazon.csv`
*   Bộ dữ liệu này có kích thước **(1351, 27)**, hoàn toàn sạch sẽ, có cấu trúc và được làm giàu với các đặc trưng mới.
