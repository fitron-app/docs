# 投诉与建议

**涉及子系统**：云端 API、管理后台、小程序
**核心业务**：用户投诉/建议收集，支持分类与回复

---

## 功能说明

用户可在小程序个人中心提交投诉或建议，选择类型（体验/服务/设施/其他）并附上描述及照片。管理员在后台查看、分类处理，并可选择回复。

---

## 数据模型

```
Feedback {
  id          String
  userId      String
  storeId     String?     # 针对某门店（可选）
  type        Enum        # COMPLAINT / SUGGESTION / OTHER
  content     String
  images      String[]
  status      Enum        # PENDING / REVIEWED / REPLIED / CLOSED
  reply       String?     # 管理员回复内容
  repliedAt   DateTime?
  createdAt   DateTime
}
```

---

## 待确认事项

- [ ] 回复是否通过微信服务通知推送给用户
- [ ] 是否需要对投诉数量做统计报表
