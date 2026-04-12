# 工控机硬件接口分类与通信方式

**涉及子系统**：工控机
**核心业务**：定义工控机物理接口的分类规范与各类接口的通信方式

---

## 接口分类总览

工控机的所有硬件接口分为以下四类，端口类型决定了通信方式和 driver 选型：

| 类型 | 通信介质 | 适用硬件 | 端口 ID 前缀 |
|---|---|---|---|
| 485Hub 继电器 | RS485 总线 + 继电器模块 | 灯光、门锁、热水阀等一切需要开关控制的设备 | `relay_` |
| 485Hub Modbus | RS485 总线 + Modbus RTU | 需要读写寄存器的设备（温湿度传感器、部分空调等） | `modbus_` |
| 专用接口 | RS485 / USB / RS232 | 空调主机、UPS 等有独立通信协议的设备 | 按设备类型（`ac_`、`ups`） |
| 网络接口 | RJ45（TCP/IP） | 刷脸机、摄像头、Modbus TCP 设备等 | `net_` |

---

## 1. 485Hub 继电器类

### 特性

- 物理形态：485Hub 上的继电器输出模块，每个模块提供若干路继电器通道
- 接口本质：纯开关信号（继电器闭合 / 断开），**无类型限制**，可接任意需要开关控制的设备
- 端口用途由工控机本地配置的 `role` 字段定义，与端口 ID 无关

### 端口 ID 规范

按物理编号命名：`relay_01`、`relay_02`、……、`relay_NN`

### 工控机本地配置示例

```json
{
  "deviceId": "relay_01",
  "portClass": "relay",
  "label": "A 门电磁锁",
  "role": "door_lock",
  "driver": "relay_485hub",
  "driverConfig": {
    "busPort": "/dev/ttyUSB0",
    "address": 1,
    "channel": 1
  }
}
```

```json
{
  "deviceId": "relay_03",
  "portClass": "relay",
  "label": "健身区灯光",
  "role": "light",
  "driver": "relay_485hub",
  "driverConfig": {
    "busPort": "/dev/ttyUSB0",
    "address": 1,
    "channel": 3
  }
}
```

### role 枚举

| role | 适用场景 | 说明 |
|---|---|---|
| `door_lock` | A 门、B 门电磁锁 | 支持 `door_control` 指令的解锁/锁定语义（含时长） |
| `light` | 各区域灯光 | 支持 `relay_control` 指令，on/off 开关 |
| `shower_valve` | 淋浴热水阀 | 支持 `shower_valve` / `shower_countdown` 指令 |
| `shower_light` | 淋浴间内部灯光 | 支持 `shower_light` 指令（可覆盖本地自动策略） |
| `generic` | 其他通用开关设备 | 仅支持 `relay_control` on/off |

---

## 2. 485Hub Modbus 专用类

### 特性

- 物理形态：通过 RS485 总线连接的 Modbus RTU 设备
- 与继电器类的区别：需要读写设备寄存器，不是单纯的开关信号
- 不同品牌 / 型号的设备对应不同寄存器地址和数据格式，由 driver 实现封装

### 端口 ID 规范

按设备类型 + 序号命名：`modbus_sensor_01`、`modbus_ac_01` 等

### 工控机本地配置示例（温湿度传感器）

```json
{
  "deviceId": "modbus_sensor_01",
  "portClass": "modbus",
  "label": "健身区温湿度传感器",
  "role": "env_sensor",
  "driver": "generic_temp_humidity",
  "driverConfig": {
    "busPort": "/dev/ttyUSB0",
    "address": 2,
    "baudRate": 9600
  }
}
```

---

## 3. 专用接口类

### 特性

- 物理端口硬件设计为特定设备专用（如空调 RS485 主机接口、UPS RS232 接口）
- 采用设备厂商专有协议或独立 Modbus 配置，driver 按品牌适配

### 端口 ID 规范

按设备类型 + 序号命名，单台设备省略序号：

| 示例 deviceId | 说明 |
|---|---|
| `ac_01`、`ac_02` | 空调，支持多台 |
| `ups` | UPS 电源（通常单台） |

### 空调 driver 清单

| driver | 说明 |
|---|---|
| `midea_modbus` | 美的空调 RS485 Modbus RTU |
| `gree_modbus` | 格力空调 RS485 Modbus RTU |
| `daikin_modbus` | 大金空调 RS485 Modbus RTU |
| `generic_infrared` | 通用红外码（需配置码库文件） |

### 工控机本地配置示例（空调）

```json
{
  "deviceId": "ac_01",
  "portClass": "dedicated",
  "label": "健身区空调",
  "role": "ac",
  "driver": "midea_modbus",
  "driverConfig": {
    "busPort": "/dev/ttyUSB1",
    "address": 1,
    "baudRate": 9600
  }
}
```

---

## 4. 网络接口类（RJ45）

### 特性

- 通过 RJ45 以太网接入局域网，通过 IP 地址 + 端口 + 协议访问设备
- 协议多样：HTTP、TCP（自定义）、Modbus TCP、RTSP/ONVIF 等

### 端口 ID 规范

按设备类型 + 序号命名：`net_face_01`、`net_camera_01` 等

### 工控机本地配置示例

```json
{
  "deviceId": "net_face_01",
  "portClass": "network",
  "label": "入口刷脸机",
  "role": "face_reader",
  "driver": "hikface_http",
  "driverConfig": {
    "host": "192.168.1.101",
    "port": 80,
    "protocol": "http"
  }
}
```

```json
{
  "deviceId": "net_camera_01",
  "portClass": "network",
  "label": "健身区监控摄像头",
  "role": "camera",
  "driver": "rtsp_generic",
  "driverConfig": {
    "host": "192.168.1.102",
    "port": 554,
    "protocol": "rtsp"
  }
}
```

---

## RS485 总线规范

- 协议：Modbus RTU（继电器类和 Modbus 类共用总线时按地址段隔离）
- 波特率：9600 / 19200（按设备规格，同一总线必须统一）
- 地址分配：每台工控机按设备类型预留地址段，具体分配在配置文件中定义

---

## 待确认事项

- [ ] 刷脸机品牌与 SDK/HTTP API 文档
- [ ] 空调品牌型号确认（决定 driver 选型）
- [ ] 灯光回路数量（决定 485Hub 继电器模块路数）
- [ ] 淋浴间数量（决定 shower_valve + shower_light 的继电器通道数）
- [ ] 工控机设备配置的管理方式（本地维护 vs 云端下发动态更新）
