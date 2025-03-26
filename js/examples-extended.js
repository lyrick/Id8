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
    部署上线      : 2023-02-26, 2023-03-01`
    }
};