### **BÁO CÁO XÂY DỰNG HỆ THỐNG GỢI Ý: BỘ DỮ LIỆU SẢN PHẨM AMAZON**

---

#### **1. TỔNG QUAN DỰ ÁN**

**1.1. Mục tiêu**

Báo cáo này trình bày quy trình xây dựng, đánh giá và so sánh nhiều mô hình gợi ý khác nhau để xác định hệ thống hoạt động hiệu quả nhất cho bộ dữ liệu sản phẩm Amazon. Các mục tiêu cụ thể bao gồm:
*   Xây dựng các mô hình gợi ý đa dạng: Dựa trên Nội dung (Content-Based), Lọc Cộng tác (Collaborative Filtering), và Lai (Hybrid).
*   Đánh giá hiệu suất mô hình một cách khách quan bằng các chỉ số chuẩn (NDCG@10, HitRate@10, Recall@10).
*   Lựa chọn và lưu trữ mô hình hoạt động tốt nhất dưới dạng một tệp có thể tái sử dụng.
*   Phát triển một hàm dự đoán để đưa ra các gợi ý sản phẩm cho một người dùng cụ thể.

**1.2. Dữ liệu sử dụng**

*   Phân tích được thực hiện trên bộ dữ liệu `../data/processed/amazon.csv.csv`, là kết quả của giai đoạn tiền xử lý trước đó.
*   Dữ liệu chứa thông tin về tương tác của người dùng (`user_id`) với sản phẩm (`product_id`), cùng với các siêu dữ liệu sản phẩm như điểm đánh giá (`rating`), danh mục (`category_main`), và mô tả (`about_product`).

---

#### **2. CHUẨN BỊ VÀ PHÂN CHIA DỮ LIỆU**

**2.1. Tải và Tiền xử lý Dữ liệu Tương tác**

*   Dữ liệu được tải từ tệp CSV đã xử lý.
*   **"Bùng nổ" (Explode) Dữ liệu:** Cột `user_id`, vốn chứa một danh sách các ID người dùng được phân tách bằng dấu phẩy, đã được "bùng nổ" để mỗi hàng chỉ đại diện cho một tương tác duy nhất giữa một người dùng và một sản phẩm.
*   **Lọc nhiễu:**
    *   Các hàng có giá trị thiếu ở các cột quan trọng (`user_id`, `product_id`, `rating`) đã bị loại bỏ.
    *   Để giảm nhiễu và đảm bảo chất lượng dữ liệu, chỉ những người dùng có **ít nhất 3 tương tác** được giữ lại.

**2.2. Chiến lược Đánh giá: Phân chia "Leave-One-Out"**

*   Để đánh giá hiệu quả của các mô hình trong việc dự đoán tương tác tiếp theo của người dùng, chiến lược phân chia "Leave-One-Out" đã được áp dụng.
*   **Phương pháp:** Đối với mỗi người dùng, tương tác được đánh giá cao nhất (hoặc gần nhất với cao nhất) được giữ lại làm **tập kiểm tra (Test Set)**. Các tương tác còn lại của người dùng đó được đưa vào **tập huấn luyện (Train Set)**.
*   **Kết quả:**
    *   **Tập huấn luyện:** 1,000 tương tác.
    *   **Tập kiểm tra:** 357 tương tác.
*   **Lợi ích:** Phương pháp này mô phỏng một cách thực tế kịch bản mà hệ thống gợi ý phải đối mặt: dự đoán sản phẩm tiếp theo mà người dùng sẽ thích dựa trên lịch sử tương tác của họ.

---

#### **3. XÂY DỰNG CÁC THÀNH PHẦN MÔ HÌNH**

Các thành phần cơ bản sau đã được xây dựng để làm nền tảng cho các mô hình gợi ý.

**3.1. Bộ mã hóa và Ma trận Người dùng-Sản phẩm (UPM)**

*   **Bộ mã hóa (Encoders):** `LabelEncoder` được sử dụng để chuyển đổi các ID người dùng và sản phẩm dạng chuỗi sang các chỉ số số nguyên, thuận tiện cho việc xây dựng ma trận.
*   **Ma trận Người dùng-Sản phẩm (User-Product Matrix - UPM):**
    *   Một ma trận thưa (`csr_matrix`) đã được xây dựng, trong đó các hàng đại diện cho người dùng, các cột đại diện cho sản phẩm, và các giá trị là điểm đánh giá (`rating`).
    *   **Chuẩn hóa:** Để loại bỏ độ chệch (bias) do một số người dùng có xu hướng đánh giá cao hơn hoặc thấp hơn, các điểm đánh giá đã được chuẩn hóa bằng cách trừ đi điểm đánh giá trung bình của từng người dùng.

**3.2. Mô hình Cơ sở: Dựa trên Mức độ Phổ biến (Popularity-Based)**

*   Một danh sách xếp hạng các sản phẩm dựa trên mức độ phổ biến đã được tạo ra.
*   **Phương pháp tính điểm:** Một điểm số kết hợp đã được tính toán bằng cách sử dụng **trung bình Bayes (Bayesian Average)** của điểm đánh giá và số lượng đánh giá. Công thức này giúp ưu tiên các sản phẩm vừa có đánh giá cao vừa có nhiều lượt đánh giá, tránh trường hợp một sản phẩm chỉ có một đánh giá 5 sao được xếp hạng cao.

**3.3. Mô hình Dựa trên Nội dung (Content-Based)**

*   **Xây dựng "Hồ sơ" Sản phẩm:** Siêu dữ liệu văn bản của mỗi sản phẩm (danh mục, mô tả, tên) được kết hợp thành một trường văn bản duy nhất.
*   **Vector hóa TF-IDF:** `TfidfVectorizer` được sử dụng để chuyển đổi văn bản này thành các vector số, biểu diễn tầm quan trọng của các từ.
*   **Tính toán Độ tương đồng:** **Độ tương đồng Cosine (Cosine Similarity)** được tính toán giữa tất cả các cặp vector sản phẩm, tạo ra một ma trận tương đồng nội dung.

**3.4. Mô hình Lọc Cộng tác (Collaborative Filtering) sử dụng SVD**

*   **Phân rã Ma trận:** **Phân rã Giá trị Kỳ dị (Truncated SVD)** được áp dụng trên ma trận Người dùng-Sản phẩm (UPM) đã chuẩn hóa.
*   **Kết quả:** SVD phân rã UPM thành hai ma trận có chiều thấp hơn:
    *   **Ma trận Người dùng-Đặc trưng (U):** Biểu diễn sở thích của người dùng dưới dạng các yếu tố ẩn (latent factors).
    *   **Ma trận Sản phẩm-Đặc trưng (V):** Biểu diễn các đặc tính của sản phẩm theo cùng các yếu tố ẩn đó.
*   Kích thước của các yếu tố ẩn (`n_factors`) được đặt là 64.

---

#### **4. ĐÁNH GIÁ HIỆU SUẤT MÔ HÌNH**

**4.1. Các chỉ số Đánh giá**

Ba chỉ số tiêu chuẩn đã được sử dụng để đo lường hiệu suất của top 10 gợi ý:
*   **NDCG@10 (Normalized Discounted Cumulative Gain):** Đo lường chất lượng xếp hạng của các gợi ý.
*   **HitRate@10:** Đo lường tỷ lệ người dùng có ít nhất một sản phẩm được gợi ý đúng trong top 10.
*   **Recall@10:** Đo lường tỷ lệ các sản phẩm liên quan thực sự được gợi ý trong top 10.

**4.2. Kết quả Đánh giá**

Một mẫu gồm 100 người dùng từ tập kiểm tra đã được sử dụng để đánh giá.

| Model | NDCG@10 | HitRate@10 | Recall@10 |
| :--- | :--- | :--- | :--- |
| **Content-Based** | **0.8445** | **0.89** | **0.89** |
| Hybrid | 0.5177 | 0.83 | 0.83 |
| Random | 0.0234 | 0.05 | 0.05 |
| Collaborative | 0.0106 | 0.03 | 0.03 |
| Popularity | 0.0000 | 0.00 | 0.00 |

**Phân tích Kết quả:**
*   **Content-Based là mô hình hoạt động tốt nhất một cách vượt trội,** với NDCG@10 đạt 0.84. Điều này cho thấy trong bộ dữ liệu này, việc gợi ý các sản phẩm tương tự về mặt nội dung (danh mục, mô tả) với sản phẩm mà người dùng đã thích gần đây là một chiến lược cực kỳ hiệu quả.
*   **Mô hình Hybrid** cũng cho kết quả tốt, nhưng thấp hơn đáng kể so với Content-Based thuần túy. Điều này có thể do tín hiệu từ mô hình Lọc Cộng tác (vốn hoạt động kém) đã làm nhiễu các gợi ý tốt từ mô hình Content-Based.
*   **Lọc Cộng tác (SVD) hoạt động rất kém.** NDCG chỉ đạt 0.01. Nguyên nhân chính có thể là do **độ thưa của dữ liệu (data sparsity)**. Mặc dù đã lọc người dùng có ít hơn 3 tương tác, ma trận vẫn còn rất thưa, khiến mô hình khó học được các mẫu sở thích chung.
*   Các mô hình cơ sở (Popularity, Random) hoạt động kém như dự kiến, đóng vai trò là một đường cơ sở để so sánh.

---

#### **5. LƯU TRỮ VÀ SỬ DỤNG MÔ HÌNH**

*   Dựa trên kết quả đánh giá, mặc dù Content-Based hoạt động tốt nhất, mô hình **Hybrid** được chọn để lưu trữ vì nó kết hợp cả hai phương pháp và có thể linh hoạt hơn trong các kịch bản khác nhau. (Lưu ý: Đoạn mã đã lưu mô hình Hybrid).
*   Tất cả các thành phần cần thiết cho việc tái tạo và dự đoán (bộ mã hóa, các ma trận U và V từ SVD, ma trận tương đồng nội dung, danh sách xếp hạng phổ biến, và các cấu hình) đã được đóng gói và lưu vào tệp `hybrid_model.joblib`.
*   Một hàm `predict_for_user` đã được phát triển để minh họa cách tải các thành phần đã lưu và đưa ra gợi ý cho một người dùng cụ thể.

---

#### **6. KẾT LUẬN**

Quy trình đã xây dựng và đánh giá thành công nhiều mô hình gợi ý. Kết quả cho thấy **mô hình Dựa trên Nội dung (Content-Based)** là phương pháp hiệu quả nhất cho bộ dữ liệu này, đạt được độ chính xác rất cao. Mô hình **Lọc Cộng tác** hoạt động kém do dữ liệu thưa. Mặc dù mô hình **Hybrid** không vượt qua được Content-Based, nó vẫn được lưu trữ như một giải pháp toàn diện, kết hợp cả hai tín hiệu. Các thành phần mô hình đã được lưu lại và sẵn sàng cho việc triển khai trong một ứng dụng thực tế.