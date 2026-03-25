// 主应用逻辑

const App = {
  // 当前状态
  state: {
    currentMethod: 'time', // 'time' | 'number' | 'bazi'
    currentGua: null,
    currentBazi: null,
    isGenerating: false
  },

  // 初始化
  init() {
    this.bindEvents();
    this.updateTime();
    this.startTimeUpdate();

    // 1.5秒后显示继续按钮
    setTimeout(() => {
      const continueBtn = document.getElementById('continue-btn');
      if (continueBtn) {
        continueBtn.classList.remove('hidden');
      }
    }, 1500);
  },

  // 进入主界面
  enterMain() {
    UIUtil.vibrate([50]);
    UIUtil.hideSplash();
  },

  // 绑定事件
  bindEvents() {
    // 继续按钮
    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => this.enterMain());
    }

    // 起卦区域手势
    const divinationArea = document.getElementById('divination-area');
    UIUtil.addSwipeListener(divinationArea, {
      onTap: () => this.handleTap(),
      onLongPress: () => this.handleLongPress(),
      onSwipeUp: () => this.switchMethod('next'),
      onSwipeDown: () => this.switchMethod('prev')
    });

    // 数字输入确认
    const confirmBtn = document.getElementById('confirm-number');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => this.handleNumberConfirm());
    }

    // 返回按钮
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.hideDetail());
    }

    // 顶部返回键（卦象/八字展示页返回）
    const headerBackBtn = document.getElementById('header-back-btn');
    if (headerBackBtn) {
      headerBackBtn.addEventListener('click', () => {
        if (this.state.currentBazi) {
          this.resetBaziDisplay();
        } else {
          this.resetGuaDisplay();
        }
      });
    }

    // 八字批盘按钮
    const confirmBaziBtn = document.getElementById('confirm-bazi');
    if (confirmBaziBtn) {
      confirmBaziBtn.addEventListener('click', () => this.handleBaziConfirm());
    }

    // 八字详情返回按钮
    const baziBackBtn = document.getElementById('bazi-back-btn');
    if (baziBackBtn) {
      baziBackBtn.addEventListener('click', () => this.hideBaziDetail());
    }

    // 八字 AI 问答
    const baziSendBtn = document.getElementById('bazi-ai-send-btn');
    const baziInput = document.getElementById('bazi-ai-question');
    if (baziSendBtn && baziInput) {
      baziSendBtn.addEventListener('click', () => {
        const question = baziInput.value.trim();
        if (question) {
          this.askBaziAI(question);
          baziInput.value = '';
        }
      });
      baziInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const question = baziInput.value.trim();
          if (question) {
            this.askBaziAI(question);
            baziInput.value = '';
          }
        }
      });
    }

    // 返回键支持
    window.addEventListener('popstate', (e) => {
      const detail = document.getElementById('gua-detail');
      const baziDetail = document.getElementById('bazi-detail');
      const settingsPage = document.getElementById('settings-page');
      const chatHistoryPage = document.getElementById('chat-history-page');
      const chatDetailPage = document.getElementById('chat-detail-page');
      if (!detail.classList.contains('hidden')) {
        this.hideDetail();
        e.preventDefault();
      } else if (!baziDetail.classList.contains('hidden')) {
        this.hideBaziDetail();
        e.preventDefault();
      } else if (!chatDetailPage.classList.contains('hidden')) {
        this.hideChatDetail();
        e.preventDefault();
      } else if (!chatHistoryPage.classList.contains('hidden')) {
        this.hideChatHistory();
        e.preventDefault();
      } else if (!settingsPage.classList.contains('hidden')) {
        this.hideSettings();
        e.preventDefault();
      }
    });

    // AI 问答栏事件
    this.bindAIChatEvents();

    // 设置页面事件
    this.bindSettingsEvents();
  },

  // 绑定设置页面事件
  bindSettingsEvents() {
    // 设置按钮
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.showSettings());
    }

    // 查看历史按钮
    const viewHistoryBtn = document.getElementById('view-history-btn');
    if (viewHistoryBtn) {
      viewHistoryBtn.addEventListener('click', () => this.showChatHistory());
    }

    // 设置返回按钮
    const settingsBackBtn = document.getElementById('settings-back-btn');
    if (settingsBackBtn) {
      settingsBackBtn.addEventListener('click', () => this.hideSettings());
    }

    // 聊天历史返回按钮
    const chatHistoryBackBtn = document.getElementById('chat-history-back-btn');
    if (chatHistoryBackBtn) {
      chatHistoryBackBtn.addEventListener('click', () => this.hideChatHistory());
    }

    // 对话详情返回按钮
    const chatDetailBackBtn = document.getElementById('chat-detail-back-btn');
    if (chatDetailBackBtn) {
      chatDetailBackBtn.addEventListener('click', () => this.hideChatDetail());
    }

    // 服务提供商切换
    const providerInputs = document.querySelectorAll('input[name="ai-provider"]');
    providerInputs.forEach(input => {
      input.addEventListener('change', (e) => this.switchAIProvider(e.target.value));
    });

    // 保存设置
    const saveBtn = document.getElementById('settings-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.saveAISettings());
    }

    // 测试连接
    const testBtn = document.getElementById('settings-test-btn');
    if (testBtn) {
      testBtn.addEventListener('click', () => this.testAIConnection());
    }

    // 加载已保存的设置
    this.loadAISettings();
  },

  // 显示设置页面
  showSettings() {
    const settingsPage = document.getElementById('settings-page');
    settingsPage.classList.remove('hidden');
    history.pushState({ settings: true }, '');
  },

  // 隐藏设置页面
  hideSettings() {
    const settingsPage = document.getElementById('settings-page');
    settingsPage.classList.add('hidden');
    history.back();
  },

  // 切换 AI 服务提供商
  switchAIProvider(provider) {
    const deepseekConfig = document.getElementById('deepseek-config');
    const customConfig = document.getElementById('custom-config');

    if (provider === 'deepseek') {
      deepseekConfig.classList.remove('hidden');
      customConfig.classList.add('hidden');
    } else {
      deepseekConfig.classList.add('hidden');
      customConfig.classList.remove('hidden');
    }
  },

  // 加载 AI 设置
  loadAISettings() {
    const config = Storage.getAIConfig();

    // 设置提供商
    const providerInput = document.querySelector(`input[name="ai-provider"][value="${config.provider}"]`);
    if (providerInput) {
      providerInput.checked = true;
      this.switchAIProvider(config.provider);
    }

    // DeepSeek 配置
    const deepseekApiKey = document.getElementById('deepseek-apikey');
    if (deepseekApiKey) {
      deepseekApiKey.value = config.deepseek?.apiKey || '';
    }

    // DeepSeek 模型选择
    const modelInput = document.querySelector(`input[name="deepseek-model"][value="${config.deepseek?.model || 'deepseek-chat'}"]`);
    if (modelInput) {
      modelInput.checked = true;
    }

    // 自定义配置
    const customBaseUrl = document.getElementById('custom-baseurl');
    const customApiKey = document.getElementById('custom-apikey');
    const customModel = document.getElementById('custom-model');

    if (customBaseUrl) customBaseUrl.value = config.custom?.baseUrl || '';
    if (customApiKey) customApiKey.value = config.custom?.apiKey || '';
    if (customModel) customModel.value = config.custom?.modelName || '';
  },

  // 保存 AI 设置
  saveAISettings() {
    const provider = document.querySelector('input[name="ai-provider"]:checked')?.value || 'deepseek';

    const config = {
      provider: provider,
      deepseek: {
        apiKey: document.getElementById('deepseek-apikey')?.value?.trim() || '',
        model: document.querySelector('input[name="deepseek-model"]:checked')?.value || 'deepseek-chat'
      },
      custom: {
        baseUrl: document.getElementById('custom-baseurl')?.value?.trim() || '',
        apiKey: document.getElementById('custom-apikey')?.value?.trim() || '',
        modelName: document.getElementById('custom-model')?.value?.trim() || ''
      }
    };

    Storage.setAIConfig(config);
    UIUtil.showToast('设置已保存');
    this.hideSettings();
  },

  // 测试 AI 连接
  async testAIConnection() {
    const config = Storage.getAIConfig();
    const provider = document.querySelector('input[name="ai-provider"]:checked')?.value || config.provider;

    let apiKey, baseUrl, modelName;

    if (provider === 'deepseek') {
      apiKey = document.getElementById('deepseek-apikey')?.value?.trim();
      baseUrl = 'https://api.deepseek.com/v1';
      modelName = document.querySelector('input[name="deepseek-model"]:checked')?.value || 'deepseek-chat';
    } else {
      apiKey = document.getElementById('custom-apikey')?.value?.trim();
      baseUrl = document.getElementById('custom-baseurl')?.value?.trim();
      modelName = document.getElementById('custom-model')?.value?.trim() || 'gpt-3.5-turbo';
    }

    if (!apiKey) {
      UIUtil.showToast('请输入 API Key');
      return;
    }

    if (provider === 'custom' && !baseUrl) {
      UIUtil.showToast('请输入 Base URL');
      return;
    }

    UIUtil.showToast('正在测试连接...');

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: 'user', content: '你好' }],
          max_tokens: 10
        })
      });

      if (response.ok) {
        UIUtil.showToast('连接成功！');
      } else {
        const error = await response.json();
        UIUtil.showToast(`连接失败：${error.error?.message || response.statusText}`);
      }
    } catch (error) {
      UIUtil.showToast(`连接失败：${error.message}`);
    }
  },

  // 绑定 AI 问答事件
  bindAIChatEvents() {
    const aiInput = document.getElementById('ai-question');
    const aiSendBtn = document.getElementById('ai-send-btn');

    if (aiSendBtn) {
      aiSendBtn.addEventListener('click', () => {
        const question = aiInput?.value.trim();
        if (question) {
          this.askDeepSeek(question);
          aiInput.value = '';
        }
      });
    }

    if (aiInput) {
      aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const question = aiInput.value.trim();
          if (question) {
            this.askDeepSeek(question);
            aiInput.value = '';
          }
        }
      });
    }
  },

  // 处理轻触起卦
  handleTap() {
    if (this.state.isGenerating) return;

    // 如果已经有卦象，不允许重新起卦（必须通过返回键返回）
    if (this.state.currentGua) {
      return;
    }

    UIUtil.vibrate([30]);

    if (this.state.currentMethod === 'time') {
      this.generateTimeGua();
    } else {
      this.showNumberPanel();
    }
  },

  // 处理长按保存
  handleLongPress() {
    if (!this.state.currentGua) {
      UIUtil.showToast('请先起卦');
      return;
    }

    UIUtil.vibrate([50, 100, 50]);

    if (Storage.addHistory(this.state.currentGua)) {
      UIUtil.showToast('已保存到历史记录');
    }
  },

  // 时间起卦
  generateTimeGua() {
    if (this.state.isGenerating) return;
    this.state.isGenerating = true;

    const display = document.getElementById('gua-display');
    display.classList.add('gua-generating');

    // 模拟起卦延迟，增加仪式感
    setTimeout(() => {
      const gua = MeiHua.calculateByTime(new Date());
      this.state.currentGua = gua;
      this.displayGua(gua);

      display.classList.remove('gua-generating');
      this.state.isGenerating = false;

      // 更新提示文字
      document.getElementById('action-hint').textContent = '长按保存 · 点击查看详情';
    }, 800);
  },

  // 数字起卦
  generateNumberGua(upperNum, lowerNum) {
    if (this.state.isGenerating) return;
    this.state.isGenerating = true;

    const gua = MeiHua.calculateByNumber(upperNum, lowerNum);
    this.state.currentGua = gua;
    this.displayGua(gua);

    this.hideNumberPanel();
    this.state.isGenerating = false;

    document.getElementById('action-hint').textContent = '长按保存 · 点击查看详情';
  },

  // 显示卦象
  displayGua(gua) {
    const display = document.getElementById('gua-main');
    display.innerHTML = UIUtil.createGuaCard(gua);

    // 初始化滑动组件
    const carousel = display.querySelector('.gua-carousel');
    if (carousel) {
      UIUtil.initCarousel(carousel);
    }

    // 显示顶部返回键
    const headerBackBtn = document.getElementById('header-back-btn');
    if (headerBackBtn) {
      headerBackBtn.classList.remove('hidden');
    }
  },

  // 切换起卦方式
  switchMethod(direction) {
    const methods = ['time', 'number', 'bazi'];
    const currentIdx = methods.indexOf(this.state.currentMethod);
    let newIdx;

    if (direction === 'next') {
      newIdx = (currentIdx + 1) % methods.length;
    } else {
      newIdx = (currentIdx - 1 + methods.length) % methods.length;
    }

    this.state.currentMethod = methods[newIdx];

    // 更新指示器
    document.querySelectorAll('.method-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === newIdx);
    });

    // 更新提示
    const hints = {
      time: '轻触起卦 · 向上滑动切换方式',
      number: '轻触输入数字 · 向上滑动切换',
      bazi: '轻触输入八字 · 向上滑动切换'
    };
    document.getElementById('action-hint').textContent = hints[this.state.currentMethod];

    // 重置卦象显示
    if (this.state.currentMethod === 'time') {
      this.hideNumberPanel();
      this.hideBaziPanel();
    } else if (this.state.currentMethod === 'number') {
      this.hideBaziPanel();
    } else {
      this.hideNumberPanel();
    }

    UIUtil.vibrate([20]);
  },

  // 显示数字输入面板
  showNumberPanel() {
    const panel = document.getElementById('number-panel');
    panel.classList.remove('hidden');
    document.getElementById('upper-num').focus();
  },

  // 隐藏数字输入面板
  hideNumberPanel() {
    const panel = document.getElementById('number-panel');
    panel.classList.add('hidden');
  },

  // 确认数字起卦
  handleNumberConfirm() {
    const upperInput = document.getElementById('upper-num');
    const lowerInput = document.getElementById('lower-num');

    const upperNum = parseInt(upperInput.value) || 1;
    const lowerNum = parseInt(lowerInput.value) || 1;

    if (upperNum < 1 || upperNum > 999 || lowerNum < 1 || lowerNum > 999) {
      UIUtil.showToast('请输入1-999之间的数字');
      return;
    }

    this.generateNumberGua(upperNum, lowerNum);

    // 清空输入
    upperInput.value = '';
    lowerInput.value = '';
  },

  // 显示详情
  showDetail() {
    if (!this.state.currentGua) return;

    const detail = document.getElementById('gua-detail');
    const content = document.getElementById('detail-content');

    content.innerHTML = this.createDetailHtml(this.state.currentGua);

    detail.classList.remove('hidden');
    history.pushState({ detail: true }, '');
  },

  // 隐藏详情
  hideDetail() {
    const detail = document.getElementById('gua-detail');
    detail.classList.add('hidden');
    history.back();

    // 重置卦象显示，回到起卦方式选择状态
    this.resetGuaDisplay();
  },

  // 重置卦象显示
  resetGuaDisplay() {
    // 清除当前卦象
    this.state.currentGua = null;

    // 重置显示区域为等待状态
    const display = document.getElementById('gua-main');
    display.innerHTML = `
      <div class="gua-waiting">
        <p>轻触起卦</p>
        <p class="hint">或向上滑动切换方式</p>
      </div>
    `;

    // 重置提示文字
    document.getElementById('action-hint').textContent = '轻触起卦 · 向上滑动切换方式';

    // 隐藏顶部返回键
    const headerBackBtn = document.getElementById('header-back-btn');
    if (headerBackBtn) {
      headerBackBtn.classList.add('hidden');
    }
  },

  // 创建详情HTML
  createDetailHtml(gua) {
    return `
      <!-- 卦象概览卡片 -->
      ${this.createGuaOverviewHtml(gua)}

      <!-- 体用分析 -->
      ${this.createTiYongHtml(gua)}

      <!-- 卦辞详解 -->
      ${this.createGuaCiDetailHtml(gua)}

      <!-- 外应模块 -->
      ${this.createWaiYingHtml()}

      <!-- 八字四柱 -->
      ${this.getBaZiHtml(gua.timeInfo)}
    `;
  },

  // 创建卦象概览（所有卦象）
  createGuaOverviewHtml(gua) {
    const guaList = [
      { key: 'mainGua', name: '本卦', desc: '事情现状' },
      { key: 'bianGua', name: '变卦', desc: '事情结果' },
      { key: 'huGua', name: '互卦', desc: '发展过程' },
      { key: 'cuoGua', name: '错卦', desc: '阴阳全反' },
      { key: 'zongGua', name: '综卦', desc: '换位思考' }
    ];

    let cardsHtml = '';
    guaList.forEach(item => {
      const guaData = gua[item.key];
      if (!guaData) return;

      const isMain = item.key === 'mainGua';
      const upperColor = UIUtil.getWuxingColor(guaData.upperGua.wuxing);
      const lowerColor = UIUtil.getWuxingColor(guaData.lowerGua.wuxing);

      // 生成六爻
      let yaoHtml = '';
      for (let i = 6; i >= 1; i--) {
        const yaoType = guaData.yaos[i - 1];
        const isDong = isMain && i === gua.dongYao;
        const wuxing = i >= 4 ? guaData.upperGua.wuxing : guaData.lowerGua.wuxing;
        yaoHtml += UIUtil.createYaoHtml(yaoType, isDong, wuxing);
      }

      cardsHtml += `
        <div class="gua-overview-card ${isMain ? 'main' : ''}">
          <div class="gua-overview-type">${item.name}</div>
          <div class="gua-overview-name" style="color: ${upperColor}">${guaData.name}</div>
          <div class="gua-overview-trigrams">
            <span style="color: ${upperColor}">${guaData.upperGua.name}</span>
            <span class="divider">·</span>
            <span style="color: ${lowerColor}">${guaData.lowerGua.name}</span>
          </div>
          <div class="gua-overview-yaos">${yaoHtml}</div>
          <div class="gua-overview-desc">${item.desc}</div>
        </div>
      `;
    });

    return `
      <div class="detail-section gua-overview-section">
        <h3>卦象总览</h3>
        <div class="gua-overview-scroll">
          ${cardsHtml}
        </div>
      </div>
    `;
  },

  // 创建体用分析
  createTiYongHtml(gua) {
    // 梅花易数体用判断：无动爻的卦为体，有动爻的卦为用
    const dongYao = gua.dongYao;
    let tiGua, yongGua, tiPosition, yongPosition;

    if (dongYao >= 4) {
      // 上卦动，上卦为用，下卦为体
      tiGua = gua.lowerGua;
      yongGua = gua.upperGua;
      tiPosition = '下卦';
      yongPosition = '上卦';
    } else {
      // 下卦动（或六爻静），下卦为用，上卦为体
      tiGua = gua.upperGua;
      yongGua = gua.lowerGua;
      tiPosition = '上卦';
      yongPosition = '下卦';
    }

    const wuxingRelation = this.getWuxingRelation(tiGua.wuxing, yongGua.wuxing);

    return `
      <div class="detail-section tiyong-section">
        <h3>体用分析</h3>
        <div class="tiyong-container">
          <div class="tiyong-item ti">
            <div class="tiyong-label">体卦（${tiPosition}）</div>
            <div class="tiyong-gua" style="color: ${UIUtil.getWuxingColor(tiGua.wuxing)}">${tiGua.name}</div>
            <div class="tiyong-wuxing">${tiGua.wuxing}</div>
            <div class="tiyong-desc">代表自己、主体、当前状态</div>
          </div>
          <div class="tiyong-relation">
            <div class="relation-arrow">→</div>
            <div class="relation-text">${wuxingRelation}</div>
          </div>
          <div class="tiyong-item yong">
            <div class="tiyong-label">用卦（${yongPosition}）</div>
            <div class="tiyong-gua" style="color: ${UIUtil.getWuxingColor(yongGua.wuxing)}">${yongGua.name}</div>
            <div class="tiyong-wuxing">${yongGua.wuxing}</div>
            <div class="tiyong-desc">代表外物、客体、所问之事</div>
          </div>
        </div>
      </div>
    `;
  },

  // 五行关系判断
  getWuxingRelation(tiWuxing, yongWuxing) {
    const relations = {
      '金': { '木': '金克木（体克用，吉）', '火': '火克金（用克体，凶）', '土': '土生金（用生体，吉）', '水': '金生水（体生用，凶）', '金': '比和（吉）' },
      '木': { '土': '木克土（体克用，吉）', '金': '金克木（用克体，凶）', '水': '水生木（用生体，吉）', '火': '木生火（体生用，凶）', '木': '比和（吉）' },
      '水': { '火': '水克火（体克用，吉）', '土': '土克水（用克体，凶）', '金': '金生水（用生体，吉）', '木': '水生木（体生用，凶）', '水': '比和（吉）' },
      '火': { '金': '火克金（体克用，吉）', '水': '水克火（用克体，凶）', '木': '木生火（用生体，吉）', '土': '火生土（体生用，凶）', '火': '比和（吉）' },
      '土': { '水': '土克水（体克用，吉）', '木': '木克土（用克体，凶）', '火': '火生土（用生体，吉）', '金': '土生金（体生用，凶）', '土': '比和（吉）' }
    };
    return relations[tiWuxing]?.[yongWuxing] || '相生相克';
  },

  // 卦辞详解
  createGuaCiDetailHtml(gua) {
    const guaCi = MeiHua.getGuaCi(gua);
    const yaociNames = ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'];

    let allYaociHtml = '';
    if (guaCi.allYaoci && guaCi.allYaoci.length > 0) {
      guaCi.allYaoci.forEach((yao, index) => {
        const isDong = (index + 1) === gua.dongYao;
        allYaociHtml += `
          <div class="yao-ci-item ${isDong ? 'dong' : ''}">
            <span class="yao-ci-name">${yaociNames[index]}${isDong ? '（动）' : ''}</span>
            <span class="yao-ci-text">${yao || '无'}</span>
          </div>
        `;
      });
    }

    return `
      <div class="detail-section guaci-section">
        <h3>卦辞详解</h3>
        <div class="guaci-main">
          <div class="guaci-label">${gua.mainGua.name}卦辞</div>
          <div class="guaci-text">${guaCi.guaCi || '暂无卦辞'}</div>
        </div>
        ${gua.dongYao > 0 ? `
        <div class="dongyao-highlight">
          <div class="dongyao-label">动爻辞（第${gua.dongYao}爻）</div>
          <div class="dongyao-text">${guaCi.dongYaoCi || '暂无'}</div>
        </div>
        ` : ''}
        <div class="yaoci-list">
          <div class="yaoci-title">六爻爻辞</div>
          ${allYaociHtml || '<p>暂无爻辞</p>'}
        </div>
      </div>
    `;
  },

  // 外应模块
  createWaiYingHtml() {
    return `
      <div class="detail-section waiying-section">
        <h3>外应</h3>
        <p class="waiying-hint">问天问地不如问心</p>
        <div class="waiying-input-area">
          <textarea id="waiying-input" placeholder="记录起卦时的外应（如听到的声音、看到的景象、突发的感觉等），这些信息将帮助AI更准确地解卦..." rows="3"></textarea>
        </div>
      </div>
    `;
  },

  // 生成八字信息HTML
  getBaZiHtml(timeInfo) {
    if (!timeInfo || !timeInfo.pillars) return '';

    const [year, month, day, hour] = timeInfo.pillars;

    return `
      <div class="detail-section bazi-section">
        <h3>八字四柱</h3>
        <div class="bazi-grid">
          <div class="bazi-item">
            <span class="bazi-label">年柱</span>
            <span class="bazi-value">${year || '-'}</span>
          </div>
          <div class="bazi-item">
            <span class="bazi-label">月柱</span>
            <span class="bazi-value">${month || '-'}</span>
          </div>
          <div class="bazi-item">
            <span class="bazi-label">日柱</span>
            <span class="bazi-value">${day || '-'}</span>
          </div>
          <div class="bazi-item">
            <span class="bazi-label">时柱</span>
            <span class="bazi-value">${hour || '-'}</span>
          </div>
        </div>
        <div class="bazi-lunar">
          农历：${timeInfo.lunar?.monthStr || ''}${timeInfo.lunar?.dayStr || ''}
          ${timeInfo.lunar?.yearGanZhi?.shengxiao ? '(' + timeInfo.lunar.yearGanZhi.shengxiao + '年)' : ''}
        </div>
      </div>
    `;
  },

  // DeepSeek 解卦 Prompt
  DEEPSEEK_PROMPT: `你是一位精通梅花易数的易学大师，拥有深厚的国学功底和丰富的解卦经验。

请根据以下卦象信息，为用户提供专业、详细、有深度的解卦分析：

【起卦信息】
- 起卦时间：{time}
- 起卦方式：{method}
- 农历：{lunar}
- 八字四柱：{bazi}

【卦象数据】
{guaData}

【体用分析】
{tiYong}

【外应记录】
{waiYing}

【用户问题】
{question}

请按以下结构解卦：

1. **卦象总览**
   - 简述本卦、变卦、互卦的整体含义
   - 体用关系分析（生克吉凶）

2. **所问之事分析**
   - 针对用户问题的具体解读
   - 事情发展趋势预测

3. **动爻详解**
   - 动爻爻辞的深层含义
   - 变卦指示的结果方向

4. **时间推断**
   - 事情发展的应期（何时应验）
   - 关键时间节点

5. **建议与趋避**
   - 具体的行动建议
   - 需要注意的事项
   - 如何趋吉避凶

6. **外应参考**
   - 结合用户记录的外应信息分析
   - 外应与卦象的印证关系

解卦风格要求：
- 语言典雅，有古风韵味但不过于晦涩
- 分析有理有据，引用经典但不堆砌
- 既要有传统易学的严谨，也要有现代解读的通俗
- 对吉凶判断要清晰明确，不模棱两可
- 最后用一句话总结核心启示`,

  // 生成解卦 Prompt
  generatePrompt(gua, question) {
    const timeInfo = gua.timeInfo;

    // 体用分析
    const dongYao = gua.dongYao;
    let tiYongText = '';
    if (dongYao >= 4) {
      tiYongText = `上卦${gua.upperGua.name}（${gua.upperGua.wuxing}）为用，下卦${gua.lowerGua.name}（${gua.lowerGua.wuxing}）为体。`;
    } else {
      tiYongText = `上卦${gua.upperGua.name}（${gua.upperGua.wuxing}）为体，下卦${gua.lowerGua.name}（${gua.lowerGua.wuxing}）为用。`;
    }

    // 卦象数据
    const guaData = `
本卦（现状）：${gua.mainGua.name} - 上${gua.upperGua.name}（${gua.upperGua.wuxing}）下${gua.lowerGua.name}（${gua.lowerGua.wuxing}）
变卦（结果）：${gua.bianGua.name} - 上${gua.bianGua.upperGua.name}（${gua.bianGua.upperGua.wuxing}）下${gua.bianGua.lowerGua.name}（${gua.bianGua.lowerGua.wuxing}）
互卦（过程）：${gua.huGua.name} - 上${gua.huGua.upperGua.name}（${gua.huGua.upperGua.wuxing}）下${gua.huGua.lowerGua.name}（${gua.huGua.lowerGua.wuxing}）
错卦（阴阳）：${gua.cuoGua.name}
综卦（倒置）：${gua.zongGua.name}
动爻：第${gua.dongYao}爻
`;

    // 获取外应
    const waiYingInput = document.getElementById('waiying-input');
    const waiYing = waiYingInput ? waiYingInput.value.trim() : '无';

    return this.DEEPSEEK_PROMPT
      .replace('{time}', timeInfo.formatted)
      .replace('{method}', gua.method === 'time' ? '时间起卦' : '数字起卦')
      .replace('{lunar}', `${timeInfo.lunar.monthStr}${timeInfo.lunar.dayStr}`)
      .replace('{bazi}', timeInfo.pillars.join(' '))
      .replace('{guaData}', guaData)
      .replace('{tiYong}', tiYongText)
      .replace('{waiYing}', waiYing)
      .replace('{question}', question || '未指定具体问题');
  },

  // 调用 AI API（流式输出）
  async askDeepSeek(question) {
    if (!this.state.currentGua) {
      UIUtil.showToast('请先起卦');
      return;
    }

    const prompt = this.generatePrompt(this.state.currentGua, question);

    // 获取 AI 配置
    const aiConfig = Storage.getAIConfig();

    // 检查是否有 API Key
    let apiKey, baseUrl, modelName;

    if (aiConfig.provider === 'deepseek') {
      apiKey = aiConfig.deepseek?.apiKey;
      baseUrl = 'https://api.deepseek.com/v1';
      modelName = aiConfig.deepseek?.model || 'deepseek-chat';
    } else {
      apiKey = aiConfig.custom?.apiKey;
      baseUrl = aiConfig.custom?.baseUrl;
      modelName = aiConfig.custom?.modelName || 'gpt-3.5-turbo';
    }

    // 复制 prompt 到剪贴板
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(prompt);
    }

    if (!apiKey || (aiConfig.provider === 'custom' && !baseUrl)) {
      UIUtil.showToast('提示词已复制，请粘贴到 AI 使用');
      return;
    }

    // 创建流式响应区域
    const messageId = Date.now().toString();
    this.createStreamingResponse(messageId, question);

    let fullResponse = '';
    let reasoningContent = '';

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: '你是一位精通梅花易数的易学大师。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: true
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || response.statusText);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const json = JSON.parse(data);
              const delta = json.choices[0]?.delta;

              if (delta?.reasoning_content) {
                reasoningContent += delta.reasoning_content;
                this.updateStreamingResponse(messageId, fullResponse, reasoningContent, true);
              }

              if (delta?.content) {
                fullResponse += delta.content;
                this.updateStreamingResponse(messageId, fullResponse, reasoningContent, true);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      // 流式输出完成
      this.updateStreamingResponse(messageId, fullResponse, reasoningContent, false);

      // 保存对话记录
      Storage.addConversation({
        id: messageId,
        gua: this.state.currentGua.mainGua.name,
        guaData: this.state.currentGua,
        question: question,
        answer: fullResponse,
        reasoning: reasoningContent,
        model: modelName,
        prompt: prompt
      });

      // 清空当前流式对话记录
      this.currentStreamingConversation = null;

      UIUtil.showToast('解卦完成');

    } catch (error) {
      this.updateStreamingResponse(messageId, `请求失败：${error.message}`, '', false);

      // 发生错误时也清空当前流式对话
      this.currentStreamingConversation = null;
    }
  },

  // 当前流式对话数据
  currentStreamingConversation: null,

  // 创建流式响应区域
  createStreamingResponse(messageId, question) {
    const chatMessages = document.getElementById('chat-messages');

    // 清空并显示对话页面
    const chatDetailPage = document.getElementById('chat-detail-page');
    chatMessages.innerHTML = '';
    chatDetailPage.classList.remove('hidden');
    history.pushState({ chatDetail: true }, '');

    // 创建消息容器
    const container = document.createElement('div');
    container.id = `chat-${messageId}`;
    container.className = 'chat-messages-container';
    container.innerHTML = `
      <div class="chat-message user">
        <div class="message-bubble">${this.escapeHtml(question)}</div>
      </div>
      <div class="chat-message assistant" id="assistant-${messageId}">
        <div class="message-bubble">
          <div class="streaming-content"></div>
          <span class="streaming-cursor"></span>
        </div>
      </div>
    `;

    chatMessages.appendChild(container);

    // 设置当前对话标题
    document.getElementById('chat-detail-title').textContent =
      `${this.state.currentGua.mainGua.name} · ${question.slice(0, 10)}${question.length > 10 ? '...' : ''}`;

    // 记录当前流式对话
    this.currentStreamingConversation = {
      id: messageId,
      question: question
    };
  },

  // 处理轻触起卦
  handleTap() {
    if (this.state.isGenerating) return;

    // 如果已经有卦象，不允许重新起卦（必须通过返回键返回）
    if (this.state.currentGua) {
      return;
    }

    // 如果当前是八字批盘模式，显示八字输入面板
    if (this.state.currentMethod === 'bazi') {
      this.showBaziPanel();
      return;
    }

    UIUtil.vibrate([30]);

    if (this.state.currentMethod === 'time') {
      this.generateTimeGua();
    } else {
      this.showNumberPanel();
    }
  },

  // 显示八字输入面板
  showBaziPanel() {
    const panel = document.getElementById('bazi-panel');
    panel.classList.remove('hidden');

    // 初始化自定义下拉框
    this.initBaziSelects();

    // 农历/阳历切换事件
    const calendarToggles = panel.querySelectorAll('input[name="calendar-type"]');
    calendarToggles.forEach(toggle => {
      toggle.addEventListener('change', (e) => {
        panel.querySelectorAll('.toggle-option').forEach(opt => opt.classList.remove('active'));
        e.target.closest('.toggle-option').classList.add('active');
        // 切换阴阳历时重置日期选择
        this.resetBaziDateSelects();
      });
    });

    // 性别选择事件
    const genderOptions = panel.querySelectorAll('.gender-option');
    genderOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        genderOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        const input = opt.querySelector('input');
        if (input) input.checked = true;
      });
    });
  },

  // 隐藏八字输入面板
  hideBaziPanel() {
    const panel = document.getElementById('bazi-panel');
    panel.classList.add('hidden');
  },

  // 初始化八字选择器
  initBaziSelects() {
    const currentYear = new Date().getFullYear();
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select');
    const daySelect = document.getElementById('day-select');
    const hourSelect = document.getElementById('hour-select');

    // 填充年份选项 (1950-2025)
    const yearOptions = yearSelect.querySelector('.select-options');
    yearOptions.innerHTML = '<div class="select-option" data-value="">请选择年份</div>';
    for (let year = currentYear; year >= 1950; year--) {
      const ganZhi = FortuneAnalyzer.getYearPillar(new Date(year, 0, 1));
      yearOptions.innerHTML += `<div class="select-option" data-value="${year}">${year}年 (${ganZhi.tiangan}${ganZhi.dizhi})</div>`;
    }

    // 填充月份选项
    const monthOptions = monthSelect.querySelector('.select-options');
    monthOptions.innerHTML = '<div class="select-option" data-value="">请选择月份</div>';
    const lunarMonths = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
    for (let month = 1; month <= 12; month++) {
      monthOptions.innerHTML += `<div class="select-option" data-value="${month}">${month}月 (${lunarMonths[month-1]}月)</div>`;
    }

    // 初始化自定义下拉框事件
    this.initCustomSelect(yearSelect, 'year');
    this.initCustomSelect(monthSelect, 'month');
    this.initCustomSelect(daySelect, 'day');
    this.initCustomSelect(hourSelect, 'hour');
  },

  // 重置日期选择
  resetBaziDateSelects() {
    ['year-select', 'month-select', 'day-select'].forEach(id => {
      const select = document.getElementById(id);
      const trigger = select.querySelector('.select-value');
      trigger.textContent = id === 'year-select' ? '请选择年份' : id === 'month-select' ? '请选择月份' : '请选择日子';
      trigger.classList.add('placeholder');
      select.dataset.value = '';
    });
  },

  // 初始化自定义下拉框
  initCustomSelect(selectEl, type) {
    const trigger = selectEl.querySelector('.select-trigger');
    const options = selectEl.querySelector('.select-options');
    const valueEl = selectEl.querySelector('.select-value');

    // 点击展开/收起
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = trigger.classList.contains('active');
      // 关闭所有其他下拉框
      document.querySelectorAll('.custom-select .select-trigger.active').forEach(el => {
        if (el !== trigger) {
          el.classList.remove('active');
          el.nextElementSibling.classList.remove('active');
        }
      });
      trigger.classList.toggle('active', !isActive);
      options.classList.toggle('active', !isActive);
    });

    // 选项点击
    options.querySelectorAll('.select-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = opt.dataset.value;
        selectEl.dataset.value = value;
        valueEl.textContent = opt.textContent;
        valueEl.classList.remove('placeholder');
        trigger.classList.remove('active');
        options.classList.remove('active');

        // 更新日选项（当年月变化时）
        if (type === 'year' || type === 'month') {
          this.updateDayOptions();
        }
      });
    });

    // 点击外部关闭
    document.addEventListener('click', () => {
      trigger.classList.remove('active');
      options.classList.remove('active');
    });
  },

  // 获取农历月份天数
  _getLunarMonthDays(year, month) {
    // 从LUNAR_MAP数据中计算指定农历年月的天数
    if (typeof LUNAR_MAP === 'undefined') return 30;

    const lunarKeyPrefix = `${year}-${String(month).padStart(2, '0')}-`;
    let days = 0;

    for (const [solarDate, lunarDate] of Object.entries(LUNAR_MAP)) {
      if (lunarDate.startsWith(lunarKeyPrefix)) {
        days++;
      }
    }

    return days > 0 ? days : 30; // 默认30天
  },

  // 更新日选项
  updateDayOptions() {
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select');
    const daySelect = document.getElementById('day-select');

    const year = parseInt(yearSelect.dataset.value);
    const month = parseInt(monthSelect.dataset.value);

    if (!year || !month) return;

    const calendarType = document.querySelector('input[name="calendar-type"]:checked')?.value || 'solar';
    let daysInMonth;

    if (calendarType === 'lunar') {
      // 农历月份天数
      daysInMonth = this._getLunarMonthDays(year, month);
    } else {
      // 阳历月份天数
      daysInMonth = new Date(year, month, 0).getDate();
    }

    const dayOptions = daySelect.querySelector('.select-options');
    const currentDayValue = daySelect.dataset.value;
    dayOptions.innerHTML = '<div class="select-option" data-value="">请选择日子</div>';

    for (let day = 1; day <= daysInMonth; day++) {
      dayOptions.innerHTML += `<div class="select-option" data-value="${day}">${day}日</div>`;
    }

    // 重新绑定事件
    dayOptions.querySelectorAll('.select-option').forEach(opt => {
      opt.addEventListener('click', (e) => {
        e.stopPropagation();
        const value = opt.dataset.value;
        daySelect.dataset.value = value;
        const valueEl = daySelect.querySelector('.select-value');
        valueEl.textContent = opt.textContent;
        valueEl.classList.remove('placeholder');
        const trigger = daySelect.querySelector('.select-trigger');
        trigger.classList.remove('active');
        dayOptions.classList.remove('active');
      });
    });

    // 如果当前选择的日子超出范围，重置
    if (currentDayValue && parseInt(currentDayValue) > daysInMonth) {
      daySelect.dataset.value = '';
      const valueEl = daySelect.querySelector('.select-value');
      valueEl.textContent = '请选择日子';
      valueEl.classList.add('placeholder');
    }
  },

  // 处理八字批盘确认
  handleBaziConfirm() {
    const yearSelect = document.getElementById('year-select');
    const monthSelect = document.getElementById('month-select');
    const daySelect = document.getElementById('day-select');
    const hourSelect = document.getElementById('hour-select');
    const genderInput = document.querySelector('input[name="gender"]:checked');
    const calendarType = document.querySelector('input[name="calendar-type"]:checked')?.value || 'solar';

    const year = parseInt(yearSelect.dataset.value);
    const month = parseInt(monthSelect.dataset.value);
    const day = parseInt(daySelect.dataset.value);
    const hour = parseInt(hourSelect.dataset.value);

    if (!year) {
      UIUtil.showToast('请选择年份');
      return;
    }
    if (!month) {
      UIUtil.showToast('请选择月份');
      return;
    }
    if (!day) {
      UIUtil.showToast('请选择日子');
      return;
    }
    if (isNaN(hour)) {
      UIUtil.showToast('请选择时辰');
      return;
    }

    this.hideBaziPanel();

    // 构造日期
    let solarDate;
    if (calendarType === 'lunar') {
      // 使用 FortuneAnalyzer 转换农历到阳历
      solarDate = FortuneAnalyzer.lunarToSolar(year, month, day);
    } else {
      solarDate = new Date(year, month - 1, day);
    }

    // 设置时辰（hour是0-11的时辰索引，转换为实际小时）
    const actualHour = hour * 2;
    solarDate.setHours(actualHour);

    // 计算八字
    const baziData = this.calculateBazi(solarDate, actualHour, genderInput.value, calendarType);
    this.state.currentBazi = baziData;

    // 直接显示八字详情
    this.showBaziDetailDirectly(baziData);
  },

  // 直接显示八字详情（不经过卡片展示）
  showBaziDetailDirectly(baziData) {
    const detail = document.getElementById('bazi-detail');
    const content = document.getElementById('bazi-detail-content');

    content.innerHTML = this.createBaziDetailHtml(baziData);

    // 设置标题
    document.getElementById('bazi-detail-title').textContent =
      `${baziData.pillars.year} ${baziData.pillars.month} ${baziData.pillars.day} ${baziData.pillars.hour}`;

    detail.classList.remove('hidden');
    history.pushState({ baziDetail: true }, '');

    // 显示顶部返回键
    const headerBackBtn = document.getElementById('header-back-btn');
    if (headerBackBtn) {
      headerBackBtn.classList.remove('hidden');
    }
  },

  // 计算八字
  calculateBazi(date, hour, gender, calendarType) {
    // 如果是农历输入，需要转换
    let solarDate = date;
    if (calendarType === 'lunar') {
      // 使用 FortuneAnalyzer 转换农历到阳历
      const lunarYear = date.getFullYear();
      const lunarMonth = date.getMonth() + 1;
      const lunarDay = date.getDate();
      solarDate = FortuneAnalyzer.lunarToSolar(lunarYear, lunarMonth, lunarDay);
    }

    // 设置时辰
    solarDate.setHours(hour);

    // 获取四柱
    const pillars = FortuneAnalyzer.analyzeFourPillars(solarDate);
    const [yearPillar, monthPillar, dayPillar, hourPillar] = pillars;

    // 计算十神（以日干为日主）
    const dayGan = dayPillar[0];
    const shiShen = {
      yearGan: FortuneAnalyzer.getShiShen(dayGan, yearPillar[0]),
      monthGan: FortuneAnalyzer.getShiShen(dayGan, monthPillar[0]),
      dayGan: '日主',
      hourGan: FortuneAnalyzer.getShiShen(dayGan, hourPillar[0]),
      yearZhi: this.getZhiShiShen(dayGan, yearPillar[1]),
      monthZhi: this.getZhiShiShen(dayGan, monthPillar[1]),
      dayZhi: this.getZhiShiShen(dayGan, dayPillar[1]),
      hourZhi: this.getZhiShiShen(dayGan, hourPillar[1])
    };

    // 五行统计
    const wuXing = this.calculateWuXing(pillars);

    // 计算大运
    const dayun = this.calculateDayun(yearPillar, monthPillar, gender, solarDate);

    // 计算流年（当前及未来10年）
    const liunian = this.calculateLiunian(new Date().getFullYear(), 10);

    // 纳音
    const naYin = {
      year: FortuneAnalyzer.getNaYin(yearPillar),
      month: FortuneAnalyzer.getNaYin(monthPillar),
      day: FortuneAnalyzer.getNaYin(dayPillar),
      hour: FortuneAnalyzer.getNaYin(hourPillar)
    };

    // 神煞
    const shenSha = this.calculateShenSha(pillars);

    // 命局分析
    const mingJu = {
      riZhu: dayPillar,
      riGan: dayGan,
      riZhi: dayPillar[1],
      mingZhu: this.getMingZhu(dayPillar),
      wuXingJu: this.detectWuXingJu(pillars),
      shenQiangRuo: this.detectShenQiangRuo(wuXing, dayGan),
      yongShen: this.detectYongShen(wuXing, dayGan)
    };

    return {
      pillars: {
        year: yearPillar,
        month: monthPillar,
        day: dayPillar,
        hour: hourPillar
      },
      shiShen,
      wuXing,
      dayun,
      liunian,
      naYin,
      shenSha,
      mingJu,
      gender,
      birthDate: solarDate,
      calendarType
    };
  },

  // 获取地支十神（地支藏干）
  getZhiShiShen(dayGan, zhi) {
    const zhiCangGan = {
      '子': ['癸'],
      '丑': ['己', '癸', '辛'],
      '寅': ['甲', '丙', '戊'],
      '卯': ['乙'],
      '辰': ['戊', '乙', '癸'],
      '巳': ['丙', '庚', '戊'],
      '午': ['丁', '己'],
      '未': ['己', '丁', '乙'],
      '申': ['庚', '壬', '戊'],
      '酉': ['辛'],
      '戌': ['戊', '辛', '丁'],
      '亥': ['壬', '甲']
    };

    const cangGan = zhiCangGan[zhi] || [];
    return cangGan.map(gan => FortuneAnalyzer.getShiShen(dayGan, gan));
  },

  // 计算五行
  calculateWuXing(pillars) {
    const wuXingMap = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水',
      '子': '水', '丑': '土', '寅': '木', '卯': '木',
      '辰': '土', '巳': '火', '午': '火', '未': '土',
      '申': '金', '酉': '金', '戌': '土', '亥': '水'
    };

    const count = { '金': 0, '木': 0, '水': 0, '火': 0, '土': 0 };
    let total = 0;

    pillars.forEach(pillar => {
      const gan = pillar[0];
      const zhi = pillar[1];
      if (wuXingMap[gan]) {
        count[wuXingMap[gan]]++;
        total++;
      }
      if (wuXingMap[zhi]) {
        count[wuXingMap[zhi]]++;
        total++;
      }
    });

    return {
      count,
      total,
      percentage: {
        '金': Math.round((count['金'] / total) * 100),
        '木': Math.round((count['木'] / total) * 100),
        '水': Math.round((count['水'] / total) * 100),
        '火': Math.round((count['火'] / total) * 100),
        '土': Math.round((count['土'] / total) * 100)
      }
    };
  },

  // 计算大运
  calculateDayun(yearPillar, monthPillar, gender, birthDate) {
    const dayun = [];
    const ganYang = ['甲', '丙', '戊', '庚', '壬'];
    const isYangYear = ganYang.includes(yearPillar[0]);
    const isMale = gender === 'male';

    // 顺排或逆排
    const isShunPai = (isYangYear && isMale) || (!isYangYear && !isMale);

    // 计算起运年龄（简化版）
    const startAge = 3;

    // 生成10步大运
    const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    let startGanIndex = tianGan.indexOf(monthPillar[0]);
    let startZhiIndex = diZhi.indexOf(monthPillar[1]);

    for (let i = 0; i < 10; i++) {
      let ganIdx, zhiIdx;
      if (isShunPai) {
        ganIdx = (startGanIndex + i + 1) % 10;
        zhiIdx = (startZhiIndex + i + 1) % 12;
      } else {
        ganIdx = (startGanIndex - i - 1 + 10) % 10;
        zhiIdx = (startZhiIndex - i - 1 + 12) % 12;
      }

      const age = startAge + i * 10;
      const year = birthDate.getFullYear() + age;

      dayun.push({
        age,
        year,
        ganZhi: tianGan[ganIdx] + diZhi[zhiIdx],
        isCurrent: i === 0 // 简化，第一步为当前大运
      });
    }

    return dayun;
  },

  // 计算流年
  calculateLiunian(startYear, count) {
    const tianGan = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const diZhi = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    const liunian = [];
    let ganIdx = (startYear - 4) % 10;
    let zhiIdx = (startYear - 4) % 12;

    for (let i = 0; i < count; i++) {
      liunian.push({
        year: startYear + i,
        ganZhi: tianGan[ganIdx] + diZhi[zhiIdx]
      });
      ganIdx = (ganIdx + 1) % 10;
      zhiIdx = (zhiIdx + 1) % 12;
    }

    return liunian;
  },

  // 获取纳音
  getNaYin(pillar) {
    const naYinMap = {
      '甲子': '海中金', '乙丑': '海中金',
      '丙寅': '炉中火', '丁卯': '炉中火',
      '戊辰': '大林木', '己巳': '大林木',
      '庚午': '路旁土', '辛未': '路旁土',
      '壬申': '剑锋金', '癸酉': '剑锋金',
      '甲戌': '山头火', '乙亥': '山头火',
      '丙子': '涧下水', '丁丑': '涧下水',
      '戊寅': '城头土', '己卯': '城头土',
      '庚辰': '白蜡金', '辛巳': '白蜡金',
      '壬午': '杨柳木', '癸未': '杨柳木',
      '甲申': '泉中水', '乙酉': '泉中水',
      '丙戌': '屋上土', '丁亥': '屋上土',
      '戊子': '霹雳火', '己丑': '霹雳火',
      '庚寅': '松柏木', '辛卯': '松柏木',
      '壬辰': '长流水', '癸巳': '长流水',
      '甲午': '沙中金', '乙未': '沙中金',
      '丙申': '山下火', '丁酉': '山下火',
      '戊戌': '平地木', '己亥': '平地木',
      '庚子': '壁上土', '辛丑': '壁上土',
      '壬寅': '金箔金', '癸卯': '金箔金',
      '甲辰': '覆灯火', '乙巳': '覆灯火',
      '丙午': '天河水', '丁未': '天河水',
      '戊申': '大驿土', '己酉': '大驿土',
      '庚戌': '钗钏金', '辛亥': '钗钏金',
      '壬子': '桑柘木', '癸丑': '桑柘木',
      '甲寅': '大溪水', '乙卯': '大溪水',
      '丙辰': '沙中土', '丁巳': '沙中土',
      '戊午': '天上火', '己未': '天上火',
      '庚申': '石榴木', '辛酉': '石榴木',
      '壬戌': '大海水', '癸亥': '大海水'
    };

    return naYinMap[pillar] || '';
  },

  // 计算神煞（简化版）
  calculateShenSha(pillars) {
    const shenShaList = [];
    const [year, month, day, hour] = pillars;

    // 天乙贵人
    const tianYiGuiRen = {
      '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
      '乙': ['子', '申'], '己': ['子', '申'],
      '丙': ['亥', '酉'], '丁': ['亥', '酉'],
      '壬': ['卯', '巳'], '癸': ['卯', '巳'],
      '辛': ['寅', '午']
    };

    const dayGan = day[0];
    if (tianYiGuiRen[dayGan]) {
      const guiRen = tianYiGuiRen[dayGan];
      if (guiRen.includes(year[1]) || guiRen.includes(month[1]) || guiRen.includes(day[1]) || guiRen.includes(hour[1])) {
        shenShaList.push({ name: '天乙贵人', type: 'ji' });
      }
    }

    // 文昌贵人
    const wenChang = {
      '甲': '巳', '乙': '午', '丙': '申', '丁': '酉',
      '戊': '申', '己': '酉', '庚': '亥', '辛': '子',
      '壬': '寅', '癸': '卯'
    };
    if (wenChang[dayGan] === year[1] || wenChang[dayGan] === month[1] || wenChang[dayGan] === day[1] || wenChang[dayGan] === hour[1]) {
      shenShaList.push({ name: '文昌贵人', type: 'ji' });
    }

    // 桃花
    const taoHua = {
      '申': '酉', '子': '酉', '辰': '酉',
      '寅': '卯', '午': '卯', '戌': '卯',
      '巳': '午', '酉': '午', '丑': '午',
      '亥': '子', '卯': '子', '未': '子'
    };
    const yearZhi = year[1];
    if (taoHua[yearZhi] === day[1] || taoHua[yearZhi] === hour[1]) {
      shenShaList.push({ name: '桃花', type: 'zhong' });
    }

    // 驿马
    const yiMa = {
      '申': '寅', '子': '寅', '辰': '寅',
      '寅': '申', '午': '申', '戌': '申',
      '巳': '亥', '酉': '亥', '丑': '亥',
      '亥': '巳', '卯': '巳', '未': '巳'
    };
    if (yiMa[yearZhi] === day[1] || yiMa[yearZhi] === hour[1]) {
      shenShaList.push({ name: '驿马', type: 'zhong' });
    }

    // 华盖
    const huaGai = {
      '申': '辰', '子': '辰', '辰': '辰',
      '寅': '戌', '午': '戌', '戌': '戌',
      '巳': '丑', '酉': '丑', '丑': '丑',
      '亥': '未', '卯': '未', '未': '未'
    };
    if (huaGai[yearZhi] === day[1] || huaGai[yearZhi] === hour[1]) {
      shenShaList.push({ name: '华盖', type: 'zhong' });
    }

    return shenShaList;
  },

  // 获取命柱
  getMingZhu(dayPillar) {
    const naYin = this.getNaYin(dayPillar);
    return naYin ? dayPillar + naYin : dayPillar;
  },

  // 检测五行局
  detectWuXingJu(pillars) {
    // 简化检测，基于年柱纳音
    const naYin = this.getNaYin(pillars[0]);
    if (naYin.includes('金')) return '金局';
    if (naYin.includes('木')) return '木局';
    if (naYin.includes('水')) return '水局';
    if (naYin.includes('火')) return '火局';
    if (naYin.includes('土')) return '土局';
    return '未知';
  },

  // 检测身强身弱
  detectShenQiangRuo(wuXing, dayGan) {
    const dayGanWuXing = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };

    const dayWuXing = dayGanWuXing[dayGan];
    const dayCount = wuXing.count[dayWuXing];

    if (dayCount >= 3) return '身强';
    if (dayCount <= 1) return '身弱';
    return '平和';
  },

  // 检测用神
  detectYongShen(wuXing, dayGan) {
    const dayGanWuXing = {
      '甲': '木', '乙': '木',
      '丙': '火', '丁': '火',
      '戊': '土', '己': '土',
      '庚': '金', '辛': '金',
      '壬': '水', '癸': '水'
    };

    const dayWuXing = dayGanWuXing[dayGan];
    const counts = wuXing.count;

    // 身强喜克泄耗，身弱喜生扶
    const isStrong = counts[dayWuXing] >= 3;

    const keWo = { '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' };
    const woKe = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
    const shengWo = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };

    if (isStrong) {
      return `喜用神：${keWo[dayWuXing]}（官杀）、${woKe[dayWuXing]}（财星）`;
    } else {
      return `喜用神：${shengWo[dayWuXing]}（印星）、${dayWuXing}（比劫）`;
    }
  },

  // 显示八字命盘
  displayBazi(baziData) {
    const display = document.getElementById('gua-main');
    display.innerHTML = this.createBaziCard(baziData);

    // 显示顶部返回键
    const headerBackBtn = document.getElementById('header-back-btn');
    if (headerBackBtn) {
      headerBackBtn.classList.remove('hidden');
    }
  },

  // 创建八字卡片
  createBaziCard(baziData) {
    const { pillars, shiShen, wuXing, dayun, liunian, naYin, shenSha, mingJu } = baziData;

    // 十神展示
    const shishenHtml = `
      <div class="detail-section shishen-section">
        <h3>十神</h3>
        <div class="shishen-grid">
          <div class="shishen-item"><div class="label">年干</div><div class="value">${shiShen.yearGan}</div></div>
          <div class="shishen-item"><div class="label">月干</div><div class="value">${shiShen.monthGan}</div></div>
          <div class="shishen-item"><div class="label">时干</div><div class="value">${shiShen.hourGan}</div></div>
        </div>
      </div>
    `;

    // 五行统计
    const wuxingHtml = `
      <div class="detail-section wuxing-section">
        <h3>五行统计</h3>
        <div class="wuxing-chart">
          ${Object.entries(wuXing.count).map(([wx, count]) => `
            <div class="wuxing-item">
              <div class="wuxing-name" style="color: ${this.getWuXingColor(wx)}">${wx}</div>
              <div class="wuxing-count">${count}个 ${wuXing.percentage[wx]}%</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // 大运
    const dayunHtml = `
      <div class="detail-section dayun-section">
        <h3>大运</h3>
        <div class="dayun-list">
          ${dayun.map(dy => `
            <div class="dayun-item ${dy.isCurrent ? 'current' : ''}">
              <div class="dayun-age">${dy.age}岁</div>
              <div class="dayun-ganzhi">${dy.ganZhi}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // 流年
    const liunianHtml = `
      <div class="detail-section liunian-section">
        <h3>流年</h3>
        <div class="liunian-grid">
          ${liunian.map(ln => `
            <div class="liunian-item">
              <div class="liunian-year">${ln.year}</div>
              <div class="liunian-ganzhi">${ln.ganZhi}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // 纳音
    const nayinHtml = `
      <div class="detail-section nayin-section">
        <h3>纳音五行</h3>
        <div class="nayin-grid">
          <div class="nayin-item"><div class="pillar-label">年柱</div><div class="nayin-name">${naYin.year}</div></div>
          <div class="nayin-item"><div class="pillar-label">月柱</div><div class="nayin-name">${naYin.month}</div></div>
          <div class="nayin-item"><div class="pillar-label">日柱</div><div class="nayin-name">${naYin.day}</div></div>
          <div class="nayin-item"><div class="pillar-label">时柱</div><div class="nayin-name">${naYin.hour}</div></div>
        </div>
      </div>
    `;

    // 神煞
    const shenshaHtml = shenSha.length > 0 ? `
      <div class="detail-section shensha-section">
        <h3>神煞</h3>
        <div class="shensha-list">
          ${shenSha.map(ss => `
            <span class="shensha-tag ${ss.type}">${ss.name}</span>
          `).join('')}
        </div>
      </div>
    ` : '';

    // 命局信息
    const mingjuHtml = `
      <div class="detail-section">
        <h3>命局信息</h3>
        <div class="mingju-info">
          <div class="mingju-row">
            <span class="mingju-label">日柱（命主）</span>
            <span class="mingju-value">${mingJu.riZhu}</span>
          </div>
          <div class="mingju-row">
            <span class="mingju-label">纳音五行</span>
            <span class="mingju-value">${mingJu.mingZhu}</span>
          </div>
          <div class="mingju-row">
            <span class="mingju-label">五行局</span>
            <span class="mingju-value">${mingJu.wuXingJu}</span>
          </div>
          <div class="mingju-row">
            <span class="mingju-label">身强身弱</span>
            <span class="mingju-value">${mingJu.shenQiangRuo}</span>
          </div>
          <div class="mingju-row">
            <span class="mingju-label">用神</span>
            <span class="mingju-value">${mingJu.yongShen}</span>
          </div>
        </div>
      </div>
    `;

    return `
      <div class="bazi-card" onclick="App.showBaziDetail()">
        <div class="bazi-title">
          <h2>${pillars.year} ${pillars.month} ${pillars.day} ${pillars.hour}</h2>
          <div class="bazi-subtitle">八字命盘 · 点击查看详情</div>
        </div>

        <div class="bazi-pillar-section">
          <div class="bazi-pillar-grid">
            <div class="bazi-pillar-item">
              <div class="pillar-label">年柱</div>
              <div class="pillar-ganzhi">${pillars.year}</div>
            </div>
            <div class="bazi-pillar-item">
              <div class="pillar-label">月柱</div>
              <div class="pillar-ganzhi">${pillars.month}</div>
            </div>
            <div class="bazi-pillar-item">
              <div class="pillar-label">日柱</div>
              <div class="pillar-ganzhi">${pillars.day}</div>
            </div>
            <div class="bazi-pillar-item">
              <div class="pillar-label">时柱</div>
              <div class="pillar-ganzhi">${pillars.hour}</div>
            </div>
          </div>
        </div>

        ${mingjuHtml}
        ${shishenHtml}
        ${wuxingHtml}
        ${nayinHtml}
        ${shenshaHtml}
        ${dayunHtml}
        ${liunianHtml}
      </div>
    `;
  },

  // 获取五行颜色
  getWuXingColor(wuxing) {
    const colors = {
      '金': '#FFD700',
      '木': '#4CAF50',
      '水': '#2196F3',
      '火': '#F44336',
      '土': '#FFC107'
    };
    return colors[wuxing] || '#c9a961';
  },

  // 显示八字详情
  showBaziDetail() {
    if (!this.state.currentBazi) return;

    const detail = document.getElementById('bazi-detail');
    const content = document.getElementById('bazi-detail-content');

    content.innerHTML = this.createBaziDetailHtml(this.state.currentBazi);

    detail.classList.remove('hidden');
    history.pushState({ baziDetail: true }, '');
  },

  // 隐藏八字详情
  hideBaziDetail() {
    const detail = document.getElementById('bazi-detail');
    detail.classList.add('hidden');
    history.back();

    // 重置八字显示
    this.resetBaziDisplay();
  },

  // 重置八字显示
  resetBaziDisplay() {
    // 清除当前八字
    this.state.currentBazi = null;

    // 重置显示区域为等待状态
    const display = document.getElementById('gua-main');
    display.innerHTML = `
      <div class="gua-waiting">
        <p>轻触起卦</p>
        <p class="hint">或向上滑动切换方式</p>
      </div>
    `;

    // 重置提示文字
    document.getElementById('action-hint').textContent = '轻触起卦 · 向上滑动切换方式';

    // 隐藏顶部返回键
    const headerBackBtn = document.getElementById('header-back-btn');
    if (headerBackBtn) {
      headerBackBtn.classList.add('hidden');
    }
  },

  // 创建八字详情HTML
  createBaziDetailHtml(baziData) {
    // 复用 createBaziCard 的内容，并添加更多详细信息
    return this.createBaziCard(baziData);
  },

  // 八字 AI 问答 Prompt
  BAZI_PROMPT: `你是一位精通八字命理的易学大师，拥有深厚的子平八字造诣。

请根据以下八字命盘信息，为用户提供专业、详细、有深度的命理分析：

【基本信息】
- 性别：{gender}
- 出生日期：{birthDate}
- 农历/阳历：{calendarType}

【四柱八字】
{baziPillars}

【十神配置】
{shiShen}

【五行统计】
{wuXing}

【命局分析】
{mingJu}

【大运走势】
{dayun}

【流年运势】
{liunian}

【神煞】
{shenSha}

【用户问题】
{question}

请按以下结构解析：

1. **命局总论**
   - 日主分析（性格特点、天赋潜能）
   - 格局判断（身强身弱、从格等）
   - 五行喜忌与用神分析

2. **事业财运**
   - 适合的职业方向
   - 财运走势分析
   - 事业发展关键期

3. **感情婚姻**
   - 配偶特征分析
   - 婚姻走势
   - 桃花与感情机遇

4. **健康分析**
   - 体质特点
   - 需要注意的健康问题
   - 养生建议

5. **大运流年**
   - 当前大运分析
   - 未来三年流年运势
   - 关键年份提示

6. **综合建议**
   - 开运方位与颜色
   - 适合的行业与数字
   - 趋吉避凶的方法

解盘风格要求：
- 语言典雅，有古风韵味但不过于晦涩
- 分析有理有据，引用经典但不堆砌
- 既要有传统命理的严谨，也要有现代解读的通俗
- 对吉凶判断要清晰明确，不模棱两可
- 最后给出三句核心建议`,

  // 生成八字解析 Prompt
  generateBaziPrompt(baziData, question) {
    const { pillars, shiShen, wuXing, dayun, liunian, naYin, shenSha, mingJu, gender, birthDate, calendarType } = baziData;

    const baziPillars = `
年柱：${pillars.year}（${naYin.year}）
月柱：${pillars.month}（${naYin.month}）
日柱：${pillars.day}（${naYin.day}）- 日主
时柱：${pillars.hour}（${naYin.hour}）`;

    const shiShenText = `
年干：${shiShen.yearGan}
月干：${shiShen.monthGan}
时干：${shiShen.hourGan}
地支藏干：年支${shiShen.yearZhi.join('、')}，月支${shiShen.monthZhi.join('、')}，日支${shiShen.dayZhi.join('、')}，时支${shiShen.hourZhi.join('、')}`;

    const wuXingText = `
金：${wuXing.count['金']}个（${wuXing.percentage['金']}%）
木：${wuXing.count['木']}个（${wuXing.percentage['木']}%）
水：${wuXing.count['水']}个（${wuXing.percentage['水']}%）
火：${wuXing.count['火']}个（${wuXing.percentage['火']}%）
土：${wuXing.count['土']}个（${wuXing.percentage['土']}%）`;

    const mingJuText = `
日柱：${mingJu.riZhu}
纳音：${mingJu.mingZhu}
五行局：${mingJu.wuXingJu}
身强身弱：${mingJu.shenQiangRuo}
${mingJu.yongShen}`;

    const dayunText = dayun.slice(0, 5).map(dy =>
      `${dy.age}岁-${dy.age + 9}岁（${dy.year}-${dy.year + 9}）：${dy.ganZhi} ${dy.isCurrent ? '【当前大运】' : ''}`
    ).join('\n');

    const liunianText = liunian.slice(0, 5).map(ln =>
      `${ln.year}年：${ln.ganZhi}`
    ).join('\n');

    const shenShaText = shenSha.map(ss => ss.name).join('、') || '无';

    return this.BAZI_PROMPT
      .replace('{gender}', gender === 'male' ? '男' : '女')
      .replace('{birthDate}', birthDate.toLocaleDateString('zh-CN'))
      .replace('{calendarType}', calendarType === 'lunar' ? '农历' : '阳历')
      .replace('{baziPillars}', baziPillars)
      .replace('{shiShen}', shiShenText)
      .replace('{wuXing}', wuXingText)
      .replace('{mingJu}', mingJuText)
      .replace('{dayun}', dayunText)
      .replace('{liunian}', liunianText)
      .replace('{shenSha}', shenShaText)
      .replace('{question}', question || '请全面分析此命局');
  },

  // 八字 AI 问答（流式输出）
  async askBaziAI(question) {
    if (!this.state.currentBazi) {
      UIUtil.showToast('请先批盘');
      return;
    }

    const prompt = this.generateBaziPrompt(this.state.currentBazi, question);

    // 获取 AI 配置
    const aiConfig = Storage.getAIConfig();

    // 检查是否有 API Key
    let apiKey, baseUrl, modelName;

    if (aiConfig.provider === 'deepseek') {
      apiKey = aiConfig.deepseek?.apiKey;
      baseUrl = 'https://api.deepseek.com/v1';
      modelName = aiConfig.deepseek?.model || 'deepseek-chat';
    } else {
      apiKey = aiConfig.custom?.apiKey;
      baseUrl = aiConfig.custom?.baseUrl;
      modelName = aiConfig.custom?.modelName || 'gpt-3.5-turbo';
    }

    // 复制 prompt 到剪贴板
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(prompt);
    }

    if (!apiKey || (aiConfig.provider === 'custom' && !baseUrl)) {
      UIUtil.showToast('提示词已复制，请粘贴到 AI 使用');
      return;
    }

    // 创建流式响应区域（复用卦象的对话详情页面）
    const messageId = 'bazi-' + Date.now().toString();
    this.createBaziStreamingResponse(messageId, question);

    let fullResponse = '';
    let reasoningContent = '';

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: '你是一位精通八字命理的易学大师。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
          stream: true
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || response.statusText);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const json = JSON.parse(data);
              const delta = json.choices[0]?.delta;

              if (delta?.reasoning_content) {
                reasoningContent += delta.reasoning_content;
                this.updateStreamingResponse(messageId, fullResponse, reasoningContent, true);
              }

              if (delta?.content) {
                fullResponse += delta.content;
                this.updateStreamingResponse(messageId, fullResponse, reasoningContent, true);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }

      // 流式输出完成
      this.updateStreamingResponse(messageId, fullResponse, reasoningContent, false);

      // 保存对话记录
      Storage.addConversation({
        id: messageId,
        type: 'bazi',
        gua: this.state.currentBazi.pillars.day + '八字',
        guaData: this.state.currentBazi,
        question: question,
        answer: fullResponse,
        reasoning: reasoningContent,
        model: modelName,
        prompt: prompt
      });

      UIUtil.showToast('解析完成');

    } catch (error) {
      this.updateStreamingResponse(messageId, `请求失败：${error.message}`, '', false);
    }
  },

  // 创建八字流式响应区域
  createBaziStreamingResponse(messageId, question) {
    const chatMessages = document.getElementById('chat-messages');

    // 清空并显示对话页面
    const chatDetailPage = document.getElementById('chat-detail-page');
    chatMessages.innerHTML = '';
    chatDetailPage.classList.remove('hidden');
    history.pushState({ chatDetail: true }, '');

    // 创建消息容器
    const container = document.createElement('div');
    container.id = `chat-${messageId}`;
    container.className = 'chat-messages-container';
    container.innerHTML = `
      <div class="chat-message user">
        <div class="message-bubble">${this.escapeHtml(question)}</div>
      </div>
      <div class="chat-message assistant" id="assistant-${messageId}">
        <div class="message-bubble">
          <div class="streaming-content"></div>
          <span class="streaming-cursor"></span>
        </div>
      </div>
    `;

    chatMessages.appendChild(container);

    // 设置当前对话标题
    document.getElementById('chat-detail-title').textContent =
      `${this.state.currentBazi.pillars.day}八字 · 解析`;
  },

  // 更新流式响应
  updateStreamingResponse(messageId, content, reasoning, isStreaming) {
    const assistantMsg = document.getElementById(`assistant-${messageId}`);
    if (!assistantMsg) return;

    const bubble = assistantMsg.querySelector('.message-bubble');
    const contentDiv = bubble.querySelector('.streaming-content');
    const cursor = bubble.querySelector('.streaming-cursor');

    // 构建内容
    let html = '';

    // 推理过程（仅 DeepSeek-R1）
    if (reasoning) {
      html += `
        <div class="reasoning-process">
          <div class="reasoning-header">🤔 思维链</div>
          <div class="reasoning-content">${this.renderMarkdown(reasoning)}</div>
        </div>
      `;
    }

    // 主内容
    html += `<div class="main-content">${this.renderMarkdown(content)}</div>`;

    contentDiv.innerHTML = html;

    // 滚动到底部
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 完成时移除光标
    if (!isStreaming && cursor) {
      cursor.remove();
    }
  },

  // 简单的 Markdown 渲染
  renderMarkdown(text) {
    if (!text) return '';

    return text
      // 转义 HTML
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      // 标题
      .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 加粗
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      // 代码块
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // 行内代码
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // 引用
      .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
      // 无序列表
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
      // 有序列表
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      // 换行
      .replace(/\n/g, '<br>');
  },

  // 转义 HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // 显示聊天历史列表
  showChatHistory() {
    const chatHistoryPage = document.getElementById('chat-history-page');
    const chatList = document.getElementById('chat-list');

    // 加载历史记录
    const conversations = Storage.getConversations();

    if (conversations.length === 0) {
      chatList.innerHTML = `
        <div class="empty-chat">
          <div class="empty-chat-icon">📜</div>
          <p>暂无问答记录</p>
          <p style="font-size: 0.75rem; margin-top: 10px; opacity: 0.6;">起卦或批盘后向 AI 提问，记录将保存在这里</p>
        </div>
      `;
    } else {
      chatList.innerHTML = conversations.map(conv => `
        <div class="chat-item" data-id="${conv.id}" onclick="App.showChatDetail('${conv.id}')">
          <div class="chat-item-header">
            <span class="chat-item-gua">${conv.gua}</span>
            <span class="chat-item-time">${new Date(conv.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="chat-item-question">${this.escapeHtml(conv.question)}</div>
          <div class="chat-item-preview">${this.escapeHtml(conv.answer.slice(0, 100))}${conv.answer.length > 100 ? '...' : ''}</div>
        </div>
      `).join('');
    }

    chatHistoryPage.classList.remove('hidden');
    history.pushState({ chatHistory: true }, '');
  },

  // 隐藏聊天历史
  hideChatHistory() {
    const chatHistoryPage = document.getElementById('chat-history-page');
    chatHistoryPage.classList.add('hidden');
    history.back();
  },

  // 显示对话详情
  showChatDetail(conversationId) {
    const chatDetailPage = document.getElementById('chat-detail-page');
    const chatMessages = document.getElementById('chat-messages');

    // 先清空消息区域
    chatMessages.innerHTML = '';

    // 如果是当前正在进行的流式对话
    if (this.currentStreamingConversation && this.currentStreamingConversation.id === conversationId) {
      const container = document.getElementById(`chat-${conversationId}`);
      if (container) {
        chatDetailPage.classList.remove('hidden');
        history.pushState({ chatDetail: true }, '');
        return;
      }
    }

    // 检查是否已经在 DOM 中（正在显示的流式对话）
    const existingContainer = document.getElementById(`chat-${conversationId}`);
    if (existingContainer) {
      chatMessages.appendChild(existingContainer);
      chatDetailPage.classList.remove('hidden');
      history.pushState({ chatDetail: true }, '');
      return;
    }

    // 加载历史对话
    const conversation = Storage.getConversation(conversationId);
    if (!conversation) {
      UIUtil.showToast('对话记录不存在');
      return;
    }

    // 设置标题
    document.getElementById('chat-detail-title').textContent =
      `${conversation.gua} · ${conversation.question.slice(0, 10)}${conversation.question.length > 10 ? '...' : ''}`;

    // 渲染对话内容
    let html = '';

    // 用户问题
    html += `
      <div class="chat-message user">
        <div class="message-bubble">${this.escapeHtml(conversation.question)}</div>
      </div>
    `;

    // AI 回复
    let answerHtml = '';

    // 推理过程（如果有）
    if (conversation.reasoning) {
      answerHtml += `
        <div class="reasoning-process">
          <div class="reasoning-header">🤔 思维链</div>
          <div class="reasoning-content">${this.renderMarkdown(conversation.reasoning)}</div>
        </div>
      `;
    }

    // 主回答
    answerHtml += `<div class="main-content">${this.renderMarkdown(conversation.answer)}</div>`;

    html += `
      <div class="chat-message assistant">
        <div class="message-bubble">${answerHtml}</div>
      </div>
    `;

    chatMessages.innerHTML = html;
    chatDetailPage.classList.remove('hidden');
    history.pushState({ chatDetail: true }, '');
  },

  // 隐藏对话详情
  hideChatDetail() {
    const chatDetailPage = document.getElementById('chat-detail-page');
    chatDetailPage.classList.add('hidden');
    history.back();
  },

  // 更新时间显示
  updateTime() {
    const now = new Date();

    const timeEl = document.getElementById('current-time');
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }

    const lunarEl = document.getElementById('lunar-date');
    if (lunarEl) {
      const ganZhi = FortuneAnalyzer.getGanZhi(now);
      lunarEl.textContent = `${ganZhi.lunar.monthStr}${ganZhi.lunar.dayStr} ${ganZhi.month.name}月`;
    }
  },

  // 启动时间更新
  startTimeUpdate() {
    this.updateTime();
    setInterval(() => this.updateTime(), 60000); // 每分钟更新
  }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = App;
}
