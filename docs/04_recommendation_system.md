### **BÁO CÁO XÂY DỰNG HỆ THỐNG GỢI Ý SẢN PHẨM AMAZON**

---

#### **1. TỔNG QUAN**

**1.1. Mục tiêu**

Báo cáo này trình bày quy trình xây dựng, đánh giá và so sánh nhiều loại mô hình gợi ý sản phẩm khác nhau. Mục tiêu chính bao gồm:
*   Chuẩn bị và biến đổi dữ liệu tương tác người dùng-sản phẩm.
*   Xây dựng và triển khai các hệ thống gợi ý dựa trên các phương pháp:
    *   Lọc dựa trên Nội dung (Content-Based Filtering)
    *   Lọc Cộng tác (Collaborative Filtering)
    *   Kết hợp (Hybrid)
*   Đánh giá hiệu suất của các mô hình bằng các chỉ số xếp hạng (ranking metrics) như NDCG@10, HitRate@10, và Recall@10.
*   Lựa chọn mô hình có hiệu suất tốt nhất và lưu trữ các thành phần của nó để có thể tái sử dụng.
*   Cung cấp một hàm dự đoán để đưa ra gợi ý cho người dùng cụ thể.

**1.2. Dữ liệu sử dụng**

Phân tích được thực hiện trên bộ dữ liệu '../data/processed/amazon.csv'`, chứa thông tin chi tiết về sản phẩm và ID người dùng đã tương tác.

---

#### **2. CHUẨN BỊ VÀ BIẾN ĐỔI DỮ LIỆU**

**2.1. Cấu hình và Thiết lập**

*   Một lớp cấu hình (`NBConfig`) được thiết lập để quản lý các tham số quan trọng như đường dẫn dữ liệu, thư mục lưu mô hình, số nhân tố tiềm ẩn (latent factors) cho SVD, và các ngưỡng lọc.

**2.2. Tải và Chuẩn bị Dữ liệu Tương tác**

*   **Tải dữ liệu:** Dữ liệu đã xử lý được tải từ `amazon.csv`.
*   **"Bùng nổ" (Explode) Tương tác:** Cột `user_id` ban đầu chứa danh sách các ID người dùng được ngăn cách bởi dấu phẩy. Dữ liệu được biến đổi để mỗi hàng chỉ đại diện cho một tương tác duy nhất giữa một người dùng và một sản phẩm.
*   **Làm sạch và Lọc:**
    *   Loại bỏ các hàng có giá trị thiếu trong các cột cần thiết (`user_id`, `product_id`, `rating`, v.v.).
    *   Chỉ giữ lại các tương tác duy nhất giữa người dùng và sản phẩm.
    *   Để giảm nhiễu và tăng độ tin cậy, chỉ những người dùng có ít nhất **3 tương tác** (`min_interactions`) mới được giữ lại.

---

#### **3. CHIẾN LƯỢC ĐÁNH GIÁ: LEAVE-ONE-OUT SPLIT**

Để đánh giá hiệu suất của hệ thống gợi ý một cách thực tế, chiến lược "Leave-One-Out" đã được áp dụng:

*   **Phương pháp:** Đối với mỗi người dùng, tương tác có điểm `rating` cao nhất (và gần đây nhất, dựa trên một yếu tố ngẫu nhiên nhỏ) được chọn làm **tập kiểm tra (test set)**. Tất cả các tương tác còn lại của người dùng đó được đưa vào **tập huấn luyện (train set)**.
*   **Lý do:** Chiến lược này mô phỏng một kịch bản thực tế, nơi chúng ta cố gắng dự đoán sản phẩm tiếp theo mà người dùng có thể sẽ thích, dựa trên lịch sử tương tác của họ.
*   **Kết quả phân chia:**
    *   **Tập huấn luyện:** 1000 tương tác
    *   **Tập kiểm tra:** 357 tương tác

---

#### **4. XÂY DỰNG CÁC THÀNH PHẦN MÔ HÌNH**

**4.1. Bộ Mã hóa và Ma trận Người dùng-Sản phẩm (UPM)**

*   **Bộ mã hóa (Encoders):** `LabelEncoder` được sử dụng để chuyển đổi các `user_id` và `product_id` dạng chuỗi sang các chỉ số số nguyên, thuận tiện cho việc tạo ma trận.
*   **Ma trận UPM (User-Product Matrix):**
    *   Một ma trận thưa (`csr_matrix`) được xây dựng với kích thước (357 người dùng × 239 sản phẩm).
    *   Các giá trị trong ma trận là điểm `rating`.
    *   **Chuẩn hóa:** Để giảm thiểu ảnh hưởng của sự khác biệt trong thang điểm của mỗi người dùng, các điểm rating được chuẩn hóa bằng cách trừ đi điểm rating trung bình của người dùng đó (center by user).

**4.2. Mô hình Cơ sở (Baseline): Mức độ Phổ biến (Popularity)**

*   **Phương pháp:** Các sản phẩm được xếp hạng dựa trên một điểm số phổ biến, được tính toán bằng cách kết hợp điểm rating trung bình (sử dụng phương pháp Bayesian để giảm ảnh hưởng của các sản phẩm ít đánh giá) và logarit của số lượng đánh giá.
*   **Mục đích:** Mô hình này đóng vai trò là một đường cơ sở đơn giản để so sánh. Nó gợi ý những sản phẩm phổ biến nhất cho tất cả người dùng.

**4.3. Mô hình Lọc dựa trên Nội dung (Content-Based)**

*   **Phương pháp:**
    1.  Tạo một "văn bản đại diện" cho mỗi sản phẩm bằng cách kết hợp các thông tin văn bản như `category_main`, `about_product`, và `product_name`.
    2.  Sử dụng `TfidfVectorizer` để chuyển đổi các văn bản này thành các vector đặc trưng.
    3.  Tính toán ma trận tương đồng cosine (`cosine_similarity`) giữa tất cả các sản phẩm.
*   **Logic gợi ý:** Dựa trên sản phẩm cuối cùng mà người dùng đã tương tác, mô hình sẽ gợi ý những sản phẩm có nội dung tương đồng nhất.

**4.4. Mô hình Lọc Cộng tác (Collaborative Filtering) - SVD**

*   **Phương pháp:**
    1.  Áp dụng `TruncatedSVD` (Phân rã Giá trị Suy biến) lên ma trận UPM.
    2.  SVD phân rã ma trận UPM thành hai ma trận có chiều thấp hơn:
        *   **U (User-feature matrix):** Đại diện cho người dùng trong không gian các nhân tố tiềm ẩn (357 × 64).
        *   **V (Item-feature matrix):** Đại diện cho sản phẩm trong cùng không gian đó (239 × 64).
*   **Logic gợi ý:** Để gợi ý cho một người dùng, chúng ta lấy vector của người dùng đó trong ma trận U và nhân với ma trận V chuyển vị. Kết quả là một vector điểm số dự đoán cho tất cả các sản phẩm. Những sản phẩm có điểm số cao nhất (và chưa được người dùng tương tác) sẽ được gợi ý.

---

#### **5. ĐÁNH GIÁ HIỆU SUẤT CÁC MÔ HÌNH**

**5.1. Các chỉ số Đánh giá**

*   **NDCG@10 (Normalized Discounted Cumulative Gain):** Đo lường chất lượng xếp hạng của 10 gợi ý đầu tiên. Chỉ số này thưởng cho việc xếp các sản phẩm liên quan ở vị trí cao hơn.
*   **HitRate@10:** Tỷ lệ người dùng nhận được ít nhất một gợi ý chính xác trong top 10.
*   **Recall@10:** Tỷ lệ sản phẩm liên quan thực tế được tìm thấy trong top 10 gợi ý.

**5.2. Bảng Kết quả**

| Model | NDCG@10 | HitRate@10 | Recall@10 |
| :--- | :--- | :--- | :--- |
| **Content-Based** | **0.8168** | **0.86** | **0.86** |
| Hybrid | 0.8160 | 0.86 | 0.86 |
| Collaborative | 0.0266 | 0.04 | 0.04 |
| Random | 0.0149 | 0.04 | 0.04 |
| Popularity | 0.0000 | 0.00 | 0.00 |

**5.3. Phân tích Kết quả**

*   **Content-Based là Mô hình Vượt trội nhất:**
    *   **Insight:** Mô hình dựa trên nội dung đạt được hiệu suất cao nhất một cách đáng kể, với **NDCG@10 là 0.8168**. Điều này cho thấy trong bộ dữ liệu này, việc gợi ý các sản phẩm tương tự về mặt văn bản (danh mục, mô tả) là một chiến lược rất hiệu quả. Mô hình Hybrid, mặc dù kết hợp cả hai phương pháp, nhưng không cải thiện đáng kể so với mô hình nội dung thuần túy.

*   **Collaborative Filtering Hoạt động Kém:**
    *   **Insight:** Mô hình lọc cộng tác dựa trên SVD có hiệu suất rất thấp, chỉ nhỉnh hơn một chút so với mô hình ngẫu nhiên. Lý do chính có thể là do **độ thưa của dữ liệu (data sparsity)**. Ngay cả sau khi lọc, ma trận tương tác vẫn còn rất thưa, khiến SVD khó có thể học được các mẫu cộng tác một cách hiệu quả.

*   **Các Mô hình Cơ sở không Hiệu quả:**
    *   **Insight:** Cả `Popularity` và `Random` đều không thể đưa ra các gợi ý phù hợp, cho thấy sự cần thiết của các phương pháp cá nhân hóa. `Popularity` có kết quả bằng 0, cho thấy không có sản phẩm phổ biến nào nằm trong tập kiểm tra của những người dùng được chọn.

**Kết luận:** Dựa trên các chỉ số đánh giá, **Content-Based** được chọn là mô hình tốt nhất cho bài toán này. Tuy nhiên, mô hình Hybrid vẫn được lưu trữ vì tiềm năng của nó trong các bộ dữ liệu dày đặc hơn.

---

#### **6. LƯU TRỮ VÀ SỬ DỤNG MÔ HÌNH**

*   **Lưu trữ:**
    *   Tất cả các thành phần cần thiết để tái tạo các mô hình (bộ mã hóa, ma trận SVD, ma trận tương đồng nội dung, v.v.) đã được lưu vào một tệp duy nhất `hybrid_model.joblib`.

**Kết luận cuối cùng:** Quy trình đã xây dựng và đánh giá thành công nhiều hệ thống gợi ý, trong đó mô hình **dựa trên nội dung** cho thấy hiệu suất vượt trội. Các thành phần mô hình đã được lưu lại một cách có hệ thống, sẵn sàng cho việc tích hợp vào một ứng dụng thực tế.