import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  PenTool,
  RotateCcw,
  Check,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  cleanName,
  getMemberSignatureSvg,
  saveCustomMemberSignature,
  resetCustomMemberSignature,
  hasCustomSignature,
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

  // Tab đang mở: 'individual' (Tải ảnh từng người) | 'draw' (Ký tay trực tiếp)
  const [activeTab, setActiveTab] = useState<'individual' | 'draw'>(
    initialTargetName ? 'individual' : 'individual'
  );

  const [selectedPerson, setSelectedPerson] = useState<string>(
    initialTargetName || leaderName
  );

  // Trạng thái vẽ tay Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState<'#1d4ed8' | '#0f172a'>('#1d4ed8');
  const [hasDrawnStrokes, setHasDrawnStrokes] = useState(false);
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

  // Xử lý vẽ tay Canvas
  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnStrokes(false);
  };

  useEffect(() => {
    if (activeTab === 'draw') {
      setTimeout(() => initCanvas(), 50);
    }
  }, [activeTab]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = penColor;
    ctx.fillStyle = penColor;
    ctx.lineWidth = 2.8;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);

    setIsDrawing(true);
    setHasDrawnStrokes(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSaveDrawnSignature = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasDrawnStrokes) return;

    setIsProcessing(true);
    try {
      const dataUrl = canvas.toDataURL('image/png');
      await saveCustomMemberSignature(selectedPerson, dataUrl);
      onSignatureUpdated(selectedPerson);
      showToast(`Đã lưu chữ ký vẽ tay cho ${selectedPerson}!`);
    } catch (e) {
      console.error(e);
      alert('Không thể lưu chữ ký vẽ tay.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Xử lý nạp ảnh riêng từng người
  const handleUploadSingle = (person: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('Kích thước ảnh không được vượt quá 5MB!');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      try {
        await saveCustomMemberSignature(person, base64);
        onSignatureUpdated(person);
        showToast(`Đã cập nhật ảnh chữ ký thực tế cho ${person}!`);
      } catch (e) {
        console.error(e);
        alert('Lỗi khi lưu chữ ký.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetSingle = (person: string) => {
    resetCustomMemberSignature(person);
    onSignatureUpdated(person);
    showToast(`Đã khôi phục chữ ký gốc mặc định cho ${person}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PenTool className="w-4 h-4 text-blue-600" />
              <span>Quản lý Chữ ký Số Tổ Hậu kiểm</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cập nhật hoặc ký tay chữ ký thực tế cho nhân sự (Chỉ quyền Quản trị viên)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thông báo Toast */}
        {successToast && (
          <div className="bg-emerald-600 text-white text-xs px-4 py-2 flex items-center justify-between transition animate-in fade-in">
            <span className="flex items-center gap-1.5 font-medium">
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
            <Upload className="w-4 h-4" />
            <span>Tải ảnh chữ ký ({allPersonnel.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('draw')}
            className={`px-3.5 py-2.5 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'draw'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-2xs font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Ký tay trực tiếp trên Canvas</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: TẢI ẢNH CHỮ KÝ TỪNG NGƯỜI */}
          {activeTab === 'individual' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Hệ thống đã có sẵn chữ ký thực tế chuẩn của các nhân sự:</p>
                  <p className="text-blue-800 text-[11px] mt-0.5">
                    Hệ thống tự động chèn chữ ký thực tế của từng người khi tích chọn. Nếu muốn thay đổi ảnh khác, nhấp <b>&ldquo;Tải ảnh&rdquo;</b>.
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
                        isLeader ? 'bg-blue-50/20' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-slate-900 flex items-center gap-2">
                            <span>{person}</span>
                            {isLeader && (
                              <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 font-bold rounded-md">
                                Trưởng nhóm
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {isCustom ? 'Đang dùng ảnh chữ ký tải lên riêng' : 'Chữ ký thực tế chuẩn hệ thống'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-center">
                        {/* Xem trước chữ ký */}
                        <div
                          className="h-10 w-28 bg-slate-50 border border-slate-200 rounded-lg p-1 flex items-center justify-center"
                          dangerouslySetInnerHTML={{ __html: getMemberSignatureSvg(person) }}
                        />

                        {/* Nút tải ảnh */}
                        <label
                          className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 shadow-2xs transition cursor-pointer flex items-center gap-1"
                          title="Tải ảnh chữ ký"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleUploadSingle(person, f);
                            }}
                          />
                        </label>

                        {/* Khôi phục nếu có tùy chỉnh */}
                        {isCustom && (
                          <button
                            type="button"
                            onClick={() => handleResetSingle(person)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Quay lại chữ ký chuẩn"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: KÝ TAY TRÊN CANVAS */}
          {activeTab === 'draw' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">Chọn người ký:</label>
                  <select
                    value={selectedPerson}
                    onChange={(e) => {
                      setSelectedPerson(e.target.value);
                      initCanvas();
                    }}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:bg-white"
                  >
                    {allPersonnel.map((p) => (
                      <option key={p} value={p}>
                        {p} {cleanName(p) === cleanName(leaderName) ? '(Trưởng nhóm)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Chọn màu mực */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Màu mực:</span>
                  <button
                    type="button"
                    onClick={() => setPenColor('#1d4ed8')}
                    className={`px-2 py-1 rounded text-xs font-semibold border transition ${
                      penColor === '#1d4ed8'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-blue-700 border-blue-200'
                    }`}
                  >
                    Mực xanh bi
                  </button>
                  <button
                    type="button"
                    onClick={() => setPenColor('#0f172a')}
                    className={`px-2 py-1 rounded text-xs font-semibold border transition ${
                      penColor === '#0f172a'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Mực đen
                  </button>
                </div>
              </div>

              {/* Vùng Canvas */}
              <div className="relative border-2 border-dashed border-slate-300 rounded-2xl bg-white p-2">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={220}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-52 bg-white rounded-xl cursor-crosshair touch-none"
                />
                {!hasDrawnStrokes && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-xs text-slate-400 italic">
                      Dùng chuột hoặc bút cảm ứng ký vào đây...
                    </span>
                  </div>
                )}
              </div>

              {/* Hành động Canvas */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={initCanvas}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Xóa vẽ lại</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDrawnSignature}
                  disabled={!hasDrawnStrokes || isProcessing}
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Lưu chữ ký cho {selectedPerson}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
          >
            Đóng bảng
          </button>
        </div>
      </div>
    </div>
  );
};
