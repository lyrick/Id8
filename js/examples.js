// 示例模板
const examples = {
    flowchart: `graph TD
    A[开始] --> B{判断条件}
    B -->|条件1| C[处理1]
    B -->|条件2| D[处理2]
    C --> E[结束]
    D --> E`,
    sequence: `sequenceDiagram
    participant 用户
    participant 系统
    participant 数据库
    
    用户->>系统: 提交表单
    系统->>系统: 验证表单
    系统->>数据库: 保存数据
    数据库-->>系统: 返回结果
    系统-->>用户: 显示成功消息`,
    state: `stateDiagram-v2
    [*] --> 待处理
    待处理 --> 处理中: 开始处理
    处理中 --> 已完成: 处理完成
    处理中 --> 已取消: 取消处理
    已完成 --> [*]
    已取消 --> [*]`,
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
    Animal <|-- Cat`
};

// examples变量已设为全局变量，无需导出