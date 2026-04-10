# 门店信息

**涉及子系统**：云端 API、管理后台、小程序
**核心业务**：门店基础信息维护、地图定位、平面图上传与展示

---

## 门店数据模型

```
Store {
  id            String
  name          String          # 门店名称
  address       String          # 详细地址
  lat           Decimal         # 纬度
  lng           Decimal         # 经度
  phone         String?         # 联系电话
  openHours     String          # 营业时间（如 "06:00-23:00"）
  floorPlanUrl  String?         # 平面图图片 URL
  status        Enum            # OPEN / CLOSED / MAINTENANCE
  createdAt     DateTime
}
```

---

## 功能说明

- **管理后台**：新增/编辑门店信息，上传平面图，设置营业状态
- **小程序**：在门店列表展示位置、营业时间，可打开地图导航
- **平面图**：用于设备位置管理模块中标注设备坐标

---

## 待确认事项

- [ ] 平面图是否支持多楼层
- [ ] 门店状态变更是否推送通知给该店用户
