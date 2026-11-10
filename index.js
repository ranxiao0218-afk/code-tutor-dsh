/**
 * Code tutor — installs a model-invocable skill that explains code for readers
 * who know a little Python but cannot read real project code, plus a short
 * prompt section that tells the agent to load that skill whenever the user asks
 * about code.
 *
 * Output contract: a short plain-language overview, the syntax the code uses,
 * then one concise line per line. Everything else is opt-in, on request.
 */

/** Both services are required: without them the plugin has nothing to register. */
export const inject = ['skills', 'systemPrompt']

const SKILL_NAME = 'code-tutor'

/**
 * Short trigger rule. Placed at 700: after the persona prefix (0) and before
 * the per-tool prompt sections (1000+), so it reads as general behaviour.
 */
const TRIGGER_SECTION = `Code walkthrough: this session provides a code-explanation skill named "code-tutor".
Load it with the skill tool (name: "code-tutor") BEFORE answering whenever the user asks what a piece of code does, asks to explain, walk through, translate, or "讲解 / 逐行讲 / 看不懂" code, pastes code without a concrete question, asks about a single line, function, library call, parameter, tensor shape, or error inside code, or says they cannot follow code they were given.
Follow its three-part structure and its brevity rule: one short plain-language paragraph on what the code does, then the syntax it uses, then one concise explanation per line. Do not add sections it did not ask for.`

const SKILL_CONTENT = `# 代码讲解师工作法

## 读者
会一点 Python，但读真实项目代码很吃力；正在接触大模型相关的代码（PyTorch、transformers、numpy、训练/推理脚本、数据处理管线、API 调用）。他想看懂眼前这一段，不想上课。看不懂的地方他会自己追问。

## 第一条规矩：短
- 默认简洁。宁可少讲，也不要注水。
- 只输出下面三段，写完就停。全篇控制在一屏半以内。
- 不要画数据流箭头图，不要「运行蓝图」，不要手算推演表，不要自测题，不要坑点清单，不要总结陈词 —— 除非用户明确要。
- 不主动给没被问到的内容。用户会追问，追问时再展开。

## 输出结构（固定三段）

### 一、这段代码在做什么（一段话）
用**一段话**把整体讲清楚：它拿什么当输入、中间做了什么、最后得到什么。
要求：直白，像同事在工位边上口头解释；4 到 5 句以内；不堆术语，必须出现的术语就地用一句大白话兜住。
是一段话，不要拆成分点，不要堆小标题。

### 二、用到的语法（清单）
把这段代码里真正出现的语法/写法逐个列出来，一条一行：
- 语法名：一句话说清它是什么、在这里起什么作用。
只列这段代码实际用到的，不要罗列 Python 知识；按在代码里出现的顺序排。
需要列入的典型项：列表或字典推导式、切片与负数索引、with、f-string、*args 与 **kwargs、装饰器、lambda、三元表达式、生成器 yield、类型注解、异常处理、@ 运算符（矩阵乘）、方法链式调用、numpy 广播、张量的 dim 与 keepdim、in-place 方法（下划线结尾）、字典解包 **、import 与别名。

### 三、逐行讲解（一行一条，简短）
对每一行逻辑行给一条解释，格式固定：行号 · 那行代码原文 · 一句中文说明。
说明写「这行做了什么 + 关键变量变成了什么（值或形状）」，一到两句，不展开原理。
不跳行。只有连续 3 行以上的纯样板（连续 import、连续同结构的层定义）可以合并成一条并注明行号范围。

## 什么时候可以多讲
只在用户明确要求时：
- 「再细一点 / 为什么这么写 / 讲讲原理」：才展开原理、替代写法、取舍。
- 「这段报错了」：先指出出错的那一行和原因，再按正常三段讲。
- 「跑一遍我看看」：才给具体数值推演。
- 连续追问某一行：只对那一行做微观拆解，说明这个表达式从内到外怎么求值。

## 硬性规则
- 中文讲解；代码、变量名、库名、报错原文保持原样，不翻译。
- 术语第一次出现写成「中文（English）」，例如「张量（tensor）」。
- 引用代码时带行号或贴出那两行，让读者能对上位置；代码块要标语言。
- 不确定就说不确定，绝不编造 API、参数名或行为。
- 用户贴的代码缺上下文（变量没定义、库没 import）时，先用一句话说明你的假设再讲，不要停下来反问一堆。`

export function apply(ctx) {
  ctx.effect(() =>
    ctx.skills.register({
      name: SKILL_NAME,
      source: 'runtime',
      description:
        '先用一段话讲清整体在做什么，再列出这段代码用到的语法并逐个说明，最后逐行给出简短讲解。面向「会一点 Python 但读不懂真实项目代码」的读者。',
      whenToUse:
        '用户贴出代码并要求讲解、逐行解释、说自己看不懂，或询问代码里某个函数、库调用、参数、张量 shape、报错的作用时。',
      invocation: { modelInvocable: true, userInvocable: true },
      content: SKILL_CONTENT,
    }),
  )

  ctx.effect(() =>
    ctx.systemPrompt.section({
      name: 'plugin:code-tutor',
      order: 700,
      text: TRIGGER_SECTION,
    }),
  )
}
