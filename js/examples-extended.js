/**
 * 扩展示例模板
 * 包含各种图表类型的示例代码
 */

const extendedExamples = {
    // Mermaid示例
    mermaid: {
        // 流程图示例
        flowchart: `graph TD
    A[开始] --> B{判断条件}
    B -->|条件1| C[处理1]
    B -->|条件2| D[处理2]
    C --> E[结束]
    D --> E`,
        
        // 时序图示例
        sequence: `sequenceDiagram
    participant 用户
    participant 系统
    participant 数据库
    
    用户->>系统: 提交表单
    系统->>系统: 验证表单
    系统->>数据库: 保存数据
    数据库-->>系统: 返回结果
    系统-->>用户: 显示成功消息`,
        
        // 状态图示例
        state: `stateDiagram-v2
    [*] --> 待处理
    待处理 --> 处理中: 开始处理
    处理中 --> 已完成: 处理完成
    处理中 --> 已取消: 取消处理
    已完成 --> [*]
    已取消 --> [*]`,
        
        // 类图示例
        class: `classDiagram
    class Animal {
        +String name
        +makeSound()
    }
    class Dog {
        +fetch()
    }
    class Cat {
        +scratch()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
        
        // 甘特图示例
        gantt: `gantt
    title 项目开发计划
    dateFormat YYYY-MM-DD
    section 规划阶段
    需求分析      : 2023-01-01, 2023-01-07
    系统设计      : 2023-01-08, 2023-01-15
    section 开发阶段
    编码实现      : 2023-01-16, 2023-01-31
    单元测试      : 2023-01-25, 2023-02-05
    section 测试阶段
    集成测试      : 2023-02-06, 2023-02-15
    用户验收测试   : 2023-02-16, 2023-02-25
    section 发布阶段
    部署上线      : 2023-02-26, 2023-03-01`,
        
        // 饼图示例
        pie: `pie title 项目资源分配
    "开发" : 45
    "测试" : 25
    "设计" : 15
    "运维" : 10
    "管理" : 5`,
        
        // ER图示例
        er: `erDiagram
    客户 ||--o{ 订单 : 下单
    订单 ||--|{ 订单项 : 包含
    订单 }|--|| 支付 : 关联
    产品 ||--o{ 订单项 : 选择`,
        
        // 用户旅程图示例
        journey: `journey
    title 用户购物体验
    section 浏览阶段
      访问网站: 5: 用户
      浏览商品: 4: 用户
      查看详情: 3: 用户
    section 购买阶段
      加入购物车: 5: 用户
      结算: 3: 用户
      支付: 4: 用户
    section 售后阶段
      收货: 5: 用户
      评价: 3: 用户`
    },
    
    // PlantUML示例
    plantuml: {
        // 类图示例
        class: `@startuml

class User {
  +String username
  +String password
  +login()
  +logout()
}

class Admin {
  +manageUsers()
  +configSystem()
}

class Customer {
  +browseProducts()
  +placeOrder()
}

User <|-- Admin
User <|-- Customer

@enduml`,
        
        // 时序图示例
        sequence: `@startuml

actor 用户
participant 前端
participant 服务器
database 数据库

用户 -> 前端: 提交登录表单
前端 -> 服务器: 发送登录请求
服务器 -> 数据库: 验证用户凭据
数据库 --> 服务器: 返回验证结果

alt 登录成功
    服务器 --> 前端: 返回成功和令牌
    前端 --> 用户: 显示欢迎信息
else 登录失败
    服务器 --> 前端: 返回错误信息
    前端 --> 用户: 显示错误提示
end

@enduml`,
        
        // 用例图示例
        usecase: `@startuml

left to right direction

actor 客户
actor 管理员

rectangle 电子商务系统 {
  usecase "浏览商品" as UC1
  usecase "搜索商品" as UC2
  usecase "购买商品" as UC3
  usecase "管理库存" as UC4
  usecase "处理订单" as UC5
}

客户 --> UC1
客户 --> UC2
客户 --> UC3
管理员 --> UC4
管理员 --> UC5

@enduml`,
        
        // 活动图示例
        activity: `@startuml

start

:用户登录;

if (验证成功?) then (是)
  :显示主页;
  fork
    :浏览商品;
  fork again
    :查看个人信息;
  end fork
  :选择商品;
  :加入购物车;
  :结算;
  if (支付成功?) then (是)
    :生成订单;
    :显示订单确认;
  else (否)
    :显示支付失败;
  endif
else (否)
  :显示错误信息;
  :返回登录页;
endif

stop

@enduml`,
        
        // 组件图示例
        component: `@startuml

package "前端" {
  [用户界面] as UI
  [客户端逻辑] as Client
}

package "后端" {
  [API网关] as Gateway
  [用户服务] as UserService
  [订单服务] as OrderService
  [支付服务] as PaymentService
  database "用户数据库" as UserDB
  database "订单数据库" as OrderDB
}

UI --> Client
Client --> Gateway
Gateway --> UserService
Gateway --> OrderService
Gateway --> PaymentService
UserService --> UserDB
OrderService --> OrderDB
PaymentService --> OrderDB

@enduml`,
        
        // 状态图示例
        state: `@startuml

[*] --> 待处理

待处理 --> 处理中 : 开始处理
处理中 --> 已完成 : 处理完成
处理中 --> 已取消 : 取消处理

已完成 --> [*]
已取消 --> [*]

state 处理中 {
  [*] --> 验证
  验证 --> 执行 : 验证通过
  验证 --> 失败 : 验证失败
  执行 --> [*] : 完成
  失败 --> [*] : 记录错误
}

@enduml`
    },
    
    // Graphviz示例
    graphviz: {
        // 有向图示例
        digraph: `digraph G {
    // 图形属性
    graph [rankdir=LR, fontname="Arial", fontsize=12];
    node [shape=box, style=filled, fillcolor=lightblue, fontname="Arial", fontsize=10];
    edge [fontname="Arial", fontsize=9];
    
    // 节点定义
    A [label="开始"];
    B [label="处理数据", fillcolor=lightgreen];
    C [label="验证结果", shape=diamond, fillcolor=lightyellow];
    D [label="成功处理", fillcolor=lightgreen];
    E [label="错误处理", fillcolor=lightpink];
    F [label="结束"];
    
    // 边定义
    A -> B [label="输入数据"];
    B -> C [label="处理完成"];
    C -> D [label="验证通过", color=green];
    C -> E [label="验证失败", color=red];
    D -> F;
    E -> F;
}`,
        
        // 无向图示例
        graph: `graph G {
    // 图形属性
    graph [fontname="Arial", fontsize=12];
    node [shape=circle, style=filled, fillcolor=lightblue, fontname="Arial", fontsize=10];
    edge [fontname="Arial", fontsize=9];
    
    // 节点定义
    A [label="用户A"];
    B [label="用户B"];
    C [label="用户C"];
    D [label="用户D"];
    E [label="用户E"];
    
    // 边定义 - 社交网络关系
    A -- B [label="朋友"];
    A -- C [label="朋友"];
    B -- C [label="朋友"];
    B -- D [label="朋友"];
    C -- D [label="朋友"];
    C -- E [label="朋友"];
    D -- E [label="朋友"];
}`,
        
        // 严格图示例
        strict: `strict digraph G {
    // 图形属性
    graph [rankdir=TB, fontname="Arial", fontsize=12];
    node [shape=box, style=filled, fillcolor=lightblue, fontname="Arial", fontsize=10];
    edge [fontname="Arial", fontsize=9];
    
    // 节点定义 - 组织结构
    CEO [label="CEO", fillcolor=gold];
    CTO [label="CTO", fillcolor=lightgreen];
    CFO [label="CFO", fillcolor=lightgreen];
    PM1 [label="项目经理1", fillcolor=lightskyblue];
    PM2 [label="项目经理2", fillcolor=lightskyblue];
    DEV1 [label="开发者1"];
    DEV2 [label="开发者2"];
    DEV3 [label="开发者3"];
    DEV4 [label="开发者4"];
    
    // 边定义 - 汇报关系
    CEO -> CTO;
    CEO -> CFO;
    CTO -> PM1;
    CTO -> PM2;
    PM1 -> DEV1;
    PM1 -> DEV2;
    PM2 -> DEV3;
    PM2 -> DEV4;
}`
    },
    
    // MathJax示例
    mathjax: {
        // 数学公式示例
        math: `\begin{align}
    E &= mc^2 \\
    \frac{\partial f}{\partial x} &= 2x + y \\
    \int_{a}^{b} f(x) dx &= F(b) - F(a) \\
    \sum_{i=1}^{n} i &= \frac{n(n+1)}{2}
\end{align}`
    }
};