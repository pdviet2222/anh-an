import React, { createContext, useContext, useState, useEffect } from 'react'

const translations = {
  en: {
    login: {
      welcome: 'Welcome Back',
      subtitle: "Enter your credentials to access the VIP dashboard",
      createAccount: 'Create Account',
      email: 'Email Address',
      username: 'Username',
      password: 'Password',
      signIn: 'Sign In to Dashboard',
      signUp: 'Sign Up Now',
      registerVIP: 'Register VIP',
      alreadyHave: 'Already have an account?',
      registerSuccess: 'Registration successful! Please login.'
    },
    dashboard: {
      title: 'System Analytics',
      subtitle: "Welcome back! Here's what's happening with your properties today.",
      exportPDF: 'Export PDF',
      refreshData: 'Refresh Data',
      total_revenue: 'Total Revenue'
    },
    lands: {
      title: 'Property Inventory',
      subtitle: 'Manage and track all land assets in real-time.',
      addNew: 'Add New Listing',
      filterPlaceholder: 'Filter by title, price, or location...',
      loading: 'Loading properties...',
      propertyDetails: 'Property Details',
      location: 'Location',
      area: 'Area',
      valuation: 'Valuation',
      status: 'Status',
      actions: 'Actions',
      cancel: 'Cancel',
      publish: 'Publish Listing',
      update: 'Update Property',
      newListing: 'New Property Listing',
      updateListing: 'Update Listing'
    },
    map: {
      title: 'Interactive Asset Map',
      subtitle: 'Visualize all property assets geographically.',
      fullScreen: 'Full Screen',
      showing: 'Showing {n} active plots'
    },
    transactions: {
      title: 'Transaction History'
    },
    common: {
      available: 'Available',
      sold: 'Sold',
      pending: 'Pending',
      logout: 'Logout',
      language: 'Language'
    }
  },
  vi: {
    login: {
      welcome: 'Chào mừng trở lại',
      subtitle: 'Nhập thông tin để truy cập bảng điều khiển',
      createAccount: 'Tạo tài khoản',
      email: 'Email',
      username: 'Tên đăng nhập',
      password: 'Mật khẩu',
      signIn: 'Đăng nhập',
      signUp: 'Đăng ký',
      registerVIP: 'Đăng ký VIP',
      alreadyHave: 'Đã có tài khoản?',
      registerSuccess: 'Đăng ký thành công! Vui lòng đăng nhập.'
    },
    dashboard: {
      title: 'Phân tích hệ thống',
      subtitle: 'Xin chào! Đây là thông tin hoạt động bất động sản của bạn hôm nay.',
      exportPDF: 'Xuất PDF',
      refreshData: 'Làm mới dữ liệu',
      total_revenue: 'Tổng doanh thu'
    },
    lands: {
      title: 'Danh sách bất động sản',
      subtitle: 'Quản lý và theo dõi tất cả tài sản đất theo thời gian thực.',
      addNew: 'Thêm danh sách mới',
      filterPlaceholder: 'Tìm theo tiêu đề, giá hoặc vị trí...',
      loading: 'Đang tải danh sách...',
      propertyDetails: 'Chi tiết bất động sản',
      location: 'Vị trí',
      area: 'Diện tích',
      valuation: 'Giá trị',
      status: 'Trạng thái',
      actions: 'Hành động',
      cancel: 'Hủy',
      publish: 'Đăng',
      update: 'Cập nhật',
      newListing: 'Tạo danh sách mới',
      updateListing: 'Cập nhật danh sách'
    },
    map: {
      title: 'Bản đồ tương tác',
      subtitle: 'Hiển thị tất cả tài sản theo vị trí địa lý.',
      fullScreen: 'Toàn màn hình',
      showing: 'Hiển thị {n} lô đang hoạt động'
    },
    transactions: {
      title: 'Lịch sử giao dịch'
    },
    common: {
      available: 'Còn',
      sold: 'Đã bán',
      pending: 'Đang chờ',
      logout: 'Đăng xuất',
      language: 'Ngôn ngữ'
    }
  }
}

const I18nContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState('en')

  useEffect(() => {
    const stored = localStorage.getItem('locale')
    if (stored) setLocale(stored)
  }, [])

  useEffect(() => {
    localStorage.setItem('locale', locale)
  }, [locale])

  const t = (path, vars) => {
    const parts = path.split('.')
    let cur = translations[locale]
    for (const p of parts) {
      if (!cur) return path
      cur = cur[p]
    }
    if (typeof cur === 'string' && vars) {
      return cur.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '')
    }
    return cur || path
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useTranslation = () => useContext(I18nContext)

export default I18nContext
