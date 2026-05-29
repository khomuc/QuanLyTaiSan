const state = {
  assetRows: 0,
  approverRows: 0,
};

const assetTemplate = document.getElementById('assetTemplate');
const approverTemplate = document.getElementById('approverTemplate');
const assetRowsEl = document.getElementById('assetRows');
const approverRowsEl = document.getElementById('approverRows');
const slipsTable = document.getElementById('slipsTable');
const historySummary = document.getElementById('historySummary');
const historyItems = document.getElementById('historyItems');
const applyDepartmentToAllBtn = document.getElementById('applyDepartmentToAllBtn');
let sourceDepartmentPicker = null;
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatAssetLabel(asset) {
  const qr = asset.MaQR ? ` • ${asset.MaQR}` : '';
  const room = asset.TenPhongBan ? ` • ${asset.TenPhongBan}` : asset.MaPhongBanHienTai ? ` • ${asset.MaPhongBanHienTai}` : '';
  return `${asset.TenTaiSan}${qr}${room}`;
}

function formatDepartmentLabel(dept) {
  return `${dept.MaPhongBan} - ${dept.TenPhongBan}`;
}

function formatEmployeeLabel(employee) {
  const role = employee.TenVaiTro || employee.ChucVu || 'Chưa có vai trò';
  const room = employee.TenPhongBan ? ` • ${employee.TenPhongBan}` : '';
  return `${employee.MaNhanVien} - ${employee.HoTen}${room}`;
}

function setupSearchPicker(container, config) {
  const hidden = container.querySelector('input[type="hidden"]');
  const input = container.querySelector('.picker-input');
  const panel = container.querySelector('.picker-panel');
  let debounceTimer = null;
  let currentItems = [];

  const renderPanel = (items) => {
    currentItems = items;
    if (!items.length) {
      panel.innerHTML = `<div class="picker-empty">${escapeHtml(config.emptyText ?? 'Không có kết quả')}</div>`;
      panel.hidden = false;
      return;
    }

    panel.innerHTML = items.map((item, index) => `
      <button type="button" class="picker-option" data-index="${index}">
        <span class="picker-title">${escapeHtml(config.primary(item))}</span>
        <span class="picker-subtitle">${escapeHtml(config.secondary?.(item) ?? '')}</span>
      </button>
    `).join('');
    panel.hidden = false;
  };

  const clearSelection = () => {
    hidden.value = '';
    if (config.onClear) {
      config.onClear(container);
    }
  };

  const setValue = (item, label) => {
    hidden.value = config.value(item);
    input.value = label ?? config.display(item);
    if (config.onSelect) {
      config.onSelect(item, container);
    }
    panel.hidden = true;
  };

  const search = async (term) => {
    try {
      const query = term.trim();
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (config.extraParams) {
        const extra = config.extraParams();
        Object.entries(extra).forEach(([key, value]) => {
          if (value) params.set(key, value);
        });
      }
      const data = await api(`/api/transfer/${config.endpoint}${params.toString() ? `?${params}` : ''}`);
      renderPanel(data);
    } catch {
      panel.hidden = true;
    }
  };

  input.addEventListener('input', () => {
    clearSelection();
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => search(input.value), 220);
  });

  input.addEventListener('focus', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => search(input.value), 0);
  });

  input.addEventListener('blur', () => {
    setTimeout(() => {
      panel.hidden = true;
    }, 150);
  });

  panel.addEventListener('mousedown', (event) => event.preventDefault());
  panel.addEventListener('click', (event) => {
    const option = event.target.closest('.picker-option');
    if (!option) {
      return;
    }

    const item = currentItems[Number(option.dataset.index)];
    if (item) {
      setValue(item);
    }
  });

  return {
    setValue,
    clear: clearSelection,
    input,
    hidden,
  };
}

function addAssetRow(value = {}) {
  const node = assetTemplate.content.firstElementChild.cloneNode(true);
  const assetPicker = setupSearchPicker(node.querySelector('[data-picker="asset"]'), {
    endpoint: 'assets',
    value: (item) => item.MaTaiSan,
    display: (item) => formatAssetLabel(item),
    primary: (item) => `${item.TenTaiSan}`,
    secondary: (item) => `${item.MaQR ?? 'Không QR'} • ${item.TenPhongBan ?? item.MaPhongBanHienTai ?? ''}`,
    emptyText: 'Không tìm thấy tài sản phù hợp',
    extraParams: () => ({ maPhongBanHienTai: sourceDepartmentPicker?.hidden?.value ? sourceDepartmentPicker.hidden.value.trim() : '' }),
  });

  const departmentPicker = setupSearchPicker(node.querySelector('[data-picker="department"]'), {
    endpoint: 'departments',
    value: (item) => item.MaPhongBan,
    display: (item) => formatDepartmentLabel(item),
    primary: (item) => item.MaPhongBan,
    secondary: (item) => item.TenPhongBan,
    emptyText: 'Không tìm thấy phòng ban phù hợp',
  });

  assetPicker.setValue({ MaTaiSan: value.maTaiSan ?? '', MaQR: value.maQR ?? '', TenTaiSan: value.maTaiSanDisplay ?? '' }, value.maTaiSanLabel ?? value.maTaiSanDisplay ?? '');
  departmentPicker.setValue({ MaPhongBan: value.denPhongBan ?? '', TenPhongBan: value.denPhongBanDisplay ?? '' }, value.denPhongBanLabel ?? value.denPhongBanDisplay ?? '');
  node.querySelector('[name="lyDo"]').value = value.lyDo ?? '';
  node.querySelector('.remove-btn').addEventListener('click', () => node.remove());
  node.querySelector('.duplicate-btn').addEventListener('click', () => {
    const duplicated = {
      maTaiSan: node.querySelector('[name="maTaiSan"]').value.trim(),
      maTaiSanLabel: node.querySelector('[name="maTaiSanSearch"]').value.trim(),
      denPhongBan: node.querySelector('[name="denPhongBan"]').value.trim(),
      denPhongBanLabel: node.querySelector('[name="denPhongBanSearch"]').value.trim(),
      lyDo: node.querySelector('[name="lyDo"]').value.trim(),
    };
    addAssetRow(duplicated);
  });
  assetRowsEl.appendChild(node);
  state.assetRows += 1;
}

function addApproverRow(value = {}) {
  const node = approverTemplate.content.firstElementChild.cloneNode(true);
  const employeePicker = setupSearchPicker(node.querySelector('[data-picker="employee"]'), {
    endpoint: 'employees',
    value: (item) => item.MaNhanVien,
    display: (item) => formatEmployeeLabel(item),
    primary: (item) => `${item.MaNhanVien} - ${item.HoTen}`,
    secondary: (item) => `${item.TenVaiTro ?? item.ChucVu ?? 'Chưa có vai trò'}${item.TenPhongBan ? ` • ${item.TenPhongBan}` : ''}`,
    emptyText: 'Không tìm thấy người ký duyệt phù hợp',
    onSelect: (item, container) => {
      const roleInput = container.closest('.approver-row').querySelector('[name="tenVaiTro"]');
      if (roleInput && !roleInput.value.trim()) {
        roleInput.value = item.TenVaiTro || item.ChucVu || '';
      }
    },
  });

  employeePicker.setValue({ MaNhanVien: value.maNhanVien ?? '', HoTen: value.maNhanVienDisplay ?? '', TenVaiTro: value.tenVaiTro ?? '', ChucVu: value.tenVaiTro ?? '', TenPhongBan: value.tenPhongBanDisplay ?? '' }, value.maNhanVienLabel ?? value.maNhanVienDisplay ?? '');
  node.querySelector('[name="tenVaiTro"]').value = value.tenVaiTro ?? '';
  node.querySelector('[name="vongKy"]').value = value.vongKy ?? 1;
  node.querySelector('.remove-btn').addEventListener('click', () => node.remove());
  approverRowsEl.appendChild(node);
  state.approverRows += 1;
}

function toJsonBody(form) {
  const formData = new FormData(form);
  const assets = [...assetRowsEl.querySelectorAll('.asset-row')].map((row) => ({
    maTaiSan: row.querySelector('[name="maTaiSan"]').value.trim(),
    denPhongBan: row.querySelector('[name="denPhongBan"]').value.trim(),
    lyDo: row.querySelector('[name="lyDo"]').value.trim(),
  })).filter((item) => item.maTaiSan || item.denPhongBan);

  const approvers = [...approverRowsEl.querySelectorAll('.approver-row')].map((row) => ({
    maNhanVien: row.querySelector('[name="maNhanVien"]').value.trim(),
    tenVaiTro: row.querySelector('[name="tenVaiTro"]').value.trim(),
    vongKy: Number(row.querySelector('[name="vongKy"]').value || 1),
  })).filter((item) => item.maNhanVien);

  return {
    nguoiLap: formData.get('nguoiLap'),
    ngayDieuChuyen: formData.get('ngayDieuChuyen') || undefined,
    ghiChu: formData.get('ghiChu') || undefined,
    danhSachTaiSan: assets,
    danhSachKyDuyet: approvers,
  };
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }

  return response.status === 204 ? null : response.json();
}

function renderSlips(rows = []) {
  slipsTable.innerHTML = rows.map((row) => `
    <tr>
      <td>${row.SoPhieu}</td>
      <td>${String(row.NgayDieuChuyen ?? '').slice(0, 10)}</td>
      <td>${row.TrangThaiDuyet}</td>
      <td>${row.NguoiLapTen ?? row.NguoiLap ?? ''}</td>
      <td>${row.TongTaiSan ?? 0}</td>
    </tr>
  `).join('');
}

function renderHistory(data) {
  historySummary.innerHTML = (data.summary ?? []).map((item) => `
    <div class="summary-item">
      <strong>${item.TuPhongBanTen ?? item.TuPhongBan}</strong>
      <div>${item.DenPhongBanTen ?? item.DenPhongBan}</div>
      <small>${item.SoLuongTaiSan} tài sản</small>
    </div>
  `).join('');

  historyItems.innerHTML = (data.items ?? []).map((item) => `
    <div class="history-item">
      <strong>${item.SoPhieu} - ${item.TenTaiSan}</strong>
      <div>${item.TuPhongBanTen ?? item.TuPhongBan} → ${item.DenPhongBanTen ?? item.DenPhongBan}</div>
      <small>${item.LyDo ?? 'Không có lý do ghi chú'}</small>
    </div>
  `).join('');
}

async function loadSlips() {
  const filter = document.getElementById('statusFilter').value.trim();
  const query = new URLSearchParams();
  if (filter) query.set('trangThai', filter);
  const data = await api(`/api/transfer/slips${query.toString() ? `?${query}` : ''}`);
  renderSlips(data);
}

async function loadHistory() {
  const data = await api('/api/transfer/reports/history');
  renderHistory(data);
}

document.getElementById('addAssetBtn').addEventListener('click', () => addAssetRow({}));
document.getElementById('addApproverBtn').addEventListener('click', () => addApproverRow({}));
document.getElementById('reloadSlipsBtn').addEventListener('click', loadSlips);
document.getElementById('reloadHistoryBtn').addEventListener('click', loadHistory);
document.getElementById('loadSampleBtn').addEventListener('click', () => {
  const form = document.getElementById('transferForm');
  form.ghiChu.value = 'Điều chuyển phục vụ công tác chuyên môn';
  assetRowsEl.innerHTML = '';
  approverRowsEl.innerHTML = '';
  addAssetRow({
    maTaiSan: 'TS0001',
    maTaiSanLabel: 'Máy tính xách tay Dell Latitude 7420 • QR-TS-0001 • Ban Giám hiệu',
    denPhongBan: 'PB02',
    denPhongBanLabel: 'PB02 - Khoa Lý luận cơ sở',
    lyDo: 'Điều phối công tác',
  });
  addAssetRow({
    maTaiSan: 'TS0002',
    maTaiSanLabel: 'Máy chiếu Epson EB-X06 • QR-TS-0002 • Khoa Lý luận cơ sở',
    denPhongBan: 'PB03',
    denPhongBanLabel: 'PB03 - Khoa Xây dựng Đảng',
    lyDo: 'Sắp xếp lại phòng ban',
  });
  addApproverRow({
    maNhanVien: 'NV0001',
    maNhanVienLabel: 'NV0001 - Hiệu trưởng',
    tenVaiTro: 'Hiệu trưởng',
    vongKy: 1,
  });
});

applyDepartmentToAllBtn.addEventListener('click', () => {
  const firstRow = assetRowsEl.querySelector('.asset-row');
  const firstDest = firstRow?.querySelector('[name="denPhongBan"]').value.trim();
  if (!firstDest) {
    document.getElementById('createResult').textContent = 'Chọn phòng ban đích ở dòng đầu tiên trước khi áp dụng cho toàn bộ.';
    return;
  }

  assetRowsEl.querySelectorAll('.asset-row').forEach((row) => {
    row.querySelector('[name="denPhongBan"]').value = firstDest;
    const deptSearch = row.querySelector('[name="denPhongBanSearch"]');
    if (deptSearch && firstRow) {
      deptSearch.value = firstRow.querySelector('[name="denPhongBanSearch"]').value;
    }
  });
});

document.getElementById('transferForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const resultEl = document.getElementById('createResult');
  resultEl.textContent = 'Đang tạo phiếu...';
  try {
    const payload = toJsonBody(event.target);
    const errors = validateForm(payload);
    if (errors.length) {
      resultEl.textContent = `Vui lòng sửa: ${errors.join('; ')}`;
      return;
    }

    const created = await api('/api/transfer/slips', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    resultEl.textContent = `Đã tạo ${created.SoPhieu} với ${created.items.length} tài sản.`;
    await loadSlips();
    await loadHistory();
  } catch (error) {
    resultEl.textContent = `Lỗi: ${error.message}`;
  }
});

function validateForm(payload) {
  const errors = [];
  if (!payload.nguoiLap || !String(payload.nguoiLap).trim()) {
    errors.push('Người lập không được để trống');
  }
  if (!Array.isArray(payload.danhSachTaiSan) || payload.danhSachTaiSan.length === 0) {
    errors.push('Phải có ít nhất 1 tài sản để điều chuyển');
  } else {
    payload.danhSachTaiSan.forEach((item, idx) => {
      if (!item.maTaiSan || !String(item.maTaiSan).trim()) {
        errors.push(`Tài sản #${idx + 1}: vui lòng chọn tài sản từ danh sách`);
      }
      if (!item.denPhongBan || !String(item.denPhongBan).trim()) {
        errors.push(`Tài sản #${idx + 1}: vui lòng chọn phòng ban đến từ danh sách`);
      }
    });
  }
  if (Array.isArray(payload.danhSachKyDuyet)) {
    payload.danhSachKyDuyet.forEach((ap, idx) => {
      if (!ap.maNhanVien || !String(ap.maNhanVien).trim()) {
        errors.push(`Người duyệt #${idx + 1}: mã nhân viên không được để trống`);
      }
    });
  }
  return errors;
}

document.querySelectorAll('[data-scroll]').forEach((button) => {
  button.addEventListener('click', () => {
    document.getElementById(button.dataset.scroll).scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelectorAll('.nav-item').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    const target = document.getElementById(button.dataset.view);
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.getElementById('statusFilter').addEventListener('change', loadSlips);

async function init() {
  sourceDepartmentPicker = setupSearchPicker(document.querySelector('[data-picker="sourceDepartment"]'), {
    endpoint: 'departments',
    value: (item) => item.MaPhongBan,
    display: (item) => formatDepartmentLabel(item),
    primary: (item) => item.MaPhongBan,
    secondary: (item) => item.TenPhongBan,
    emptyText: 'Không tìm thấy phòng ban nguồn phù hợp',
  });
  addAssetRow({});
  addApproverRow({});
  await loadSlips();
  await loadHistory();
}

init();