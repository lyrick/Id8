/**
 * 语言切换功能
 * 支持中英文双语切换
 */

class LanguageSwitcher {
    constructor() {
        this.currentLanguage = 'zh'; // 默认语言为中文
        this.translations = {
            zh: {}, // 中文翻译
            en: {}  // 英文翻译
            // 可以根据需要添加更多语言
        };
        this.initTranslations();
    }

    /**
     * 初始化翻译内容
     */
    initTranslations() {
        // 中文翻译（默认语言，作为参考）
        this.translations.zh = {
            // 页面标题和描述
            'page_title': '流程图生成工具',
            'page_subtitle': '支持多种图表库，轻松创建美观的流程图',
            'footer_text': '© 2023 流程图生成工具 | 使用纯前端技术构建',
            
            // 层级导航
            'level1_title': '1. 选择编辑模式',
            'level2_title': '2. 选择渲染器',
            'level3_title': '3. 选择图表类型',
            
            // 编辑器和预览
            'editor_title': '编辑器',
            'preview_title': '预览',
            'markdown_placeholder': '请输入Markdown格式的流程图代码，例如：\ngraph TD\n    A[开始] --> B{判断条件}\n    B -->|条件1| C[处理1]\n    B -->|条件2| D[处理2]\n    C --> E[结束]\n    D --> E',
            'plaintext_placeholder': '请输入纯文本格式的流程图代码，例如：\ngraph TD\nA[用户支付] --> B(判断余额是否充足?)\nB --> |N| C[选择银行卡支付]\nB --> |Y| D[输入密码支付]\nC --> E(验证是否成功?)\nD --> F\nE --> |N| F[重新支付]\nE --> |Y| G[支付成功]',
            
            // 按钮和控件
            'generate_btn': '生成流程图',
            'download_btn': '下载图片',
            'clear_btn': '清空内容',
            'color_picker_title': '选择背景颜色：',
            'examples_title': '示例模板',
            'empty_diagram_text': '请输入流程图代码',
            
            // 示例卡片
            'flowchart_title': '基础流程图',
            'flowchart_desc': '简单的流程图示例，包含开始、判断、处理和结束节点',
            'sequence_title': '时序图',
            'sequence_desc': '展示系统组件之间交互的时序图',
            'state_title': '状态图',
            'state_desc': '展示系统状态变化的状态图',
            'class_title': '类图',
            'class_desc': '展示类之间关系的类图',
            'gantt_title': '甘特图',
            'gantt_desc': '项目计划和时间管理图表',
            
            // 提示消息
            'loading_diagram': '正在生成流程图...',
            'success_diagram': '流程图生成成功',
            'error_diagram': '流程图生成失败',
            'loading_image': '正在生成图片...',
            'success_image': '图片已成功下载',
            'error_image': '下载图片失败，请重试',
            'content_cleared': '内容已清空',
            'example_loaded': '已加载{0}示例',
            'renderer_error': '渲染器 {0} 不可用，使用Mermaid渲染器',
            
            // 图像控制
            'zoom_in': '放大',
            'zoom_out': '缩小',
            'reset_zoom': '重置缩放',
            'toggle_layout': '切换布局'
        };
        
        // 英文翻译
        this.translations.en = {
            // 页面标题和描述
            'page_title': 'Diagram Generator',
            'page_subtitle': 'Support multiple chart libraries, easily create beautiful diagrams',
            'footer_text': '© 2023 Diagram Generator | Built with pure frontend technology',
            
            // 层级导航
            'level1_title': '1. Select Edit Mode',
            'level2_title': '2. Select Renderer',
            'level3_title': '3. Select Chart Type',
            
            // 编辑器和预览
            'editor_title': 'Editor',
            'preview_title': 'Preview',
            'markdown_placeholder': 'Please enter Markdown format diagram code, for example:\ngraph TD\n    A[Start] --> B{Condition}\n    B -->|Condition 1| C[Process 1]\n    B -->|Condition 2| D[Process 2]\n    C --> E[End]\n    D --> E',
            'plaintext_placeholder': 'Please enter plaintext format diagram code, for example:\ngraph TD\nA[User Payment] --> B(Check Balance?)\nB --> |N| C[Select Bank Card]\nB --> |Y| D[Enter Password]\nC --> E(Verification Success?)\nD --> F\nE --> |N| F[Retry Payment]\nE --> |Y| G[Payment Success]',
            
            // 按钮和控件
            'generate_btn': 'Generate Diagram',
            'download_btn': 'Download Image',
            'clear_btn': 'Clear Content',
            'color_picker_title': 'Select Background Color:',
            'examples_title': 'Example Templates',
            'empty_diagram_text': 'Please enter diagram code',
            
            // 示例卡片
            'flowchart_title': 'Basic Flowchart',
            'flowchart_desc': 'Simple flowchart example with start, condition, process, and end nodes',
            'sequence_title': 'Sequence Diagram',
            'sequence_desc': 'Diagram showing interactions between system components',
            'state_title': 'State Diagram',
            'state_desc': 'Diagram showing system state changes',
            'class_title': 'Class Diagram',
            'class_desc': 'Diagram showing relationships between classes',
            'gantt_title': 'Gantt Chart',
            'gantt_desc': 'Project planning and time management chart',
            
            // 提示消息
            'loading_diagram': 'Generating diagram...',
            'success_diagram': 'Diagram generated successfully',
            'error_diagram': 'Failed to generate diagram',
            'loading_image': 'Generating image...',
            'success_image': 'Image downloaded successfully',
            'error_image': 'Failed to download image, please try again',
            'content_cleared': 'Content cleared',
            'example_loaded': '{0} example loaded',
            'renderer_error': 'Renderer {0} not available, using Mermaid renderer',
            
            // 图像控制
            'zoom_in': 'Zoom In',
            'zoom_out': 'Zoom Out',
            'reset_zoom': 'Reset Zoom',
            'toggle_layout': 'Toggle Layout'
        };
    }

    /**
     * 切换语言
     * @param {string} lang - 目标语言代码
     */
    switchLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            this.updatePageContent();
            // 保存语言偏好到本地存储
            localStorage.setItem('preferred_language', lang);
            return true;
        }
        return false;
    }

    /**
     * 获取翻译文本
     * @param {string} key - 翻译键
     * @param {Array} params - 替换参数
     * @returns {string} 翻译后的文本
     */
    getText(key, ...params) {
        const translations = this.translations[this.currentLanguage];
        let text = translations[key] || key;
        
        // 替换参数
        if (params && params.length > 0) {
            params.forEach((param, index) => {
                text = text.replace(`{${index}}`, param);
            });
        }
        
        return text;
    }

    /**
     * 更新页面内容
     */
    updatePageContent() {
        // 更新页面标题和描述
        document.title = this.getText('page_title');
        document.querySelector('h1').textContent = this.getText('page_title');
        document.querySelector('.subtitle').textContent = this.getText('page_subtitle');
        document.querySelector('footer p').textContent = this.getText('footer_text');
        
        // 更新层级导航
        const hierarchyTitles = document.querySelectorAll('.hierarchy-title');
        if (hierarchyTitles.length >= 3) {
            hierarchyTitles[0].textContent = this.getText('level1_title');
            hierarchyTitles[1].textContent = this.getText('level2_title');
            hierarchyTitles[2].textContent = this.getText('level3_title');
        }
        
        // 更新编辑器和预览标题
        document.querySelectorAll('.card-title').forEach(title => {
            if (title.textContent === '编辑器' || title.textContent === 'Editor') {
                title.textContent = this.getText('editor_title');
            } else if (title.textContent === '预览' || title.textContent === 'Preview') {
                title.textContent = this.getText('preview_title');
            } else if (title.textContent.includes('背景颜色') || title.textContent.includes('Background Color')) {
                title.textContent = this.getText('color_picker_title');
            }
        });
        
        // 更新按钮文本
        document.getElementById('generate-btn').textContent = this.getText('generate_btn');
        document.getElementById('download-btn').textContent = this.getText('download_btn');
        document.getElementById('clear-btn').textContent = this.getText('clear_btn');
        
        // 更新示例标题
        document.querySelector('.examples-title').textContent = this.getText('examples_title');
        
        // 更新示例卡片
        document.querySelectorAll('.example-card').forEach(card => {
            const type = card.dataset.example;
            const titleElement = card.querySelector('.example-title');
            const descElement = card.querySelector('.example-body');
            
            if (type === 'flowchart') {
                titleElement.textContent = this.getText('flowchart_title');
                descElement.textContent = this.getText('flowchart_desc');
            } else if (type === 'sequence') {
                titleElement.textContent = this.getText('sequence_title');
                descElement.textContent = this.getText('sequence_desc');
            } else if (type === 'state') {
                titleElement.textContent = this.getText('state_title');
                descElement.textContent = this.getText('state_desc');
            } else if (type === 'class') {
                titleElement.textContent = this.getText('class_title');
                descElement.textContent = this.getText('class_desc');
            } else if (type === 'gantt') {
                titleElement.textContent = this.getText('gantt_title');
                descElement.textContent = this.getText('gantt_desc');
            }
        });
        
        // 更新输入框占位符
        document.getElementById('markdown-input').placeholder = this.getText('markdown_placeholder');
        document.getElementById('plaintext-input').placeholder = this.getText('plaintext_placeholder');
        
        // 更新空图表提示文本
        const emptyDiagram = document.querySelector('#mermaid-diagram div');
        if (emptyDiagram && (emptyDiagram.textContent.includes('请输入流程图代码') || emptyDiagram.textContent.includes('Please enter diagram code'))) {
            emptyDiagram.textContent = this.getText('empty_diagram_text');
        }
        
        // 更新图像控制按钮
        const imageControls = document.querySelectorAll('.image-control');
        imageControls.forEach(control => {
            if (control.title.includes('放大') || control.title.includes('Zoom In')) {
                control.title = this.getText('zoom_in');
            } else if (control.title.includes('缩小') || control.title.includes('Zoom Out')) {
                control.title = this.getText('zoom_out');
            } else if (control.title.includes('重置') || control.title.includes('Reset')) {
                control.title = this.getText('reset_zoom');
            } else if (control.title.includes('切换') || control.title.includes('Toggle')) {
                control.title = this.getText('toggle_layout');
            }
        });
        
        // 触发自定义事件，通知其他组件语言已更改
        const event = new CustomEvent('languageChanged', { detail: { language: this.currentLanguage } });
        document.dispatchEvent(event);
    }

    /**
     * 从本地存储加载语言偏好
     */
    loadPreferredLanguage() {
        const preferredLanguage = localStorage.getItem('preferred_language');
        if (preferredLanguage && this.translations[preferredLanguage]) {
            this.switchLanguage(preferredLanguage);
        } else {
            // 如果没有保存的偏好，尝试使用浏览器语言
            const browserLang = navigator.language.split('-')[0];
            if (browserLang && this.translations[browserLang]) {
                this.switchLanguage(browserLang);
            }
        }
    }

    /**
     * 创建语言切换器UI
     */
    createLanguageSwitcherUI() {
        // 创建语言切换器容器
        const switcherContainer = document.createElement('div');
        switcherContainer.className = 'language-switcher';
        
        // 创建中文选项
        const zhOption = document.createElement('div');
        zhOption.className = `language-option ${this.currentLanguage === 'zh' ? 'active' : ''}`;
        zhOption.textContent = '中文';
        zhOption.dataset.lang = 'zh';
        
        // 创建英文选项
        const enOption = document.createElement('div');
        enOption.className = `language-option ${this.currentLanguage === 'en' ? 'active' : ''}`;
        enOption.textContent = 'English';
        enOption.dataset.lang = 'en';
        
        // 添加点击事件
        zhOption.addEventListener('click', () => this.handleLanguageOptionClick(zhOption));
        enOption.addEventListener('click', () => this.handleLanguageOptionClick(enOption));
        
        // 将选项添加到容器
        switcherContainer.appendChild(zhOption);
        switcherContainer.appendChild(enOption);
        
        // 将容器添加到页面
        const header = document.querySelector('header');
        header.appendChild(switcherContainer);
    }

    /**
     * 处理语言选项点击事件
     * @param {HTMLElement} option - 被点击的语言选项
     */
    handleLanguageOptionClick(option) {
        const lang = option.dataset.lang;
        if (lang && this.currentLanguage !== lang) {
            // 更新活动状态
            document.querySelectorAll('.language-option').forEach(opt => {
                opt.classList.toggle('active', opt.dataset.lang === lang);
            });
            
            // 切换语言
            this.switchLanguage(lang);
            
            // 添加微动效
            option.classList.add('pulse');
            setTimeout(() => {
                option.classList.remove('pulse');
            }, 500);
        }
    }

    /**
     * 初始化语言切换器
     */
    init() {
        // 加载语言偏好
        this.loadPreferredLanguage();
        
        // 创建语言切换器UI
        this.createLanguageSwitcherUI();
        
        // 更新页面内容
        this.updatePageContent();
        
        console.log(`Language switcher initialized with language: ${this.currentLanguage}`);
    }
}

// 创建全局实例
const languageSwitcher = new LanguageSwitcher();

// 在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    languageSwitcher.init();
});