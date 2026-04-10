# 设备位置管理

**涉及子系统**：云端 API、管理后台
**核心业务**：在门店平面图上标注各设备的物理位置，便于维护与远程控制定位

---

## 功能说明

管理员可在平面图编辑器中拖拽添加设备图标，标注设备类型（刷脸机、门锁、灯光、淋浴阀、温湿度传感器等）及其物理位置坐标，与设备配置中的逻辑设备 ID 绑定。

---

## 数据模型

```
DeviceLocation {
  id        String
  storeId   String
  deviceId  String      # 关联逻辑设备 ID
  type      Enum        # face_machine / door_lock / light / shower / sensor / ...
  label     String      # 显示名称（如：A门刷脸机、3号淋浴）
  x         Decimal     # 在平面图上的 x 坐标比例（0-1）
  y         Decimal     # 在平面图上的 y 坐标比例（0-1）
}
```

---

## 待确认事项

- [ ] 设备位置图是否需要在管理后台实时展示设备状态（在线/离线/报警）
