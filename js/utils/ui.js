// UI动画与交互工具

const UIUtil = {
  // 震动反馈
  vibrate(pattern = [50]) {
    if (navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  },

  // 显示提示
  showToast(message, duration = 2000) {
    // 移除已有toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(26, 26, 26, 0.95);
      color: #c9a961;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 0.9rem;
      z-index: 10000;
      animation: fadeInUp 0.3s ease;
      border: 1px solid rgba(201, 169, 97, 0.3);
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // 元素淡入
  fadeIn(element, duration = 400) {
    element.style.opacity = '0';
    element.style.display = '';
    element.classList.remove('hidden');
    element.style.transition = `opacity ${duration}ms ease`;

    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });

    return new Promise(resolve => {
      setTimeout(resolve, duration);
    });
  },

  // 元素淡出
  fadeOut(element, duration = 400) {
    element.style.transition = `opacity ${duration}ms ease`;
    element.style.opacity = '0';

    return new Promise(resolve => {
      setTimeout(() => {
        element.classList.add('hidden');
        resolve();
      }, duration);
    });
  },

  // 滑动检测
  addSwipeListener(element, callbacks) {
    let startX, startY, startTime;
    let isTracking = false;

    const onStart = (e) => {
      const touch = e.touches ? e.touches[0] : e;
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      isTracking = true;
    };

    const onMove = (e) => {
      if (!isTracking) return;
      // 可选：添加滑动时的视觉反馈
    };

    const onEnd = (e) => {
      if (!isTracking) return;
      isTracking = false;

      const touch = e.changedTouches ? e.changedTouches[0] : e;
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();

      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;

      // 滑动阈值
      const threshold = 50;
      const velocity = Math.abs(deltaX) / deltaTime;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold && velocity > 0.3) {
        if (deltaX > 0 && callbacks.onSwipeRight) {
          callbacks.onSwipeRight();
        } else if (deltaX < 0 && callbacks.onSwipeLeft) {
          callbacks.onSwipeLeft();
        }
      } else if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > threshold) {
        if (deltaY > 0 && callbacks.onSwipeDown) {
          callbacks.onSwipeDown();
        } else if (deltaY < 0 && callbacks.onSwipeUp) {
          callbacks.onSwipeUp();
        }
      } else if (deltaTime > 500 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        // 长按
        if (callbacks.onLongPress) {
          callbacks.onLongPress();
        }
      } else if (deltaTime < 300 && Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
        // 轻触
        if (callbacks.onTap) {
          callbacks.onTap();
        }
      }
    };

    element.addEventListener('touchstart', onStart, { passive: true });
    element.addEventListener('touchmove', onMove, { passive: true });
    element.addEventListener('touchend', onEnd);

    // 鼠标事件（桌面端）
    element.addEventListener('mousedown', onStart);
    element.addEventListener('mousemove', onMove);
    element.addEventListener('mouseup', onEnd);

    return () => {
      element.removeEventListener('touchstart', onStart);
      element.removeEventListener('touchmove', onMove);
      element.removeEventListener('touchend', onEnd);
      element.removeEventListener('mousedown', onStart);
      element.removeEventListener('mousemove', onMove);
      element.removeEventListener('mouseup', onEnd);
    };
  },

  // 长按检测（独立）
  addLongPressListener(element, callback, duration = 800) {
    let timer;
    let isPressed = false;

    const start = (e) => {
      isPressed = true;
      timer = setTimeout(() => {
        if (isPressed) {
          callback(e);
          this.vibrate([100]);
        }
      }, duration);
    };

    const end = () => {
      isPressed = false;
      clearTimeout(timer);
    };

    element.addEventListener('touchstart', start, { passive: true });
    element.addEventListener('touchend', end);
    element.addEventListener('touchcancel', end);
    element.addEventListener('mousedown', start);
    element.addEventListener('mouseup', end);
    element.addEventListener('mouseleave', end);
  },

  // 获取五行颜色（适配深色背景）
  getWuxingColor(wuxing) {
    const colors = {
      '木': '#4CAF50',  // 绿色
      '火': '#F44336',  // 红色
      '土': '#FFC107',  // 黄色
      '金': '#FFD700',  // 金色
      '水': '#2196F3'   // 蓝色（黑色背景不可见，改用蓝色）
    };
    return colors[wuxing] || '#c9a961';
  },

  // 创建单爻HTML（带五行颜色和动爻圆圈）
  createYaoHtml(yaoType, isDong, wuxing) {
    const color = this.getWuxingColor(wuxing);
    const yaoClass = yaoType ? 'yang' : 'yin';
    const dongIndicator = isDong ? `<span class="dong-indicator" style="color: ${color}">●</span>` : '<span class="dong-indicator"></span>';

    return `
      <div class="yao-row">
        ${dongIndicator}
        <div class="yao ${yaoClass}" style="--yao-color: ${color}"></div>
      </div>
    `;
  },

  // 创建单个卦象卡片（用于滑动组件）
  createSingleGuaCard(guaData, dongYao, type, typeName) {
    const { yaos, upperGua, lowerGua, name } = guaData;

    // 生成六爻HTML
    let yaoHtml = '';
    for (let i = 6; i >= 1; i--) {
      const yaoType = yaos[i - 1];
      // 只有本卦显示动爻
      const isDong = (type === 'main' && i === dongYao);
      // 使用上卦五行对应456爻，下卦五行对应123爻
      const wuxing = i >= 4 ? upperGua.wuxing : lowerGua.wuxing;
      yaoHtml += this.createYaoHtml(yaoType, isDong, wuxing);
    }

    // 生成五行文字颜色样式
    const upperColor = this.getWuxingColor(upperGua.wuxing);
    const lowerColor = this.getWuxingColor(lowerGua.wuxing);

    return `
      <div class="gua-card-slide" data-type="${type}">
        <div class="gua-type-label">${typeName}</div>
        <div class="gua-title">
          <h2 style="color: ${upperColor}">${name}</h2>
          <div class="gua-trigrams">
            <span style="color: ${upperColor}">${upperGua.name}</span>
            <span class="trigram-divider">·</span>
            <span style="color: ${lowerColor}">${lowerGua.name}</span>
          </div>
        </div>
        <div class="gua-visual">
          ${yaoHtml}
        </div>
        <div class="gua-wuxing-info">
          <span style="color: ${upperColor}">上${upperGua.wuxing}</span>
          <span style="color: ${lowerColor}">下${lowerGua.wuxing}</span>
        </div>
      </div>
    `;
  },

  // 创建可滑动的卦象卡片组
  createGuaCard(guaData) {
    const { mainGua, dongYao, bianGua, huGua, cuoGua, zongGua, timeInfo } = guaData;

    // 所有卦象卡片
    const cards = [
      { type: 'main', name: '本卦', data: mainGua },
      { type: 'bian', name: '变卦', data: bianGua },
      { type: 'hu', name: '互卦', data: huGua },
      { type: 'cuo', name: '错卦', data: cuoGua },
      { type: 'zong', name: '综卦', data: zongGua }
    ];

    let cardsHtml = '';
    cards.forEach((card, index) => {
      cardsHtml += this.createSingleGuaCard(card.data, dongYao, card.type, card.name);
    });

    return `
      <div class="gua-carousel" id="gua-carousel" onclick="App.showDetail()">
        <div class="gua-carousel-track">
          ${cardsHtml}
        </div>
        <div class="gua-carousel-dots">
          ${cards.map((_, i) => `<span class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}
        </div>
      </div>

      <div class="time-info">
        <div class="time-info-item">
          <span class="time-info-label">农历</span>
          ${timeInfo.lunar ? timeInfo.lunar.monthStr + timeInfo.lunar.dayStr : timeInfo.month + '月 ' + timeInfo.day + '日'}
        </div>
        <div class="time-info-item">
          <span class="time-info-label">干支</span>
          ${timeInfo.year}年 ${timeInfo.month}月 ${timeInfo.day}日 ${timeInfo.hour}时
        </div>
      </div>
    `;
  },

  // 初始化循环Carousel组件 - 重新设计，确保居中
  initCarousel(element) {
    const track = element.querySelector('.gua-carousel-track');
    const dots = element.querySelectorAll('.carousel-dot');
    const originalCards = Array.from(track.querySelectorAll('.gua-card-slide'));
    const cardCount = originalCards.length;

    if (cardCount < 2) return;

    // 从 CSS 变量读取配置
    const carouselStyle = window.getComputedStyle(element);
    const cardWidth = parseInt(carouselStyle.getPropertyValue('--carousel-card-width')) || 220;
    const gap = parseInt(carouselStyle.getPropertyValue('--carousel-card-gap')) || 20;
    const slideWidth = cardWidth + gap; // 每张卡片占据的总宽度（含间距）

    // 状态变量
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    let currentTranslate = 0;
    let prevTranslate = 0;
    let animationID;
    let currentIndex = 0;

    // 获取容器宽度
    const getContainerWidth = () => {
      return element.getBoundingClientRect().width;
    };

    // 计算目标位置的translateX值 - 核心居中算法
    const calculateTranslateX = (index) => {
      const containerWidth = getContainerWidth();

      // 要让第index张卡片居中：
      // 1. 卡片左边缘位置 = index * slideWidth
      // 2. 卡片中心位置 = 卡片左边缘 + 卡片宽度/2
      // 3. 视口中心位置 = containerWidth / 2
      // 4. 需要的偏移 = 视口中心 - 卡片中心
      // 5. translateX = 偏移值（负值，向左移动）

      const cardLeftEdge = index * slideWidth;
      const cardCenter = cardLeftEdge + (cardWidth / 2);
      const viewportCenter = containerWidth / 2;

      return viewportCenter - cardCenter;
    };

    // 设置位置
    const setSliderPosition = () => {
      track.style.transform = `translateX(${currentTranslate}px)`;
    };

    // 动画循环
    const animation = () => {
      setSliderPosition();
      if (isDragging) animationID = requestAnimationFrame(animation);
    };

    // 更新激活状态
    const updateActiveStates = () => {
      const cards = track.querySelectorAll('.gua-card-slide');
      cards.forEach((card, i) => {
        card.classList.toggle('active', i === currentIndex);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
      });
    };

    // 移动到指定索引
    const moveToIndex = (index, animate = true) => {
      currentIndex = index;
      currentTranslate = calculateTranslateX(currentIndex);
      prevTranslate = currentTranslate;

      if (animate) {
        track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      } else {
        track.style.transition = 'none';
      }

      setSliderPosition();
      updateActiveStates();
    };

    // 触摸/鼠标开始
    const touchStart = (e) => {
      isDragging = true;
      startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
      track.style.transition = 'none';
      animationID = requestAnimationFrame(animation);
    };

    // 触摸/鼠标移动
    const touchMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
      const diff = x - startX;
      currentTranslate = prevTranslate + diff;
    };

    // 触摸/鼠标结束
    const touchEnd = (e) => {
      if (!isDragging) return;
      isDragging = false;
      cancelAnimationFrame(animationID);

      const movedBy = currentTranslate - prevTranslate;
      const threshold = slideWidth * 0.2; // 20%阈值

      // 判断滑动方向
      if (movedBy < -threshold && currentIndex < cardCount - 1) {
        currentIndex += 1;
      } else if (movedBy > threshold && currentIndex > 0) {
        currentIndex -= 1;
      }

      moveToIndex(currentIndex, true);
    };

    // 绑定事件
    track.addEventListener('touchstart', touchStart, { passive: true });
    track.addEventListener('touchend', touchEnd);
    track.addEventListener('touchmove', touchMove, { passive: false });

    track.addEventListener('mousedown', touchStart);
    track.addEventListener('mouseup', touchEnd);
    track.addEventListener('mouseleave', () => {
      if (isDragging) touchEnd();
    });
    track.addEventListener('mousemove', touchMove);

    // 阻止拖拽时的默认行为
    track.addEventListener('dragstart', (e) => e.preventDefault());

    // 点击指示器跳转
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        if (index >= 0 && index < cardCount) {
          moveToIndex(index, true);
        }
      });
    });

    // 窗口大小变化时重新计算
    const handleResize = () => {
      moveToIndex(currentIndex, false);
    };

    window.addEventListener('resize', handleResize);

    // 初始化：第一张卡片居中
    updateActiveStates();
    // 延迟初始化确保DOM已渲染
    requestAnimationFrame(() => {
      moveToIndex(0, false);
    });

    // 返回清理函数
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  },

  // 隐藏启动页
  async hideSplash() {
    const splash = document.getElementById('splash');
    const main = document.getElementById('main-content');

    await this.fadeOut(splash, 600);
    splash.classList.add('hidden');
    await this.fadeIn(main, 400);
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIUtil;
}
