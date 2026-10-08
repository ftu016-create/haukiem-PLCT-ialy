import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  RotateCcw,
  Check,
  Crop,
  Sparkles,
  Users,
  ShieldCheck,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import {
  cleanName,
  getMemberSignatureSvg,
  saveCustomMemberSignature,
  resetCustomMemberSignature,
  hasCustomSignature,
  cleanImageBackground,
  cropImageArea,
} from '../utils/signatureService';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: string[]; // Danh sách thành viên tổ
  leaderName?: string; // Tên trưởng nhóm, mặc định "Trần Thanh Chương"
  initialTargetName?: string | null; // Tên người đang muốn gán/ký trực tiếp
  onSignatureUpdated: (personName: string) => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({
  isOpen,
  onClose,
  members,
  leaderName = 'Trần Thanh Chương',
  initialTargetName,
  onSignatureUpdated,
}) => {
  // Toàn bộ danh sách nhân sự cần chữ ký (Trưởng nhóm đặt đầu tiên)
  const allPersonnel = [leaderName, ...members.filter((m) => cleanName(m) !== cleanName(leaderName))];

  // Tab đang mở: 'individual' (Tải từng người) | 'batch' (Cắt từ ảnh chụp chung)
  const [activeTab, setActiveTab] = useState<'individual' | 'batch'>('individual');

  const [selectedPerson, setSelectedPerson] = useState<string>(
    initialTargetName || leaderName
  );

  // Trạng thái cắt ảnh chung
  const [batchImageSrc, setBatchImageSrc] = useState<string | null>(null);
  const batchImgRef = useRef<HTMLImageElement | null>(null);
  const [cropBox, setCropBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isDraggingCrop, setIsDraggingCrop] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Trạng thái thông báo thành công
  const [successToast, setSuccessToast] = useState<string | null>(null);

  useEffect(() => {
    if (initialTargetName) {
      setSelectedPerson(initialTargetName);
    }
  }, [initialTargetName]);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // -------------------------------------------------------------
  // Xử lý tải ảnh riêng lẻ từng người
  // -------------------------------------------------------------
  const handleUploadSingleImage = async (personName: string, file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const rawData = e.target?.result as string;
      if (rawData) {
        // Tự động làm sạch nền giấy, tách mực
        const cleaned = await saveCustomMemberSignature(personName, rawData);
        onSignatureUpdated(personName);
        setIsProcessing(false);
        showToast(`Đã tải và xử lý chữ ký thành công cho "${personName}"!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetSingleSignature = (personName: string) => {
    resetCustomMemberSignature(personName);
    onSignatureUpdated(personName);
    showToast(`Đã khôi phục chữ ký chuẩn cho "${personName}"!`);
  };

  // -------------------------------------------------------------
  // Xử lý cắt từ ảnh chụp chung (Batch Crop)
  // -------------------------------------------------------------
  const handleLoadBatchImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const res = e.target?.result as string;
      if (res) {
        setBatchImageSrc(res);
        setCropBox(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBatchMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setDragStart({ x, y });
    setCropBox({ x, y, width: 0, height: 0 });
    setIsDraggingCrop(true);
  };

  const handleBatchMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingCrop || !dragStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const x = Math.min(dragStart.x, currentX);
    const y = Math.min(dragStart.y, currentY);
    const width = Math.abs(currentX - dragStart.x);
    const height = Math.abs(currentY - dragStart.y);

    setCropBox({ x, y, width, height });
  };

  const handleBatchMouseUp = () => {
    setIsDraggingCrop(false);
  };

  const handleApplyCrop = async () => {
    if (!batchImageSrc || !cropBox || cropBox.width < 10 || cropBox.height < 10 || !batchImgRef.current) return;
    setIsProcessing(true);

    const imgEl = batchImgRef.current;
    const croppedDataUrl = await cropImageArea(batchImageSrc, {
      x: cropBox.x,
      y: cropBox.y,
      width: cropBox.width,
      height: cropBox.height,
      imgWidth: imgEl.clientWidth,
      imgHeight: imgEl.clientHeight,
    });

    await saveCustomMemberSignature(selectedPerson, croppedDataUrl);
    onSignatureUpdated(selectedPerson);
    setIsProcessing(false);
    showToast(`Đã cắt và gán chữ ký thành công cho "${selectedPerson}"!`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:hidden animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header Modal */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Quản lý & Chèn chữ ký điện tử
              </h3>
              <p className="text-xs text-slate-500">
                Chữ ký tự động chèn vào báo cáo khi tích chọn tên thành viên hoặc Trưởng nhóm
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông báo toast nổi */}
        {successToast && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-between transition-all">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4" />
              {successToast}
            </span>
            <button onClick={() => setSuccessToast(null)} className="text-emerald-200 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-100/60 px-5 pt-2 gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`px-3.5 py-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'individual'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tải ảnh riêng từng người ({allPersonnel.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('batch')}
            className={`px-3.5 py-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'batch'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Crop className="w-4 h-4" />
            <span>Tải ảnh chung & Cắt vùng chữ ký</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* ========================================================================= */}
          {/* TAB 1: TẢI ẢNH RIÊNG TỪNG NGƯỜI */}
          {/* ========================================================================= */}
          {activeTab === 'individual' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Hướng dẫn tải ảnh chữ ký thật:</p>
                  <p className="text-blue-800 text-[11px] mt-0.5">
                    Hệ thống tự động lọc nền giấy trắng và làm sắc nét nét mực xanh bi chân thực. Nhấp vào nút{' '}
                    <b>&ldquo;Tải ảnh&rdquo;</b> bên cạnh tên từng người (bao gồm Trưởng nhóm và các thành viên) để nạp ảnh chữ ký.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {allPersonnel.map((person, idx) => {
                  const isLeader = cleanName(person) === cleanName(leaderName);
                  const isCustom = hasCustomSignature(person);

                  return (
                    <div
                      key={person}
                      className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition ${
                        isLeader ? 'bg-amber-50/30' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900">
                              {person}
                            </span>
                            {isLeader && (
                              <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                TRƯỞNG NHÓM
                              </span>
                            )}
                            {isCustom ? (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                Ảnh chữ ký riêng
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                Mẫu chuẩn mực xanh
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            Tự động hiển thị khi tích chọn trong báo cáo
                          </span>
                        </div>
                      </div>

                      {/* Vùng xem trước & Nút thao tác */}
                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {/* Preview Box */}
                        <div
                          className="h-10 w-28 bg-slate-50 border border-slate-200 rounded-lg p-1 flex items-center justify-center overflow-hidden"
                          title="Xem trước chữ ký"
                        >
                          <div
                            className="max-h-8 max-w-[100px] flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: getMemberSignatureSvg(person) }}
                          />
                        </div>

                        {/* Nút Upload ảnh */}
                        <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadSingleImage(person, file);
                            }}
                          />
                        </label>



                        {/* Nút Khôi phục về mẫu gốc */}
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => handleResetSingleSignature(person)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition cursor-pointer"
                            title="Xóa ảnh riêng, khôi phục chữ ký mẫu"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: TẢI ẢNH CHUNG & CẮT VÙNG CHỮ KÝ */}
          {/* ========================================================================= */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <Crop className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Công cụ cắt chữ ký từ bức ảnh chụp chung:</p>
                  <p className="text-amber-800 text-[11px] mt-0.5">
                    1. Tải bức ảnh chứa các chữ ký mà anh chụp.
                    <br />
                    2. Chọn người nhận chữ ký &rarr; Dùng chuột kéo một khung chữ nhật bao quanh chữ ký của người đó &rarr; Bấm <b>&ldquo;Cắt & Gán chữ ký&rdquo;</b>.
                  </p>
                </div>
              </div>

              {/* Thanh chọn người nhận & nút tải ảnh */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Gán cho:</span>
                  <select
                    value={selectedPerson}
                    onChange={(e) => setSelectedPerson(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    {allPersonnel.map((p) => (
                      <option key={p} value={p}>
                        {cleanName(p) === cleanName(leaderName) ? `★ ${p} (TRƯỞNG NHÓM)` : p}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-2xs transition cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{batchImageSrc ? 'Thay ảnh chụp khác' : 'Chọn ảnh chụp danh sách chữ ký'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleLoadBatchImage(file);
                    }}
                  />
                </label>
              </div>

              {/* Vùng tương tác kéo cắt */}
              {batchImageSrc ? (
                <div className="space-y-3">
                  <div
                    onMouseDown={handleBatchMouseDown}
                    onMouseMove={handleBatchMouseMove}
                    onMouseUp={handleBatchMouseUp}
                    className="relative border-2 border-dashed border-blue-400 bg-slate-900/5 rounded-xl overflow-hidden cursor-crosshair select-none flex items-center justify-center max-h-[380px]"
                  >
                    <img
                      ref={batchImgRef}
                      src={batchImageSrc}
                      alt="Ảnh danh sách chữ ký"
                      className="max-h-[380px] w-auto object-contain pointer-events-none"
                    />

                    {/* Khung kéo cắt (Crop Box) */}
                    {cropBox && cropBox.width > 5 && cropBox.height > 5 && (
                      <div
                        style={{
                          left: `${cropBox.x}px`,
                          top: `${cropBox.y}px`,
                          width: `${cropBox.width}px`,
                          height: `${cropBox.height}px`,
                        }}
                        className="absolute border-2 border-rose-500 bg-rose-500/20 shadow-lg pointer-events-none"
                      >
                        <span className="absolute -top-5 left-0 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {selectedPerson}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 italic">
                      {cropBox && cropBox.width > 10
                        ? `Đã chọn vùng ${Math.round(cropBox.width)} x ${Math.round(cropBox.height)} px`
                        : 'Kéo chuột trên ảnh để chọn vùng chữ ký'}
                    </span>

                    <button
                      type="button"
                      onClick={handleApplyCrop}
                      disabled={!cropBox || cropBox.width < 10 || isProcessing}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 shadow-xs transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isProcessing ? 'Đang xử lý...' : `Cắt & Gán chữ ký cho "${selectedPerson}"`}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-14 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 text-slate-400">
                  <ImageIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">Chưa có ảnh danh sách chữ ký</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Bấm &ldquo;Chọn ảnh chụp danh sách chữ ký&rdquo; ở trên để bắt đầu cắt và gán
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Chữ ký được lưu an toàn trên trình duyệt và tự động chèn khi xuất Word (.doc) & In ấn</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
