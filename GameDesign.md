## 数字英雄设计

#### 战斗相关

A对B发动普通攻击

1. A执行攻击PreformAttack --> AttactEvent	[这里可以播放攻击动画,或者打出某个子弹发球]
2. A生成CreateDamage -->OnModifyDamage [A生成一个伤害实例,此实例的damge,被A的buf,场景等 修正过的数值]
3. B执行GetDamage --> PerformDefend-->DefendEvent [B在承受到伤害后,对伤害进行防御事件]

上述的步骤由结算的地方,按照所需步骤进行 1&2 可以互换



执行攻击的入口有

Card --> InvokeAbility()

Skill --> NormalAttack -->OnUse