### **BÁO CÁO PHÂN TÍCH DỮ LIỆU KHÁM PHÁ (EDA): BỘ DỮ LIỆU SẢN PHẨM AMAZON**
**Dự án:** Phân tích Sản phẩm Amazon

---

#### **1. TỔNG QUAN**

**1.1. Mục tiêu**

Báo cáo này trình bày kết quả của giai đoạn Phân tích Dữ liệu Khám phá (Exploratory Data Analysis - EDA) được thực hiện trên bộ dữ liệu sản phẩm Amazon đã được làm sạch. Mục tiêu của phân tích này là:
*   Tóm tắt các đặc điểm chính của dữ liệu thông qua thống kê mô tả.
*   Trực quan hóa sự phân phối của các biến số quan trọng (phân tích đơn biến).
*   Khám phá các mối quan hệ, tương quan và xu hướng giữa các biến khác nhau (phân tích đa biến).
*   Rút ra các insight ban đầu về hành vi người mua, chiến lược định giá và đặc điểm của các sản phẩm thành công trong bộ dữ liệu.

**1.2. Dữ liệu sử dụng**

Phân tích được thực hiện trên bộ dữ liệu  `../data/processed/amazon.csv`, là kết quả của giai đoạn tiền xử lý trước đó.
*   **Số dòng:** 1,351
*   **Số cột:** 27
*   **Chất lượng:** Dữ liệu đã được làm sạch, không còn giá trị thiếu hay trùng lặp, các kiểu dữ liệu đã được chuẩn hóa.

---

#### **2. THỐNG KÊ MÔ TẢ (DESCRIPTIVE STATISTICS)**

**2.1. Các biến số (Numerical)**

*   **Đánh giá (`rating`):**
    *   Điểm đánh giá trung bình là **4.09**, cho thấy chất lượng sản phẩm chung được cảm nhận là rất cao.
    *   Độ lệch chuẩn thấp (**0.30**) và khoảng tứ phân vị (3.9 - 4.3) hẹp, chứng tỏ điểm đánh giá rất tập trung, không có sự chênh lệch quá lớn về chất lượng giữa các sản phẩm.
*   **Giá cả (`actual_price` & `discounted_price`):**
    *   Khoảng giá rất rộng, từ **39₫** đến **139,900₫** (giá gốc).
    *   Giá trị trung bình (`mean`) cao hơn đáng kể so với trung vị (`median`, 50%), cho thấy sự phân phối bị lệch phải mạnh bởi một số ít sản phẩm có giá trị rất cao. Giá trung vị (1,795₫) phản ánh đúng hơn mức giá phổ biến của sản phẩm.
*   **Số lượng đánh giá (`rating_count`):**
    *   Phân phối cực kỳ lệch, với trung bình là **17,618** nhưng trung vị chỉ là **4,736**. Điều này cho thấy đa số sản phẩm có ít đánh giá, trong khi một số ít sản phẩm "ngôi sao" có số lượng đánh giá rất lớn (tối đa lên tới **426,973**).
*   **Tỷ lệ giảm giá (`discount_percentage`):**
    *   Mức giảm giá trung bình là **46.7%**, một con số rất đáng kể. Hầu hết các sản phẩm được giảm giá từ **31%** đến **62%**.

**2.2. Các biến phân loại (Categorical)**

*   **Danh mục chính (`category_main`):**
    *   Có **9** danh mục chính.
    *   **"Electronics"** là danh mục phổ biến nhất, chiếm **490/1,351** sản phẩm (khoảng 36%).
*   **Loại sản phẩm (`product_type`):**
    *   Có **207** loại sản phẩm khác nhau, cho thấy sự đa dạng trong các danh mục.
    *   **"USBCables"** là loại sản phẩm xuất hiện nhiều nhất (**161** lần).
*   **Nhóm đánh giá (`rating_category`):**
    *   **"Excellent"** (Xuất sắc) là nhóm chiếm đa số với **852** sản phẩm.

---

#### **3. PHÂN TÍCH ĐƠN BIẾN (UNIVARIATE ANALYSIS)**

**3.1. Phân tích các biến số**

*   **1. Phân phối Điểm đánh giá:**
    *   **Insight:** Đánh giá sản phẩm tập trung cao ở khoảng 4.0-4.2 điểm. Phân phối lệch trái, cho thấy phần lớn sản phẩm trong bộ dữ liệu được người mua đánh giá rất tích cực.
    *   **Diễn giải:** Chất lượng chung của các sản phẩm là tốt. Các sản phẩm có đánh giá rất thấp (dưới 3.5) có thể đã bị người bán gỡ bỏ hoặc không thu hút được nhiều lượt mua, một cơ chế tự lọc của thị trường.

*   **2. Phân phối Giá gốc:**
    *   **Insight:** Phân phối lệch phải mạnh, với phần lớn sản phẩm có giá gốc tập trung ở mức thấp (0 - 20,000₫) và một "đuôi dài" các sản phẩm giá rất cao.
    *   **Diễn giải:** Bộ dữ liệu tập trung vào phân khúc sản phẩm giá rẻ và tầm trung. Giá trị trung bình sẽ bị ảnh hưởng bởi các sản phẩm đắt tiền, trong khi trung vị phản ánh tốt hơn mức giá phổ biến.

*   **3. Phân phối Số lượng đánh giá:**
    *   **Insight:** Phân phối lệch phải cực mạnh. Đa số sản phẩm có rất ít đánh giá, trong khi một số ít "sản phẩm chủ lực" có số lượng đánh giá vượt trội.
    *   **Diễn giải:** Tồn tại sự phân hóa rõ rệt về mức độ phổ biến. Số lượng đánh giá không phải là thước đo chất lượng cho phần lớn sản phẩm, mà là thước đo mức độ lan tỏa và tin dùng.

*   **4. Phân phối Tỷ lệ giảm giá:**
    *   **Insight:** Hầu hết sản phẩm đều có mức giảm giá đáng kể, tập trung trong khoảng 40% - 80%. Rất hiếm sản phẩm được bán với giá gốc.
    *   **Diễn giải:** Giảm giá là một chiến lược định giá cốt lõi trong bộ dữ liệu này. Giá niêm yết (giá gốc) có thể chỉ mang tính tham khảo, và người mua có thể đã hình thành kỳ vọng về các chương trình khuyến mãi lớn.

**3.2. Phân tích các biến phân loại**

*   **5. Phân bổ theo Danh mục chính:**
    *   **Insight:** Danh mục **"Electronics"** (Điện tử) chiếm ưu thế tuyệt đối, theo sau là **"Home&Kitchen"** (Nhà bếp & Gia dụng) và **"Computers&Accessories"** (Máy tính & Phụ kiện).
    *   **Diễn giải:** Bộ dữ liệu không phải là một mẫu đại diện cho toàn bộ Amazon mà là một lát cắt chuyên sâu vào một vài lĩnh vực chính, chủ yếu là đồ điện tử và gia dụng.

*   **6. Phân bố theo Nhóm đánh giá:**
    *   **Insight:** Phần lớn áp đảo các sản phẩm được xếp vào nhóm **"Excellent"** (Xuất sắc). Các nhóm đánh giá tiêu cực ("Poor", "Fair") gần như không có.
    *   **Diễn giải:** Sự hài lòng của khách hàng là rất cao. Điều này có thể do bộ dữ liệu chỉ bao gồm các sản phẩm đã được sàng lọc (ví dụ: bán chạy nhất) hoặc các danh mục này có tiêu chuẩn chất lượng cao và cơ chế loại bỏ sản phẩm kém hiệu quả.

---

#### **4. PHÂN TÍCH ĐA BIẾN (MULTIVARIATE ANALYSIS)**

**4.1. Ma trận tương quan**

*   **7. Phân tích Mối tương quan giữa các biến số:**
    *   **Insight chính:**
        1.  **Tương quan dương mạnh nhất (0.96)** là giữa `actual_price` và `discounted_price`. Điều này là hiển nhiên, cho thấy giá giảm được tính toán trực tiếp từ giá gốc.
        2.  **Gần như không có tương quan** giữa **Giá** (cả gốc và đã giảm) và **Điểm đánh giá (`rating`)**. Hệ số tương quan chỉ ~0.1.
        3.  Có một **mối tương quan nghịch nhẹ (-0.11)** giữa `rating` và `rating_count` (số lượng đánh giá).
    *   **Diễn giải:**
        *   Người mua không mặc định "đắt hơn là tốt hơn". Chất lượng cảm nhận không phụ thuộc vào mức giá.
        *   Các sản phẩm được đánh giá nhiều nhất không nhất thiết là những sản phẩm có điểm số cao nhất tuyệt đối. Có thể các sản phẩm ở mức "tốt" (4.0-4.2) thu hút được lượng người mua đông đảo hơn các sản phẩm ở thị trường ngách có điểm "xuất sắc" (4.5+).

**4.2. Phân tích chuyên sâu**

*   **8. Mối quan hệ giữa Điểm đánh giá và Giá sản phẩm:**
    *   **Insight:** Biểu đồ phân tán cho thấy các điểm dữ liệu phân bố thành một đám mây không có xu hướng rõ ràng. Các sản phẩm phổ biến nhất (chấm màu sáng) tập trung ở phân khúc giá thấp đến trung bình. Các sản phẩm giá rất cao có rất ít đánh giá (chấm màu sẫm).
    *   **Diễn giải:** Điều này trực quan hóa kết luận từ ma trận tương quan: giá cả không phải là yếu tố quyết định điểm đánh giá. Phân khúc sản phẩm giá cả phải chăng và chất lượng tốt là nơi thu hút nhiều sự chú ý nhất.

*   **9. Điểm đánh giá trung bình theo Danh mục:**
    *   **Insight:** Tất cả các danh mục đều có điểm đánh giá trung bình khá cao (trên 3.8). Trong các danh mục có cỡ mẫu lớn, `Computers&Accessories` (4.15) có điểm cao nhất, theo sau là `Electronics` (4.08).
    *   **Diễn giải:** Mức độ hài lòng của khách hàng cao trên diện rộng. Cần thận trọng với các kết luận từ những danh mục có cỡ mẫu quá nhỏ (n≤2).

*   **10. Phân phối giá theo Độ phổ biến:**
    *   **Insight:** Biểu đồ hộp cho thấy nhóm sản phẩm **phổ biến** (is_popular = 1) có **giá trung vị cao hơn** và **khoảng giá rộng hơn** đáng kể so với nhóm không phổ biến. Các sản phẩm giá trị cao nhất hầu hết đều thuộc nhóm phổ biến.
    *   **Diễn giải:** Các chiến dịch quảng bá hoặc sự phổ biến tự nhiên có xu hướng tập trung vào các sản phẩm có giá trị cao hơn. Mặc dù giá không tương quan với chất lượng, nhưng nó lại tương quan với mức độ phổ biến, có thể do lợi nhuận cao hơn thúc đẩy chi tiêu marketing.

*   **11. Phân phối Giá theo Danh mục (Violin Plot):**
    *   **Insight:** `Electronics` và `Computers&Accessories` có sự phân bố giá rộng nhất, từ rất rẻ đến rất đắt. Tuy nhiên, phần lớn sản phẩm trong các danh mục này vẫn tập trung ở phân khúc giá thấp. Các danh mục khác như `Office Products` có khoảng giá rất hẹp.
    *   **Diễn giải:** Biểu đồ này cung cấp cái nhìn chi tiết hơn về cấu trúc giá của từng ngành hàng, nhấn mạnh sự thống trị của các sản phẩm giá cả phải chăng ngay cả trong các danh mục đa dạng nhất.

*   **12 & 13. Phân tích hiệu quả Giảm giá:**
    *   **Insight:** `HomeImprovement` và `Computers&Accessories` có tỷ lệ giảm giá trung bình cao nhất. Tuy nhiên, biểu đồ phân tán cho thấy **không có mối quan hệ rõ ràng** giữa tỷ lệ giảm giá và điểm đánh giá.
    *   **Diễn giải:** Giảm giá sâu không "mua" được đánh giá tốt hơn. Đây là một chiến lược cạnh tranh về giá để thu hút sự chú ý, nhưng chất lượng cảm nhận của người mua vẫn là một yếu tố độc lập.

**4.3. Phân tích Phản hồi của Khách hàng (Word Clouds)**

Để hiểu sâu hơn về *lý do* đằng sau các điểm đánh giá, chúng tôi đã thực hiện phân tích tần suất từ trong nội dung đánh giá của khách hàng.

*   **Khách hàng tập trung vào các yếu tố thực tế và tính năng cốt lõi.** 
    *   **Insight:** Các từ khóa có tần suất xuất hiện cao nhất là "phone", "product", "quality", "price", "easy", "use".
    *   **Diễn giải:** Người mua đánh giá sản phẩm dựa trên các tiêu chí rõ ràng: sản phẩm là gì, chất lượng ra sao, giá cả thế nào và có dễ sử dụng không, thay vì các cảm xúc mơ hồ.

*   **Bộ dữ liệu bị chi phối mạnh mẽ bởi các sản phẩm liên quan đến điện thoại.** 
    *   **Insight:** Từ "phone" có kích thước rất lớn, cùng với các từ liên quan như "charging", "cable", "sound".
    *   **Diễn giải:** Điều này khẳng định rằng các phản hồi chủ yếu phản ánh trải nghiệm của người dùng đối với thị trường điện thoại di động và phụ kiện.

*   **Xu hướng chung của các phản hồi là tích cực và hài lòng.** 
    *   **Insight:** Từ "good" là từ được lặp lại nhiều nhất một cách áp đảo, vượt trội hơn cả các từ chung chung như "product". Từ "nice" cũng xuất hiện với tần suất đáng kể.
    *   **Diễn giải:** Đây là một chỉ báo rất mạnh mẽ, củng cố thêm cho kết quả phân tích định lượng rằng phần lớn các đánh giá trong bộ dữ liệu này thể hiện sự hài lòng của người mua.
---

#### **5. TÓM TẮT VÀ KẾT LUẬN**

Bộ dữ liệu này vẽ nên một bức tranh về một thị trường trực tuyến năng động, nơi chất lượng sản phẩm được cảm nhận rất cao và các chiến lược định giá, đặc biệt là giảm giá, đóng vai trò trung tâm.

*   **Chất lượng không đi đôi với giá cả:** Điểm nổi bật nhất là sự hài lòng áp đảo của khách hàng, và sự hài lòng này độc lập với giá niêm yết hay giá sau khi giảm. Người mua trong bộ dữ liệu này tập trung vào **giá trị thực tế** (value for money).

*   **"Điểm ngọt" của sự phổ biến:** Các sản phẩm thành công nhất (phổ biến nhất) thường nằm ở phân khúc **giá tầm trung, được giảm giá sâu và có điểm đánh giá cao**. Đây là những sản phẩm cân bằng được giữa chất lượng và giá cả, tạo ra sức hút lớn nhất.

*   **Tập trung vào ngành hàng Điện tử:** Toàn bộ bức tranh này bị chi phối mạnh mẽ bởi các danh mục **Electronics, Home&Kitchen, và Computers&Accessories**. Do đó, các kết luận này chỉ mang tính đại diện cho các ngành hàng này và cần cẩn trọng khi áp dụng cho các lĩnh vực khác.

Tóm lại, bộ dữ liệu này cho thấy một hệ sinh thái sản phẩm thành công, nơi niềm tin của người mua được xây dựng trên chất lượng cao, và các nhà bán hàng cạnh tranh chủ yếu thông qua các chương trình giảm giá hấp dẫn để thu hút sự chú ý trong các danh mục lớn.