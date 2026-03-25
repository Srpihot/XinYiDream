// 农历与日期计算工具
// 基于 FortuneAnalyzer 实现

const DateUtil = {
  // 天干
  TIAN_GAN: ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],

  // 地支
  DI_ZHI: ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'],

  // 生肖
  SHENG_XIAO: ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'],

  // 农历月份
  LUNAR_MONTH: ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'],

  // 农历日期
  LUNAR_DAY: [
    '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
    '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
    '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
  ],

  /**
   * 获取当前时间的完整干支历信息
   */
  getCurrentGanZhi() {
    return FortuneAnalyzer.getGanZhi(new Date());
  },

  /**
   * 获取指定时间的干支历
   * @param {Date} date
   * @returns {Object}
   */
  getGanZhi(date) {
    return FortuneAnalyzer.getGanZhi(date);
  },

  /**
   * 阳历转农历
   * @param {Date} date
   * @returns {Object}
   */
  solarToLunar(date) {
    return FortuneAnalyzer.convertSolarToLunar(date);
  },

  /**
   * 获取八字四柱
   * @param {Date} date
   * @returns {Array} [年柱, 月柱, 日柱, 时柱]
   */
  getFourPillars(date) {
    return FortuneAnalyzer.analyzeFourPillars(date);
  },

  /**
   * 获取节气时间
   * @param {Number} year 年份
   * @param {String} termName 节气名称
   * @returns {Date}
   */
  getSolarTerm(year, termName) {
    return FortuneAnalyzer._getSolarTerm(year, termName);
  },

  /**
   * 获取节气月份
   * @param {Date} date
   * @returns {Number} 1-12（1=寅月/正月）
   */
  getTermMonth(date) {
    const year = date.getFullYear();
    const jieOrder = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑',
                      '立秋', '白露', '寒露', '立冬', '大雪'];

    let monthIndex = null;
    for (let i = 0; i < jieOrder.length; i++) {
      const jieqi = this.getSolarTerm(year, jieOrder[i]);
      if (jieqi && date >= jieqi) {
        monthIndex = i;
      } else {
        break;
      }
    }

    if (monthIndex === null) {
      monthIndex = 11;
    }

    return monthIndex + 1;
  },

  /**
   * 格式化时间显示
   */
  formatTime(date) {
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  },

  /**
   * 格式化日期显示
   */
  formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  },

  /**
   * 获取时辰名称
   * 子时(23-1点), 丑时(1-3点), 寅时(3-5点), ... 亥时(21-23点)
   */
  getShiChen(hour) {
    const shiChen = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const num = this.getShiChenNum(hour);
    return shiChen[num - 1];
  },

  /**
   * 获取时辰数（1-12）
   * 子时(23-1点)=1, 丑时(1-3点)=2, 寅时(3-5点)=3, ... 亥时(21-23点)=12
   */
  getShiChenNum(hour) {
    // 23点和0点都是子时(1)，其他时间正常计算
    if (hour === 23 || hour === 0) return 1;
    return Math.floor((hour + 1) / 2) + 1;
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DateUtil;
}
