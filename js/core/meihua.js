// 梅花易数核心算法
// 基于 FortuneAnalyzer 实现

const MeiHua = {
  // 地支数组（用于获取年支数）
  DIZHI: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],

  // 五行颜色映射
  WUXING_COLORS: {
    '木': '#4CAF50',  // 绿色
    '火': '#F44336',  // 红色
    '土': '#FFC107',  // 黄色
    '金': '#FFD700',  // 金色
    '水': '#000000'   // 黑色
  },

  // 先天八卦对应
  // yao数组是[下爻, 中爻, 上爻] - 从下到上
  XIAN_TIAN_BA_GUA: {
    1: { name: '乾', symbol: '☰', wuxing: '金', yao: [1, 1, 1] },    // 三阳
    2: { name: '兑', symbol: '☱', wuxing: '金', yao: [1, 1, 0] },    // 上缺 - 顶部阴
    3: { name: '离', symbol: '☲', wuxing: '火', yao: [1, 0, 1] },    // 中虚
    4: { name: '震', symbol: '☳', wuxing: '木', yao: [1, 0, 0] },    // 仰盂 - 底部阳，上面两阴
    5: { name: '巽', symbol: '☴', wuxing: '木', yao: [0, 1, 1] },    // 下断 - 底部阴
    6: { name: '坎', symbol: '☵', wuxing: '水', yao: [0, 1, 0] },    // 中满
    7: { name: '艮', symbol: '☶', wuxing: '土', yao: [0, 0, 1] },    // 覆碗 - 顶部阳，下面两阴
    8: { name: '坤', symbol: '☷', wuxing: '土', yao: [0, 0, 0] }     // 三阴
  },

  // 获取卦象数字对应的卦
  getTrigram(num) {
    const idx = num === 0 ? 8 : num;
    return this.XIAN_TIAN_BA_GUA[idx] || this.XIAN_TIAN_BA_GUA[8];
  },

  /**
   * 时间起卦法（使用农历和四柱）
   * @param {Date} date - 可选，默认为当前时间
   * @returns {Object} 卦象数据
   */
  calculateByTime(date = new Date()) {
    // 使用 FortuneAnalyzer 获取完整干支历
    const ganZhi = FortuneAnalyzer.getGanZhi(date);
    const lunar = ganZhi.lunar;

    // 使用农历年地支数（子=1, 丑=2, ... 亥=12）
    const nianZhiNum = this.DIZHI.indexOf(ganZhi.year.dizhi) + 1;
    // 农历月
    const lunarMonth = lunar.month;
    // 农历日
    const lunarDay = lunar.day;
    // 时辰（24小时制转12时辰）
    const hour = date.getHours();
    const shiChenNum = DateUtil.getShiChenNum(hour);

    // 计算上卦：(年支数+农历月+农历日) % 8
    const upperNum = (nianZhiNum + lunarMonth + lunarDay) % 8;
    const upperGua = this.getTrigram(upperNum === 0 ? 8 : upperNum);

    // 计算下卦：(年支数+农历月+农历日+时) % 8
    const lowerNum = (nianZhiNum + lunarMonth + lunarDay + shiChenNum) % 8;
    const lowerGua = this.getTrigram(lowerNum === 0 ? 8 : lowerNum);

    // 计算动爻：(年支数+农历月+农历日+时) % 6
    const dongYao = (nianZhiNum + lunarMonth + lunarDay + shiChenNum) % 6;
    const finalDongYao = dongYao === 0 ? 6 : dongYao;

    return this.buildGuaData(upperGua, lowerGua, finalDongYao, {
      method: 'time',
      time: date,
      ganZhi: ganZhi,
      upperNum: upperNum === 0 ? 8 : upperNum,
      lowerNum: lowerNum === 0 ? 8 : lowerNum
    });
  },

  /**
   * 数字起卦法
   * @param {Number} upperNum - 上卦数
   * @param {Number} lowerNum - 下卦数
   * @returns {Object} 卦象数据
   */
  calculateByNumber(upperNum, lowerNum) {
    const upperGua = this.getTrigram(upperNum % 8 || 8);
    const lowerGua = this.getTrigram(lowerNum % 8 || 8);
    const dongYao = ((upperNum + lowerNum) % 6) || 6;

    // 获取当前时间的干支信息
    const ganZhi = FortuneAnalyzer.getGanZhi(new Date());

    return this.buildGuaData(upperGua, lowerGua, dongYao, {
      method: 'number',
      upperNum, lowerNum,
      ganZhi: ganZhi
    });
  },

  /**
   * 构建完整卦象数据
   */
  buildGuaData(upperGua, lowerGua, dongYao, options = {}) {
    // 六爻：下卦3爻 + 上卦3爻（从下往上）
    const yaos = [...lowerGua.yao, ...upperGua.yao];

    // 主卦信息
    const mainGua = this.get64GuaName(upperGua, lowerGua);
    mainGua.yaos = yaos;
    mainGua.upperGua = upperGua;
    mainGua.lowerGua = lowerGua;

    // 变卦：动爻变阴阳
    const bianYaos = [...yaos];
    if (dongYao > 0 && dongYao <= 6) {
      bianYaos[dongYao - 1] = bianYaos[dongYao - 1] === 1 ? 0 : 1;
    }
    const bianGua = this.getBianGua(bianYaos);

    // 互卦：取234爻为下互卦，345爻为上互卦
    const huLowerYaos = yaos.slice(1, 4);
    const huUpperYaos = yaos.slice(2, 5);
    const huGua = this.getHuGua(huLowerYaos, huUpperYaos);

    // 错卦：六爻全变
    const cuoGua = this.getCuoGua(yaos);

    // 综卦：上下颠倒
    const zongGua = this.getZongGua(yaos);

    // 从 options 获取干支信息
    const ganZhi = options.ganZhi || FortuneAnalyzer.getGanZhi(new Date());

    return {
      upperGua: { ...upperGua, position: 'upper' },
      lowerGua: { ...lowerGua, position: 'lower' },
      mainGua,
      dongYao,
      bianGua,
      huGua,
      cuoGua,
      zongGua,
      method: options.method || 'unknown',
      timeInfo: {
        year: ganZhi.year.name,
        month: ganZhi.month.name,
        day: ganZhi.day.name,
        hour: ganZhi.hour.name,
        lunar: ganZhi.lunar,
        pillars: ganZhi.pillars,
        fullDate: (options.time || new Date()).toISOString(),
        formatted: (options.time || new Date()).toLocaleString('zh-CN')
      },
      raw: options
    };
  },

  /**
   * 获取64卦名称
   */
  get64GuaName(upperGua, lowerGua) {
    const upperIdx = Object.keys(this.XIAN_TIAN_BA_GUA).find(
      k => this.XIAN_TIAN_BA_GUA[k].name === upperGua.name
    );
    const lowerIdx = Object.keys(this.XIAN_TIAN_BA_GUA).find(
      k => this.XIAN_TIAN_BA_GUA[k].name === lowerGua.name
    );

    const key = `${upperIdx}-${lowerIdx}`;

    if (typeof GUA_DATA !== 'undefined' && GUA_DATA[key]) {
      return GUA_DATA[key];
    }

    return {
      name: `${upperGua.name}${lowerGua.name}`,
      pinyin: '',
      ci: '',
      yaoci: []
    };
  },

  /**
   * 根据爻数组获取变卦
   */
  getBianGua(yaoArray) {
    const lowerYaos = yaoArray.slice(0, 3);
    const upperYaos = yaoArray.slice(3, 6);

    const lowerGua = this.yaosToTrigram(lowerYaos);
    const upperGua = this.yaosToTrigram(upperYaos);

    return {
      ...this.get64GuaName(upperGua, lowerGua),
      yaos: yaoArray,
      upperGua,
      lowerGua
    };
  },

  /**
   * 获取互卦
   */
  getHuGua(huLowerYaos, huUpperYaos) {
    const lowerGua = this.yaosToTrigram(huLowerYaos);
    const upperGua = this.yaosToTrigram(huUpperYaos);

    return {
      ...this.get64GuaName(upperGua, lowerGua),
      yaos: [...huLowerYaos, ...huUpperYaos],
      upperGua,
      lowerGua
    };
  },

  /**
   * 获取错卦（六爻全变）
   */
  getCuoGua(yaoArray) {
    const cuoYaos = yaoArray.map(y => y === 1 ? 0 : 1);
    const lowerYaos = cuoYaos.slice(0, 3);
    const upperYaos = cuoYaos.slice(3, 6);

    const lowerGua = this.yaosToTrigram(lowerYaos);
    const upperGua = this.yaosToTrigram(upperYaos);

    return {
      ...this.get64GuaName(upperGua, lowerGua),
      yaos: cuoYaos,
      upperGua,
      lowerGua
    };
  },

  /**
   * 获取综卦（上下颠倒/旋转180度）
   */
  getZongGua(yaoArray) {
    // 六爻整体颠倒（初变上，二变五，三变四）
    const zongYaos = [yaoArray[5], yaoArray[4], yaoArray[3], yaoArray[2], yaoArray[1], yaoArray[0]];
    const lowerYaos = zongYaos.slice(0, 3);
    const upperYaos = zongYaos.slice(3, 6);

    const lowerGua = this.yaosToTrigram(lowerYaos);
    const upperGua = this.yaosToTrigram(upperYaos);

    return {
      ...this.get64GuaName(upperGua, lowerGua),
      yaos: zongYaos,
      upperGua,
      lowerGua
    };
  },

  /**
   * 三爻转八卦
   * yaoArray = [下爻(初爻), 中爻(二爻), 上爻(三爻)] - 从下到上
   */
  yaosToTrigram(yaoArray) {
    const key = yaoArray.join('');

    // 先天八卦对应（yao数组是[下爻, 中爻, 上爻]）
    const map = {
      '111': this.XIAN_TIAN_BA_GUA[1], // 乾 ☰ 三阳
      '110': this.XIAN_TIAN_BA_GUA[2], // 兑 ☱ 上缺(顶部阴)
      '101': this.XIAN_TIAN_BA_GUA[3], // 离 ☲ 中虚
      '100': this.XIAN_TIAN_BA_GUA[4], // 震 ☳ 仰盂(底部阳,上两阴)
      '011': this.XIAN_TIAN_BA_GUA[5], // 巽 ☴ 下断(底部阴)
      '010': this.XIAN_TIAN_BA_GUA[6], // 坎 ☵ 中满
      '001': this.XIAN_TIAN_BA_GUA[7], // 艮 ☶ 覆碗(顶部阳,下两阴)
      '000': this.XIAN_TIAN_BA_GUA[8]  // 坤 ☷ 三阴
    };
    return map[key] || this.XIAN_TIAN_BA_GUA[8];
  },

  /**
   * 获取卦辞解释
   */
  getGuaCi(guaData) {
    if (!guaData || !guaData.mainGua) return null;

    const dongYao = guaData.dongYao;
    const yaoci = guaData.mainGua.yaoci;

    return {
      guaCi: guaData.mainGua.ci || '',
      dongYaoCi: dongYao > 0 && yaoci ? yaoci[dongYao - 1] : '',
      allYaoci: yaoci || []
    };
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MeiHua;
}
