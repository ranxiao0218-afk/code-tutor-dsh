# 代码讲解师（code-tutor）

一个装在 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 里的行为型插件：注册一个**模型可调用的技能** `code-tutor`，并加一小段系统提示，使得「讲解代码」类请求一到，助手会先加载该技能，再按固定结构、以简洁为主地回答。

面向的读者：学过一点 Python，但读真实项目代码很吃力；正在接触大模型相关的代码（PyTorch、transformers、numpy、训练/推理脚本、数据处理管线、API 调用）。

## 安装

1. 克隆到本地任意目录：

   ```bash
   git clone https://github.com/ranxiao0218-afk/code-tutor-dsh.git
   ```

2. 在 DeepSeek Harness 里新开一个会话，把该目录发给它，说「把这个目录安装成插件」。它会让 `plugin_manager` 以 `install_bundle` 完成安装（链接方式，改代码后重装即可生效）。

3. 装完即生效，无需重启：新会话的技能目录里会出现 `code-tutor`。

## 触发条件

- 贴出代码并问「这是啥 / 看不懂 / 讲解一下 / 逐行讲」
- 贴出代码但没提具体问题
- 问代码里某一行、某个函数、某个库调用、某个参数、某个 tensor shape、某个报错

## 回答结构（三段，默认简洁）

1. **这段代码在做什么**：一段话，直白说清输入、处理、输出
2. **用到的语法**：清单，一条一行，说明每个语法是什么、在这里起什么作用
3. **逐行讲解**：一行一条，格式为「行号 · 代码原文 · 一句说明」

默认不画数据流图、不做推演表、不给自测题、不列坑点清单，全篇控制在一屏半以内；用户明确说「再细一点 / 为什么这么写 / 跑一遍我看看」时才会展开。

## 文件

| 文件 | 作用 |
|---|---|
| `index.js` | `apply()` 里注册技能与提示片段 |
| `cordis.patch.yml` | 插入 `code-tutor` 这一行 |
| `locale/en.json`、`locale/zh.json` | 插件管理器中显示的名称与描述 |
| `icon.svg` | 插件图标 |

## 改措辞

- 想改变触发范围或讲解风格：改 `index.js` 里的 `TRIGGER_SECTION` 或 `SKILL_CONTENT`。
- 改完在 DSH 里让它重装一次（`remove_bundle` 后再 `install_bundle`）即可生效。

## 卸载

```
plugin_manager  action: remove_bundle  target: @local/code-tutor
```

## English

A DeepSeek Harness plugin that registers a model-invocable skill named `code-tutor`. When you ask about a piece of code, the agent loads the skill and answers in three short parts: what the code does overall, which Python/PyTorch syntax it uses, then a concise line-by-line walkthrough. No diagrams, no quizzes, no boilerplate — details on demand.
