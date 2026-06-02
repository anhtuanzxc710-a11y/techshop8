import React, { useContext, useEffect, useState } from 'react'
import { AdminContext } from '../context/AdminContext'
import { useTranslation } from 'react-i18next'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts'
import { DollarSign, ShoppingBag, Users, MessageSquare, TrendingUp, TrendingDown, PackageSearch, CreditCard, ChevronRight, Calendar, Download, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'

const Dashboard = () => {
  const { t } = useTranslation();
  const { aToken, dashData, getDashData, revenueStats, getRevenueStats, backendurl } = useContext(AdminContext)
  const navigate = useNavigate();

  const [filter, setFilter] = useState({
    preset: '30d',
    startDate: '',
    endDate: '',
    groupBy: 'day',
    orderStatus: 'all',
    paymentMethod: 'all',
    categoryId: 'all',
    compare: false
  });
  const [loadingRevenue, setLoadingRevenue] = useState(false);
  const [categories, setCategories] = useState([]);
  const [paymentMethods] = useState(['Cash', 'ZaloPay', 'Stripe', 'VNPay', 'MoMo']);

  // Load categories
  useEffect(() => {
    if (aToken && backendurl) {
      import('axios').then(({ default: axios }) => {
        axios.get(backendurl + '/api/admin/categories', { headers: { aToken } })
          .then(res => {
            if (res.data.success) setCategories(res.data.categories || []);
          })
          .catch(() => {});
      });
    }
  }, [aToken, backendurl]);

  const getDatesFromPreset = (preset) => {
    const today = new Date();
    const pad = (num) => num.toString().padStart(2, '0');
    const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
    let startDate = todayStr;
    let endDate = todayStr;
    let groupBy = 'day';

    switch (preset) {
      case 'today':
        startDate = todayStr; endDate = todayStr; groupBy = 'day'; break;
      case '7d': {
        const d = new Date(); d.setDate(today.getDate() - 7);
        startDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        endDate = todayStr; groupBy = 'day'; break;
      }
      case '30d': {
        const d = new Date(); d.setDate(today.getDate() - 30);
        startDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        endDate = todayStr; groupBy = 'day'; break;
      }
      case 'thisMonth': {
        const d = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        endDate = todayStr; groupBy = 'day'; break;
      }
      case 'thisYear': {
        const d = new Date(today.getFullYear(), 0, 1);
        startDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
        endDate = todayStr; groupBy = 'month'; break;
      }
      case 'custom': default: break;
    }
    return { startDate, endDate, groupBy };
  };

  const fetchRevenue = (params) => {
    setLoadingRevenue(true);
    getRevenueStats(params).finally(() => setLoadingRevenue(false));
  };

  useEffect(() => {
    if (aToken) {
      getDashData();
      const { startDate, endDate, groupBy } = getDatesFromPreset('30d');
      const newFilter = { preset: '30d', startDate, endDate, groupBy, orderStatus: 'all', paymentMethod: 'all', categoryId: 'all', compare: false };
      setFilter(newFilter);
      fetchRevenue({ startDate, endDate, groupBy });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aToken])

  if (!dashData) return null;

  const handlePresetChange = (preset) => {
    if (preset === 'custom') {
      const { startDate, endDate, groupBy } = getDatesFromPreset('30d');
      setFilter(prev => ({ ...prev, preset, startDate, endDate, groupBy }));
    } else {
      const { startDate, endDate, groupBy } = getDatesFromPreset(preset);
      const newFilter = { ...filter, preset, startDate, endDate, groupBy };
      setFilter(newFilter);
      fetchRevenue({ startDate, endDate, groupBy, orderStatus: filter.orderStatus, paymentMethod: filter.paymentMethod, categoryId: filter.categoryId, compare: filter.compare ? 'true' : undefined });
    }
  };

  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    if (new Date(filter.startDate) > new Date(filter.endDate)) {
      alert("Ngày bắt đầu không được lớn hơn ngày kết thúc!");
      return;
    }
    fetchRevenue({
      startDate: filter.startDate, endDate: filter.endDate, groupBy: filter.groupBy,
      orderStatus: filter.orderStatus, paymentMethod: filter.paymentMethod,
      categoryId: filter.categoryId, compare: filter.compare ? 'true' : undefined
    });
  };

  const fmtVND = (v) => `${new Intl.NumberFormat('vi-VN').format(v || 0)}₫`;

  // Safe data access
  const summary = revenueStats?.summary || revenueStats || {};
  const comparison = revenueStats?.comparison || null;
  const isMock = revenueStats?.isMockData || false;
  const isError = revenueStats?._error || false;
  const hasData = !isError && revenueStats;

  // Chart data
  const chartSeriesData = (revenueStats?.revenueSeries || []).map(item => ({
    name: item.date, revenue: item.revenue, orders: item.orders || 0
  }));

  const pieStats = revenueStats?.orderStatusStats || {
    processedOrders: dashData.processedOrders || 0,
    unprocessedOrders: dashData.unprocessedOrders || 0,
    totalOrders: dashData.totalOrders || 0,
    cancelledOrders: 0
  };
  const orderPieData = [
    { name: t('dashboard.processed') || 'Đã xử lý', value: pieStats.processedOrders },
    { name: t('dashboard.unprocessed') || 'Chưa xử lý', value: pieStats.unprocessedOrders },
    { name: 'Đã hủy', value: pieStats.cancelledOrders }
  ];
  const COLORS = ['#3b82f6', '#f97316', '#ef4444'];

  const topProductsList = revenueStats?.topProducts || dashData.topSellingProducts || [];
  const categoryRevenue = revenueStats?.categoryRevenue || [];
  const paymentMethodRevenue = revenueStats?.paymentMethodRevenue || [];
  const topCustomers = revenueStats?.topCustomers || [];

  // Comparison helper
  const renderChange = (changePercent, changeValue, isCurrency = false) => {
    if (changePercent === null || changePercent === undefined) {
      if (changeValue > 0) return <span className="text-xs text-gray-400 ml-1">Kỳ trước không có dữ liệu</span>;
      return null;
    }
    const isUp = changePercent >= 0;
    return (
      <span className={`text-xs font-bold ml-2 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
        {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(changePercent)}%
      </span>
    );
  };

  // =========== EXPORT EXCEL ===========
  const handleExportExcel = () => {
    if (!hasData) return;
    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng quan
    const overviewData = [
      ['BÁO CÁO DOANH THU'],
      [`Từ ngày: ${filter.startDate}`, `Đến ngày: ${filter.endDate}`],
      [`Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}`],
      [],
      ['Chỉ số', 'Giá trị'],
      ['Tổng doanh thu', summary.totalRevenue || 0],
      ['Đơn thanh toán thành công', summary.totalPaidOrders || 0],
      ['Giá trị đơn trung bình', summary.averageOrderValue || 0],
      ['Sản phẩm đã bán', summary.totalItemsSold || 0],
    ];
    if (isMock) overviewData.push([], ['⚠ DỮ LIỆU MẪU - KHÔNG PHẢI DOANH THU THẬT']);
    if (comparison?.enabled) {
      overviewData.push([], ['SO SÁNH VỚI KỲ TRƯỚC']);
      overviewData.push(['Kỳ trước', `${comparison.previousPeriod.startDate} - ${comparison.previousPeriod.endDate}`]);
      overviewData.push(['Doanh thu kỳ trước', comparison.previousPeriod.totalRevenue]);
      overviewData.push(['Thay đổi doanh thu', comparison.changes.revenueChange]);
      overviewData.push(['% thay đổi', comparison.changes.revenueChangePercent !== null ? `${comparison.changes.revenueChangePercent}%` : 'N/A']);
    }
    const ws1 = XLSX.utils.aoa_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');

    // Sheet 2: Doanh thu theo thời gian
    const seriesData = [['Thời gian', 'Doanh thu (₫)', 'Số đơn']];
    (revenueStats?.revenueSeries || []).forEach(r => seriesData.push([r.date, r.revenue, r.orders || 0]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(seriesData), 'Doanh thu theo thời gian');

    // Sheet 3: Doanh thu theo danh mục
    const catData = [['Danh mục', 'Doanh thu (₫)', 'Số lượng bán', 'Số đơn', '% doanh thu']];
    categoryRevenue.forEach(c => catData.push([c.categoryName, c.revenue, c.totalSold, c.orderCount, `${c.percentOfRevenue}%`]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(catData), 'Theo danh mục');

    // Sheet 4: Doanh thu theo PTTT
    const pmData = [['Phương thức thanh toán', 'Doanh thu (₫)', 'Số đơn', '% doanh thu']];
    paymentMethodRevenue.forEach(p => pmData.push([p.paymentMethod, p.revenue, p.orderCount, `${p.percentOfRevenue}%`]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(pmData), 'Theo PTTT');

    // Sheet 5: Top khách hàng
    const custData = [['Khách hàng', 'Email', 'SĐT', 'Tổng chi (₫)', 'Số đơn', 'SP đã mua', 'Đơn gần nhất']];
    topCustomers.forEach(c => custData.push([c.customerName, c.email, c.phone, c.totalSpent, c.paidOrders, c.totalItemsBought, c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString('vi-VN') : '']));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(custData), 'Top khách hàng');

    // Sheet 6: Top sản phẩm
    const prodData = [['Sản phẩm', 'Danh mục', 'Số lượng bán', 'Doanh thu (₫)']];
    topProductsList.forEach(p => prodData.push([p.productName, p.categoryName || '', p.totalSold || p.total_sold || 0, p.revenue || 0]));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(prodData), 'Top sản phẩm');

    XLSX.writeFile(wb, `revenue-report_${filter.startDate}_to_${filter.endDate}.xlsx`);
  };

  // =========== EXPORT PDF ===========
  const handleExportPDF = async () => {
    if (!hasData) return;
    const { default: jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(18);
    doc.text('BAO CAO DOANH THU', 105, y, { align: 'center' }); y += 10;
    doc.setFontSize(10);
    doc.text(`Tu ngay: ${filter.startDate}  Den ngay: ${filter.endDate}`, 105, y, { align: 'center' }); y += 6;
    doc.text(`Ngay xuat: ${new Date().toLocaleDateString('vi-VN')}`, 105, y, { align: 'center' }); y += 8;

    if (isMock) {
      doc.setTextColor(200, 100, 0);
      doc.text('DU LIEU MAU - KHONG PHAI DOANH THU THAT', 105, y, { align: 'center' }); y += 8;
      doc.setTextColor(0, 0, 0);
    }

    // Summary table
    doc.autoTable({
      startY: y,
      head: [['Chi so', 'Gia tri']],
      body: [
        ['Tong doanh thu', fmtVND(summary.totalRevenue)],
        ['Don thanh toan thanh cong', `${summary.totalPaidOrders || 0} don`],
        ['Gia tri don trung binh', fmtVND(summary.averageOrderValue)],
        ['San pham da ban', `${summary.totalItemsSold || 0} san pham`],
      ],
      theme: 'grid', styles: { fontSize: 9 }
    });
    y = doc.lastAutoTable.finalY + 8;

    // Comparison
    if (comparison?.enabled) {
      doc.setFontSize(12);
      doc.text('SO SANH VOI KY TRUOC', 14, y); y += 6;
      doc.autoTable({
        startY: y,
        head: [['Chi so', 'Ky hien tai', 'Ky truoc', 'Thay doi']],
        body: [
          ['Doanh thu', fmtVND(comparison.currentPeriod.totalRevenue), fmtVND(comparison.previousPeriod.totalRevenue),
            comparison.changes.revenueChangePercent !== null ? `${comparison.changes.revenueChangePercent}%` : 'N/A'],
          ['So don', comparison.currentPeriod.totalPaidOrders, comparison.previousPeriod.totalPaidOrders,
            comparison.changes.paidOrdersChangePercent !== null ? `${comparison.changes.paidOrdersChangePercent}%` : 'N/A'],
        ],
        theme: 'grid', styles: { fontSize: 8 }
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // Revenue series
    if ((revenueStats?.revenueSeries || []).length > 0) {
      doc.setFontSize(12);
      doc.text('Doanh thu theo thoi gian', 14, y); y += 4;
      doc.autoTable({
        startY: y,
        head: [['Thoi gian', 'Doanh thu', 'So don']],
        body: (revenueStats.revenueSeries || []).map(r => [r.date, fmtVND(r.revenue), r.orders || 0]),
        theme: 'striped', styles: { fontSize: 8 }
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // Category revenue
    if (categoryRevenue.length > 0) {
      if (y > 240) { doc.addPage(); y = 15; }
      doc.setFontSize(12);
      doc.text('Doanh thu theo danh muc', 14, y); y += 4;
      doc.autoTable({
        startY: y,
        head: [['Danh muc', 'Doanh thu', 'So luong', '% doanh thu']],
        body: categoryRevenue.map(c => [c.categoryName, fmtVND(c.revenue), c.totalSold, `${c.percentOfRevenue}%`]),
        theme: 'striped', styles: { fontSize: 8 }
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // Payment method
    if (paymentMethodRevenue.length > 0) {
      if (y > 240) { doc.addPage(); y = 15; }
      doc.setFontSize(12);
      doc.text('Doanh thu theo phuong thuc thanh toan', 14, y); y += 4;
      doc.autoTable({
        startY: y,
        head: [['Phuong thuc', 'Doanh thu', 'So don', '% doanh thu']],
        body: paymentMethodRevenue.map(p => [p.paymentMethod, fmtVND(p.revenue), p.orderCount, `${p.percentOfRevenue}%`]),
        theme: 'striped', styles: { fontSize: 8 }
      });
      y = doc.lastAutoTable.finalY + 8;
    }

    // Top customers
    if (topCustomers.length > 0) {
      if (y > 220) { doc.addPage(); y = 15; }
      doc.setFontSize(12);
      doc.text('Top khach hang', 14, y); y += 4;
      doc.autoTable({
        startY: y,
        head: [['Khach hang', 'Email', 'Tong chi', 'So don']],
        body: topCustomers.map(c => [c.customerName, c.email, fmtVND(c.totalSpent), c.paidOrders]),
        theme: 'striped', styles: { fontSize: 8 }
      });
    }

    doc.save(`revenue-report_${filter.startDate}_to_${filter.endDate}.pdf`);
  };

  // =========== GENERAL STATS ===========
  const stats = [
    { label: t('dashboard.total_revenue'), value: fmtVND(dashData.totalRevenue), icon: DollarSign, color: 'bg-emerald-500', trend: '+12.5%', trendUp: true },
    { label: t('dashboard.total_orders'), value: dashData.totalOrders || 0, icon: ShoppingBag, color: 'bg-indigo-500', trend: '+5.2%', trendUp: true },
    { label: t('dashboard.processed'), value: dashData.processedOrders || 0, icon: CreditCard, color: 'bg-blue-500', trend: '+2.1%', trendUp: true },
    { label: t('dashboard.unprocessed'), value: dashData.unprocessedOrders || 0, icon: PackageSearch, color: 'bg-orange-500', trend: '-1.5%', trendUp: false },
    { label: t('dashboard.total_users'), value: dashData.users?.length || 0, icon: Users, color: 'bg-amber-500', trend: '+18.2%', trendUp: true },
    { label: t('dashboard.comments'), value: dashData.qcomments || 0, icon: MessageSquare, color: 'bg-rose-500', trend: '+4.3%', trendUp: true },
    { label: t('dashboard.low_stock'), value: dashData.lowStockCount || 0, icon: TrendingUp, color: 'bg-red-500', trend: '-2.0%', trendUp: false },
    { label: t('dashboard.active_vouchers'), value: `${dashData.voucherStats?.activeVouchers || 0} / ${dashData.voucherStats?.totalVouchers || 0}`, icon: DollarSign, color: 'bg-teal-500', trend: '0%', trendUp: true },
  ];

  // Period stats cards
  const periodStats = [
    {
      label: 'Doanh thu trong kỳ', value: fmtVND(summary.totalRevenue), icon: DollarSign,
      colorClass: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white',
      desc: `Lọc từ ${filter.startDate} đến ${filter.endDate}`,
      change: comparison?.changes?.revenueChangePercent, changeVal: comparison?.changes?.revenueChange
    },
    {
      label: 'Đơn thanh toán thành công', value: `${summary.totalPaidOrders || 0} đơn`, icon: ShoppingBag,
      colorClass: 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white',
      desc: 'Các đơn có trạng thái đã thanh toán',
      change: comparison?.changes?.paidOrdersChangePercent, changeVal: comparison?.changes?.paidOrdersChange
    },
    {
      label: 'Giá trị đơn trung bình', value: fmtVND(summary.averageOrderValue), icon: CreditCard,
      colorClass: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
      desc: 'Doanh thu chia cho số đơn thành công',
      change: comparison?.changes?.averageOrderValueChangePercent, changeVal: comparison?.changes?.averageOrderValueChange
    },
    {
      label: 'Sản phẩm đã bán', value: `${summary.totalItemsSold || 0} sản phẩm`, icon: TrendingUp,
      colorClass: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white',
      desc: 'Tổng số lượng sản phẩm bán ra',
      change: comparison?.changes?.itemsSoldChangePercent, changeVal: comparison?.changes?.itemsSoldChange
    }
  ];

  const CAT_COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{t('dashboard.title')}</h1>
          <p className="text-gray-500 mt-1">{t('dashboard.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExportExcel} disabled={!hasData || loadingRevenue}
            className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Xuất Excel
          </button>
          <button onClick={handleExportPDF} disabled={!hasData || loadingRevenue}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Xuất PDF
          </button>
          <button onClick={() => { getDashData(); handleApplyFilter(); }} className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      {/* Stats Cards (General/Lifetime) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className={`${item.color} p-3 rounded-xl text-white shadow-sm group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {item.trend}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800 mb-1">{item.value}</p>
              <p className="text-sm font-medium text-gray-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 my-8"></div>

      {/* Filter Form Block */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h3 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" /> Bộ lọc thống kê doanh thu theo kỳ
        </h3>
        <form onSubmit={handleApplyFilter} className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[160px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Khoảng thời gian</label>
              <select value={filter.preset} onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
                <option value="today">Hôm nay</option>
                <option value="7d">7 ngày qua</option>
                <option value="30d">30 ngày qua</option>
                <option value="thisMonth">Tháng này</option>
                <option value="thisYear">Năm nay</option>
                <option value="custom">Tùy chỉnh khoảng ngày</option>
              </select>
            </div>

            {filter.preset === 'custom' && (
              <>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Từ ngày</label>
                  <input type="date" value={filter.startDate} onChange={(e) => setFilter(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" required />
                </div>
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Đến ngày</label>
                  <input type="date" value={filter.endDate} onChange={(e) => setFilter(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" required />
                </div>
              </>
            )}

            <div className="flex-1 min-w-[120px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Nhóm theo</label>
              <select value={filter.groupBy} onChange={(e) => setFilter(prev => ({ ...prev, groupBy: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
                <option value="day">Theo Ngày</option>
                <option value="month">Theo Tháng</option>
                <option value="year">Theo Năm</option>
              </select>
            </div>
          </div>

          {/* Advanced filters row */}
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Trạng thái đơn</label>
              <select value={filter.orderStatus} onChange={(e) => setFilter(prev => ({ ...prev, orderStatus: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
                <option value="all">Tất cả</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đã giao</option>
                <option value="delivered">Đã nhận</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Phương thức TT</label>
              <select value={filter.paymentMethod} onChange={(e) => setFilter(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
                <option value="all">Tất cả</option>
                {paymentMethods.map(pm => <option key={pm} value={pm}>{pm}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Danh mục SP</label>
              <select value={filter.categoryId} onChange={(e) => setFilter(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
                <option value="all">Tất cả</option>
                {categories.map(c => <option key={c.CategoryID} value={c.CategoryID}>{c.CategoryName}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2 min-w-[180px] pb-0.5">
              <input type="checkbox" id="compareToggle" checked={filter.compare}
                onChange={(e) => setFilter(prev => ({ ...prev, compare: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <label htmlFor="compareToggle" className="text-sm font-medium text-gray-700 cursor-pointer">So sánh kỳ trước</label>
            </div>
            <button type="submit"
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all">
              Lọc dữ liệu
            </button>
          </div>
        </form>
      </div>

      {/* Filtered Period Statistics Section */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Thống kê trong kỳ lọc</h2>

        {/* Mock Data Warning */}
        {isMock && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <div>
              <p className="text-sm font-bold text-amber-800">⚠ Đang hiển thị dữ liệu mẫu, không phải số liệu doanh thu thật.</p>
              <p className="text-xs text-amber-600 mt-1">{revenueStats?.mockMessage || "Dữ liệu bên dưới chỉ dùng cho mục đích phát triển/test. Vui lòng kết nối database để xem doanh thu thực tế."}</p>
            </div>
          </div>
        )}

        {/* API Error State */}
        {isError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            <div>
              <p className="text-sm font-bold text-red-800">Không thể tải thống kê doanh thu</p>
              <p className="text-xs text-red-600 mt-1">{revenueStats?._errorMessage || "Đã xảy ra lỗi khi kết nối máy chủ."}</p>
            </div>
          </div>
        )}

        {!isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {periodStats.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400 mb-1">{item.label}</p>
                <p className="text-2xl font-bold text-gray-800 mb-1">
                  {item.value}
                  {comparison?.enabled && renderChange(item.change, item.changeVal)}
                </p>
                <p className="text-[11px] text-gray-400 font-medium line-clamp-1">{item.desc}</p>
              </div>
              <div className={`${item.colorClass} p-4 rounded-2xl shadow-md flex items-center justify-center`}>
                <item.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Comparison Detail */}
        {comparison?.enabled && !isError && (
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
            <h3 className="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> So sánh với kỳ trước ({comparison.previousPeriod.startDate} → {comparison.previousPeriod.endDate})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">Doanh thu kỳ trước</p>
                <p className="font-bold text-gray-800">{fmtVND(comparison.previousPeriod.totalRevenue)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">Đơn kỳ trước</p>
                <p className="font-bold text-gray-800">{comparison.previousPeriod.totalPaidOrders}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">AOV kỳ trước</p>
                <p className="font-bold text-gray-800">{fmtVND(comparison.previousPeriod.averageOrderValue)}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-gray-500 text-xs mb-1">SP bán kỳ trước</p>
                <p className="font-bold text-gray-800">{comparison.previousPeriod.totalItemsSold}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Line Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" /> Doanh thu theo thời gian lọc
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-full">
              Nhóm theo: {filter.groupBy === 'day' ? 'Ngày' : filter.groupBy === 'month' ? 'Tháng' : 'Năm'}
            </span>
          </div>

          {loadingRevenue ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : chartSeriesData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-gray-400 font-medium bg-gray-50 rounded-xl border border-dashed border-gray-200">
              Không có dữ liệu trong khoảng thời gian này
            </div>
          ) : (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartSeriesData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 11}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}k`} tick={{fill: '#9ca3af', fontSize: 11}} dx={-10} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    formatter={(value, name) => [name === 'revenue' ? fmtVND(value) : value, name === 'revenue' ? 'Doanh thu' : 'Số đơn']}
                    cursor={{stroke: '#e5e7eb', strokeWidth: 2}} />
                  <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Order Status Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-1">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Trạng thái đơn hàng trong kỳ</h2>
          {loadingRevenue ? (
            <div className="h-[250px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={orderPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {orderPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Category Revenue + Payment Method Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Category Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Doanh thu theo danh mục</h2>
          {loadingRevenue ? (
            <div className="h-[250px] flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></div>
          ) : categoryRevenue.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm font-medium">Không có dữ liệu</div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryRevenue} layout="vertical" margin={{ top: 5, right: 20, left: 5, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                  <XAxis type="number" tickFormatter={v => `${(v / 1000000).toFixed(0)}M`} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="categoryName" width={120} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => [fmtVND(v), 'Doanh thu']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                    {categoryRevenue.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Payment Method Revenue */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Doanh thu theo phương thức thanh toán</h2>
          {loadingRevenue ? (
            <div className="h-[250px] flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></div>
          ) : paymentMethodRevenue.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm font-medium">Không có dữ liệu</div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentMethodRevenue} cx="50%" cy="45%" outerRadius={90} dataKey="revenue" nameKey="paymentMethod" label={({ paymentMethod, percentOfRevenue }) => `${paymentMethod} (${percentOfRevenue}%)`}>
                    {paymentMethodRevenue.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => [fmtVND(v), 'Doanh thu']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Top Products + Top Customers + Latest Users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Selling Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Top sản phẩm bán chạy</h2>
            <button onClick={() => navigate('/products')} className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 flex items-center">
              Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          {loadingRevenue ? (
            <div className="py-8 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></div>
          ) : topProductsList.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm font-medium">Không có sản phẩm</div>
          ) : (
            <div className="space-y-3">
              {topProductsList.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer" onClick={() => navigate('/products')}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-100 text-amber-600' : index === 1 ? 'bg-gray-200 text-gray-600' : index === 2 ? 'bg-orange-100 text-orange-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">{product.productName}</p>
                      {product.categoryName && <p className="text-[10px] text-gray-400">{product.categoryName}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded-lg">{product.totalSold || product.total_sold}</p>
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">{t('dashboard.units_sold')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Customers */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Top khách hàng</h2>
          {loadingRevenue ? (
            <div className="py-8 flex items-center justify-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div></div>
          ) : topCustomers.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-sm font-medium">Không có dữ liệu</div>
          ) : (
            <div className="space-y-3">
              {topCustomers.slice(0, 5).map((cust, index) => (
                <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-amber-100 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800 line-clamp-1">{cust.customerName}</p>
                      <p className="text-[10px] text-gray-400">{cust.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{fmtVND(cust.totalSpent)}</p>
                    <p className="text-[10px] text-gray-400">{cust.paidOrders} đơn</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">{t('dashboard.latest_users')}</h2>
            <button onClick={() => navigate('/users')} className="text-sm text-indigo-600 font-semibold hover:text-indigo-800 flex items-center">
              Xem tất cả <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-3">
            {dashData.users.slice(0, 5).map((user, index) => (
              <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer" key={index} onClick={() => navigate('/users')}>
                <div className="flex items-center gap-3">
                  <img className="rounded-full w-9 h-9 object-cover border-2 border-white shadow-sm" src={user.image} alt="" />
                  <div>
                    <p className="text-sm font-bold text-gray-800">{user.name}</p>
                    <p className="text-[10px] text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-indigo-100 hover:text-indigo-600 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
