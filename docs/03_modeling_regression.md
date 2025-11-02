### **BÁO CÁO XÂY DỰNG MÔ HÌNH HỌC MÁY: DỰ ĐOÁN GIÁ BÁN SẢN PHẨM AMAZON**

---

#### **1. TỔNG QUAN**

**1.1. Mục tiêu**

Báo cáo này trình bày quy trình xây dựng, xác thực và so sánh các mô hình học máy để dự đoán giá bán sau khi giảm giá (`discounted_price`) của sản phẩm trên Amazon. Mục tiêu chính bao gồm:
*   Chuẩn bị dữ liệu và lựa chọn các đặc trưng phù hợp cho bài toán hồi quy.
*   Xây dựng và đánh giá hiệu suất của các mô hình cơ bản (Baseline Models) và nâng cao (Advanced Models).
*   So sánh hiệu suất giữa các mô hình dựa trên các chỉ số R-squared, MAE và RMSE.
*   Phân tích sâu mô hình có hiệu suất tốt nhất để hiểu rõ hơn về hành vi và các yếu tố ảnh hưởng đến dự đoán.
*   Lưu trữ mô hình tốt nhất để có thể tái sử dụng trong tương lai.

**1.2. Dữ liệu sử dụng**

Phân tích được thực hiện trên bộ dữ liệu '../data/processed/amazon.csv'`, là kết quả của giai đoạn tiền xử lý trước đó.
*   **Số dòng:** 1,351
*   **Số cột:** 27
*   **Biến mục tiêu (Target Variable):** `discounted_price`

---

#### **2. CHUẨN BỊ DỮ LIỆU VÀ LỰA CHỌN ĐẶC TRƯNG**

**2.1. Tải dữ liệu**

*   Dữ liệu đã xử lý được tải thành công, với kích thước (1351, 27).

**2.2. Lựa chọn Đặc trưng và Biến mục tiêu**

*   **Biến mục tiêu (y):** `discounted_price`.
*   **Các đặc trưng đầu vào (X):**
    *   Một quá trình lựa chọn đặc trưng cẩn thận đã được thực hiện để tránh rò rỉ dữ liệu (data leakage) và các vấn đề đa cộng tuyến.
    *   Các cột liên quan trực tiếp đến biến mục tiêu (như `discount_percentage`, `price_difference`) đã bị loại bỏ.
    *   Các cột chứa dữ liệu thô, không phải dạng số (như `product_id`, `product_name`, `review_content`) cũng bị loại bỏ.
    *   Các đặc trưng cuối cùng được chọn để huấn luyện mô hình bao gồm:
        1.  `actual_price` (Giá gốc)
        2.  `rating` (Điểm đánh giá)
        3.  `rating_count` (Số lượng đánh giá)
        4.  `is_popular` (Cờ chỉ mức độ phổ biến)

**2.3. Phân chia Dữ liệu**

*   Dữ liệu được chia thành hai tập:
    *   **Tập huấn luyện (Training set):** 1080 mẫu (80%)
    *   **Tập kiểm tra (Testing set):** 271 mẫu (20%)
*   Việc phân chia này đảm bảo mô hình được đánh giá trên dữ liệu mà nó chưa từng thấy trước đây, cung cấp một thước đo khách quan về hiệu suất.

---

#### **3. XÂY DỰNG VÀ ĐÁNH GIÁ MÔ HÌNH HỒI QUY**

Một loạt các mô hình hồi quy đã được xây dựng và đánh giá trên cùng một tập dữ liệu để so sánh hiệu suất.

**3.1. Danh sách các Mô hình**

*   **Mô hình cơ bản (Baseline):**
    *   `Linear Regression` (Hồi quy tuyến tính)
    *   `Decision Tree Regressor` (Cây quyết định hồi quy)
*   **Mô hình nâng cao (Advanced Ensemble Models):**
    *   `Random Forest Regressor` (Rừng ngẫu nhiên hồi quy)
    *   `Gradient Boosting Regressor` (Tăng cường Gradient)
    *   `XGBoost Regressor` (eXtreme Gradient Boosting)

**3.2. Quy trình Huấn luyện và Đánh giá**

*   Mỗi mô hình được huấn luyện trên tập `X_train` và `y_train`.
*   Hiệu suất được đánh giá trên tập `X_test` và `y_test` bằng các chỉ số sau:
    *   **R-squared (R²):** Đo lường tỷ lệ phương sai của biến mục tiêu được giải thích bởi mô hình. Giá trị càng gần 1 càng tốt.
    *   **Mean Absolute Error (MAE):** Sai số tuyệt đối trung bình, cho biết mức độ sai lệch trung bình của các dự đoán. Giá trị càng thấp càng tốt.
    *   **Root Mean Squared Error (RMSE):** Căn bậc hai của sai số bình phương trung bình. Chỉ số này nhạy cảm hơn với các lỗi lớn. Giá trị càng thấp càng tốt.

---

#### **4. SO SÁNH HIỆU SUẤT CÁC MÔ HÌNH**

**4.1. Bảng Kết quả**

| Model | R-squared | MAE | RMSE |
| :--- | :--- | :--- | :--- |
| **XGBoost** | **0.9736** | **467.12** | **1013.72** |
| Random Forest | 0.9601 | 500.34 | 1245.47 |
| Linear Regression | 0.9476 | 726.34 | 1427.11 |
| Gradient Boosting | 0.9041 | 687.36 | 1931.14 |
| Decision Tree | 0.8851 | 732.14 | 2113.54 |

**4.2. Phân tích Kết quả**

*   **XGBoost là Mô hình Vượt trội nhất:**
    *   **Insight:** `XGBoost` đạt được chỉ số **R-squared cao nhất (0.9736)** và các chỉ số lỗi **MAE, RMSE thấp nhất**. Điều này cho thấy `XGBoost` có khả năng giải thích và dự đoán giá bán sản phẩm một cách chính xác nhất trong số các mô hình được thử nghiệm.

*   **Các Mô hình Ensemble cho thấy Sức mạnh:**
    *   **Insight:** Cả `XGBoost` và `Random Forest` đều có hiệu suất cao hơn đáng kể so với các mô hình cơ bản. `Linear Regression` cũng hoạt động khá tốt, cho thấy có một mối quan hệ tuyến tính mạnh mẽ trong dữ liệu, nhưng không thể nắm bắt được các tương tác phức tạp như các mô hình ensemble.

*   **Decision Tree là Mô hình Yếu nhất:**
    *   **Insight:** Một cây quyết định đơn lẻ có xu hướng học quá mức (overfitting) và không tổng quát hóa tốt trên dữ liệu mới, dẫn đến chỉ số R-squared thấp nhất và RMSE cao nhất.

**Kết luận:** Dựa trên các chỉ số đánh giá, **XGBoost** được chọn là mô hình tốt nhất cho bài toán này.

---

#### **5. PHÂN TÍCH CHUYÊN SÂU MÔ HÌNH TỐT NHẤT (XGBOOST)**

**5.1. Phân tích Biểu đồ Phần dư (Residual Plot)**

*   **Độ chính xác rất cao ở phân khúc giá thấp-trung:** Phần lớn các lỗi dự đoán tập trung dày đặc quanh đường 0 đối với các giá trị dự đoán dưới 10,000, cho thấy mô hình cực kỳ hiệu quả với nhóm sản phẩm phổ thông.
*   **Sai số tăng ở sản phẩm giá trị cao (Phương sai thay đổi):** Biểu đồ có dạng hình phễu, cho thấy lỗi dự đoán lớn hơn đối với các sản phẩm đắt tiền. Điều này có thể do số lượng mẫu ít hơn trong dữ liệu huấn luyện.
*   **Không có độ chệch (bias) đáng kể:** Các lỗi phân bố ngẫu nhiên trên và dưới đường 0, cho thấy mô hình không có xu hướng dự đoán cao hơn hay thấp hơn một cách có hệ thống.

**5.2. Phân tích Biểu đồ Giá trị Thực tế vs. Dự đoán**

*   **Hiệu suất tổng thể rất cao:** Các điểm dữ liệu bám rất sát đường chéo dự đoán hoàn hảo, trực quan hóa kết quả R-squared cao.
*   **Độ lệch tăng ở sản phẩm giá trị cao:** Tương tự như biểu đồ phần dư, các điểm bắt đầu phân tán xa đường chéo hơn khi giá trị tăng lên.
*   **Một vài dự đoán giá trị âm không đáng kể:** Một hạn chế nhỏ của mô hình là đưa ra dự đoán âm cho các sản phẩm có giá trị thực tế gần 0, nhưng không ảnh hưởng lớn đến hiệu suất chung.

**5.3. Phân tích Mức độ Quan trọng của Đặc trưng**

*   **`actual_price` là Yếu tố "Neo giá" Quyết định:** Với điểm quan trọng gần 0.9, giá gốc là yếu tố dự báo mạnh mẽ nhất, thể hiện mối quan hệ kinh doanh cốt lõi.
*   **`rating_count` và `rating` là Yếu tố Tinh chỉnh:** Các đặc trưng về sự tương tác của khách hàng giúp mô hình điều chỉnh dự đoán, cho thấy nó không chỉ dựa vào một phép tính đơn giản mà còn xem xét cả tín hiệu thị trường.
*   **Các Đặc trưng khác Đóng vai trò Hỗ trợ:** Các đặc trưng còn lại có mức độ quan trọng thấp hơn, nhưng vẫn đóng góp vào việc tăng cường độ chính xác tổng thể của mô hình.

---

#### **6. LƯU TRỮ MÔ HÌNH**

*   **Hành động:** Mô hình `XGBoost` tốt nhất, cùng với siêu dữ liệu (metadata) bao gồm danh sách đặc trưng đã sử dụng và các chỉ số hiệu suất, đã được lưu vào tệp `xgboost_model.joblib`.
*   **Mục đích:** Việc lưu trữ này cho phép mô hình được tải lại và sử dụng để dự đoán trên dữ liệu mới mà không cần phải huấn luyện lại từ đầu, tạo điều kiện thuận lợi cho việc triển khai vào một ứng dụng thực tế.

**Kết luận cuối cùng:** Quy trình đã xác định thành công **XGBoost** là mô hình hồi quy hiệu quả nhất để dự đoán giá bán sản phẩm. Phân tích chuyên sâu cho thấy mô hình hoạt động rất tốt, đặc biệt ở phân khúc giá thấp đến trung bình, và đã nắm bắt được các mối quan hệ kinh doanh hợp lý. Mô hình này hiện đã sẵn sàng để được triển khai.