// 本地存储管理

const Storage = {
  KEY_PREFIX: 'xinyimeng_',

  // 获取键名
  key(name) {
    return this.KEY_PREFIX + name;
  },

  // 保存数据
  set(name, data) {
    try {
      localStorage.setItem(this.key(name), JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Storage set error:', e);
      return false;
    }
  },

  // 获取数据
  get(name, defaultValue = null) {
    try {
      const data = localStorage.getItem(this.key(name));
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error('Storage get error:', e);
      return defaultValue;
    }
  },

  // 删除数据
  remove(name) {
    localStorage.removeItem(this.key(name));
  },

  // 添加历史记录
  addHistory(guaData) {
    const history = this.get('history', []);
    const record = {
      ...guaData,
      id: Date.now(),
      savedAt: new Date().toISOString()
    };

    // 最多保存100条
    history.unshift(record);
    if (history.length > 100) {
      history.pop();
    }

    this.set('history', history);
    return record.id;
  },

  // 获取历史记录
  getHistory(limit = 50) {
    const history = this.get('history', []);
    return history.slice(0, limit);
  },

  // 删除历史记录
  deleteHistory(id) {
    const history = this.get('history', []);
    const filtered = history.filter(h => h.id !== id);
    this.set('history', filtered);
  },

  // 清空历史
  clearHistory() {
    this.remove('history');
  },

  // 保存设置
  setSettings(settings) {
    const current = this.get('settings', {});
    this.set('settings', { ...current, ...settings });
  },

  // 获取设置
  getSettings() {
    return this.get('settings', {
      vibration: true,
      autoSave: true,
      theme: 'dark'
    });
  },

  // 保存聊天历史
  saveChatHistory(history) {
    this.set('chat_history', history);
  },

  // 获取聊天历史
  getChatHistory() {
    return this.get('chat_history', []);
  },

  // 保存 AI 配置
  setAIConfig(config) {
    this.set('ai_config', config);
  },

  // 获取 AI 配置
  getAIConfig() {
    return this.get('ai_config', {
      provider: 'deepseek',  // 'deepseek' | 'custom'
      deepseek: {
        apiKey: '',
        model: 'deepseek-chat'  // 'deepseek-chat' | 'deepseek-reasoner'
      },
      custom: {
        baseUrl: '',
        apiKey: '',
        modelName: ''
      }
    });
  },

  // 添加对话记录
  addConversation(conversation) {
    const history = this.get('conversations', []);
    const record = {
      ...conversation,
      id: conversation.id || Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    history.unshift(record);
    // 最多保存50条
    if (history.length > 50) {
      history.pop();
    }
    this.set('conversations', history);
    return record.id;
  },

  // 获取所有对话记录
  getConversations() {
    return this.get('conversations', []);
  },

  // 获取单个对话
  getConversation(id) {
    const history = this.get('conversations', []);
    return history.find(c => c.id === id);
  },

  // 删除对话记录
  deleteConversation(id) {
    const history = this.get('conversations', []);
    const filtered = history.filter(c => c.id !== id);
    this.set('conversations', filtered);
  },

  // 清空所有对话
  clearConversations() {
    this.remove('conversations');
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
