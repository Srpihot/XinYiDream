// FortuneAnalyzer - JavaScript 版本
// 基于 php-fortune-analyzer 转换
// 支持 1900-2100 年间阳历与农历的相互转换，八字排盘、五行推演等功能

/**
 * 常量定义
 */
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const SHENGXIAO = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const LUNAR_MONTH = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const LUNAR_DAY = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
];

// 天干五行
const TIANGAN_WUXING = {
  '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土',
  '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水'
};

// 地支五行
const DIZHI_WUXING = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火',
  '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水'
};

// 地支藏干
const CANG_GAN_MAP = {
  '子': ['癸'], '丑': ['己', '癸', '辛'], '寅': ['甲', '丙', '戊'],
  '卯': ['乙'], '辰': ['戊', '乙', '癸'], '巳': ['丙', '庚', '戊'],
  '午': ['丁', '己'], '未': ['己', '丁', '乙'], '申': ['庚', '壬', '戊'],
  '酉': ['辛'], '戌': ['戊', '辛', '丁'], '亥': ['壬', '甲']
};

// 天干阴阳
const TIANGAN_YINYANG = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
  '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴'
};

// 五行生克关系
const WUXING_RELATION_MAP = {
  '生我': { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' },
  '我生': { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' },
  '克我': { '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' },
  '我克': { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' },
  '同我': { '木': '木', '火': '火', '土': '土', '金': '金', '水': '水' }
};

// 十神映射
const SHI_SHEN_MAP = {
  '生我-同性': '偏印', '生我-异性': '正印',
  '我生-同性': '食神', '我生-异性': '伤官',
  '克我-同性': '七杀', '克我-异性': '正官',
  '我克-同性': '偏财', '我克-异性': '正财',
  '同我-同性': '比肩', '同我-异性': '劫财'
};

// 五局定义
const WU_XING_JU = {
  '金四局': ['申', '酉'], '木三局': ['寅', '卯'],
  '水二局': ['亥', '子'], '火六局': ['巳', '午'],
  '土五局': ['辰', '戌', '丑', '未']
};

// 三会局
const SAN_HUI_JU = {
  '木三会': ['寅', '卯', '辰'], '火三会': ['巳', '午', '未'],
  '金三会': ['申', '酉', '戌'], '水三会': ['亥', '子', '丑']
};

// 三合局
const SAN_HE_JU = {
  '水三合': ['申', '子', '辰'], '火三合': ['寅', '午', '戌'],
  '木三合': ['亥', '卯', '未'], '金三合': ['巳', '酉', '丑']
};

// 六合局
const LIU_HE_JU = {
  '土六合': ['丑', '未'], '金六合': ['申', '酉'],
  '木六合': ['寅', '亥'], '水六合': ['子', '丑'], '火六合': ['巳', '午']
};

/**
 * 引用外部数据文件的数据（bazi-data.js 需要先加载）
 * LUNAR_MAP: 阳历转农历映射
 * SOLAR_TERMS_MAP: 节气数据
 */

/**
 * FortuneAnalyzer 主类
 */
const FortuneAnalyzer = {
  /**
   * 阳历转农历
   * @param {string|Date} date 阳历日期
   * @returns {Object} 农历信息对象
   */
  convertSolarToLunar(date) {
    const d = date instanceof Date ? date : new Date(date);
    const dateKey = this._formatDate(d);

    if (typeof LUNAR_MAP === 'undefined') {
      console.error('LUNAR_MAP 未加载，请确保已加载 bazi-data.js');
      return null;
    }

    const lunarStr = LUNAR_MAP[dateKey];
    if (!lunarStr) {
      return null;
    }

    // 解析农历字符串 (格式: YYYY-MM-DD)
    const [lunarYear, lunarMonth, lunarDay] = lunarStr.split('-').map(Number);

    return {
      year: lunarYear,
      month: lunarMonth,
      day: lunarDay,
      yearGanZhi: this._getYearGanZhi(lunarYear),
      monthStr: LUNAR_MONTH[lunarMonth - 1] + '月',
      dayStr: LUNAR_DAY[lunarDay - 1],
      ganZhi: this._getYearGanZhi(lunarYear).name
    };
  },

  /**
   * 农历转阳历
   * @param {number} year 农历年
   * @param {number} month 农历月
   * @param {number} day 农历日
   * @returns {Date|null} 阳历日期
   */
  lunarToSolar(year, month, day) {
    if (typeof LUNAR_MAP === 'undefined') {
      console.error('LUNAR_MAP 未加载，请确保已加载 bazi-data.js');
      return null;
    }

    const lunarKey = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // 在LUNAR_MAP中查找对应的阳历日期
    for (const [solarDate, lunarDate] of Object.entries(LUNAR_MAP)) {
      if (lunarDate === lunarKey) {
        return new Date(solarDate);
      }
    }

    return null;
  },

  /**
   * 获取八字（四柱）
   * @param {string|Date} datetime 阳历日期时间
   * @returns {Array} [年柱, 月柱, 日柱, 时柱]
   */
  analyzeFourPillars(datetime) {
    const yearPillar = this.getYearPillar(datetime);
    const monthPillar = this.getMonthPillar(datetime);
    const dayPillar = this.getDayPillar(datetime);
    const hourPillar = this.getHourPillar(datetime);

    return [
      yearPillar.tiangan + yearPillar.dizhi,
      monthPillar.tiangan + monthPillar.dizhi,
      dayPillar.tiangan + dayPillar.dizhi,
      hourPillar.tiangan + hourPillar.dizhi
    ];
  },

  /**
   * 获取年柱
   * @param {string|Date} datetime 阳历日期
   * @returns {Object} {tiangan, dizhi}
   */
  getYearPillar(datetime) {
    const dt = datetime instanceof Date ? datetime : new Date(datetime);
    let year = dt.getFullYear();

    // 获取当年立春时间
    const solarTerms = this._getSolarTermsByYear(year);
    const liChun = solarTerms && solarTerms['立春'] ? new Date(solarTerms['立春']) : null;

    // 若未到立春，则使用上一年干支
    if (liChun && dt < liChun) {
      year--;
    }

    const offset = (year - 4) % 60;
    return {
      tiangan: TIANGAN[offset % 10],
      dizhi: DIZHI[offset % 12]
    };
  },

  /**
   * 获取月柱
   * @param {string|Date} datetime 阳历日期
   * @returns {Object} {tiangan, dizhi}
   */
  getMonthPillar(datetime) {
    const dt = datetime instanceof Date ? datetime : new Date(datetime);
    const year = dt.getFullYear();

    // 获取节令
    const solarTerms = this._getSolarTermsByYear(year);
    const jieqiOrder = ['立春', '惊蛰', '清明', '立夏', '芒种', '小暑',
                       '立秋', '白露', '寒露', '立冬', '大雪'];
    const monthBranches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

    let monthIndex = null;
    for (let i = 0; i < jieqiOrder.length; i++) {
      const jieqi = jieqiOrder[i];
      if (!solarTerms || !solarTerms[jieqi]) continue;

      const jieqiDate = new Date(solarTerms[jieqi]);
      if (dt >= jieqiDate) {
        monthIndex = i;
      } else {
        break;
      }
    }

    if (monthIndex === null) {
      // 小寒前属于上一年腊月（丑月）
      monthIndex = 11;
    }

    const yearPillar = this.getYearPillar(datetime);
    const yearGan = yearPillar.tiangan;

    // 五虎遁
    const monthGanStartMap = {
      '甲': '丙', '己': '丙', '乙': '戊', '庚': '戊',
      '丙': '庚', '辛': '庚', '丁': '壬', '壬': '壬',
      '戊': '甲', '癸': '甲'
    };

    const startGan = monthGanStartMap[yearGan];
    const startIndex = TIANGAN.indexOf(startGan);
    const ganIndex = (startIndex + monthIndex) % 10;

    return {
      tiangan: TIANGAN[ganIndex],
      dizhi: monthBranches[monthIndex]
    };
  },

  /**
   * 获取日柱
   * @param {string|Date} datetime 阳历日期
   * @returns {Object} {tiangan, dizhi}
   */
  getDayPillar(datetime) {
    const dt = datetime instanceof Date ? datetime : new Date(datetime);
    const baseDate = new Date('1899-12-22'); // 甲子日
    const days = Math.floor((dt - baseDate) / (24 * 60 * 60 * 1000));
    const hour = dt.getHours();
    const offset = (hour === 23) ? 1 : 0;

    return {
      tiangan: TIANGAN[(days + offset) % 10],
      dizhi: DIZHI[(days + offset) % 12]
    };
  },

  /**
   * 获取时柱
   * @param {string|Date} datetime 阳历日期
   * @returns {Object} {tiangan, dizhi}
   */
  getHourPillar(datetime) {
    const dt = datetime instanceof Date ? datetime : new Date(datetime);
    const hour = dt.getHours();
    const dayPillar = this.getDayPillar(dt);
    const dayGan = dayPillar.tiangan;
    const dizhi = this._getHourBranch(hour);

    return {
      tiangan: this._calcHourGan(dayGan, dizhi),
      dizhi: dizhi
    };
  },

  /**
   * 获取十神
   * @param {string} dayGan 日主天干
   * @param {string} target 目标天干或地支
   * @param {boolean} mainQiOnly 是否只返回主气
   * @returns {string} 十神名称
   */
  getShiShen(dayGan, target, mainQiOnly = true) {
    const targetGan = [];
    const result = [];

    if (TIANGAN_WUXING[target]) {
      targetGan.push(target);
    } else if (CANG_GAN_MAP[target]) {
      if (mainQiOnly) {
        targetGan.push(CANG_GAN_MAP[target][0]);
      } else {
        targetGan.push(...CANG_GAN_MAP[target]);
      }
    }

    for (const _targetGan of targetGan) {
      const me = TIANGAN_WUXING[dayGan];
      const he = TIANGAN_WUXING[_targetGan];
      const meYinYang = TIANGAN_YINYANG[dayGan];
      const heYinYang = TIANGAN_YINYANG[_targetGan];

      if (me === he) {
        const key = '同我-' + (meYinYang === heYinYang ? '同性' : '异性');
        result.push(SHI_SHEN_MAP[key] || '');
        continue;
      }

      for (const [relation, map] of Object.entries(WUXING_RELATION_MAP)) {
        if (map[me] === he) {
          const key = relation + '-' + (meYinYang === heYinYang ? '同性' : '异性');
          result.push(SHI_SHEN_MAP[key] || '');
        }
      }
    }

    return result.join(',');
  },

  /**
   * 获取完整的干支历信息
   * @param {Date} date 日期
   * @returns {Object} 完整的干支信息
   */
  getGanZhi(date) {
    const dt = date instanceof Date ? date : new Date(date);

    const yearPillar = this.getYearPillar(dt);
    const monthPillar = this.getMonthPillar(dt);
    const dayPillar = this.getDayPillar(dt);
    const hourPillar = this.getHourPillar(dt);

    const lunar = this.convertSolarToLunar(dt);

    return {
      year: { ...yearPillar, name: yearPillar.tiangan + yearPillar.dizhi },
      month: { ...monthPillar, name: monthPillar.tiangan + monthPillar.dizhi },
      day: { ...dayPillar, name: dayPillar.tiangan + dayPillar.dizhi },
      hour: { ...hourPillar, name: hourPillar.tiangan + hourPillar.dizhi },
      lunar: lunar,
      pillars: [
        yearPillar.tiangan + yearPillar.dizhi,
        monthPillar.tiangan + monthPillar.dizhi,
        dayPillar.tiangan + dayPillar.dizhi,
        hourPillar.tiangan + hourPillar.dizhi
      ]
    };
  },

  /**
   * 获取纳音五行
   * @param {string} pillar 干支组合
   * @returns {string} 纳音名称
   */
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

  // ============ 内部方法 ============

  /**
   * 格式化日期为 YYYY-MM-DD
   */
  _formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  /**
   * 根据年份获取节气
   */
  _getSolarTermsByYear(year) {
    if (typeof SOLAR_TERMS_MAP === 'undefined') {
      console.error('SOLAR_TERMS_MAP 未加载，请确保已加载 bazi-data.js');
      return null;
    }
    return SOLAR_TERMS_MAP[year] || null;
  },

  /**
   * 获取年干支
   */
  _getYearGanZhi(year) {
    const gan = TIANGAN[(year - 4) % 10];
    const zhi = DIZHI[(year - 4) % 12];
    const shengxiao = SHENGXIAO[(year - 4) % 12];
    return {
      gan,
      zhi,
      name: gan + zhi,
      shengxiao
    };
  },

  /**
   * 根据小时获取地支时辰
   */
  _getHourBranch(hour) {
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    const index = (hour === 23) ? 0 : Math.floor((hour + 1) / 2);
    return branches[index];
  },

  /**
   * 根据日干与时支计算时干（五鼠遁）
   */
  _calcHourGan(dayGan, dizhi) {
    const startGanMap = {
      '甲': '甲', '己': '甲', '乙': '丙', '庚': '丙',
      '丙': '戊', '辛': '戊', '丁': '庚', '壬': '庚',
      '戊': '壬', '癸': '壬'
    };
    const startGan = startGanMap[dayGan];
    const startIdx = TIANGAN.indexOf(startGan);
    const dizhiIdx = DIZHI.indexOf(dizhi);
    return TIANGAN[(startIdx + dizhiIdx) % 10];
  }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FortuneAnalyzer;
}
