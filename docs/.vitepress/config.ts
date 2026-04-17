import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

/** GitHub Pages：项目页为 /<repo>/；用户/组织站点仓库 *.github.io 为根路径 */
function resolveBase(): string {
  if (process.env.VITEPRESS_BASE) {
    return process.env.VITEPRESS_BASE
  }
  const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]
  if (!repo || repo.endsWith('.github.io')) {
    return '/'
  }
  return `/${repo}/`
}

export default withMermaid(defineConfig({
  title: '飞创 Fitron',
  description: '飞创 Fitron — 无人值守连锁健身房服务系统规划文档',
  lang: 'zh-CN',
  base: resolveBase(),
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
                { text: '硬件控制面板', link: '/subsystems/admin-web/hardware' },
                { text: '数据分析', link: '/subsystems/admin-web/analytics' },
                { text: '财务管理', link: '/subsystems/admin-web/finance' },
                { text: '外部券码管理', link: '/subsystems/admin-web/vouchers' },
              ],
            },
            {
              text: '微信小程序体系',
              collapsed: false,
              items: [
                { text: '体系概览', link: '/subsystems/mini-program' },
                {
                  text: '客户端小程序',
                  collapsed: false,
                  items: [
                    { text: '概览', link: '/subsystems/mini-program/client/' },
                    { text: '登录与账号', link: '/subsystems/mini-program/client/login' },
                    { text: '首页 / 门店 / 营销', link: '/subsystems/mini-program/client/home-marketing' },
                    { text: '产品购买', link: '/subsystems/mini-program/client/purchase' },
                    { text: '会员与订单', link: '/subsystems/mini-program/client/membership' },
                    { text: '人脸录入', link: '/subsystems/mini-program/client/face' },
                    { text: '淋浴服务', link: '/subsystems/mini-program/client/shower' },
                    { text: '外部券码', link: '/subsystems/mini-program/client/voucher' },
                    { text: '个人中心', link: '/subsystems/mini-program/client/profile' },
                  ],
                },
                {
                  text: '店长端小程序',
                  collapsed: false,
                  items: [
                    { text: '概览', link: '/subsystems/mini-program/manager/' },
                    { text: '登录与权限初始化', link: '/subsystems/mini-program/manager/login' },
                    { text: '统计报表分析', link: '/subsystems/mini-program/manager/analytics' },
                    { text: '控制开门', link: '/subsystems/mini-program/manager/door-control' },
                  ],
                },
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
            {
              text: '基础',
              collapsed: false,
              items: [
                { text: '远程 SSH 到工控机', link: '/functional-systems/basics/remote-ssh' },
                { text: '工控机看门狗及进程保活', link: '/functional-systems/basics/watchdog' },
                { text: 'OTA 更新', link: '/functional-systems/basics/ota' },
                { text: '小程序发布', link: '/functional-systems/basics/miniprogram-release' },
                { text: '接口通信安全', link: '/functional-systems/basics/api-security' },
                { text: '数据备份与权限控制', link: '/functional-systems/basics/backup-access' },
                { text: 'API 定义文档系统', link: '/functional-systems/basics/api-docs' },
                { text: '域名备案与 HTTPS 证书', link: '/functional-systems/basics/domain-https' },
                { text: '安全发布与测试流程', link: '/functional-systems/basics/release-process' },
                { text: '多语言机制（i18n）', link: '/functional-systems/i18n' },
              ],
            },
            {
              text: '用户',
              collapsed: false,
              items: [
                { text: '账号（微信 + 手机号）', link: '/functional-systems/user-system' },
                { text: '人脸管理', link: '/functional-systems/face-recognition' },
                { text: '订单记录', link: '/functional-systems/order-system' },
                { text: '进店记录', link: '/functional-systems/user-system#进出记录' },
                { text: '封禁', link: '/functional-systems/user-system#用户封禁逻辑' },
              ],
            },
            {
              text: '门店',
              collapsed: false,
              items: [
                { text: '门店信息（定位 + 平面图）', link: '/functional-systems/store/info' },
                { text: '设备位置管理', link: '/functional-systems/store/device-layout' },
                { text: '设备配置', link: '/functional-systems/hardware-control' },
                { text: '设备控制', link: '/functional-systems/hardware-control' },
                { text: '外部平台配置（美团 / 抖音）', link: '/functional-systems/external-voucher' },
                { text: '门店用户管理', link: '/functional-systems/store/users' },
                { text: '门店产品列表', link: '/functional-systems/product-system#多门店产品' },
                { text: '门店订单管理', link: '/functional-systems/order-system' },
                { text: '门店数据概览', link: '/functional-systems/analytics' },
              ],
            },
            {
              text: '产品',
              collapsed: false,
              items: [
                { text: '产品类型定义', link: '/functional-systems/product-system#产品类型' },
                { text: '产品列表与定价', link: '/functional-systems/product-system' },
              ],
            },
            {
              text: '运营',
              collapsed: true,
              items: [
                { text: '优惠券（暂不做）', link: '/functional-systems/' },
                { text: '活动（暂不做）', link: '/functional-systems/' },
              ],
            },
            {
              text: '订单',
              collapsed: false,
              items: [
                { text: '多端口订单系统', link: '/functional-systems/order-system' },
                { text: '三方券码核销', link: '/functional-systems/external-voucher' },
              ],
            },
            {
              text: '支付',
              collapsed: false,
              items: [
                { text: '微信支付', link: '/functional-systems/payment' },
                { text: '资格申请', link: '/functional-systems/payment#资格申请' },
              ],
            },
            {
              text: '门禁',
              collapsed: false,
              items: [
                { text: '人脸识别进出控制（AB 门）', link: '/functional-systems/face-recognition' },
                { text: '人脸录入与存储', link: '/functional-systems/face-recognition#录入流程' },
                { text: '三级门禁架构', link: '/functional-systems/access-control' },
              ],
            },
            {
              text: '硬件',
              collapsed: false,
              items: [
                { text: '硬件选型 BOM', link: '/hardware/bom' },
                { text: '硬件接线图', link: '/hardware/wiring-rules' },
                { text: '工控机与各硬件通信方式', link: '/functional-systems/basics/ipc-hardware-comm' },
                { text: '工控机软件初始化', link: '/functional-systems/basics/ipc-init' },
                { text: '工控机与云端通信协议', link: '/functional-systems/basics/ipc-cloud-protocol' },
                { text: '工控机控制逻辑', link: '/functional-systems/hardware-control' },
              ],
            },
            {
              text: '动作库管理',
              collapsed: false,
              items: [
                { text: '动作库', link: '/functional-systems/action-library' },
              ],
            },
            {
              text: '留言',
              collapsed: false,
              items: [
                { text: '设备报修', link: '/functional-systems/message/repair' },
                { text: '加盟咨询', link: '/functional-systems/message/franchise' },
                { text: '投诉与建议', link: '/functional-systems/message/feedback' },
              ],
            },
            {
              text: '数据分析',
              collapsed: false,
              items: [
                { text: '财务分析', link: '/functional-systems/analytics#财务分析' },
                { text: '经营分析', link: '/functional-systems/analytics' },
              ],
            },
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
      message: '飞创 Fitron 内部规划文档',
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
