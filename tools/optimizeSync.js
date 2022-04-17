

// Stronghold Rate/Mat Buffs
export const estateBuffMap = {
  100000: ['estateT1c', 'estateT1p'],
  100001: ['estateT1c', 'estateT1p'],
  200000: ['estateT2c', 'estateT2p'],
  200001: ['estateT2c', 'estateT2p'],
  310000: ['estateT3ac', 'estateT3ap'],
  310001: ['estateT3ac', 'estateT3ap'],
  310500: ['estateT3bc', 'estateT3bp'],
  310501: ['estateT3bc', 'estateT3bp'],
  311000: ['estateT3cc', 'estateT3cp'],
  311001: ['estateT3cc', 'estateT3cp'],
};

//Synchornous function
{Data: {
 items: {
   quality,
   
 } // indexed by item
}
}
// task: {
  item,
  level,

}
// options: 
// prices: 

export default function optimizeSync(Data, task, options, prices) {
  const item = Data.items[task.item];
  if (!item) return null;
  const quality = Data.itemQuality[`${item.quality}#${task.level + 100}`];
  if (!quality) return null;
  const common = Data.enhanceCommon[quality.common];
  if (!common) return null;
  let boost = Data.enhanceBoost[quality.boost];
  const commonM = quality.common.match(/^(.*)#/);
  const buffType = commonM && estateBuffMap[commonM[1]];
  if (buffType && (options[buffType[0]] || options[buffType[1]])) {
    boost = {...boost};
    if (options[buffType[0]]) boost.chance = (boost.chance || 0) + (commonM[1] < 300000 ? 2000 : 1000);
    if (options[buffType[1]]) boost.expDiscount = (boost.expDiscount || 0) + 2000;
  }

  const mats = [];
  for (const mat of common.additive) {
    mats.push({id: mat.id, cost: prices[mat.id] || 0, chance: mat.rate, limit: mat.max});
  }
  while (mats.length < 3) {
    mats.push({cost: 0, chance: 0, limit: 0});
  }
  const mat4 = common.special && (Data.enhanceMaterial[common.special]?.find(m => prices[m.id]) || Data.enhanceMaterial[common.special]?.[0]);
  const mat4fx = mat4?.effects.find(fx => fx.type === 1);
  if (mat4fx) mats.push({id: mat4.id, cost: prices[mat4.id] || 0, chance: mat4fx.value, limit: 1});
  else mats.push({cost: 0, chance: 0, limit: 0});

  let attemptCost = 0;
  for (const [id, amount] of Object.entries(boost?.money || common.money)) {
    attemptCost += (prices[id] || 0) * amount;
  }
  for (const [id, amount] of Object.entries(boost?.mats || quality.mats)) {
    attemptCost += (prices[id] || 0) * amount;
  }

  const stepsFull = [];
  for (let n0 = 0; n0 <= mats[0].limit; ++n0) {
    for (let n1 = 0; n1 <= mats[1].limit; ++n1) {
      for (let n2 = 0; n2 <= mats[2].limit; ++n2) {
        for (let n3 = 0; n3 <= mats[3].limit; ++n3) {
          const chance = Math.min(common.additiveMax, n0 * mats[0].chance + n1 * mats[1].chance + n2 * mats[2].chance) + n3 * mats[3].chance;
          const cost = n0 * mats[0].cost + n1 * mats[1].cost + n2 * mats[2].cost + n3 * mats[3].cost;
          if (!stepsFull[chance] || cost < stepsFull[chance].cost) {
            stepsFull[chance] = {
              cost,
              mat0: n0,
              mat1: n1,
              mat2: n2,
              mat3: n3,
            };
          }
        }
      }
    }
  }
  let steps = stepsFull.map((m, i) => m ? {...m, chance: i} : null).filter(Boolean);
  if (options.honing === 0) {
    steps = [steps[0]];
  } else if (options.honing === 2) {
    steps = [steps[steps.length - 1]];
  }

  const guaranteedResult = {cost: attemptCost, mat0: 0, mat1: 0, mat2: 0, mat3: 0, nextChance: 0};
  const maxAttempts = common.failMax ? Math.ceil(common.failMax / common.failBonus) : 0;

  const cache = [];
  function _compute(attempts, failureTotal) {
    let optimal = null;
    for (const step of steps) {
      const chance = common.success + (boost?.chance || 0) + Math.min(common.failBonus * attempts, common.failMax) + step.chance;
      let cost = attemptCost + step.cost;
      let failure = null, failureChance = 0;
      if (chance < 10000) {
        failure = compute(attempts + 1, failureTotal + chance);
        failureChance = (10000 - chance) / 10000;
        cost += failure.cost * failureChance;
      }
      if (!optimal || cost < optimal.cost) {
        if (!optimal) optimal = {};
        optimal.cost = cost;
        optimal.next = failure;
        optimal.nextChance = failureChance;
        optimal.mat0 = step.mat0;
        optimal.mat1 = step.mat1;
        optimal.mat2 = step.mat2;
        optimal.mat3 = step.mat3;
      }
    }
    return optimal;
  }
  function compute(attempts, failureTotal) {
    if (failureTotal >= common.threshold) {
      return guaranteedResult;
    }
    if (attempts > maxAttempts) attempts = maxAttempts;
    const pos = attempts * common.threshold + failureTotal;
    if (!cache[pos]) cache[pos] = _compute(attempts, failureTotal);
    return cache[pos];
  }
  const result = compute(task.fails, Math.floor(task.blessing * 215));

  const out = {
    mats: {},
    money: {},
    steps: [],
  };

  let curChance = 1, cur = result;
  while (cur) {
    const step = {
      chance: 1 - cur.nextChance,
      mats: {},
      money: {},
    };
    for (const [id, amount] of Object.entries(boost?.money || common.money)) {
      if (id && amount) {
        step.money[id] = amount;
        out.money[id] = (out.money[id] || 0) + amount * curChance;
      }
    }
    function _mat(id, amount) { // eslint-disable-line no-loop-func
      if (id && amount) {
        step.mats[id] = amount;
        out.mats[id] = (out.mats[id] || 0) + amount * curChance;
      }
    }
    for (const [id, amount] of Object.entries(boost?.mats || quality.mats)) {
      _mat(id, amount);
    }
    _mat(mats[0].id, cur.mat0);
    _mat(mats[1].id, cur.mat1);
    _mat(mats[2].id, cur.mat2);
    _mat(mats[3].id, cur.mat3);
    out.steps.push(step);
    if (options.luck === 0) {
      if (!cur.nextChance) curChance = 0;
    } else if (options.luck === 2) {
      curChance = 0;
    } else {
      curChance *= cur.nextChance;
    }
    cur = cur.next;
  }

  const prevQuality = Data.itemQuality[`${item.quality}#${task.level + 100 - 1}`];
  const prevCommon = prevQuality && Data.enhanceCommon[prevQuality.common];
  const feedExp = common.exp - (prevCommon?.exp || 0);
  const feedAmount = Math.ceil(feedExp / common.feedExp * (1 - (boost?.expDiscount || 0) / 10000));
  out.feed = {
    mats: {},
    money: {
      [common.feedType]: feedAmount,
      [common.feedSubType]: feedAmount * common.feedSubCost,
    },
  };
  out.money[common.feedType] = (out.money[common.feedType] || 0) + feedAmount;
  out.money[common.feedSubType] = (out.money[common.feedSubType] || 0) + feedAmount * common.feedSubCost;
  return out;
}
