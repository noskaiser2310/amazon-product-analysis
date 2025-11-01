### **BÁO CÁO XÂY DỰNG MÔ HÌNH DỰ ĐOÁN GIÁ BÁN: BỘ DỮ LIỆU SẢN PHẨM AMAZON**
---

#### **1. TỔNG QUAN DỰ ÁN**

**1.1. Mục tiêu**

Báo cáo này trình bày quy trình xây dựng, xác thực và so sánh các mô hình học máy để dự đoán chính xác giá bán sau khi giảm giá (`discounted_price`) của các sản phẩm trên Amazon. Mục tiêu chính bao gồm:
*   Chuẩn bị dữ liệu và lựa chọn các đặc trưng phù hợp cho bài toán hồi quy.
*   Xây dựng và đánh giá các mô hình cơ sở (Baseline Models) để làm thước đo hiệu suất.
*   Thử nghiệm các mô hình nâng cao (Advanced Models) để tìm ra giải pháp có độ chính xác cao nhất.
*   So sánh hiệu suất các mô hình dựa trên các chỉ số R-squared, MAE, và RMSE.
*   Phân tích sâu hơn về mô hình hoạt động tốt nhất để hiểu rõ hơn về hành vi dự đoán và các yếu tố ảnh hưởng chính.

**1.2. Dữ liệu và Biến số**

*   **Dữ liệu sử dụng:** Bộ dữ liệu `../data/processed/amazon.csv.csv` (1,351 sản phẩm, 27 cột).
*   **Biến mục tiêu (Target Variable):** `discounted_price` (Giá sau khi giảm).
*   **Biến độc lập (Features):** Các đặc trưng số học được lựa chọn cẩn thận để tránh rò rỉ dữ liệu (data leakage).

---

#### **2. CHUẨN BỊ DỮ LIỆU**

**2.1. Tải và Lựa chọn Đặc trưng**

*   Bộ dữ liệu đã được xử lý từ giai đoạn trước được tải thành công.
*   **Lựa chọn đặc trưng:** Một bước quan trọng là lựa chọn các đặc trưng đầu vào (X) để tránh rò rỉ thông tin từ biến mục tiêu. Các cột sau đã bị loại bỏ:
    *   Các cột liên quan trực tiếp đến giá bán (`discount_percentage`, `price_difference`, `discount_amount`).
    *   Các cột định danh và văn bản thô không phù hợp cho mô hình hồi quy (`product_id`, `category`, `review_content`, v.v.).
    *   Các đặc trưng đã được mã hóa lại hoặc không cần thiết (`rating_category`, `product_type`).
*   **Kết quả:** Tập đặc trưng cuối cùng được sử dụng để huấn luyện mô hình bao gồm:
    `['actual_price', 'rating', 'rating_count', 'review_length', 'review_word_count', 'is_popular']`

**2.2. Phân chia Dữ liệu**

*   Dữ liệu được phân chia thành hai tập:
    *   **Tập huấn luyện (Training Set):** 80% dữ liệu (1,080 mẫu).
    *   **Tập kiểm tra (Testing Set):** 20% dữ liệu (271 mẫu).
*   Việc phân chia này đảm bảo rằng mô hình sẽ được đánh giá trên một tập dữ liệu mà nó chưa từng thấy trước đây, giúp đánh giá khách quan hiệu suất tổng quát hóa của mô hình.

---

#### **3. XÂY DỰNG VÀ ĐÁNH GIÁ MÔ HÌNH**

Năm mô hình hồi quy khác nhau đã được lựa chọn để thử nghiệm, bao gồm cả các mô hình cơ sở và các thuật toán ensemble nâng cao.

**3.1. Các mô hình được thử nghiệm:**

*   **Mô hình cơ sở:**
    1.  **Linear Regression (Hồi quy Tuyến tính):** Để thiết lập một đường cơ sở đơn giản.
    2.  **Decision Tree (Cây Quyết định):** Một mô hình phi tuyến tính cơ bản.
*   **Mô hình nâng cao (Ensemble):**
    3.  **Random Forest (Rừng Ngẫu nhiên):** Cải tiến của Cây Quyết định, giảm thiểu overfitting.
    4.  **Gradient Boosting:** Xây dựng tuần tự các cây yếu để cải thiện hiệu suất.
    5.  **XGBoost:** Một phiên bản tối ưu hóa và hiệu suất cao của Gradient Boosting.

**3.2. Kết quả Đánh giá**

Tất cả các mô hình đều được huấn luyện trên cùng một tập huấn luyện và đánh giá trên cùng một tập kiểm tra.

| Model | R-squared (R²) | MAE (Lỗi Tuyệt đối Trung bình) | RMSE (Sai số Căn bậc hai Trung bình) |
| :--- | :--- | :--- | :--- |
| **Random Forest** | **0.9597** | **503.45** | **1251.62** |
| XGBoost | 0.9506 | 552.39 | 1385.25 |
| Linear Regression | 0.9459 | 746.36 | 1450.41 |
| Gradient Boosting | 0.9321 | 609.16 | 1624.90 |
| Decision Tree | 0.9006 | 674.34 | 1965.75 |

**Nhận xét:**
*   **Random Forest là mô hình hoạt động tốt nhất** trên cả ba chỉ số, với **R-squared cao nhất (0.9597)** và **MAE/RMSE thấp nhất**. Điều này cho thấy nó có khả năng giải thích 96% sự biến thiên của giá bán và có sai số dự đoán trung bình thấp nhất.
*   Các mô hình ensemble (Random Forest, XGBoost, Gradient Boosting) đều cho kết quả tốt hơn mô hình Cây Quyết định đơn lẻ, chứng tỏ hiệu quả của việc kết hợp nhiều mô hình.
*   Hồi quy Tuyến tính, mặc dù đơn giản, cũng đạt được R-squared rất cao (0.9459), chủ yếu là do mối tương quan cực mạnh giữa `actual_price` và `discounted_price`.

---

#### **4. PHÂN TÍCH MÔ HÌNH TỐT NHẤT: RANDOM FOREST**

Để hiểu rõ hơn về hiệu suất của mô hình chiến thắng, chúng tôi đã tiến hành phân tích sâu hơn.

**4.1. Phân tích Biểu đồ Phần dư (Residual Plot)**

*   **Insight:**
    1.  **Độ chính xác cao ở phân khúc giá thấp:** Phần lớn các điểm dữ liệu tập trung dày đặc quanh đường lỗi bằng 0, đặc biệt với các giá trị dự đoán dưới 10,000.
    2.  **Phương sai thay đổi (Heteroscedasticity):** Sai số tăng lên đáng kể đối với các sản phẩm giá trị cao. Biểu đồ có hình phễu, cho thấy mô hình kém ổn định hơn khi dự đoán giá của các mặt hàng đắt tiền.
    3.  **Không có độ chệch (bias) đáng kể:** Các phần dư phân bố ngẫu nhiên cả trên và dưới đường số 0, cho thấy mô hình không có xu hướng dự đoán cao hơn hay thấp hơn một cách có hệ thống.
*   **Ý nghĩa:** Mô hình rất đáng tin cậy cho các sản phẩm phổ thông. Tuy nhiên, cần thận trọng khi áp dụng cho các sản phẩm giá trị rất cao do sai số có thể lớn hơn.

**4.2. Phân tích Biểu đồ Giá trị Thực tế vs. Dự đoán**

*   **Insight:** Hầu hết các điểm dữ liệu bám sát "Đường Dự đoán Hoàn hảo". Độ lệch tăng lên ở các sản phẩm giá trị cao. Có một vài dự đoán âm không hợp lệ cho các sản phẩm giá rất thấp.
*   **Ý nghĩa:** Biểu đồ này trực quan hóa kết quả R-squared cao, khẳng định hiệu suất tổng thể rất tốt của mô hình.

**4.3. Phân tích Mức độ Quan trọng của Đặc trưng**

*   **Insight:**
    1.  **`actual_price` (Giá Gốc)** là đặc trưng quan trọng nhất với điểm số vượt trội (gần 0.9).
    2.  **`rating_count` (Số lượng đánh giá)** và **`rating` (Điểm đánh giá)** là hai yếu tố quan trọng tiếp theo.
    3.  Các đặc trưng khác có ảnh hưởng nhỏ hơn.
*   **Ý nghĩa:** Mô hình đã học được quy luật kinh doanh cốt lõi: giá bán sau khi giảm phụ thuộc chủ yếu vào giá gốc. Các yếu tố về sự tương tác của khách hàng (số lượng và chất lượng đánh giá) đóng vai trò là các yếu tố "tinh chỉnh" quan trọng, giúp mô hình đưa ra dự đoán chính xác hơn.

---

#### **5. LƯU MÔ HÌNH**

*   Mô hình hoạt động tốt nhất, **Random Forest**, đã được lựa chọn.
*   Toàn bộ đối tượng mô hình cùng với các siêu dữ liệu quan trọng (tên mô hình, danh sách đặc trưng đã sử dụng, chỉ số hiệu suất, phiên bản thư viện) đã được đóng gói và lưu vào tệp '../models/price_prediction/random_forest_model.joblib'.
*   Việc lưu trữ này đảm bảo rằng mô hình có thể được tải lại và sử dụng cho việc triển khai trong tương lai mà không cần huấn luyện lại, đồng thời duy trì tính nhất quán về môi trường và dữ liệu.

---

#### **6. KẾT LUẬN**

Quy trình đã xây dựng và xác thực thành công một mô hình **Random Forest** có khả năng dự đoán giá bán sau khi giảm giá với độ chính xác rất cao (**R-squared ≈ 0.96**). Phân tích sâu hơn cho thấy mô hình hoạt động đặc biệt hiệu quả với các sản phẩm giá thấp và tầm trung. Đặc trưng quan trọng nhất là giá gốc, nhưng các yếu tố về sự phổ biến và đánh giá của người dùng cũng đóng góp một phần ý nghĩa vào việc tinh chỉnh dự đoán. Mô hình này đã sẵn sàng để được triển khai và ứng dụng vào thực tế.