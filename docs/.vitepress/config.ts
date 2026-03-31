import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(defineConfig({
  title: '健身房服务系统',
  description: '无人值守连锁健身房服务系统 — 规划文档',
  lang: 'zh-CN',
  base: '/',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '子系统', link: '/subsystems/' },
      { text: '功能系统', link: '/functional-systems/' },
      { text: '硬件', link: '/hardware/bom' },
      { text: '工期规划', link: '/planning/work-breakdown' },
    ],
    sidebar: {
      '/subsystems/': [
        {
          text: '子系统',
          items: [
            { text: '概览', link: '/subsystems/' },
            { text: '工控机子系统', link: '/subsystems/industrial-pc' },
            { text: '云端 API 服务', link: '/subsystems/cloud-api' },
            {
              text: '管理后台 Web',
              collapsed: false,
              items: [
                { text: '概览', link: '/subsystems/admin-web' },
                { text: '门店管理', link: '/subsystems/admin-web/stores' },
                { text: '会员管理', link: '/subsystems/admin-web/members' },
                { text: '订单管理', link: '/subsystems/admin-web/orders' },
                { text: '产品管理', link: '/subsystems/admin-web/products' },
                { text: '优惠券管理', link: '/subsystems/admin-web/coupons' },
                { text: '硬件控制面板', link: '/subsystems/admin-web/hardware' },
                { text: '数据分析', link: '/subsystems/admin-web/analytics' },
                { text: '财务管理', link: '/subsystems/admin-web/finance' },
                { text: '外部券码管理', link: '/subsystems/admin-web/vouchers' },
              ],
            },
            {
              text: '微信小程序',
              collapsed: false,
              items: [
                { text: '概览', link: '/subsystems/mini-program' },
                { text: '登录与账号', link: '/subsystems/mini-program/login' },
                { text: '人脸录入', link: '/subsystems/mini-program/face' },
                { text: '产品购买', link: '/subsystems/mini-program/purchase' },
                { text: '淋浴服务', link: '/subsystems/mini-program/shower' },
                { text: '会员与订单', link: '/subsystems/mini-program/membership' },
                { text: '外部券码', link: '/subsystems/mini-program/voucher' },
                { text: '个人中心', link: '/subsystems/mini-program/profile' },
                { text: '首页 / 门店 / 营销', link: '/subsystems/mini-program/home-marketing' },
              ],
            },
            { text: '飞书多维表格', link: '/subsystems/feishu-bitable' },
          ],
        },
      ],
      '/functional-systems/': [
        {
          text: '功能系统',
          items: [
            { text: '概览', link: '/functional-systems/' },
            { text: '刷脸系统（AB 门）', link: '/functional-systems/face-recognition' },
            { text: '门禁系统', link: '/functional-systems/access-control' },
            { text: '产品/计费系统', link: '/functional-systems/product-system' },
            { text: '订单系统', link: '/functional-systems/order-system' },
            { text: '用户系统', link: '/functional-systems/user-system' },
            { text: '优惠券系统', link: '/functional-systems/coupon-system' },
            { text: '外部平台券码核销', link: '/functional-systems/external-voucher' },
            { text: '淋浴系统', link: '/functional-systems/shower-system' },
            { text: '硬件控制系统', link: '/functional-systems/hardware-control' },
            { text: '数据分析系统', link: '/functional-systems/analytics' },
            { text: '多语言系统（i18n）', link: '/functional-systems/i18n' },
          ],
        },
      ],
      '/hardware/': [
        {
          text: '硬件文档',
          items: [
            { text: '硬件 BOM 清单', link: '/hardware/bom' },
            { text: '内部接线规则', link: '/hardware/wiring-rules' },
          ],
        },
      ],
      '/planning/': [
        {
          text: '工期规划',
          items: [
            { text: '工作内容梳理（WBS）', link: '/planning/work-breakdown' },
            { text: '工期预期', link: '/planning/timeline' },
          ],
        },
      ],
    },
    socialLinks: [],
    footer: {
      message: '健身房服务系统内部规划文档',
    },
    outline: {
      level: [2, 3],
      label: '本页目录',
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    darkModeSwitchLabel: '主题',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
              },
            },
          },
        },
      },
    },
  },
  mermaid: {
    theme: 'default',
  },
}))
