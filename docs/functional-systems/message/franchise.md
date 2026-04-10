# 加盟咨询

**涉及子系统**：云端 API、管理后台、小程序
**核心业务**：潜在加盟商通过小程序提交加盟意向，后台查看跟进

---

## 加盟留言流程

潜在加盟商在小程序填写基本信息（姓名、城市、联系方式、意向说明）提交后，系统创建加盟咨询记录，总部运营人员在管理后台查看并跟进联系。

---

## 数据模型

```
FranchiseInquiry {
  id          String
  name        String      # 联系人姓名
  phone       String      # 联系电话
  city        String      # 意向城市
  message     String?     # 补充说明
  status      Enum        # NEW / CONTACTED / QUALIFIED / CLOSED
  handledBy   String?     # 跟进人
  createdAt   DateTime
}
```

---

## 待确认事项

- [ ] 是否需要短信通知运营负责人
- [ ] 加盟资料落地页是否在小程序内展示
