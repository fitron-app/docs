---
layout: home

hero:
  name: 飞创 Fitron
  text: 无人值守连锁健身房
  tagline: 覆盖门禁刷脸、会员管理、硬件控制、数据分析的一体化服务平台
  actions:
    - theme: brand
      text: 查看子系统
      link: /subsystems/
    - theme: alt
      text: 功能系统
      link: /functional-systems/
    - theme: alt
      text: 工期规划
      link: /planning/work-breakdown

features:
  - title: 子系统
    details: 工控机、云端 API、管理后台 Web、微信小程序、飞书多维表格——五端协同，清晰分工。
    link: /subsystems/
  - title: 功能系统
    details: 基础运维、用户、门店、产品、订单、支付、门禁、硬件、数据分析等完整业务闭环。
    link: /functional-systems/
  - title: 硬件
    details: 硬件 BOM 清单与控制箱内部接线规范。
    link: /hardware/bom
  - title: 工期规划
    details: 基于 AI 辅助开发节奏的工作内容梳理与交付时间线。
    link: /planning/work-breakdown
---

## 项目概述

**飞创 Fitron** 旨在打造一套**无人值守连锁健身房**综合服务系统，通过自研硬件与软件的深度整合，实现用户从进店到离店全流程的自动化管理。

### 核心特点

- **自研 AB 门刷脸系统**：入口隔离间 + 本地人脸库 + 云端验证回退，安全可靠
- **连锁多店管理**：统一后台，支持多门店独立配置与数据汇总
- **硬件全自研**：工控机、控制箱、门禁、灯控均自主设计安装
- **AI 辅助开发**：三端分工明确，基于 AI 工具高效推进

---

## 团队分工

| 技术方向 | 负责内容 | 主要子系统 |
|---|---|---|
| **硬件端（负责人）** | 硬件设计、选型、组装、工控机程序 | 工控机子系统 |
| **后端程序员** | 云端服务、API、数据库、消息队列、飞书数据同步 | 云端 API 服务 + 飞书多维表格（同步任务） |
| **前端程序员** | 管理后台、微信小程序 | 管理后台 Web + 微信小程序 |

> 三端均基于 AI 辅助编程，工期估算已结合 AI 加速因子。

---

## 系统架构总览

```mermaid
graph TD
    MiniProgram["微信小程序\n注册 / 购买 / 人脸录入 / 订单 / 淋浴 / 三方券码"]
    CloudAPI["云端 API 服务\n用户 / 订单 / 产品 / 支付 / 人脸验证 / 硬件指令下发"]
    AdminWeb["管理后台 Web\n门店 / 用户 / 订单 / 数据分析 / 硬件控制 / 财务"]
    IPC["工控机子系统\n本地人脸库 / 门禁控制 / 灯控 / 淋浴 / UPS 监控"]
    Hardware["控制箱硬件\nAB 门锁 / 门磁 / 摄像头 / 灯光继电器 / 淋浴阀 / 空调"]
    Feishu["飞书多维表格\n老板 / 财务 / 灵活数据分析"]

    MiniProgram -->|"HTTPS"| CloudAPI
    AdminWeb -->|"HTTPS"| CloudAPI
    CloudAPI -->|"MQTT / HTTP"| IPC
    CloudAPI -->|"飞书开放平台 API"| Feishu
    IPC -->|"GPIO / RS485 / Relay"| Hardware
```

---

## 快速导航

- [子系统概览](/subsystems/) — 了解各子系统的边界与职责
- [功能系统概览](/functional-systems/) — 了解各功能系统的业务逻辑
- [硬件 BOM](/hardware/bom) — 硬件选型与物料清单
- [接线规则](/hardware/wiring-rules) — 控制箱内部接线规范
- [工作内容梳理](/planning/work-breakdown) — 各功能点三端任务拆解
- [工期预期](/planning/timeline) — 交付里程碑与时间线
