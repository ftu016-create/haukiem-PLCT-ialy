import { RawSheetRecord } from '../types';

/**
 * Raw CSV data directly from the user's Google Sheets / Field Audit dataset
 */
export const DEFAULT_RAW_CSV = `STT,Mã PCT,Tên Công Việc,Người Hậu Kiểm,Email Hậu Kiểm,Đơn Vị Công Tác,Người Cấp Phiếu,Người CHTT,Người Cho Phép,Kết Quả,Điểm An Toàn (%),Số Lỗi Phát Hiện,Danh Sách Lỗi,Ngày Hậu Kiểm
1,PHIẾU CÔNG TÁC SỐ 429_2026_VHIALY-TĐIAL,Phiếu công tác này có nhiều thiếu sót nghiêm trọng về thủ tục kết thúc công tác và kiểm soát nhân sự. Các chữ ký xác nhậ,Đỗ Thanh Phong,thanhphongialy@gmail.com,Phân xưởng Vận hành Ialy,Nguyễn Tiến Danh,Nguyễn Quốc Công,Phạm Văn Toàn,Có sai sót,0%,10,[CRITICAL] Thiếu chữ ký hoàn thành công việc của CHTT (Điều 30 Quy trình 278) ; [CRITICAL] Thiếu thời gian hoàn thành công việc (Điều 30 Quy trình 278) ; [CRITICAL] Thiếu chữ ký khóa phiếu của Người cho phép (Điều 31 Quy trình 278) ; [CRITICAL] Thiếu thời gian khóa phiếu (Điều 31 Quy trình 278) ; [CRITICAL] Thiếu chữ ký kiểm tra hoàn thành phiếu của Người cấp phiếu (Điều 31 Quy trình 278) ; [CRITICAL] Thiếu chữ ký ra khỏi vị trí làm việc của nhân viên (Điều 14 Quy trình 278) ; [CRITICAL] Nhiều nhân viên thiếu ghi nhận vào/ra vị trí làm việc (Điều 14 Quy trình 278) ; [WARNING] Thiếu xác nhận thủ tục kết thúc công tác (Điều 30 Quy trình 278) ; [WARNING] Phạm vi làm việc không rõ ràng (Điều 20 Quy trình 278) ; [WARNING] Thiếu kiểm tra hoặc xác nhận BPAT bổ sung (Điều 25 Quy trình 278),2026-09-17
2,PCT-092026-002,"Phiếu công tác này có nhiều thiếu sót nghiêm trọng trong việc ghi nhận biện pháp an toàn và tiếp địa, đặc biệt là phần t",QLKT,qlktpxvhialy@gmail.com,Phân xưởng Vận hành Ialy,Hoàng Tấn Hùng,Trần Văn Thi,Trần Văn Thiên,Có sai sót,35%,4,[WARNING] Thiếu xác nhận biện pháp an toàn bổ sung của đơn vị công tác (Điều 25 Quy trình 278 (Bỏ ngỏ bảng kiểm tra an toàn hiện trường)) ; [CRITICAL] Bỏ trống phần ghi nhận biện pháp an toàn và tiếp đất bổ sung (Điều 25 Quy trình 278 (Không làm thêm tiếp đất di động của CHTT nếu có yêu cầu an toàn)) ; [CRITICAL] Bỏ trống phần ghi nhận tiếp đất của đơn vị vận hành (Điều 25 Quy trình 278 & Điều 44 Quy trình 278 (Thiếu chữ ký người thắt tiếp đất)) ; [INFO] Thiếu xác nhận hiểu rõ phạm vi công việc của nhân viên công tác (Điều 20 Quy trình 278 (Thiếu phổ biến an toàn công việc cụ thể)),2026-09-14
1,429/2026/VHIALY-TÐIAL,Sửa chữa lớn Máy nén khí Sauer WP6310 (MNK2) NMTĐ Ialy,QLKT,qlktpxvhialy@gmail.com,CÔNG TY THỦY ĐIỆN IALY,Nguyễn Tiến Danh,Nguyễn Quốc Công,Phạm Văn Toàn,Có sai sót,60%,8,"[CRITICAL] undefined (Điều 31 Quy trình 278/QĐ-EVN) ; [CRITICAL] undefined (Điều 28 Quy trình 278/QĐ-EVN) ; [CRITICAL] undefined (Điều 31 và Điều 29 Quy trình 278/QĐ-EVN) ; [CRITICAL] undefined (Điều 30 Quy trình 278/QĐ-EVN) ; [CRITICAL] undefined (Điều 31 Quy trình 278/QĐ-EVN) ; [WARNING] undefined (Điều 14, Điều 28 Quy trình 278/QĐ-EVN) ; [WARNING] undefined (Điều 14, Điều 28 Quy trình 278/QĐ-EVN) ; [WARNING] undefined (Điều 25 Quy trình 278/QĐ-EVN)",2026-09-17
1,427/2026/VHIALY-TÐIAL,Sửa chữa thường xuyên Trung tâm thông gió đẩy Quạt Đ5; Quạt Đ7 - Nhà máy thủy điện Ialy.,Đỗ Thanh Phong,thanhphongialy@gmail.com,Công ty Thủy điện Ialy,Người cấp phiếu (Chưa rõ),Người CHTT (Chưa rõ),Người cho phép (Chưa rõ),Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 427_2026_VHIALY-TĐIAL.pdf (Kỳ Tháng 09/2026),2026-09-24
1,427/2026/VHIALY-TÐIAL,Sửa chữa thường xuyên Trung tâm thông gió đẩy Quạt Đ5; Quạt Đ7 - Nhà máy thủy điện Ialy.,Đỗ Thanh Phong,thanhphongialy@gmail.com,Công ty Thủy điện Ialy,Người cấp phiếu (Chưa rõ),Người CHTT (Chưa rõ),Người cho phép (Chưa rõ),Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 427_2026_VHIALY-TĐIAL.pdf (Kỳ Tháng 09/2026),2026-09-24
1,429/2026/VHIALY-TĐIAL,Sửa chữa lớn Máy nén khí Sauer WP6310 (MNK2) NMTĐ Ialy,Đỗ Thanh Phong,thanhphongialy@gmail.com,CÔNG TY THỦY ĐIỆN IALY,Nguyễn Tiến Danh,Nguyễn Quốc Công,Phạm Văn Toàn,Có sai sót,0%,8,[WARNING] undefined (Điều 25 Quy trình 278) ; [WARNING] undefined (Điều 25 Quy trình 278) ; [WARNING] undefined (Điều 14 Quy trình 278) ; [WARNING] undefined (Điều 28 Quy trình 278) ; [CRITICAL] undefined (Điều 30 Quy trình 278) ; [WARNING] undefined (Điều 30 Quy trình 278) ; [CRITICAL] undefined (Điều 31 Quy trình 278) ; [WARNING] undefined (Điều 31 Quy trình 278),2026-09-24
1,2026/06/PCT-NX01,Bảo dưỡng định kỳ / Thử nghiệm thiết bị trạm điện,Đỗ Thanh Phong,thanhphongialy@gmail.com,Phân xưởng Vận hành Ialy (PXVHIALY),Nguyễn Đức Hải (Phó Giám đốc kỹ thuật),Trần Văn Tuấn,Lê Minh Quang (Trưởng ca vận hành),Có sai sót,50%,2,[CRITICAL] Nghịch lý thời gian: Người cho phép ký trước Người cấp phiếu (Điều 14 & Điều 28 Quy trình 278/QĐ-EVN) ; [CRITICAL] Chỉ huy trực tiếp cho bắt đầu làm việc trước khi Người cho phép bàn giao (Điều 28 Quy trình 278/QĐ-EVN),2026-09-24
1,2026/06/PCT-NX01,Bảo dưỡng định kỳ / Thử nghiệm thiết bị trạm điện,Đỗ Thanh Phong,thanhphongialy@gmail.com,Phân xưởng Vận hành Ialy (PXVHIALY),Nguyễn Đức Hải (Phó Giám đốc kỹ thuật),Trần Văn Tuấn,Lê Minh Quang (Trưởng ca vận hành),Có sai sót,50%,2,[CRITICAL] Nghịch lý thời gian: Người cho phép ký trước Người cấp phiếu (Điều 14 & Điều 28 Quy trình 278/QĐ-EVN) ; [CRITICAL] Chỉ huy trực tiếp cho bắt đầu làm việc trước khi Người cho phép bàn giao (Điều 28 Quy trình 278/QĐ-EVN),2026-09-24
1,CHƯA XÁC ĐỊNH SỐ PCT,Công tác theo Phiếu công tác (Chưa rõ nội dung cụ thể),Đỗ Thanh Phong,thanhphongialy@gmail.com,Đơn vị công tác hiện trường,Người cấp phiếu,Người chỉ huy trực tiếp,Người cho phép (Trực ban / Trưởng ca),Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 453_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-28
2,CHƯA XÁC ĐỊNH SỐ PCT,Công tác theo Phiếu công tác (Chưa rõ nội dung cụ thể),Đỗ Thanh Phong,thanhphongialy@gmail.com,Đơn vị công tác hiện trường,Người cấp phiếu,Người chỉ huy trực tiếp,Người cho phép (Trực ban / Trưởng ca),Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 454_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-28
1,CHƯA XÁC ĐỊNH SỐ PCT,Công tác theo Phiếu công tác (Chưa rõ nội dung cụ thể),Đỗ Thanh Phong,thanhphongialy@gmail.com,Đơn vị công tác hiện trường,Người cấp phiếu,Người chỉ huy trực tiếp,Người cho phép (Trực ban / Trưởng ca),Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 453_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-28
1,136/2026/VHSS3-TĐIAL,Cải tạo mạch điều khiển dừng tự động tại hành trình nâng lên 50mm cửa van VHSC của CNN H1 theo Phương án kỹ thuật đã dược duyệt,PhongHK,thanhphongihpc@gmail.com,Phân xưởng vận hành Sê San 3,Trương Quang Vinh,Trần Đăng Khoa,Phạm Tuấn,Hợp lệ,80%,4,"[WARNING] Thiếu bậc an toàn điện của các chức danh trong Phiếu công tác (Điều 6, 7, 12, 14) ; [WARNING] Để trống ô biện pháp an toàn làm thêm của Đơn vị công tác (Mục 3.2) (Điều 25) ; [INFO] Chưa ghi rõ tên đơn vị công tác tại Mục 1 (Cấp cho) (Điều 20) ; [INFO] Lỗi chính tả tại Mục 2.5 (Điều 20)",2026-09-29
2,150_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 150_2026_VHIALY-TĐIAL,PhongHK,thanhphongihpc@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 150_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-29
1,150_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 150_2026_VHIALY-TĐIAL,PhongHK,thanhphongihpc@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 150_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-29
2,136/2026/VHSS3-TĐIAL,Cải tạo mạch điều khiển dừng tự động tại hành trình nâng lên 50mm cửa van VHSC của CNN H1 theo Phương án kỹ thuật đã dược duyệt,PhongHK,thanhphongihpc@gmail.com,Phân xưởng vận hành Sê San 3,Trương Quang Vinh,Trần Đăng Khoa,Phạm Tuấn,Hợp lệ,80%,4,"[WARNING] Thiếu bậc an toàn điện của các chức danh trong Phiếu công tác (Điều 6, 7, 12, 14) ; [WARNING] Để trống ô biện pháp an toàn làm thêm của Đơn vị công tác (Mục 3.2) (Điều 25) ; [INFO] Chưa ghi rõ tên đơn vị công tác tại Mục 1 (Cấp cho) (Điều 20) ; [INFO] Lỗi chính tả tại Mục 2.5 (Điều 20)",2026-09-29
1,457_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 457_2026_VHIALY-TĐIAL,Đỗ Thanh Phong,thanhphongialy@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 457_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
2,459_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 459_2026_VHIALY-TĐIAL,Đỗ Thanh Phong,thanhphongialy@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 459_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
1,459_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 459_2026_VHIALY-TĐIAL,Đỗ Thanh Phong,thanhphongialy@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 459_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
2,457_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 457_2026_VHIALY-TĐIAL,Đỗ Thanh Phong,thanhphongialy@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 457_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
3,150_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 150_2026_VHIALY-TĐIAL,PhongHK,thanhphongihpc@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 150_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-29
4,136/2026/VHSS3-TĐIAL,Cải tạo mạch điều khiển dừng tự động tại hành trình nâng lên 50mm cửa van VHSC của CNN H1 theo Phương án kỹ thuật đã dược duyệt,PhongHK,thanhphongihpc@gmail.com,Phân xưởng vận hành Sê San 3,Trương Quang Vinh,Trần Đăng Khoa,Phạm Tuấn,Hợp lệ,80%,4,"[WARNING] Thiếu bậc an toàn điện của các chức danh trong Phiếu công tác (Điều 6, 7, 12, 14) ; [WARNING] Để trống ô biện pháp an toàn làm thêm của Đơn vị công tác (Mục 3.2) (Điều 25) ; [INFO] Chưa ghi rõ tên đơn vị công tác tại Mục 1 (Cấp cho) (Điều 20) ; [INFO] Lỗi chính tả tại Mục 2.5 (Điều 20)",2026-09-29
1,459_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 459_2026_VHIALY-TĐIAL,Đỗ Thanh Phong,thanhphongialy@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 459_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
2,457_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 457_2026_VHIALY-TĐIAL,Đỗ Thanh Phong,thanhphongialy@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 457_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
1,PCT-2026/08/042,Bảo dưỡng định kỳ Tổ máy H1 - NMTĐ Ialy,Đỗ Thanh Phong,thanhphongialy@gmail.com,Phân xưởng Sửa chữa Cơ nhiệt,Lê Minh Tuấn,Hoàng Văn Nam,Đỗ Quốc Hùng,Có sai sót,65%,2,[CRITICAL] Sai trình tự thời gian ký cho phép (Điều 14 Quy trình 278/QĐ-EVN) ; [WARNING] Thiếu chữ ký kết thúc ngày làm việc (Điều 28 Quy trình 278/QĐ-EVN),2026-08-12
2,PCT-2026/08/045,Thí nghiệm định kỳ rơ le bảo vệ ngăn 571 - NMTĐ Se San 3,Nguyễn Văn Hậu,haukiem.ialy@evn.com.vn,Phân xưởng Tự động hóa,Nguyễn Đức Anh,Hoàng Văn Nam,Trần Bảo Long,Có sai sót,70%,1,[WARNING] Nội dung công việc ghi chung chung (Điều 20 Quy trình 278/QĐ-EVN),2026-08-12
3,PCT-2026/08/048,Sửa chữa hệ thống dầu áp lực nâng van cung - NMTĐ Pleikrông,Nguyễn Văn Hậu,haukiem.ialy@evn.com.vn,Đội Sửa chữa Thủy lực,Lê Minh Tuấn,Vũ Đình Trọng,Đỗ Quốc Hùng,Hợp lệ,100%,0,Không phát hiện lỗi,2026-08-11
4,PCT-2026/08/050,Thay thế cáp động lực máy cắt 431 - NMTĐ Ialy,Phạm Văn An,phamvanan@evn.com.vn,Phân xưởng Sửa chữa Điện,Lê Minh Tuấn,Phạm Quốc Bảo,Trần Bảo Long,Có sai sót,50%,2,[CRITICAL] Chưa tích xác nhận làm thêm tiếp đất di động (Điều 25 Quy trình 278/QĐ-EVN) ; [WARNING] Quá thời hạn khóa phiếu trên hệ thống (Điều 31 Quy trình 278/QĐ-EVN),2026-08-10
5,PCT-2026/08/052,Kiểm tra định kỳ máy biến áp T1 110kV,Nguyễn Thanh Phong,thanhphongialy@gmail.com,Phân xưởng Vận hành Ialy,Nguyễn Đức Anh,Hoàng Văn Nam,Đỗ Quốc Hùng,Hợp lệ,95%,0,Không phát hiện lỗi,2026-08-09
1,150_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 150_2026_VHIALY-TĐIAL,Phùng Ngọc Tú,f.tu016@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 150_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
2,152_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 152_2026_VHIALY-TĐIAL,Phùng Ngọc Tú,f.tu016@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 152_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
3,451_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 451_2026_VHIALY-TĐIAL,Phùng Ngọc Tú,f.tu016@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 451_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
4,452_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 452_2026_VHIALY-TĐIAL,Phùng Ngọc Tú,f.tu016@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 452_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
5,453_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 453_2026_VHIALY-TĐIAL,Phùng Ngọc Tú,f.tu016@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 453_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
6,454_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 454_2026_VHIALY-TĐIAL,Phùng Ngọc Tú,f.tu016@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 454_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
7,455_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 455_2026_VHIALY-TĐIAL,Phùng Ngọc Tú,f.tu016@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 455_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
8,456_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 456_2026_VHIALY-TĐIAL,Phùng Ngọc Tú,f.tu016@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 456_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
9,457_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 457_2026_VHIALY-TĐIAL,Phùng Ngọc Tú,f.tu016@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 457_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
10,459_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 459_2026_VHIALY-TĐIAL,Phùng Ngọc Tú,f.tu016@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 459_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
1,404_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 404_2026_VHIALY-TĐIAL,Phùng Ngọc Tú,f.tu016@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 404_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
1,431_2026_VHIALY-TĐIAL,Công tác theo Phiếu công tác: Phiếu công tác số 431_2026_VHIALY-TĐIAL,Phùng Ngọc Tú,f.tu016@gmail.com,Phân xưởng Vận hành Ialy,,,Người cho phép,Hợp lệ,100%,0,Soát hàng loạt tự động từ tệp: Phiếu công tác số 431_2026_VHIALY-TĐIAL.pdf (PCT - Kỳ Tháng 09/2026),2026-09-30
1,311/2026/VHIALY-TĐIAL,"Thay đổi giá trị đặt chênh áp trước và sau van đĩa H2 để cho phép van đĩa mở tự động từ 2,0 kgf/cm2 lên 4,0 kgf/cm2 theo chương trình số 2234/PX3 ngày 23/9/2026 đã được phê duyệt",Phùng Ngọc Tú,f.tu016@gmail.com,Phân xưởng Sửa chữa,Phạm Văn Toàn,Phan Minh Long,Không áp dụng (LCT),Hợp lệ,85%,3,"[WARNING] Thời gian bắt đầu công việc trước thời gian nhân viên đến làm việc (Điều 14, Điều 16 Quy trình 278/QĐ-EVN) ; [INFO] Chưa đồng nhất giữa vị trí tủ công tác và tên thiết bị công nghệ (Điều 20 Quy trình 278/QĐ-EVN) ; [INFO] Chữ ký nhân viên công tác chưa rõ nét (Điều 14 Quy trình 278/QĐ-EVN)",2026-09-30`;

/**
 * Robust CSV parser that handles commas inside quotes, unescaped quotes, and trims fields.
 */
export function parseCSVToRawRecords(csvText: string): RawSheetRecord[] {
  if (!csvText || !csvText.trim()) return [];

  // Split into lines while respecting quotes that span multiple lines
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  const cleanText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote: "" -> "
        currentField += '"';
        i++;
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !inQuotes) {
      // End of record
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Push lingering field if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  if (rows.length === 0) return [];

  // Check header or filter repeated headers
  // Tự động nhận diện tiêu đề cột nếu có
  let headerMap: { [key: string]: number } = {};
  let startIndex = 0;
  if (rows.length > 0) {
    const firstRowLower = rows[0].map((c) => c.toLowerCase().trim());
    const isHeader = firstRowLower.some(
      (c) => c.includes('mã') || c.includes('công việc') || c.includes('ngày') || c.includes('kết quả')
    );
    if (isHeader) {
      firstRowLower.forEach((colName, colIdx) => {
        if (colName.includes('stt')) headerMap['stt'] = colIdx;
        else if (colName.includes('mã') || colName.includes('code')) headerMap['code'] = colIdx;
        else if (colName.includes('công việc') || colName.includes('tên cv')) headerMap['jobName'] = colIdx;
        else if (colName.includes('người hậu kiểm') || colName.includes('người kiểm')) headerMap['inspectorName'] = colIdx;
        else if (colName.includes('email')) headerMap['inspectorEmail'] = colIdx;
        else if (colName.includes('đơn vị')) headerMap['unit'] = colIdx;
        else if (colName.includes('cấp phiếu')) headerMap['issuer'] = colIdx;
        else if (colName.includes('chtt') || colName.includes('chỉ huy')) headerMap['leader'] = colIdx;
        else if (colName.includes('cho phép')) headerMap['approver'] = colIdx;
        else if (
          colName.includes('nhân viên') ||
          colName.includes('nvdvct') ||
          colName.includes('nvđvct') ||
          colName.includes('nvđct') ||
          colName.includes('đội công tác')
        ) {
          headerMap['workers'] = colIdx;
        } else if (colName.includes('ra lệnh') || colName.includes('nrl')) {
          headerMap['orderGiver'] = colIdx;
        } else if (colName.includes('giám sát') || colName.includes('gsat')) {
          headerMap['supervisor'] = colIdx;
        } else if (colName.includes('kết quả')) headerMap['result'] = colIdx;
        else if (colName.includes('điểm') || colName.includes('score')) headerMap['safetyScore'] = colIdx;
        else if (colName.includes('số lỗi')) headerMap['errorCount'] = colIdx;
        else if (colName.includes('danh sách lỗi') || colName.includes('nội dung lỗi')) headerMap['rawErrors'] = colIdx;
        else if (colName.includes('ngày')) headerMap['auditDate'] = colIdx;
      });
      startIndex = 1;
    }
  }

  const getCol = (row: string[], key: string, fallbackIdx?: number): string => {
    if (headerMap[key] !== undefined && row[headerMap[key]] !== undefined) {
      return row[headerMap[key]];
    }
    if (fallbackIdx !== undefined && row[fallbackIdx] !== undefined) {
      return row[fallbackIdx];
    }
    return '';
  };

  const dataRows: RawSheetRecord[] = [];
  for (let idx = startIndex; idx < rows.length; idx++) {
    const row = rows[idx];
    if (row.length < 4) continue;

    // Check if this row is a repeated header row (e.g. STT, Mã PCT...)
    const firstCol = (row[0] || '').trim().toUpperCase();
    const secondCol = (row[1] || '').trim().toUpperCase();
    if (firstCol === 'STT' && (secondCol.includes('MÃ') || secondCol.includes('MA') || secondCol.includes('PCT'))) {
      continue;
    }

    const record: RawSheetRecord = {
      stt: getCol(row, 'stt', 0),
      code: getCol(row, 'code', 1),
      jobName: getCol(row, 'jobName', 2),
      inspectorName: getCol(row, 'inspectorName', 3),
      inspectorEmail: getCol(row, 'inspectorEmail', 4),
      unit: getCol(row, 'unit', 5),
      issuer: getCol(row, 'issuer', 6),
      leader: getCol(row, 'leader', 7),
      approver: getCol(row, 'approver', 8),
      workers: getCol(row, 'workers', 14),
      orderGiver: getCol(row, 'orderGiver', 15),
      supervisor: getCol(row, 'supervisor', 16),
      result: getCol(row, 'result', 9),
      safetyScore: getCol(row, 'safetyScore', 10),
      errorCount: getCol(row, 'errorCount', 11),
      rawErrors: getCol(row, 'rawErrors', 12),
      auditDate: getCol(row, 'auditDate', 13),
    };

    // Filter out completely empty rows
    if (record.code || record.jobName || record.auditDate) {
      dataRows.push(record);
    }
  }

  return dataRows;
}

/**
 * Converts a Google Sheets URL into a direct exportable CSV URL
 */
export function formatGoogleSheetsCsvUrl(rawUrl: string): string {
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  // If already a direct CSV url
  if (trimmed.includes('output=csv') || trimmed.includes('format=csv')) {
    return trimmed;
  }

  // Match /spreadsheets/d/{SPREADSHEET_ID}
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    const sheetId = match[1];
    // Check if there is a gid parameter
    const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
    const gidPart = gidMatch ? `&gid=${gidMatch[1]}` : '';
    return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidPart}`;
  }

  return trimmed;
}
