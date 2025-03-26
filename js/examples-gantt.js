/**
 * 甘特图示例
 * 包含正确格式的甘特图代码
 */

const ganttExamples = {
    // 基础甘特图示例 - 使用正确的日期格式 YYYY-MM-DD
    basic: `gantt
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
    部署上线      : 2023-02-26, 2023-03-01
    `,
    
    // 高级甘特图示例 - 包含里程碑和依赖关系
    advanced: `gantt
    title 产品发布计划
    dateFormat YYYY-MM-DD
    axisFormat %m/%d
    
    section 产品规划
    市场调研           : a1, 2023-03-01, 10d
    产品需求文档        : a2, after a1, 7d
    产品规划完成        : milestone, after a2, 0d
    
    section 设计开发
    UI/UX设计          : b1, after a2, 15d
    前端开发            : b2, after b1, 20d
    后端开发            : b3, after a2, 25d
    API集成            : b4, after b2, 5d
    
    section 测试发布
    QA测试             : c1, after b4, 10d
    Bug修复            : c2, after c1, 5d
    产品发布            : milestone, after c2, 0d
    `
};

// 将甘特图示例添加到扩展示例中
if (typeof extendedExamples !== 'undefined' && extendedExamples.mermaid) {
    extendedExamples.mermaid.gantt = ganttExamples.basic;
}